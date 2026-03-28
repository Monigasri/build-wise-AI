import { create } from "zustand";
import { toast } from "sonner";
import { analyzeRisks, generateRiskItems, generateRiskTrendData, generateCostData, generateProgressData, predictDelay, computeCriticalPath } from "@/lib/riskEngine";

export interface Task {
  id: string;
  name: string;
  start: number;
  duration: number;
  dependencies: string[];
  progress: number;
  budget: number;
  actualCost: number;
  status: "on-track" | "at-risk" | "delayed" | "completed";
  assignee: string;
  resourceCount: number;
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

export interface ProgressEntry {
  week: string;
  planned: number;
  actual: number;
}

export interface CostEntry {
  month: string;
  planned: number;
  actual: number;
}

export interface RiskTrendEntry {
  month: string;
  schedule: number;
  cost: number;
  resource: number;
  weather: number;
  permit: number;
  scope: number;
  safety: number;
  supply: number;
}

export interface Alert {
  id: string;
  type: "risk" | "budget" | "delay";
  title: string;
  desc: string;
  time: string;
  severity: "high" | "medium" | "low";
}

export interface RiskBreakdownData {
  scheduleRisk: number;
  costRisk: number;
  resourceRisk: number;
  weatherRisk: number;
  permitRisk: number;
  scopeRisk: number;
  safetyRisk: number;
  supplyRisk: number;
  overallScore: number;
  level: "Low" | "Medium" | "High";
  insights: string[];
  recommendations: string[];
}

export interface DelayData {
  expectedCompletionDate: string;
  expectedDurationDays: number;
  predictedDelayDays: number;
  criticalTasks: string[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  startDate: string;
  totalBudget: number;
  createdAt: number;
  tasks: Task[];
  risks: RiskItem[];
  progressData: ProgressEntry[];
  costData: CostEntry[];
  riskTrendData: RiskTrendEntry[];
  alerts: Alert[];
  completionForecast: string;
  riskBreakdown: RiskBreakdownData;
  delayPrediction: DelayData;
  csvImported: boolean;
}

// ── Default data generators (demo project only) ──

function defaultTasks(): Task[] {
  return [
    { id: "T1", name: "Site Preparation", start: 0, duration: 14, dependencies: [], progress: 100, budget: 45000, actualCost: 43200, status: "completed", assignee: "Raj Mehta", resourceCount: 5 },
    { id: "T2", name: "Foundation Work", start: 14, duration: 21, dependencies: ["T1"], progress: 85, budget: 120000, actualCost: 118500, status: "on-track", assignee: "Anita Sharma", resourceCount: 8 },
    { id: "T3", name: "Structural Framing", start: 35, duration: 28, dependencies: ["T2"], progress: 42, budget: 200000, actualCost: 95000, status: "at-risk", assignee: "Vikram Patel", resourceCount: 12 },
    { id: "T4", name: "Electrical Rough-In", start: 49, duration: 14, dependencies: ["T2"], progress: 20, budget: 55000, actualCost: 14000, status: "on-track", assignee: "Priya Nair", resourceCount: 4 },
    { id: "T5", name: "Plumbing Installation", start: 49, duration: 18, dependencies: ["T2"], progress: 15, budget: 68000, actualCost: 12000, status: "at-risk", assignee: "Suresh Iyer", resourceCount: 6 },
    { id: "T6", name: "Roofing", start: 63, duration: 12, dependencies: ["T3"], progress: 0, budget: 95000, actualCost: 0, status: "on-track", assignee: "Raj Mehta", resourceCount: 7 },
    { id: "T7", name: "HVAC Installation", start: 63, duration: 16, dependencies: ["T3"], progress: 0, budget: 78000, actualCost: 0, status: "on-track", assignee: "Kavita Desai", resourceCount: 5 },
    { id: "T8", name: "Interior Finishing", start: 75, duration: 21, dependencies: ["T4", "T5", "T6"], progress: 0, budget: 150000, actualCost: 0, status: "on-track", assignee: "Anita Sharma", resourceCount: 10 },
    { id: "T9", name: "Landscaping", start: 90, duration: 10, dependencies: ["T8"], progress: 0, budget: 35000, actualCost: 0, status: "on-track", assignee: "Priya Nair", resourceCount: 4 },
    { id: "T10", name: "Final Inspection", start: 100, duration: 5, dependencies: ["T8", "T9"], progress: 0, budget: 12000, actualCost: 0, status: "on-track", assignee: "Vikram Patel", resourceCount: 2 },
  ];
}

function defaultRisks(): RiskItem[] {
  return [
    { id: "R1", category: "Weather", description: "Monsoon season may delay outdoor work by 2–3 weeks", probability: 72, impact: 85, score: 78, trend: "up", mitigation: "Pre-position weather shields; schedule critical outdoor tasks before monsoon onset" },
    { id: "R2", category: "Labor", description: "Skilled welder shortage in region affecting structural framing", probability: 58, impact: 70, score: 64, trend: "stable", mitigation: "Contract backup labor agency; cross-train existing crew" },
    { id: "R3", category: "Material", description: "Steel delivery delayed due to supply chain disruption", probability: 45, impact: 80, score: 62, trend: "up", mitigation: "Place advance orders; identify alternative suppliers" },
    { id: "R4", category: "Equipment", description: "Crane availability limited during peak construction season", probability: 35, impact: 65, score: 48, trend: "down", mitigation: "Reserve crane 4 weeks in advance; arrange backup equipment" },
    { id: "R5", category: "Regulatory", description: "Potential permit delay for electrical work", probability: 28, impact: 55, score: 38, trend: "stable", mitigation: "Submit permits early; maintain regulatory relationships" },
    { id: "R6", category: "Budget", description: "Concrete price volatility may increase foundation costs", probability: 40, impact: 50, score: 44, trend: "up", mitigation: "Lock in prices with forward contracts; maintain 10% contingency" },
  ];
}

function defaultProgress(): ProgressEntry[] {
  return [
    { week: "W1", planned: 5, actual: 4 }, { week: "W2", planned: 12, actual: 11 },
    { week: "W3", planned: 20, actual: 18 }, { week: "W4", planned: 28, actual: 24 },
    { week: "W5", planned: 35, actual: 30 }, { week: "W6", planned: 42, actual: 36 },
    { week: "W7", planned: 48, actual: 40 }, { week: "W8", planned: 55, actual: 46 },
  ];
}

function defaultCost(): CostEntry[] {
  return [
    { month: "Jan", planned: 85000, actual: 82000 }, { month: "Feb", planned: 165000, actual: 170000 },
    { month: "Mar", planned: 280000, actual: 295000 }, { month: "Apr", planned: 410000, actual: 440000 },
    { month: "May", planned: 540000, actual: 0 }, { month: "Jun", planned: 680000, actual: 0 },
    { month: "Jul", planned: 790000, actual: 0 }, { month: "Aug", planned: 858000, actual: 0 },
  ];
}

function defaultRiskTrend(): RiskTrendEntry[] {
  return [
    { month: "Jan", schedule: 30, cost: 25, resource: 40, weather: 30, permit: 15, scope: 10, safety: 12, supply: 20 },
    { month: "Feb", schedule: 35, cost: 30, resource: 45, weather: 35, permit: 18, scope: 12, safety: 14, supply: 22 },
    { month: "Mar", schedule: 50, cost: 40, resource: 50, weather: 50, permit: 22, scope: 18, safety: 16, supply: 30 },
    { month: "Apr", schedule: 55, cost: 48, resource: 55, weather: 65, permit: 25, scope: 20, safety: 18, supply: 35 },
    { month: "May", schedule: 58, cost: 45, resource: 58, weather: 72, permit: 28, scope: 22, safety: 20, supply: 38 },
  ];
}

const defaultBreakdown: RiskBreakdownData = { scheduleRisk: 55, costRisk: 45, resourceRisk: 40, weatherRisk: 50, permitRisk: 20, scopeRisk: 15, safetyRisk: 18, supplyRisk: 25, overallScore: 48, level: "Medium", insights: ["Demo project with pre-loaded risk data."], recommendations: ["Continue monitoring project metrics."] };
const defaultDelay: DelayData = { expectedCompletionDate: "Aug 24, 2025", expectedDurationDays: 105, predictedDelayDays: 12, criticalTasks: ["T1", "T2", "T3", "T6", "T8", "T9", "T10"] };

function createProject(name: string, location: string, startDate: string, budget: number, useDefaults = false): Project {
  return {
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name, location, startDate, totalBudget: budget, createdAt: Date.now(),
    tasks: useDefaults ? defaultTasks() : [],
    risks: useDefaults ? defaultRisks() : [],
    progressData: useDefaults ? defaultProgress() : [],
    costData: useDefaults ? defaultCost() : [],
    riskTrendData: useDefaults ? defaultRiskTrend() : [],
    alerts: [],
    completionForecast: useDefaults ? "Aug 24, 2025" : "N/A",
    riskBreakdown: useDefaults ? defaultBreakdown : { scheduleRisk: 0, costRisk: 0, resourceRisk: 0, weatherRisk: 0, permitRisk: 0, scopeRisk: 0, safetyRisk: 0, supplyRisk: 0, overallScore: 0, level: "Low", insights: [], recommendations: [] },
    delayPrediction: useDefaults ? defaultDelay : { expectedCompletionDate: "N/A", expectedDurationDays: 0, predictedDelayDays: 0, criticalTasks: [] },
    csvImported: useDefaults,
  };
}

// ── Helpers ──

function computeRiskScore(risk: RiskItem): number {
  return Math.round(risk.probability * 0.4 + risk.impact * 0.6);
}

function recalculateProject(project: Project): Project {
  const { tasks, risks, progressData } = project;

  // Run AI risk analysis engine
  const totalBudget = tasks.reduce((s, t) => s + t.budget, 0);
  const riskBreakdown = analyzeRisks(tasks, totalBudget);
  const delayPrediction = predictDelay(tasks, project.startDate);
  const cpm = computeCriticalPath(tasks);

  // Generate computed data if tasks exist
  let newRisks = risks;
  let newRiskTrend = project.riskTrendData;
  let newCostData = project.costData;
  let newProgressData = project.progressData;

  if (tasks.length > 0 && project.csvImported) {
    newRisks = generateRiskItems(riskBreakdown);
    newRiskTrend = generateRiskTrendData(riskBreakdown);
    newCostData = generateCostData(tasks, cpm.expectedDuration);
    newProgressData = generateProgressData(tasks, cpm.expectedDuration);
  }

  // Generate alerts
  const newAlerts: Alert[] = [];
  const avgProgress = tasks.length > 0 ? tasks.reduce((s, t) => s + t.progress, 0) / tasks.length : 0;
  const latestPlanned = newProgressData.length > 0 ? newProgressData[newProgressData.length - 1].planned : 50;

  if (tasks.length > 0 && avgProgress < latestPlanned * 0.85) {
    newAlerts.push({ id: `alert-prog-${Date.now()}`, type: "delay", title: "Project Behind Schedule", desc: `Overall progress (${Math.round(avgProgress)}%) is behind planned (${latestPlanned}%).`, time: "Just now", severity: "high" });
  }

  if (delayPrediction.predictedDelayDays > 5) {
    newAlerts.push({ id: `alert-delay`, type: "delay", title: `Predicted ${delayPrediction.predictedDelayDays}-Day Delay`, desc: `CPM analysis predicts completion on ${delayPrediction.expectedCompletionDate}. ${delayPrediction.criticalTasks.length} tasks on critical path.`, time: "Just now", severity: delayPrediction.predictedDelayDays > 14 ? "high" : "medium" });
  }

  newRisks.forEach((r) => {
    if (r.score >= 70) newAlerts.push({ id: `alert-risk-${r.id}`, type: "risk", title: `${r.category} Risk Critical (${r.score})`, desc: r.description, time: "Just now", severity: "high" });
    else if (r.score >= 50) newAlerts.push({ id: `alert-risk-${r.id}`, type: "risk", title: `${r.category} Risk Elevated (${r.score})`, desc: r.description, time: "Just now", severity: "medium" });
  });

  const totalSpent = tasks.reduce((s, t) => s + t.actualCost, 0);
  if (totalBudget > 0 && totalSpent > totalBudget * 0.9) {
    newAlerts.push({ id: `alert-cost`, type: "budget", title: "Budget Threshold Warning", desc: `Spent $${totalSpent.toLocaleString()} of $${totalBudget.toLocaleString()} budget (${Math.round((totalSpent / totalBudget) * 100)}%).`, time: "Just now", severity: totalSpent > totalBudget ? "high" : "medium" });
  }

  if (riskBreakdown.overallScore >= 60) {
    newAlerts.push({ id: `alert-overall-risk`, type: "risk", title: `Overall Risk Level: ${riskBreakdown.level}`, desc: riskBreakdown.insights[0] || "Multiple risk factors elevated.", time: "Just now", severity: "high" });
  }

  return {
    ...project,
    risks: newRisks,
    riskTrendData: newRiskTrend,
    costData: newCostData,
    progressData: newProgressData,
    alerts: newAlerts,
    completionForecast: delayPrediction.expectedCompletionDate,
    riskBreakdown,
    delayPrediction,
  };
}

// ── Initial demo project ──

const demoProject = createProject("Highway Expansion — Phase II", "Mumbai, India", "2025-01-06", 858000, true);
const initializedDemo = recalculateProject(demoProject);

// ── Store ──

interface MultiProjectState {
  projects: Project[];
  currentProjectId: string;
  addProject: (name: string, location: string, startDate: string, budget: number) => void;
  removeProject: (id: string) => void;
  switchProject: (id: string) => void;
  importCsvTasks: (tasks: Task[], totalBudget: number) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  updateRisk: (id: string, updates: Partial<RiskItem>) => void;
  addProgressEntry: (entry: ProgressEntry) => void;
  updateProgressEntry: (week: string, updates: Partial<ProgressEntry>) => void;
  updateCostEntry: (month: string, updates: Partial<CostEntry>) => void;
  submitDailyProgress: (taskId: string, newProgress: number) => void;
  recalculate: () => void;
}

function updateCurrentProject(state: MultiProjectState, updater: (p: Project) => Project): Partial<MultiProjectState> {
  return { projects: state.projects.map((p) => (p.id === state.currentProjectId ? updater(p) : p)) };
}

export const useProjectStore = create<MultiProjectState>((set, get) => ({
  projects: [initializedDemo],
  currentProjectId: initializedDemo.id,

  addProject: (name, location, startDate, budget) => {
    const p = createProject(name, location, startDate, budget, false);
    set((s) => ({ projects: [...s.projects, p], currentProjectId: p.id }));
    toast.success(`Project "${name}" created — upload a CSV to begin planning`);
  },

  removeProject: (id) => {
    const s = get();
    if (s.projects.length <= 1) { toast.error("Cannot remove the last project"); return; }
    const remaining = s.projects.filter((p) => p.id !== id);
    set({ projects: remaining, currentProjectId: s.currentProjectId === id ? remaining[0].id : s.currentProjectId });
    toast.success("Project removed");
  },

  switchProject: (id) => set({ currentProjectId: id }),

  importCsvTasks: (tasks, totalBudget) => {
    set((s) => updateCurrentProject(s, (p) => recalculateProject({ ...p, tasks, totalBudget: totalBudget || p.totalBudget, csvImported: true })));
    toast.success(`${tasks.length} tasks imported — AI analysis complete`);
  },

  updateTask: (id, updates) => {
    set((s) => updateCurrentProject(s, (p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })));
    get().recalculate();
    toast.success("Task updated");
  },

  addTask: (task) => {
    set((s) => updateCurrentProject(s, (p) => ({ ...p, tasks: [...p.tasks, task], csvImported: true })));
    get().recalculate();
    toast.success("Task added");
  },

  removeTask: (id) => {
    set((s) => updateCurrentProject(s, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== id) })));
    get().recalculate();
    toast.success("Task removed");
  },

  updateRisk: (id, updates) => {
    set((s) => updateCurrentProject(s, (p) => ({
      ...p,
      risks: p.risks.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        updated.score = computeRiskScore(updated);
        return updated;
      }),
    })));
    get().recalculate();
  },

  addProgressEntry: (entry) => {
    set((s) => updateCurrentProject(s, (p) => ({ ...p, progressData: [...p.progressData, entry] })));
  },

  updateProgressEntry: (week, updates) => {
    set((s) => updateCurrentProject(s, (p) => ({ ...p, progressData: p.progressData.map((e) => (e.week === week ? { ...e, ...updates } : e)) })));
  },

  updateCostEntry: (month, updates) => {
    set((s) => updateCurrentProject(s, (p) => ({ ...p, costData: p.costData.map((c) => (c.month === month ? { ...c, ...updates } : c)) })));
    get().recalculate();
    toast.success("Cost data updated");
  },

  submitDailyProgress: (taskId, newProgress) => {
    const project = get().projects.find((p) => p.id === get().currentProjectId);
    if (!project) return;
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const clamped = Math.min(100, Math.max(0, newProgress));
    const newStatus: Task["status"] = clamped >= 100 ? "completed" : clamped < task.progress ? "delayed" : task.status;
    const newActualCost = Math.round(task.budget * (clamped / 100) * (0.95 + Math.random() * 0.15));
    set((s) => updateCurrentProject(s, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, progress: clamped, status: newStatus, actualCost: newActualCost } : t)),
    })));
    get().recalculate();
    toast.success(`Progress for ${task.name} updated to ${clamped}%`);
  },

  recalculate: () => {
    set((s) => updateCurrentProject(s, (p) => recalculateProject(p)));
  },
}));

// ── Selectors ──

export function useCurrentProject(): Project {
  return useProjectStore((s) => s.projects.find((p) => p.id === s.currentProjectId)!);
}

export const useKpis = () => {
  const project = useCurrentProject();
  const { tasks, riskBreakdown, completionForecast: forecast, delayPrediction } = project;

  const overallProgress = tasks.length > 0 ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0;
  const totalBudget = tasks.reduce((s, t) => s + t.budget, 0);
  const spentSoFar = tasks.reduce((s, t) => s + t.actualCost, 0);
  const budgetHealth = totalBudget > 0 ? Math.round(((totalBudget - spentSoFar) / totalBudget) * 100) : 100;
  const tasksCompleted = tasks.filter((t) => t.status === "completed").length;

  return {
    overallProgress,
    delayRisk: riskBreakdown.overallScore,
    riskLevel: riskBreakdown.level,
    budgetHealth: Math.max(0, Math.min(100, budgetHealth)),
    completionForecast: forecast,
    totalBudget, spentSoFar, tasksCompleted,
    totalTasks: tasks.length,
    activeAlerts: project.alerts.length,
    predictedDelay: delayPrediction.predictedDelayDays,
    criticalTasks: delayPrediction.criticalTasks,
    costOverrun: totalBudget > 0 && spentSoFar > 0 ? Math.max(0, Math.round(((spentSoFar / (totalBudget * (overallProgress / 100 || 0.01))) - 1) * 100)) : 0,
  };
};
