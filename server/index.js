import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { placesAdapter } from './googlePlacesAdapter.js';
import { calculateLeadScore } from './scoring.js';
import { EmailOutreachService } from './emailService.js';
import { generateCsv } from './csvExporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const emailService = new EmailOutreachService(db);

// System Health & Provider Status (PRD Section 7.10)
app.get('/api/health', (req, res) => {
  const settings = db.getSettings();
  const quota = placesAdapter.getQuotaStatus();
  const hasKey = !!(settings.googlePlacesApiKey || process.env.GOOGLE_PLACES_API_KEY);
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    provider: {
      name: 'Google Places API (New)',
      status: settings.placesApiStatus,
      isLiveGoogleConnected: hasKey,
      requestsToday: quota.requestsToday,
      dailyQuota: quota.maxDailyQuota,
      lastSync: quota.lastSync
    },
    outreach: {
      killSwitchActive: settings.outboundEmailKillSwitch,
      dailyLimit: settings.dailyEmailLimit,
      sentToday: emailService.sentCountToday
    }
  });
});

// Authentication & Registration System
app.post('/api/auth/register', async (req, res) => {
  try {
    const { displayName, email, password, companyName } = req.body;
    if (!displayName || !email || !password) {
      return res.status(400).json({ error: 'Please enter your full name, email, and password.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    const user = await db.registerUser({ displayName, email, password, companyName });
    const { password: _, ...safeUser } = user;
    const token = `token_${user.uid}_${Date.now()}`;
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your email address and password.' });
    }
    const user = db.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }
    const { password: _, ...safeUser } = user;
    const token = `token_${user.uid}_${Date.now()}`;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    const parts = token.split('_');
    if (parts.length >= 2) {
      // Token format: token_user_123456789_timestamp
      const uid = parts.slice(1, -1).join('_');
      const user = db.findUserById(uid);
      if (user) {
        const { password: _, ...safeUser } = user;
        return res.json({ user: safeUser });
      }
    }
    const defaultUser = db.getUsers()[0];
    if (defaultUser) {
      const { password: _, ...safeUser } = defaultUser;
      return res.json({ user: safeUser });
    }
    res.status(401).json({ error: 'Session expired' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users
app.get('/api/users', (req, res) => {
  res.json(db.getUsers().map(({ password, ...u }) => u));
});

// Business Discovery Search (PRD Section 7.2 & 7.3)
app.get('/api/search', async (req, res) => {
  try {
    const { query, category, location, radius, websiteFilter, phoneFilter, minRating } = req.query;
    const settings = db.getSettings();
    const activeApiKey = settings?.googlePlacesApiKey || process.env.GOOGLE_PLACES_API_KEY || '';

    const searchResult = await placesAdapter.searchBusinesses({
      query,
      category,
      location,
      radius: Number(radius) || 10,
      websiteFilter,
      phoneFilter,
      minRating: Number(minRating) || 0,
      apiKey: activeApiKey
    });

    // Cross-reference each result against saved CRM leads for duplicate / saved check
    const enrichedResults = searchResult.results.map(item => {
      const existing = db.findDuplicate(item.businessName, item.businessPhone, item.businessWebsite);
      const scoreData = calculateLeadScore(item);
      return {
        ...item,
        score: scoreData.score,
        priority: scoreData.priority,
        scoreBreakdown: scoreData.breakdown,
        isSaved: !!existing,
        savedLeadId: existing ? existing.id : null,
        savedStage: existing ? existing.pipelineStage : null
      };
    });

    res.json({
      ...searchResult,
      results: enrichedResults
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRM Leads (PRD Section 7.4)
app.get('/api/leads', (req, res) => {
  const leads = db.getLeads(req.query);
  res.json(leads);
});

app.get('/api/leads/:id', (req, res) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

app.post('/api/leads/check-duplicate', (req, res) => {
  const { businessName, phone, website } = req.body;
  const duplicate = db.findDuplicate(businessName, phone, website);
  res.json({
    hasDuplicate: !!duplicate,
    duplicateLead: duplicate || null
  });
});

app.post('/api/leads', async (req, res) => {
  try {
    const { leadData, actorUid } = req.body;
    if (!leadData || !leadData.businessName) {
      return res.status(400).json({ error: 'businessName is required' });
    }

    // Deduplication check
    const duplicate = db.findDuplicate(leadData.businessName, leadData.businessPhone, leadData.businessWebsite);
    if (duplicate && !req.body.forceSave) {
      return res.status(409).json({
        error: 'DUPLICATE_LEAD_DETECTED',
        message: `A potential match '${duplicate.businessName}' already exists in CRM (Stage: ${duplicate.pipelineStage}).`,
        existingLead: duplicate
      });
    }

    const saved = await db.saveLead(leadData, actorUid || 'user_sales_01');
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { updates, actorUid } = req.body;
    const updated = await db.updateLead(req.params.id, updates, actorUid || 'user_sales_01');
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/leads/:id/stage', async (req, res) => {
  try {
    const { stage, dealValue, cashCollected, lossReason, actorUid } = req.body;
    const lead = db.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const updates = { pipelineStage: stage };
    if (dealValue !== undefined) updates.dealValue = Number(dealValue);
    if (cashCollected !== undefined) updates.cashCollected = Number(cashCollected);
    if (lossReason !== undefined) updates.lossReason = lossReason;

    const updated = await db.updateLead(req.params.id, updates, actorUid || 'user_sales_01');

    // Log activity
    await db.addActivity({
      id: `act_${Date.now()}`,
      leadId: req.params.id,
      type: 'status-change',
      occurredAt: new Date().toISOString(),
      outcome: `Stage: ${stage}`,
      summary: `Pipeline stage moved to "${stage}"`,
      details: lossReason ? `Reason: ${lossReason}` : dealValue ? `Deal Value: ₹${dealValue}` : '',
      createdBy: actorUid || 'user_sales_01',
      createdAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  const actorUid = req.query.actorUid || 'user_admin_01';
  const success = await db.deleteLead(req.params.id, actorUid);
  if (!success) return res.status(404).json({ error: 'Lead not found' });
  res.json({ success: true, id: req.params.id });
});

// Activities Timeline (PRD Section 7.6 & 10.3)
app.get('/api/leads/:id/activities', (req, res) => {
  const acts = db.getActivities(req.params.id);
  res.json(acts);
});

app.post('/api/leads/:id/activities', async (req, res) => {
  try {
    const { type, outcome, summary, details, nextStep, actorUid } = req.body;
    const act = await db.addActivity({
      id: `act_${Date.now()}`,
      leadId: req.params.id,
      type: type || 'note',
      occurredAt: new Date().toISOString(),
      outcome: outcome || 'Logged',
      summary: summary || 'Activity logged',
      details: details || '',
      nextStep: nextStep || '',
      createdBy: actorUid || 'user_sales_01',
      createdAt: new Date().toISOString()
    });
    res.status(201).json(act);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow-ups & Tasks (PRD Section 7.6 & 10.4)
app.get('/api/tasks', (req, res) => {
  res.json(db.getTasks(req.query));
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { leadId, title, type, dueAt, assignedTo, actorUid } = req.body;
    if (!title || !dueAt) {
      return res.status(400).json({ error: 'Title and dueAt are required' });
    }
    const task = await db.createTask({
      leadId,
      title,
      type,
      dueAt,
      assignedTo: assignedTo || actorUid || 'user_sales_01'
    }, actorUid || 'user_sales_01');

    // Also update lead nextFollowUpAt
    if (leadId) {
      await db.updateLead(leadId, { nextFollowUpAt: dueAt });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { status, outcome, actorUid, dueAt } = req.body;
    const updated = await db.updateTask(req.params.id, {
      ...(status && { status }),
      ...(outcome && { outcome }),
      ...(dueAt && { dueAt })
    }, actorUid || 'user_sales_01');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email Outreach & Suppression (PRD Section 7.7 & 10.5 & 10.6)
app.get('/api/email/templates', (req, res) => {
  res.json(db.getEmailTemplates());
});

app.post('/api/email/templates', async (req, res) => {
  const template = await db.saveEmailTemplate(req.body, req.body.actorUid || 'user_admin_01');
  res.json(template);
});

app.post('/api/email/preview', (req, res) => {
  const { templateId, leadId, customBody, customSubject } = req.body;
  const lead = db.getLeadById(leadId) || {};
  const templates = db.getEmailTemplates();
  const template = templates.find(t => t.id === templateId) || {};

  const bodyToRender = customBody || template.bodyTemplate || '';
  const subjectToRender = customSubject || template.subjectTemplate || '';

  const variables = {
    businessName: lead.businessName || 'Business Owner',
    contactName: lead.businessName?.split(' ')[0] || 'Sir/Madam',
    locality: lead.locality || lead.city || 'your area',
    relevantService: (lead.opportunityTypes && lead.opportunityTypes[0]) || 'Digital Automation',
    observedOpportunity: (lead.opportunityEvidence && lead.opportunityEvidence[0]) || 'opportunities to capture more online enquiries',
    senderName: 'Siddharth Rathi',
    companyName: 'iCoded Automation Pvt. Ltd.',
    website: 'https://icoded.in',
    contactDetails: '+91 91580 00000 | info@icoded.in'
  };

  const renderedBody = emailService.renderTemplate(bodyToRender, variables);
  const renderedSubject = emailService.renderTemplate(subjectToRender, variables);

  const recipientEmail = lead.publicBusinessEmail || '';
  const isSuppressed = db.isSuppressed(recipientEmail);

  res.json({
    renderedSubject,
    renderedBody,
    recipientEmail,
    isSuppressed: !!isSuppressed,
    suppressionReason: isSuppressed ? isSuppressed.reason : null,
    killSwitchActive: db.getSettings().outboundEmailKillSwitch
  });
});

app.post('/api/email/send', async (req, res) => {
  try {
    const { leadId, recipientEmail, subject, body, senderName, actorUid } = req.body;
    const result = await emailService.sendLeadEmail({
      leadId,
      recipientEmail,
      subject,
      body,
      senderName,
      actorUid: actorUid || 'user_sales_01'
    });
    res.json(result);
  } catch (error) {
    console.error('Send error:', error.message);
    res.status(403).json({ error: error.message });
  }
});

app.get('/api/email/suppression', (req, res) => {
  res.json(db.getSuppressionList());
});

app.post('/api/email/suppression', async (req, res) => {
  const { email, reason, source, actorUid } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  await db.addSuppression({
    normalizedEmail: email,
    reason: reason || 'Manual Admin Suppression',
    source: source || 'Admin Manual Add',
    createdBy: actorUid || 'user_admin_01'
  });
  res.json({ success: true, email });
});

app.delete('/api/email/suppression/:email', async (req, res) => {
  await db.removeSuppression(req.params.email);
  res.json({ success: true, email: req.params.email });
});

// CSV Export (PRD Section 7.8)
app.post('/api/export/csv', (req, res) => {
  try {
    const { leadIds, columns, actorUid = 'user_admin_01' } = req.body;
    let leadsToExport = db.getLeads();

    if (leadIds && leadIds.length > 0) {
      leadsToExport = leadsToExport.filter(l => leadIds.includes(l.id));
    }

    const defaultCols = [
      { key: 'businessName', label: 'Business Name' },
      { key: 'category', label: 'Category' },
      { key: 'locality', label: 'Locality' },
      { key: 'city', label: 'City' },
      { key: 'businessPhone', label: 'Phone' },
      { key: 'businessWebsite', label: 'Website' },
      { key: 'publicBusinessEmail', label: 'Public Email' },
      { key: 'score', label: 'Score' },
      { key: 'priority', label: 'Priority' },
      { key: 'pipelineStage', label: 'Pipeline Stage' },
      { key: 'dealValue', label: 'Deal Value (INR)' },
      { key: 'ownerName', label: 'Lead Owner' },
      { key: 'opportunityTypes', label: 'Identified Opportunities' },
      { key: 'notes', label: 'Internal Notes' },
      { key: 'lastVerifiedAt', label: 'Last Verified Date' }
    ];

    const chosenCols = columns && columns.length > 0 ? columns : defaultCols;
    const csvContent = generateCsv(leadsToExport, chosenCols);

    // Audit log (PRD Section 7.8)
    db.addAuditLog({
      actorUid,
      action: 'EXPORT_LEADS_CSV',
      entityType: 'lead',
      entityId: 'batch_export',
      result: 'SUCCESS',
      metadata: { recordCount: leadsToExport.length, columnCount: chosenCols.length }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="icoded_leads_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/export/csv', (req, res) => {
  try {
    const leadsToExport = db.getLeads();
    const defaultCols = [
      { key: 'businessName', label: 'Business Name' },
      { key: 'category', label: 'Category' },
      { key: 'locality', label: 'Locality' },
      { key: 'city', label: 'City' },
      { key: 'businessPhone', label: 'Phone' },
      { key: 'businessWebsite', label: 'Website' },
      { key: 'publicBusinessEmail', label: 'Public Email' },
      { key: 'rating', label: 'Rating' },
      { key: 'reviewCount', label: 'Reviews' },
      { key: 'pipelineStage', label: 'Lead Status' },
      { key: 'opportunityTypes', label: 'Digital Opportunities' },
      { key: 'notes', label: 'Notes' },
      { key: 'createdAt', label: 'Saved Date' }
    ];
    const csvContent = generateCsv(leadsToExport, defaultCols);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="icoded_leads_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics & Reports (PRD Section 7.9)
app.get('/api/reports/analytics', (req, res) => {
  const leads = db.getLeads(req.query);
  const tasks = db.getTasks(req.query);

  const stageCounts = {
    New: 0,
    Researching: 0,
    Qualified: 0,
    Contacted: 0,
    Interested: 0,
    'Meeting Booked': 0,
    'Proposal Sent': 0,
    Negotiation: 0,
    Won: 0,
    Lost: 0,
    'Not a Fit': 0
  };

  let totalWonRevenue = 0;
  let totalCashCollected = 0;
  let pipelinePotentialValue = 0;

  leads.forEach(l => {
    if (stageCounts[l.pipelineStage] !== undefined) {
      stageCounts[l.pipelineStage] += 1;
    }
    if (l.pipelineStage === 'Won') {
      totalWonRevenue += Number(l.dealValue || 0);
      totalCashCollected += Number(l.cashCollected || 0);
    } else if (l.pipelineStage !== 'Lost' && l.pipelineStage !== 'Not a Fit') {
      pipelinePotentialValue += Number(l.dealValue || 0);
    }
  });

  const now = new Date();
  const overdueTasks = tasks.filter(t => t.status === 'Pending' && new Date(t.dueAt) < now).length;
  const tasksDueToday = tasks.filter(t => {
    if (t.status !== 'Pending') return false;
    const d = new Date(t.dueAt);
    return d.toDateString() === now.toDateString();
  }).length;

  res.json({
    metrics: {
      totalDiscovered: 42,
      totalSavedLeads: leads.length,
      totalQualified: leads.filter(l => l.priority === 'Hot' || l.priority === 'Warm').length,
      totalContacted: leads.filter(l => ['Contacted', 'Interested', 'Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.pipelineStage)).length,
      totalMeetings: leads.filter(l => ['Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.pipelineStage)).length,
      totalProposals: leads.filter(l => ['Proposal Sent', 'Negotiation', 'Won'].includes(l.pipelineStage)).length,
      totalWon: stageCounts.Won,
      totalWonRevenue,
      totalCashCollected,
      pipelinePotentialValue,
      overdueTasks,
      tasksDueToday
    },
    funnel: [
      { stage: 'Discovered', count: 42, conversion: 100 },
      { stage: 'Saved Leads', count: leads.length, conversion: Math.round((leads.length / 42) * 100) },
      { stage: 'Qualified', count: leads.filter(l => l.priority === 'Hot' || l.priority === 'Warm').length, conversion: Math.round((leads.filter(l => l.priority === 'Hot' || l.priority === 'Warm').length / leads.length) * 100) },
      { stage: 'Contacted', count: leads.filter(l => ['Contacted', 'Interested', 'Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.pipelineStage)).length, conversion: 75 },
      { stage: 'Meetings', count: leads.filter(l => ['Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.pipelineStage)).length, conversion: 40 },
      { stage: 'Proposals', count: leads.filter(l => ['Proposal Sent', 'Negotiation', 'Won'].includes(l.pipelineStage)).length, conversion: 30 },
      { stage: 'Closed Won', count: stageCounts.Won, conversion: 15 }
    ],
    stageCounts
  });
});

// Audit Logs (PRD Section 7.10 & 10.7)
app.get('/api/audit-logs', (req, res) => {
  res.json(db.getAuditLogs());
});

// Settings & Scoring Rules (PRD Section 7.10)
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.patch('/api/settings', async (req, res) => {
  const { updates, actorUid } = req.body;
  const newSettings = await db.updateSettings(updates, actorUid || 'user_admin_01');
  res.json(newSettings);
});

// Verify Google Places API Key
app.post('/api/settings/verify-google-api', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey || db.getSettings()?.googlePlacesApiKey || process.env.GOOGLE_PLACES_API_KEY;
    if (!keyToTest) {
      return res.status(400).json({ success: false, error: 'No Google Places API key provided.' });
    }
    const result = await placesAdapter.testGooglePlacesApiKey(keyToTest);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static client bundle with cache-busting
app.use(express.static(distPath, { etag: false, maxAge: 0 }));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`iCoded LeadPilot Backend running on http://localhost:${PORT}`);
});

// Keep process active in non-interactive terminal
setInterval(() => {}, 60000);
