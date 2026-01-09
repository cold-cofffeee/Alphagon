// ============================================
// PUBLIC CONFIG ROUTES
// Frontend configuration endpoints (no auth required)
// ============================================

import { Router } from 'express';
import { supabaseService } from '../services/supabase.service';

const router = Router();

// ============================================
// TOOL CONFIGURATION
// Frontend reads this to know what tools are available
// ============================================

router.get('/tools', async (req, res, next) => {
  try {
    const { data, error } = await supabaseService['serviceClient']
      .from('tool_config')
      .select('*')
      .eq('is_enabled', true)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/tools/:toolName', async (req, res, next) => {
  try {
    const { toolName } = req.params;

    const { data, error } = await supabaseService['serviceClient']
      .from('tool_config')
      .select('*')
      .eq('tool_name', toolName)
      .eq('is_enabled', true)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// ============================================
// SYSTEM SETTINGS
// Frontend reads this for maintenance mode, defaults, etc.
// ============================================

router.get('/settings', async (req, res, next) => {
  try {
    const { data, error } = await supabaseService['serviceClient']
      .from('system_settings')
      .select('setting_key, setting_value, description');

    if (error) throw error;

    // Convert array to object for easier access
    const settings = data.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, any>);

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.get('/settings/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    const { data, error } = await supabaseService['serviceClient']
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

    if (error) throw error;

    res.json(data.setting_value);
  } catch (error) {
    next(error);
  }
});

// ============================================
// WEBSITE CONTENT
// Frontend reads dynamic content from database
// ============================================

router.get('/content', async (req, res, next) => {
  try {
    const { page } = req.query;

    let query = supabaseService['serviceClient']
      .from('website_content')
      .select('*')
      .eq('is_active', true);

    if (page) {
      query = query.eq('page', page as string);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
