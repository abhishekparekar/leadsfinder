/**
 * iCoded LeadPilot — Firestore Multi-Tenant Database Adapter
 * Configured for Project: job-portal-85414
 * Tenant: icoded-leads-abhi
 * 
 * Clean Database (Zero Demo Data):
 * Leads, activities, tasks, and suppressions start clean.
 * All mutations sync directly to Firestore under tenants/icoded-leads-abhi/*
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateLeadScore } from './scoring.js';
import { 
  getTenantCollection, 
  getTenantDoc, 
  firestore, 
  TENANT_ID 
} from './firebase.js';
import { 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Real Users for iCoded
const INITIAL_USERS = [
  {
    uid: 'user_admin_01',
    displayName: 'Aditya Shinde (Founder)',
    email: 'aditya@icoded.in',
    role: 'Admin',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'user_sales_01',
    displayName: 'Pooja Deshmukh (Sales Lead)',
    email: 'pooja@icoded.in',
    role: 'Sales',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'user_sales_02',
    displayName: 'Rohan Patil (SDR)',
    email: 'rohan@icoded.in',
    role: 'Sales',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'user_analyst_01',
    displayName: 'Sneha More (Market Analyst)',
    email: 'sneha@icoded.in',
    role: 'Analyst',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Production-ready Outreach Email Templates
const INITIAL_TEMPLATES = [
  {
    id: 'tpl_clinic_whatsapp',
    name: 'Healthcare: Clinic WhatsApp Appointment Booking',
    serviceLine: 'WhatsApp Enquiry / Booking Automation',
    purpose: 'Initial introduction to clinic doctors highlighting missed patient enquiries on mobile',
    subjectTemplate: 'Quick question regarding patient appointments at {{businessName}}',
    bodyTemplate: `Hi Dr. {{contactName}},

I came across {{businessName}} while reviewing specialized healthcare practices in {{locality}}. 

We noticed that patients discovering {{businessName}} online currently have to make a direct voice call or visit in person. At iCoded Automation, we help top clinics in Maharashtra automate their appointment booking directly over WhatsApp with automated slot confirmations, Google Calendar sync, and instant vaccination/follow-up reminders.

Clinics using our solution typically see a 35% reduction in reception phone workload and 0 missed evening enquiries.

Would you be open to a brief 7-minute call this Thursday to see how this works for {{businessName}}?

Best regards,
{{senderName}}
iCoded Automation Pvt. Ltd. | Chhatrapati Sambhajinagar
Website: https://icoded.in
Direct: +91 91580 00000

---
To opt out of future communications from iCoded, reply with "STOP" or contact privacy@icoded.in.`,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl_web_redesign',
    name: 'Website & Mobile Redesign for Local Practice',
    serviceLine: 'Websites & E-commerce',
    purpose: 'Targeting businesses with outdated or missing responsive websites',
    subjectTemplate: 'Digital presence and mobile enquiry flow for {{businessName}}',
    bodyTemplate: `Dear Team {{businessName}},

I was looking up services in {{locality}} and noticed {{observedOpportunity}}.

In {{locality}}, over 82% of patients and customers search on mobile phones. When a website takes more than 3 seconds to load or lacks a clear booking CTA, prospects quickly switch to neighboring alternatives.

At iCoded Automation, we design lightning-fast, mobile-first websites with integrated enquiry flows and Google Business Profile optimization.

Are you available for a short demo next week showing a modern mobile concept customized for {{businessName}}?

Warm regards,
{{senderName}}
Business Solutions Consultant
{{companyName}}`,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl_custom_crm',
    name: 'Education / Academy Student CRM & Follow-up',
    serviceLine: 'CRM/HRMS/ERP Solutions',
    purpose: 'Targeting coaching institutes and academies to stop lead leakage',
    subjectTemplate: 'Streamlining student enquiry follow-ups at {{businessName}}',
    bodyTemplate: `Hello Director at {{businessName}},

During admission cycles, coaching institutes in {{locality}} receive hundreds of parent calls, walk-ins, and online leads. Managing these on personal phone logs or spreadsheets often leads to 40%+ untracked inquiries.

We developed iCoded EduLead CRM specifically for coaching institutes in Maharashtra:
- Automatic capture from Meta Ads, website, and WhatsApp
- Instant automated WhatsApp brochure dispatch to parent
- Daily counselor task dashboard with call recording & outcome notes

Could we schedule a 10-minute online walkthrough this Friday?

Regards,
{{senderName}}
Enterprise Solutions | iCoded Automation`,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_SETTINGS = {
  tenantId: TENANT_ID,
  outboundEmailKillSwitch: false,
  dailyEmailLimit: 50,
  placesApiStatus: 'Connected',
  quotaRequestsToday: 0,
  quotaLimitDaily: 1000,
  scoringWeights: {
    sectorFit: 25,
    opportunityEvidence: 25,
    reachability: 15,
    digitalPresence: 20,
    freshness: 15
  },
  serviceCatalog: [
    'Websites and E-commerce Development',
    'Android Applications',
    'Custom Software & Automation',
    'CRM / HRMS / ERP / LMS Solutions',
    'Meta Ads Management & Social Support',
    'Google Business Profile Assistance',
    'Lead Generation & WhatsApp Enquiry Automation'
  ]
};

// CLEAN DATABASE: Zero fake/demo leads, tasks, or activities
const INITIAL_LEADS = [];
const INITIAL_ACTIVITIES = [];
const INITIAL_TASKS = [];
const INITIAL_SUPPRESSION = [];
const INITIAL_AUDIT_LOGS = [];

class Database {
  constructor() {
    this.users = [...INITIAL_USERS];
    this.leads = [];
    this.activities = [];
    this.tasks = [];
    this.templates = [...INITIAL_TEMPLATES];
    this.suppression = [];
    this.auditLogs = [];
    this.settings = { ...INITIAL_SETTINGS };

    this.initFirestoreSync();
  }

  async initFirestoreSync() {
    try {
      console.log(`[Firestore] Syncing collections for tenant: ${TENANT_ID}...`);
      
      // Load Leads from Firestore
      const leadsSnap = await getDocs(getTenantCollection('leads'));
      if (!leadsSnap.empty) {
        this.leads = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log(`[Firestore] Loaded ${this.leads.length} leads for tenant ${TENANT_ID}`);
      }

      // Load Activities
      const actsSnap = await getDocs(getTenantCollection('activities'));
      if (!actsSnap.empty) {
        this.activities = actsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // Load Tasks
      const tasksSnap = await getDocs(getTenantCollection('tasks'));
      if (!tasksSnap.empty) {
        this.tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // Load Suppression List
      const supSnap = await getDocs(getTenantCollection('suppression'));
      if (!supSnap.empty) {
        this.suppression = supSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // Load Templates
      const tplsSnap = await getDocs(getTenantCollection('emailTemplates'));
      if (!tplsSnap.empty) {
        this.templates = tplsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else {
        // Sync initial templates to Firestore
        for (const tpl of this.templates) {
          await setDoc(getTenantDoc('emailTemplates', tpl.id), tpl).catch(() => {});
        }
      }

      // Load Settings
      const setDocSnap = await getDoc(getTenantDoc('settings', 'global'));
      if (setDocSnap.exists()) {
        this.settings = { ...this.settings, ...setDocSnap.data() };
      } else {
        await setDoc(getTenantDoc('settings', 'global'), this.settings).catch(() => {});
      }

      // Load Users
      const usersSnap = await getDocs(getTenantCollection('users'));
      if (!usersSnap.empty) {
        this.users = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
      } else {
        for (const u of this.users) {
          await setDoc(getTenantDoc('users', u.uid), u).catch(() => {});
        }
      }

      this.saveLocalBackup();
      console.log(`[Firestore] Multi-tenant sync complete for '${TENANT_ID}'. Platform ready.`);
    } catch (err) {
      console.warn(`[Firestore] Initial sync notice: ${err.message}. Using cache.`);
    }
  }

  saveLocalBackup() {
    try {
      const data = {
        tenantId: TENANT_ID,
        users: this.users,
        leads: this.leads,
        activities: this.activities,
        tasks: this.tasks,
        templates: this.templates,
        suppression: this.suppression,
        auditLogs: this.auditLogs,
        settings: this.settings
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      // Ignore backup error
    }
  }

  // Users
  getUsers() { return this.users; }
  getUser(uid) { return this.users.find(u => u.uid === uid); }
  async addUser(user) {
    this.users.push(user);
    this.saveLocalBackup();
    await setDoc(getTenantDoc('users', user.uid), user).catch(console.error);
    return user;
  }
  async updateUser(uid, updates) {
    const idx = this.users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveLocalBackup();
      await setDoc(getTenantDoc('users', uid), this.users[idx]).catch(console.error);
      return this.users[idx];
    }
    return null;
  }

  // Leads
  getLeads(filters = {}) {
    let list = [...this.leads];
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(l => 
        (l.businessName || '').toLowerCase().includes(q) ||
        (l.locality || '').toLowerCase().includes(q) ||
        (l.category || '').toLowerCase().includes(q) ||
        (l.tags && l.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    if (filters.category && filters.category !== 'All') {
      list = list.filter(l => (l.category || '').toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.priority && filters.priority !== 'All') {
      list = list.filter(l => l.priority === filters.priority);
    }
    if (filters.stage && filters.stage !== 'All') {
      list = list.filter(l => l.pipelineStage === filters.stage);
    }
    if (filters.owner && filters.owner !== 'All') {
      list = list.filter(l => l.ownerUid === filters.owner);
    }
    if (filters.hasWebsite === 'yes') {
      list = list.filter(l => !!l.businessWebsite);
    } else if (filters.hasWebsite === 'no') {
      list = list.filter(l => !l.businessWebsite);
    }
    return list;
  }

  getLeadById(id) {
    return this.leads.find(l => l.id === id);
  }

  findDuplicate(businessName, phone, website) {
    const normName = (businessName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const cleanDomain = website ? website.replace(/https?:\/\//, '').replace(/www\./, '').split('/')[0].toLowerCase() : '';

    return this.leads.find(l => {
      const lNorm = (l.businessName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const lPhone = (l.businessPhone || '').replace(/[^0-9]/g, '');
      const lDomain = l.businessWebsite ? l.businessWebsite.replace(/https?:\/\//, '').replace(/www\./, '').split('/')[0].toLowerCase() : '';

      if (normName && lNorm && (normName === lNorm || (normName.length > 8 && lNorm.includes(normName)))) return true;
      if (cleanPhone && lPhone && cleanPhone.slice(-10) === lPhone.slice(-10)) return true;
      if (cleanDomain && lDomain && cleanDomain === lDomain) return true;
      return false;
    });
  }

  async saveLead(leadData, actorUid = 'user_admin_01') {
    const scoreResult = calculateLeadScore(leadData);
    const newLead = {
      id: `lead_${Date.now()}`,
      tenantId: TENANT_ID,
      businessName: leadData.businessName,
      normalizedBusinessName: (leadData.businessName || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
      category: leadData.category || 'General Business',
      subcategory: leadData.subcategory || '',
      address: leadData.address || '',
      locality: leadData.locality || '',
      city: leadData.city || 'Chhatrapati Sambhajinagar',
      region: leadData.region || 'Maharashtra',
      country: leadData.country || 'India',
      lat: leadData.lat || 19.8762,
      lng: leadData.lng || 75.3433,
      businessPhone: leadData.businessPhone || '',
      businessWebsite: leadData.businessWebsite || '',
      publicBusinessEmail: leadData.publicBusinessEmail || '',
      rating: leadData.rating || 0,
      reviewCount: leadData.reviewCount || 0,
      sourceName: leadData.sourceName || 'Google Places API (New)',
      sourceRecordId: leadData.sourceRecordId || '',
      sourceAttribution: leadData.sourceAttribution || 'Google Places Platform',
      discoveredAt: leadData.discoveredAt || new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString().split('T')[0],
      dataQualityStatus: leadData.dataQualityStatus || 'Pending Review',
      opportunityTypes: leadData.opportunityTypes || [],
      opportunityEvidence: leadData.opportunityEvidence || [],
      score: scoreResult.score,
      scoreBreakdown: scoreResult.breakdown,
      priority: leadData.priority || scoreResult.priority,
      priorityReason: leadData.priorityReason || '',
      pipelineStage: leadData.pipelineStage || 'New',
      dealValue: Number(leadData.dealValue) || 0,
      cashCollected: Number(leadData.cashCollected) || 0,
      lossReason: leadData.lossReason || '',
      ownerUid: leadData.ownerUid || actorUid,
      ownerName: leadData.ownerName || 'Pooja Deshmukh',
      tags: leadData.tags || [],
      notes: leadData.notes || '',
      nextFollowUpAt: leadData.nextFollowUpAt || '',
      createdBy: actorUid,
      createdAt: new Date().toISOString(),
      updatedBy: actorUid,
      updatedAt: new Date().toISOString()
    };

    this.leads.unshift(newLead);
    this.saveLocalBackup();

    // Firestore Sync
    await setDoc(getTenantDoc('leads', newLead.id), newLead).catch(console.error);

    // Add activity in Firestore
    await this.addActivity({
      id: `act_${Date.now()}`,
      leadId: newLead.id,
      type: 'status-change',
      occurredAt: new Date().toISOString(),
      outcome: 'Discovered & Saved',
      summary: `Lead saved to CRM from ${newLead.sourceName}`,
      details: `Initial score: ${newLead.score}/100 (${newLead.priority}). Stage: ${newLead.pipelineStage}.`,
      createdBy: actorUid,
      createdAt: new Date().toISOString()
    });

    return newLead;
  }

  async updateLead(id, updates, actorUid = 'user_admin_01') {
    const idx = this.leads.findIndex(l => l.id === id);
    if (idx === -1) return null;

    const existing = this.leads[idx];
    const merged = { ...existing, ...updates, updatedBy: actorUid, updatedAt: new Date().toISOString() };

    if (updates.category || updates.opportunityTypes || updates.opportunityEvidence || updates.businessPhone || updates.businessWebsite) {
      const scoreResult = calculateLeadScore(merged);
      merged.score = scoreResult.score;
      merged.scoreBreakdown = scoreResult.breakdown;
      if (!updates.priority) {
        merged.priority = scoreResult.priority;
      }
    }

    this.leads[idx] = merged;
    this.saveLocalBackup();

    // Firestore Sync
    await setDoc(getTenantDoc('leads', id), merged).catch(console.error);

    return merged;
  }

  async deleteLead(id, actorUid = 'user_admin_01') {
    const idx = this.leads.findIndex(l => l.id === id);
    if (idx === -1) return false;
    const removed = this.leads.splice(idx, 1)[0];
    this.saveLocalBackup();

    // Firestore Sync
    await deleteDoc(getTenantDoc('leads', id)).catch(console.error);

    await this.addAuditLog({
      actorUid,
      action: 'DELETE_LEAD',
      entityType: 'lead',
      entityId: id,
      result: 'SUCCESS',
      metadata: { businessName: removed.businessName }
    });

    return true;
  }

  // Activities
  getActivities(leadId) {
    return this.activities.filter(a => a.leadId === leadId).sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
  }

  async addActivity(activity) {
    const fullActivity = { ...activity, tenantId: TENANT_ID };
    this.activities.unshift(fullActivity);
    this.saveLocalBackup();
    await setDoc(getTenantDoc('activities', fullActivity.id), fullActivity).catch(console.error);
    return fullActivity;
  }

  // Tasks
  getTasks() {
    return this.tasks;
  }

  async createTask(taskData, actorUid = 'user_admin_01') {
    const newTask = {
      id: `task_${Date.now()}`,
      tenantId: TENANT_ID,
      leadId: taskData.leadId,
      title: taskData.title,
      type: taskData.type || 'call',
      dueAt: taskData.dueAt,
      status: 'Pending',
      assignedTo: taskData.assignedTo || actorUid,
      outcome: '',
      createdBy: actorUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.unshift(newTask);
    this.saveLocalBackup();
    await setDoc(getTenantDoc('tasks', newTask.id), newTask).catch(console.error);
    return newTask;
  }

  async updateTask(id, updates, actorUid = 'user_admin_01') {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = { ...this.tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    
    if (updates.status === 'Completed' && this.tasks[idx].leadId) {
      await this.addActivity({
        id: `act_${Date.now()}`,
        leadId: this.tasks[idx].leadId,
        type: this.tasks[idx].type || 'call',
        occurredAt: new Date().toISOString(),
        outcome: updates.outcome || 'Completed',
        summary: `Task completed: ${this.tasks[idx].title}`,
        details: updates.outcome || 'Marked as completed by assignee.',
        createdBy: actorUid,
        createdAt: new Date().toISOString()
      });
    }

    this.saveLocalBackup();
    await setDoc(getTenantDoc('tasks', id), this.tasks[idx]).catch(console.error);
    return this.tasks[idx];
  }

  // Templates
  getEmailTemplates() { return this.templates; }
  async saveEmailTemplate(template, actorUid = 'user_admin_01') {
    if (template.id) {
      const idx = this.templates.findIndex(t => t.id === template.id);
      if (idx !== -1) {
        this.templates[idx] = { ...this.templates[idx], ...template, updatedAt: new Date().toISOString() };
        this.saveLocalBackup();
        await setDoc(getTenantDoc('emailTemplates', template.id), this.templates[idx]).catch(console.error);
        return this.templates[idx];
      }
    }
    const newTemplate = {
      ...template,
      id: `tpl_${Date.now()}`,
      tenantId: TENANT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorUid
    };
    this.templates.push(newTemplate);
    this.saveLocalBackup();
    await setDoc(getTenantDoc('emailTemplates', newTemplate.id), newTemplate).catch(console.error);
    return newTemplate;
  }

  // Suppression
  getSuppressionList() { return this.suppression; }
  isSuppressed(email) {
    if (!email) return false;
    const norm = email.trim().toLowerCase();
    return this.suppression.find(s => s.normalizedEmail === norm) || null;
  }
  async addSuppression(entry) {
    const norm = entry.normalizedEmail.trim().toLowerCase();
    if (!this.suppression.some(s => s.normalizedEmail === norm)) {
      const newSup = {
        id: `sup_${Date.now()}`,
        tenantId: TENANT_ID,
        normalizedEmail: norm,
        reason: entry.reason || 'Manual Suppression',
        source: entry.source || 'Admin Interface',
        createdAt: new Date().toISOString(),
        createdBy: entry.createdBy || 'user_admin_01'
      };
      this.suppression.push(newSup);
      this.saveLocalBackup();
      await setDoc(getTenantDoc('suppression', newSup.id), newSup).catch(console.error);
    }
    return true;
  }
  async removeSuppression(email) {
    const norm = email.trim().toLowerCase();
    const item = this.suppression.find(s => s.normalizedEmail === norm);
    this.suppression = this.suppression.filter(s => s.normalizedEmail !== norm);
    this.saveLocalBackup();
    if (item) {
      await deleteDoc(getTenantDoc('suppression', item.id)).catch(console.error);
    }
    return true;
  }

  // Audit Logs
  getAuditLogs() {
    return this.auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  async addAuditLog(log) {
    const newLog = {
      id: `log_${Date.now()}`,
      tenantId: TENANT_ID,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.auditLogs.unshift(newLog);
    this.saveLocalBackup();
    await setDoc(getTenantDoc('auditLogs', newLog.id), newLog).catch(console.error);
    return newLog;
  }

  // Settings
  getSettings() { return this.settings; }
  async updateSettings(updates, actorUid = 'user_admin_01') {
    this.settings = { ...this.settings, ...updates };
    this.saveLocalBackup();
    await setDoc(getTenantDoc('settings', 'global'), this.settings).catch(console.error);
    await this.addAuditLog({
      actorUid,
      action: 'UPDATE_SYSTEM_SETTINGS',
      entityType: 'settings',
      entityId: 'global',
      result: 'SUCCESS',
      metadata: updates
    });
    return this.settings;
  }
}

export const db = new Database();
