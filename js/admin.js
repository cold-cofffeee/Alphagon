// ============================================
// ADMIN PANEL CLIENT
// Frontend for enterprise admin control
// ============================================

const API_BASE = '/api';
let currentView = 'dashboard';
let authToken = localStorage.getItem('token');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Check admin access
  checkAdminAccess();

  // Setup navigation
  setupNavigation();

  // Load default view
  loadView('dashboard');

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
});

async function checkAdminAccess() {
  if (!authToken) {
    window.location.href = '/login?redirect=/admin';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Not authorized');
    }
  } catch (error) {
    console.error('Admin access denied:', error);
    alert('You do not have admin access');
    window.location.href = '/';
  }
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      if (view) {
        loadView(view);

        // Update active state
        navItems.forEach((nav) => nav.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });
}

function handleKeyboardShortcuts(e) {
  // Cmd/Ctrl + K for search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.focus();
  }

  // Cmd/Ctrl + S to save
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    const saveBtn = document.querySelector('.btn-primary');
    if (saveBtn) saveBtn.click();
  }
}

// ============================================
// VIEW MANAGEMENT
// ============================================

function loadView(view) {
  currentView = view;
  const container = document.getElementById('view-container');
  const template = document.getElementById(`${view}-template`);

  if (template) {
    container.innerHTML = template.innerHTML;

    // Load view-specific data
    switch (view) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'users':
        loadUsers();
        break;
      case 'tools':
        loadTools();
        break;
      case 'prompts':
        loadPrompts();
        break;
      case 'settings':
        loadSettings();
        break;
      case 'content':
        loadContent();
        break;
      case 'flags':
        loadFlags();
        break;
      case 'analytics':
        loadAnalytics();
        break;
      case 'logs':
        loadLogs();
        break;
    }
  }
}

// ============================================
// DASHBOARD VIEW
// ============================================

async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load dashboard');

    const data = await response.json();

    // Update stats
    updateStat('users', data.overview.total_users, data.overview.users_last_24h);
    updateStat('projects', data.overview.total_projects, data.overview.projects_last_24h);
    updateStat(
      'generations',
      data.overview.generations_today,
      data.overview.generations_yesterday
    );
    updateStat('admins', data.overview.active_admins);

    // Render tool usage chart
    renderToolUsageChart(data.toolStats);

    // Render recent logs
    renderRecentLogs(data.recentLogs);
  } catch (error) {
    console.error('Dashboard error:', error);
    showError('Failed to load dashboard data');
  }
}

function updateStat(key, value, change) {
  const valueEl = document.getElementById(`stat-${key}`);
  const changeEl = document.getElementById(`stat-${key}-change`);

  if (valueEl) {
    valueEl.textContent = formatNumber(value);
  }

  if (changeEl && change !== undefined) {
    const diff = value - change;
    const percent = change > 0 ? ((diff / change) * 100).toFixed(1) : 0;
    changeEl.textContent = `${diff >= 0 ? '+' : ''}${diff} (${percent}%)`;
    changeEl.className = `stat-change ${diff >= 0 ? '' : 'negative'}`;
  }
}

function renderToolUsageChart(data) {
  const container = document.getElementById('tool-usage-chart');
  if (!container || !data) return;

  // Simple bar chart
  const maxUsage = Math.max(...data.map((t) => t.usage_count || 0));

  container.innerHTML = data
    .slice(0, 10)
    .map((tool) => {
      const percentage = maxUsage > 0 ? (tool.usage_count / maxUsage) * 100 : 0;
      return `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>${tool.tool_name}</span>
            <span style="font-weight: 600;">${tool.usage_count}</span>
          </div>
          <div style="background: #e9ecef; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: #0d6efd; height: 100%; width: ${percentage}%;"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderRecentLogs(logs) {
  const container = document.getElementById('recent-logs');
  if (!container || !logs) return;

  container.innerHTML = logs
    .map(
      (log) => `
    <div style="padding: 12px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between;">
      <div>
        <div style="font-weight: 500;">${log.action_type.replace(/_/g, ' ')}</div>
        <div style="font-size: 12px; color: #6c757d;">${log.user_profiles?.email || 'Unknown'}</div>
      </div>
      <div style="font-size: 12px; color: #6c757d;">
        ${formatDate(log.created_at)}
      </div>
    </div>
  `
    )
    .join('');
}

function refreshDashboard() {
  loadDashboard();
}

// ============================================
// USERS VIEW
// ============================================

let usersPage = 1;
let usersFilters = {};

async function loadUsers() {
  try {
    const params = new URLSearchParams({
      ...usersFilters,
      limit: 50,
      offset: (usersPage - 1) * 50,
    });

    const response = await fetch(`${API_BASE}/admin/users?${params}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load users');

    const users = await response.json();
    renderUsersTable(users);

    // Setup search
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        usersFilters.search = e.target.value;
        usersPage = 1;
        loadUsers();
      }, 300));
    }
  } catch (error) {
    console.error('Users error:', error);
    showError('Failed to load users');
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  tbody.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td><input type="checkbox" data-user-id="${user.id}"></td>
      <td>${user.email}</td>
      <td>${user.full_name || '-'}</td>
      <td>${user.projects?.count || 0}</td>
      <td>${user.ai_generations?.count || 0}</td>
      <td>
        <span class="badge badge-success">Active</span>
      </td>
      <td>${formatDate(user.created_at)}</td>
      <td>
        <button class="btn-secondary" onclick="viewUserDetails('${user.id}')">View</button>
        <button class="btn-danger" onclick="restrictUser('${user.id}')">Restrict</button>
      </td>
    </tr>
  `
    )
    .join('');
}

async function viewUserDetails(userId) {
  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load user details');

    const user = await response.json();
    showUserModal(user);
  } catch (error) {
    console.error('User details error:', error);
    showError('Failed to load user details');
  }
}

async function restrictUser(userId) {
  const reason = prompt('Restriction reason:');
  if (!reason) return;

  const type = confirm('Permanent restriction?') ? 'permanent' : 'temporary';

  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/restrict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        restriction_type: type,
        reason,
        expires_at: type === 'temporary' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      }),
    });

    if (!response.ok) throw new Error('Failed to restrict user');

    showSuccess('User restricted');
    loadUsers();
  } catch (error) {
    console.error('Restrict error:', error);
    showError('Failed to restrict user');
  }
}

// ============================================
// TOOLS VIEW
// ============================================

let toolsData = [];

async function loadTools() {
  try {
    const response = await fetch(`${API_BASE}/admin/tools`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load tools');

    toolsData = await response.json();
    renderToolsGrid(toolsData);
  } catch (error) {
    console.error('Tools error:', error);
    showError('Failed to load tools');
  }
}

function renderToolsGrid(tools) {
  const grid = document.getElementById('tools-grid');
  if (!grid) return;

  grid.innerHTML = tools
    .map(
      (tool) => `
    <div class="tool-card">
      <div class="tool-header">
        <div class="tool-name">${tool.display_name}</div>
        <div class="tool-toggle">
          <label>
            <input type="checkbox" 
              ${tool.is_enabled ? 'checked' : ''} 
              onchange="toggleTool('${tool.tool_name}', this.checked)">
            Enabled
          </label>
        </div>
      </div>
      
      <div class="tool-field">
        <label>Display Order</label>
        <input type="number" value="${tool.display_order}" 
          onchange="updateToolField('${tool.tool_name}', 'display_order', this.value)">
      </div>
      
      <div class="tool-field">
        <label>Rate Limit (per hour)</label>
        <input type="number" value="${tool.rate_limit_per_hour}" 
          onchange="updateToolField('${tool.tool_name}', 'rate_limit_per_hour', this.value)">
      </div>
      
      <div class="tool-field">
        <label>Rate Limit (per day)</label>
        <input type="number" value="${tool.rate_limit_per_day}" 
          onchange="updateToolField('${tool.tool_name}', 'rate_limit_per_day', this.value)">
      </div>
      
      <div class="tool-field">
        <label>
          <input type="checkbox" 
            ${tool.is_visible ? 'checked' : ''} 
            onchange="updateToolField('${tool.tool_name}', 'is_visible', this.checked)">
          Visible to users
        </label>
      </div>
      
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #dee2e6;">
        <small class="text-muted">Updated: ${formatDate(tool.updated_at)}</small>
      </div>
    </div>
  `
    )
    .join('');
}

async function toggleTool(toolName, enabled) {
  await updateToolField(toolName, 'is_enabled', enabled);
}

async function updateToolField(toolName, field, value) {
  try {
    const response = await fetch(`${API_BASE}/admin/tools/${toolName}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ [field]: value }),
    });

    if (!response.ok) throw new Error('Failed to update tool');

    // Update local data
    const tool = toolsData.find((t) => t.tool_name === toolName);
    if (tool) {
      tool[field] = value;
    }
  } catch (error) {
    console.error('Update tool error:', error);
    showError('Failed to update tool');
  }
}

async function saveAllTools() {
  showSuccess('All tools saved');
}

// ============================================
// PROMPTS VIEW
// ============================================

async function loadPrompts() {
  try {
    const response = await fetch(`${API_BASE}/admin/prompts`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load prompts');

    const prompts = await response.json();
    renderPromptsList(prompts);

    // Populate tool filter
    const toolFilter = document.getElementById('prompt-filter-tool');
    if (toolFilter) {
      const tools = [...new Set(prompts.map((p) => p.tool_name))];
      toolFilter.innerHTML =
        '<option value="">All Tools</option>' +
        tools.map((tool) => `<option value="${tool}">${tool}</option>`).join('');
    }
  } catch (error) {
    console.error('Prompts error:', error);
    showError('Failed to load prompts');
  }
}

function renderPromptsList(prompts) {
  const container = document.getElementById('prompts-list');
  if (!container) return;

  container.innerHTML = prompts
    .map(
      (prompt) => `
    <div class="prompt-card">
      <div class="prompt-header">
        <div>
          <h4>${prompt.tool_name} - v${prompt.version}</h4>
          ${prompt.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-info">Inactive</span>'}
        </div>
        <div>
          ${!prompt.is_active ? `<button class="btn-success" onclick="activatePrompt('${prompt.id}')">Activate</button>` : ''}
          <button class="btn-secondary" onclick="editPrompt('${prompt.id}')">Edit</button>
        </div>
      </div>
      <div class="prompt-meta">
        <span>Created: ${formatDate(prompt.created_at)}</span>
        ${prompt.activated_at ? `<span>Activated: ${formatDate(prompt.activated_at)}</span>` : ''}
      </div>
      <div class="prompt-template">${prompt.prompt_template.substring(0, 200)}...</div>
    </div>
  `
    )
    .join('');
}

async function activatePrompt(promptId) {
  try {
    const response = await fetch(`${API_BASE}/admin/prompts/${promptId}/activate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to activate prompt');

    showSuccess('Prompt activated');
    loadPrompts();
  } catch (error) {
    console.error('Activate prompt error:', error);
    showError('Failed to activate prompt');
  }
}

function createNewPrompt() {
  alert('Prompt editor modal would open here');
}

function editPrompt(promptId) {
  alert(`Edit prompt ${promptId}`);
}

function filterPrompts() {
  const toolName = document.getElementById('prompt-filter-tool').value;
  loadPrompts(toolName);
}

// ============================================
// SETTINGS VIEW
// ============================================

let settingsData = {};

async function loadSettings() {
  try {
    const response = await fetch(`${API_BASE}/admin/settings`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load settings');

    settingsData = await response.json();
    renderSettings(settingsData);
  } catch (error) {
    console.error('Settings error:', error);
    showError('Failed to load settings');
  }
}

function renderSettings(settings) {
  const criticalSettings = settings.filter((s) =>
    ['maintenance_mode', 'ai_generation_enabled', 'signup_enabled'].includes(s.setting_key)
  );

  const defaultSettings = settings.filter((s) =>
    ['default_language', 'default_tone', 'default_region'].includes(s.setting_key)
  );

  const performanceSettings = settings.filter((s) =>
    ['max_generation_length', 'cache_ttl_hours'].includes(s.setting_key)
  );

  renderSettingsGroup('critical-settings', criticalSettings);
  renderSettingsGroup('default-settings', defaultSettings);
  renderSettingsGroup('performance-settings', performanceSettings);
}

function renderSettingsGroup(groupId, settings) {
  const container = document.getElementById(groupId);
  if (!container) return;

  container.innerHTML = settings
    .map(
      (setting) => `
    <div class="setting-row">
      <div class="setting-label">
        <strong>${setting.setting_key.replace(/_/g, ' ').toUpperCase()}</strong>
        <small>${setting.description}</small>
      </div>
      <div class="setting-control">
        ${renderSettingControl(setting)}
      </div>
    </div>
  `
    )
    .join('');
}

function renderSettingControl(setting) {
  if (typeof setting.setting_value === 'boolean') {
    return `
      <label>
        <input type="checkbox" 
          ${setting.setting_value ? 'checked' : ''} 
          onchange="updateSetting('${setting.setting_key}', this.checked)">
        ${setting.setting_value ? 'Enabled' : 'Disabled'}
      </label>
    `;
  }

  if (typeof setting.setting_value === 'number') {
    return `
      <input type="number" 
        value="${setting.setting_value}" 
        onchange="updateSetting('${setting.setting_key}', this.value)"
        class="form-input">
    `;
  }

  return `
    <input type="text" 
      value="${setting.setting_value}" 
      onchange="updateSetting('${setting.setting_key}', this.value)"
      class="form-input">
  `;
}

async function updateSetting(key, value) {
  try {
    const response = await fetch(`${API_BASE}/admin/settings/${key}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) throw new Error('Failed to update setting');

    showSuccess(`Setting ${key} updated`);
  } catch (error) {
    console.error('Update setting error:', error);
    showError('Failed to update setting');
  }
}

function saveSettings() {
  showSuccess('Settings saved');
}

// ============================================
// STUBS FOR OTHER VIEWS
// ============================================

function loadContent() {
  console.log('Load content view');
}

function loadFlags() {
  console.log('Load flags view');
}

function loadAnalytics() {
  console.log('Load analytics view');
}

async function loadLogs() {
  try {
    const response = await fetch(`${API_BASE}/admin/logs?limit=50`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load logs');

    const logs = await response.json();
    console.log('Logs:', logs);
  } catch (error) {
    console.error('Logs error:', error);
  }
}

// ============================================
// UTILITIES
// ============================================

function formatNumber(num) {
  return num.toLocaleString();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Otherwise show date
  return date.toLocaleDateString();
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showSuccess(message) {
  // Simple alert for now - can be replaced with toast
  alert(`✓ ${message}`);
}

function showError(message) {
  alert(`✗ ${message}`);
}

function showUserModal(user) {
  alert(`User: ${user.email}\nProjects: ${user.projects?.count || 0}\nGenerations: ${user.ai_generations?.count || 0}`);
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
