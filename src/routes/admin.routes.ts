// ============================================
// ADMIN ROUTES
// Enterprise admin panel API endpoints
// ============================================

import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { requireAdmin, requirePermission } from '../middleware/admin.middleware';
import { adminService } from '../services/admin.service';

const router = Router();

// Apply authentication and admin checks to all routes
router.use(authenticateUser);
router.use(requireAdmin);

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

router.get('/dashboard', async (req, res, next) => {
  try {
    const overview = await adminService.getDashboardOverview();
    const toolStats = await adminService.getToolUsageStats();
    const recentLogs = await adminService.getAdminLogs({ limit: 10 });

    res.json({
      overview,
      toolStats,
      recentLogs,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/tool-usage', async (req, res, next) => {
  try {
    const stats = await adminService.getToolUsageStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

router.get('/users', requirePermission('manage_users'), async (req, res, next) => {
  try {
    const { search, limit } = req.query;
    const users = await adminService.getAllUsers({
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/users/:userId', requirePermission('manage_users'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userDetails = await adminService.getUserDetails(userId);

    res.json(userDetails);
  } catch (error) {
    next(error);
  }
});

router.post('/users/:userId/restrict', requirePermission('manage_users'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { restriction_type, reason, expires_at } = req.body;
    const adminId = (req as any).user.id;

    const restriction = await adminService.restrictUser(
      userId,
      {
        restriction_type,
        reason,
        expires_at,
      },
      adminId
    );

    res.json(restriction);
  } catch (error) {
    next(error);
  }
});

router.delete('/restrictions/:restrictionId', requirePermission('manage_users'), async (req, res, next) => {
  try {
    const { restrictionId } = req.params;
    const adminId = (req as any).user.id;

    await adminService.removeUserRestriction(restrictionId, adminId);

    res.json({ message: 'Restriction removed' });
  } catch (error) {
    next(error);
  }
});

// ============================================
// TOOL CONFIGURATION
// ============================================

router.get('/tools', async (req, res, next) => {
  try {
    const tools = await adminService.getAllTools();
    res.json(tools);
  } catch (error) {
    next(error);
  }
});

router.get('/tools/:toolName', async (req, res, next) => {
  try {
    const { toolName } = req.params;
    const tool = await adminService.getToolConfig(toolName);

    res.json(tool);
  } catch (error) {
    next(error);
  }
});

router.patch('/tools/:toolName', requirePermission('manage_tools'), async (req, res, next) => {
  try {
    const { toolName } = req.params;
    const updates = req.body;
    const adminId = (req as any).user.id;

    const tool = await adminService.updateToolConfig(toolName, updates, adminId);

    res.json(tool);
  } catch (error) {
    next(error);
  }
});

// ============================================
// PROMPT MANAGEMENT
// ============================================

router.get('/prompts', async (req, res, next) => {
  try {
    const { tool_name } = req.query;
    const prompts = await adminService.getAllPrompts(tool_name as string);

    res.json(prompts);
  } catch (error) {
    next(error);
  }
});

router.get('/prompts/active/:toolName', async (req, res, next) => {
  try {
    const { toolName } = req.params;
    const { region, language, tone } = req.query;

    const prompt = await adminService.getActivePrompt(toolName, {
      region: region as string,
      language: language as string,
      tone: tone as string,
    });

    res.json(prompt);
  } catch (error) {
    next(error);
  }
});

router.post('/prompts', requirePermission('manage_prompts'), async (req, res, next) => {
  try {
    const promptData = req.body;
    const adminId = (req as any).user.id;

    const prompt = await adminService.createPrompt(promptData, adminId);

    res.status(201).json(prompt);
  } catch (error) {
    next(error);
  }
});

router.patch('/prompts/:promptId', requirePermission('manage_prompts'), async (req, res, next) => {
  try {
    const { promptId } = req.params;
    const updates = req.body;
    const adminId = (req as any).user.id;

    const prompt = await adminService.updatePrompt(promptId, updates, adminId);

    res.json(prompt);
  } catch (error) {
    next(error);
  }
});

router.post('/prompts/:promptId/activate', requirePermission('manage_prompts'), async (req, res, next) => {
  try {
    const { promptId } = req.params;
    const adminId = (req as any).user.id;

    const prompt = await adminService.activatePrompt(promptId, adminId);

    res.json(prompt);
  } catch (error) {
    next(error);
  }
});

// ============================================
// SYSTEM SETTINGS
// ============================================

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await adminService.getAllSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.get('/settings/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await adminService.getSetting(key);

    res.json(setting);
  } catch (error) {
    next(error);
  }
});

router.patch('/settings/:key', requirePermission('manage_settings'), async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const adminId = (req as any).user.id;

    const setting = await adminService.updateSetting(key, value, adminId);

    res.json(setting);
  } catch (error) {
    next(error);
  }
});

// ============================================
// WEBSITE CONTENT
// ============================================

router.get('/content', async (req, res, next) => {
  try {
    const { page } = req.query;
    const content = await adminService.getWebsiteContent(page as string);

    res.json(content);
  } catch (error) {
    next(error);
  }
});

router.patch('/content/:contentId', requirePermission('manage_content'), async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const updates = req.body;
    const adminId = (req as any).user.id;

    const content = await adminService.updateWebsiteContent(contentId, updates, adminId);

    res.json(content);
  } catch (error) {
    next(error);
  }
});

// ============================================
// CONTENT MODERATION
// ============================================

router.get('/flags', requirePermission('moderate_content'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const flags = await adminService.getAllFlags(status as string);

    res.json(flags);
  } catch (error) {
    next(error);
  }
});

router.post('/flags/:flagId/resolve', requirePermission('moderate_content'), async (req, res, next) => {
  try {
    const { flagId } = req.params;
    const { notes } = req.body;
    const adminId = (req as any).user.id;

    const flag = await adminService.resolveFlag(flagId, { notes }, adminId);

    res.json(flag);
  } catch (error) {
    next(error);
  }
});

// ============================================
// ADMIN ROLE MANAGEMENT
// ============================================

router.get('/admins', requirePermission('manage_admins'), async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.json(admins);
  } catch (error) {
    next(error);
  }
});

router.post('/admins', requirePermission('manage_admins'), async (req, res, next) => {
  try {
    const { user_id, role } = req.body;
    const createdBy = (req as any).user.id;

    const admin = await adminService.createAdmin(user_id, role, createdBy);

    res.status(201).json(admin);
  } catch (error) {
    next(error);
  }
});

router.patch('/admins/:userId', requirePermission('manage_admins'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const updatedBy = (req as any).user.id;

    const admin = await adminService.updateAdminRole(userId, updates, updatedBy);

    res.json(admin);
  } catch (error) {
    next(error);
  }
});

// ============================================
// ACTIVITY LOGS
// ============================================

router.get('/logs', async (req, res, next) => {
  try {
    const { admin_id, action_type, limit } = req.query;

    const logs = await adminService.getAdminLogs({
      adminId: admin_id as string,
      actionType: action_type as string,
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
