/**
 * iCoded LeadPilot Frontend API Client
 */

const BASE_URL = '/api';

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`);
    return res.json();
  },
  createUser: async (userData) => {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  // Search & Discovery
  searchBusinesses: async (params) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/search?${query}`);
    return res.json();
  },

  // Leads
  getLeads: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/leads?${query}`);
    return res.json();
  },
  getLeadById: async (id) => {
    const res = await fetch(`${BASE_URL}/leads/${id}`);
    return res.json();
  },
  checkDuplicate: async (businessName, phone, website) => {
    const res = await fetch(`${BASE_URL}/leads/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, phone, website })
    });
    return res.json();
  },
  saveLead: async (leadData, actorUid, forceSave = false) => {
    const res = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadData, actorUid, forceSave })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to save lead');
    return data;
  },
  updateLead: async (id, updates, actorUid) => {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates, actorUid })
    });
    return res.json();
  },
  updateLeadStage: async (id, stageData) => {
    const res = await fetch(`${BASE_URL}/leads/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stageData)
    });
    return res.json();
  },
  deleteLead: async (id, actorUid) => {
    const res = await fetch(`${BASE_URL}/leads/${id}?actorUid=${actorUid || ''}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Activities
  getActivities: async (leadId) => {
    const res = await fetch(`${BASE_URL}/leads/${leadId}/activities`);
    return res.json();
  },
  logActivity: async (leadId, activityData) => {
    const res = await fetch(`${BASE_URL}/leads/${leadId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData)
    });
    return res.json();
  },

  // Tasks
  getTasks: async () => {
    const res = await fetch(`${BASE_URL}/tasks`);
    return res.json();
  },
  createTask: async (taskData) => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return res.json();
  },
  updateTask: async (id, taskData) => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return res.json();
  },

  // Email Outreach
  getEmailTemplates: async () => {
    const res = await fetch(`${BASE_URL}/email/templates`);
    return res.json();
  },
  saveEmailTemplate: async (templateData) => {
    const res = await fetch(`${BASE_URL}/email/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData)
    });
    return res.json();
  },
  previewEmail: async (previewData) => {
    const res = await fetch(`${BASE_URL}/email/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(previewData)
    });
    return res.json();
  },
  sendEmail: async (sendData) => {
    const res = await fetch(`${BASE_URL}/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sendData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send outreach email');
    return data;
  },
  getSuppressionList: async () => {
    const res = await fetch(`${BASE_URL}/email/suppression`);
    return res.json();
  },
  addSuppression: async (entry) => {
    const res = await fetch(`${BASE_URL}/email/suppression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.json();
  },
  removeSuppression: async (email) => {
    const res = await fetch(`${BASE_URL}/email/suppression/${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Export CSV
  exportCsv: async (exportData) => {
    const res = await fetch(`${BASE_URL}/export/csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportData)
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icoded_leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Reports
  getAnalytics: async () => {
    const res = await fetch(`${BASE_URL}/reports/analytics`);
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async () => {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    return res.json();
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${BASE_URL}/settings`);
    return res.json();
  },
  updateSettings: async (updates, actorUid) => {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates, actorUid })
    });
    return res.json();
  }
};
