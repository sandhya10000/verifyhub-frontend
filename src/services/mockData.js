export const partners = [
  { id: 'VHPT-000142', name: 'Sharma Fincorp', tier: 2, tierName: 'Standard', walletBalance: 12450.00, status: 'active', pullsThisMonth: 342, profitThisMonth: 8550 },
  { id: 'VHPT-000143', name: 'Mehta Associates', tier: 1, tierName: 'Start-Up', walletBalance: 450.00, status: 'low-balance', pullsThisMonth: 120, profitThisMonth: 3600 },
  { id: 'VHPT-000144', name: 'Kapoor Capital', tier: 3, tierName: 'Advance', walletBalance: 0.00, status: 'frozen', pullsThisMonth: 45, profitThisMonth: 1125 },
];

export const currentPartner = partners[0]; // Sharma Fincorp

export const recentPulls = [
  { id: 'PULL-101', customerName: 'Rahul Sharma', pan: 'ABCDE1234F', bureau: 'CIBIL', score: 780, status: 'Success', fee: 100, cost: 75, timestamp: new Date(new Date().setHours(18, 42, 0, 0)).toISOString() },
  { id: 'PULL-102', customerName: 'Priya Nair', pan: 'FGHIJ5678K', bureau: 'Experian', score: 686, status: 'Success', fee: 100, cost: 80, timestamp: new Date(new Date().setHours(17, 15, 0, 0)).toISOString() },
  { id: 'PULL-103', customerName: 'Amit Verma', pan: 'KLMNO9012P', bureau: 'CIBIL', score: null, status: 'Failed', fee: 25, cost: 0, timestamp: new Date(new Date().setHours(17, 5, 0, 0)).toISOString(), note: 'first attempt on new PAN' },
  { id: 'PULL-104', customerName: 'Sunita Devi', pan: 'QRSTU3456V', bureau: 'CRIF High Mark', score: 742, status: 'Success', fee: 100, cost: 75, timestamp: new Date(new Date().setHours(16, 20, 0, 0)).toISOString() },
];

export const activityFeed = [
  { id: 'ACT-1', message: 'CIBIL report pulled — Rahul Sharma (780)', type: 'pull', amount: -100, timestamp: new Date(new Date().setHours(18, 42, 0, 0)).toISOString() },
  { id: 'ACT-2', message: 'Fetch failed — Amit Verma · first attempt on new PAN', type: 'fail', amount: -25, timestamp: new Date(new Date().setHours(17, 5, 0, 0)).toISOString() },
  { id: 'ACT-3', message: 'AI analysis generated — Priya Nair report', type: 'ai', amount: -50, timestamp: new Date(new Date().setHours(16, 30, 0, 0)).toISOString() },
  { id: 'ACT-4', message: 'Wallet recharged via UPI', type: 'recharge', amount: +5000, timestamp: new Date(new Date(Date.now() - 86400000 * 2).setHours(11, 20, 0, 0)).toISOString() },
];

export const pricingConfig = {
  CIBIL: { cost: 75, tier1: 150, tier2: 120, tier3: 100, tier4: 85 },
  Experian: { cost: 80, tier1: 160, tier2: 130, tier3: 110, tier4: 90 },
  Equifax: { cost: 70, tier1: 140, tier2: 115, tier3: 95, tier4: 80 },
  CRIF: { cost: 75, tier1: 150, tier2: 120, tier3: 100, tier4: 85 },
  failChargeFirst: 25,
  failChargeRepeat: 50,
};

export const adminOverviewStats = {
  reportsPulled: { value: 64, trend: 12, success: 61, failed: 3 },
  revenueToday: 6475,
  apiCostToday: 5191,
  profitToday: 1284,
  marginPercent: 19.8,
  monthProfit: 28904,
  activePartners: { value: 38, trend: 3, frozen: 2 },
  walletLiability: 241380,
  rechargesToday: { value: 35000, count: 7, pending: 3 },
  aiAnalysesToday: { value: 22, avgTime: '6.1s' }
};

export const chartData = [
  { name: 'Fri', Revenue: 4000, Profit: 800 },
  { name: 'Sat', Revenue: 3000, Profit: 600 },
  { name: 'Sun', Revenue: 2000, Profit: 400 },
  { name: 'Mon', Revenue: 5000, Profit: 1000 },
  { name: 'Tue', Revenue: 6000, Profit: 1200 },
  { name: 'Wed', Revenue: 5500, Profit: 1100 },
  { name: 'Thu', Revenue: 6475, Profit: 1284 },
];

export const adminPullsByBureau = [
  { bureau: 'CIBIL', pulls: 39, failed: 2, revenue: 3950, cost: 3180, profit: 770 },
  { bureau: 'Experian', pulls: 11, failed: 0, revenue: 1100, cost: 880, profit: 220 },
  { bureau: 'Equifax', pulls: 8, failed: 1, revenue: 825, cost: 671, profit: 154 },
  { bureau: 'CRIF High Mark', pulls: 6, failed: 0, revenue: 600, cost: 460, profit: 140 },
];

export const platformActivity = [
  { time: '18:42', event: 'Sharma Fincorp pulled CIBIL — Rahul Sharma (780)', profit: '+₹20' },
  { time: '18:31', event: 'Mehta Associates recharged ₹10,000 via gateway', profit: '-' },
  { time: '17:05', event: 'Sharma Fincorp — failed fetch, ₹25 charged (new PAN)', profit: '+₹25' },
  { time: '16:52', event: 'Admin updated Tier 3 CIBIL price ₹95 → ₹92', profit: '-' },
  { time: '16:30', event: 'AI analysis generated — Priya Nair (Experian)', profit: '+₹8' },
];
