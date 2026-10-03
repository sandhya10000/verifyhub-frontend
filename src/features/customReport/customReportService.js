import { config } from './config.js';

/**
 * MOCK: replace each function with the real API call (same signatures and return shapes)
 */

const STORAGE_KEY = 'vh_mock_custom_reports';

/**
 * @typedef {Object} CustomReportRequest
 * @property {string} id - Request ID (e.g., 'CR-1042')
 * @property {string} companyName
 * @property {string} logo - Data URL or URL of the logo
 * @property {Object} brandColors - { primary: string, secondary: string, autoChoose: boolean }
 * @property {string} tagline
 * @property {string} signatoryName
 * @property {string} signatoryDesignation
 * @property {Object} contact - { email, phone, website, address }
 * @property {Object} socialLinks - { linkedin, instagram, facebook, x, youtube }
 * @property {Object} preferences - { sections, language, disclaimer, previousAnalysisId, additionalNotes, referenceFile }
 * @property {string} status - 'submitted' | 'in_design' | 'draft_ready' | 'changes_requested' | 'approved' | 'cancelled'
 * @property {string} expectedBy - ISO date string
 * @property {string} createdAt - ISO date string
 * @property {number} revisionCount
 * @property {Array} statusHistory - [{ status, timestamp, note }]
 * @property {Array} comments - [{ id, sender: 'user'|'team', text, timestamp }]
 */

const getMockData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { requests: [], activeBrand: null };
};

const saveMockData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateExpectedDate = (days) => {
  let date = new Date();
  let addedDays = 0;
  while (addedDays < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      addedDays++;
    }
  }
  return date.toISOString();
};

export const customReportService = {
  createRequest: async (formData) => {
    await delay(500);
    const data = getMockData();
    
    const hasActive = data.requests.some(
      (r) => !['approved', 'cancelled'].includes(r.status)
    );
    if (hasActive) {
      throw new Error('You already have an active custom report request.');
    }

    const newRequest = {
      id: `CR-${1000 + data.requests.length + 1}`,
      ...formData,
      status: 'submitted',
      expectedBy: calculateExpectedDate(config.SLA_WORKING_DAYS),
      createdAt: new Date().toISOString(),
      revisionCount: 0,
      statusHistory: [{ status: 'submitted', timestamp: new Date().toISOString(), note: 'Request submitted' }],
      comments: [],
    };

    data.requests.push(newRequest);
    saveMockData(data);
    return newRequest;
  },

  listRequests: async () => {
    await delay(300);
    return getMockData().requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getRequest: async (id) => {
    await delay(300);
    const request = getMockData().requests.find((r) => r.id === id);
    if (!request) throw new Error('Request not found');
    return request;
  },

  addComment: async (id, text) => {
    await delay(400);
    const data = getMockData();
    const req = data.requests.find((r) => r.id === id);
    if (!req) throw new Error('Request not found');
    req.comments.push({ id: Date.now().toString(), sender: 'user', text, timestamp: new Date().toISOString() });
    saveMockData(data);
    return req;
  },

  requestChanges: async (id, text) => {
    await delay(500);
    const data = getMockData();
    const req = data.requests.find((r) => r.id === id);
    if (!req) throw new Error('Request not found');
    if (req.status !== 'draft_ready') throw new Error('Cannot request changes in current status');
    if (req.revisionCount >= config.MAX_REVISIONS) throw new Error('Maximum revisions reached');
    
    req.status = 'changes_requested';
    req.revisionCount += 1;
    req.statusHistory.push({ status: 'changes_requested', timestamp: new Date().toISOString(), note: text });
    req.comments.push({ id: Date.now().toString(), sender: 'user', text, timestamp: new Date().toISOString() });
    req.expectedBy = calculateExpectedDate(3);
    
    saveMockData(data);
    return req;
  },

  approve: async (id) => {
    await delay(500);
    const data = getMockData();
    const req = data.requests.find((r) => r.id === id);
    if (!req) throw new Error('Request not found');
    if (req.status !== 'draft_ready') throw new Error('Cannot approve in current status');
    
    req.status = 'approved';
    req.statusHistory.push({ status: 'approved', timestamp: new Date().toISOString(), note: 'Brand approved' });
    data.activeBrand = req;
    
    saveMockData(data);
    return req;
  },

  cancel: async (id) => {
    await delay(400);
    const data = getMockData();
    const req = data.requests.find((r) => r.id === id);
    if (!req) throw new Error('Request not found');
    if (req.status !== 'submitted') throw new Error('Can only cancel submitted requests');
    
    req.status = 'cancelled';
    req.statusHistory.push({ status: 'cancelled', timestamp: new Date().toISOString(), note: 'Cancelled by user' });
    
    saveMockData(data);
    return req;
  },

  getBrandTemplate: async () => {
    await delay(200);
    return getMockData().activeBrand;
  },

  listPastAnalyses: async () => {
    await delay(300);
    return [
      { id: 'a1', name: 'AI Analysis - Oct 1', date: '2026-10-01' },
      { id: 'a2', name: 'AI Analysis - Sep 15', date: '2026-09-15' },
    ];
  },

  // DEV ONLY
  simulateTeamAction: async (id, actionType) => {
    const isDev = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : true;
    if (!isDev) return;
    const data = getMockData();
    const req = data.requests.find((r) => r.id === id);
    if (!req) return;
    
    if (actionType === 'in_design') {
      req.status = 'in_design';
      req.statusHistory.push({ status: 'in_design', timestamp: new Date().toISOString(), note: `Design team has started work.` });
    } else if (actionType === 'draft_ready') {
      req.status = 'draft_ready';
      req.statusHistory.push({ status: 'draft_ready', timestamp: new Date().toISOString(), note: `Draft version uploaded for your review.` });
      req.comments.push({ id: Date.now().toString(), sender: 'team', text: `Hi, your draft is ready for review! Please let us know if you need changes.`, timestamp: new Date().toISOString() });
    } else if (actionType === 'reply') {
      req.comments.push({ id: Date.now().toString(), sender: 'team', text: `We are looking into your feedback and will update you shortly.`, timestamp: new Date().toISOString() });
    }
    
    saveMockData(data);
  }
};
