// Demo data for BuildWise AI

export interface Task {
  id: string;
  name: string;
  start: number; // day offset
  duration: number;
  dependencies: string[];
  progress: number;
  budget: number;
  actualCost: number;
  status: "on-track" | "at-risk" | "delayed" | "completed";
  assignee: string;
}

export interface RiskItem {
  id: string;
  category: string;
  description: string;
  probability: number;
  impact: number;
  score: number;
  trend: "up" | "down" | "stable";
  mitigation: string;
}

export const demoTasks: Task[] = [
  { id: "T1", name: "Site Preparation", start: 0, duration: 14, dependencies: [], progress: 100, budget: 45000, actualCost: 43200, status: "completed", assignee: "Raj Mehta" },
  { id: "T2", name: "Foundation Work", start: 14, duration: 21, dependencies: ["T1"], progress: 85, budget: 120000, actualCost: 118500, status: "on-track", assignee: "Anita Sharma" },
  { id: "T3", name: "Structural Framing", start: 35, duration: 28, dependencies: ["T2"], progress: 42, budget: 200000, actualCost: 95000, status: "at-risk", assignee: "Vikram Patel" },
  { id: "T4", name: "Electrical Rough-In", start: 49, duration: 14, dependencies: ["T2"], progress: 20, budget: 55000, actualCost: 14000, status: "on-track", assignee: "Priya Nair" },
  { id: "T5", name: "Plumbing Installation", start: 49, duration: 18, dependencies: ["T2"], progress: 15, budget: 68000, actualCost: 12000, status: "at-risk", assignee: "Suresh Iyer" },
  { id: "T6", name: "Roofing", start: 63, duration: 12, dependencies: ["T3"], progress: 0, budget: 95000, actualCost: 0, status: "on-track", assignee: "Raj Mehta" },
  { id: "T7", name: "HVAC Installation", start: 63, duration: 16, dependencies: ["T3"], progress: 0, budget: 78000, actualCost: 0, status: "on-track", assignee: "Kavita Desai" },
  { id: "T8", name: "Interior Finishing", start: 75, duration: 21, dependencies: ["T4", "T5", "T6"], progress: 0, budget: 150000, actualCost: 0, status: "on-track", assignee: "Anita Sharma" },
  { id: "T9", name: "Landscaping", start: 90, duration: 10, dependencies: ["T8"], progress: 0, budget: 35000, actualCost: 0, status: "on-track", assignee: "Priya Nair" },
  { id: "T10", name: "Final Inspection", start: 100, duration: 5, dependencies: ["T8", "T9"], progress: 0, budget: 12000, actualCost: 0, status: "on-track", assignee: "Vikram Patel" },
];

export const demoRisks: RiskItem[] = [
  { id: "R1", category: "Weather", description: "Monsoon season may delay outdoor work by 2–3 weeks", probability: 72, impact: 85, score: 78, trend: "up", mitigation: "Pre-position weather shields; schedule critical outdoor tasks before monsoon onset" },
  { id: "R2", category: "Labor", description: "Skilled welder shortage in region affecting structural framing", probability: 58, impact: 70, score: 64, trend: "stable", mitigation: "Contract backup labor agency; cross-train existing crew" },
  { id: "R3", category: "Material", description: "Steel delivery delayed due to supply chain disruption", probability: 45, impact: 80, score: 62, trend: "up", mitigation: "Place advance orders; identify alternative suppliers" },
  { id: "R4", category: "Equipment", description: "Crane availability limited during peak construction season", probability: 35, impact: 65, score: 48, trend: "down", mitigation: "Reserve crane 4 weeks in advance; arrange backup equipment" },
  { id: "R5", category: "Regulatory", description: "Potential permit delay for electrical work", probability: 28, impact: 55, score: 38, trend: "stable", mitigation: "Submit permits early; maintain regulatory relationships" },
  { id: "R6", category: "Budget", description: "Concrete price volatility may increase foundation costs", probability: 40, impact: 50, score: 44, trend: "up", mitigation: "Lock in prices with forward contracts; maintain 10% contingency" },
];

export const progressData = [
  { week: "W1", planned: 5, actual: 4 },
  { week: "W2", planned: 12, actual: 11 },
  { week: "W3", planned: 20, actual: 18 },
  { week: "W4", planned: 28, actual: 24 },
  { week: "W5", planned: 35, actual: 30 },
  { week: "W6", planned: 42, actual: 36 },
  { week: "W7", planned: 48, actual: 40 },
  { week: "W8", planned: 55, actual: 46 },
];

export const costData = [
  { month: "Jan", planned: 85000, actual: 82000 },
  { month: "Feb", planned: 165000, actual: 170000 },
  { month: "Mar", planned: 280000, actual: 295000 },
  { month: "Apr", planned: 410000, actual: 440000 },
  { month: "May", planned: 540000, actual: 0 },
  { month: "Jun", planned: 680000, actual: 0 },
  { month: "Jul", planned: 790000, actual: 0 },
  { month: "Aug", planned: 858000, actual: 0 },
];

export const riskTrendData = [
  { month: "Jan", weather: 30, labor: 40, material: 25, equipment: 20 },
  { month: "Feb", weather: 35, labor: 45, material: 30, equipment: 22 },
  { month: "Mar", weather: 50, labor: 50, material: 40, equipment: 25 },
  { month: "Apr", weather: 65, labor: 55, material: 48, equipment: 30 },
  { month: "May", weather: 72, labor: 58, material: 45, equipment: 35 },
];

export const kpis = {
  overallProgress: 38,
  delayRisk: 42,
  budgetHealth: 87,
  completionForecast: "Aug 24, 2025",
  totalBudget: 858000,
  spentSoFar: 282700,
  tasksCompleted: 1,
  totalTasks: 10,
  activeAlerts: 3,
};
