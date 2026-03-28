import type { Task, RiskItem, RiskTrendEntry, CostEntry, ProgressEntry } from "@/store/projectStore";

// ── Critical Path Method ──

interface CpmNode {
  id: string;
  duration: number;
  deps: string[];
  es: number;
  ef: number;
  ls: number;
  lf: number;
  slack: number;
}

export function computeCriticalPath(tasks: Task[]): { criticalPath: string[]; expectedDuration: number; nodes: CpmNode[] } {
  if (tasks.length === 0) return { criticalPath: [], expectedDuration: 0, nodes: [] };

  const nodeMap = new Map<string, CpmNode>();
  tasks.forEach((t) => nodeMap.set(t.id, { id: t.id, duration: t.duration, deps: t.dependencies, es: 0, ef: 0, ls: 0, lf: 0, slack: 0 }));

  const resolved = new Set<string>();
  const queue = [...nodeMap.values()];
  let maxIterations = queue.length * queue.length;
  while (queue.length > 0 && maxIterations-- > 0) {
    const node = queue.shift()!;
    const allDepsResolved = node.deps.every((d) => resolved.has(d));
    if (!allDepsResolved) { queue.push(node); continue; }
    node.es = node.deps.length > 0 ? Math.max(...node.deps.map((d) => nodeMap.get(d)?.ef ?? 0)) : 0;
    node.ef = node.es + node.duration;
    resolved.add(node.id);
  }

  const projectDuration = Math.max(...[...nodeMap.values()].map((n) => n.ef), 0);

  const nodes = [...nodeMap.values()];
  nodes.forEach((n) => { n.lf = projectDuration; n.ls = n.lf - n.duration; });

  const reverseDeps = new Map<string, string[]>();
  nodes.forEach((n) => n.deps.forEach((d) => {
    if (!reverseDeps.has(d)) reverseDeps.set(d, []);
    reverseDeps.get(d)!.push(n.id);
  }));

  const processOrder = [...resolved].reverse();
  processOrder.forEach((id) => {
    const node = nodeMap.get(id)!;
    const successors = reverseDeps.get(id) || [];
    if (successors.length > 0) {
      node.lf = Math.min(...successors.map((s) => nodeMap.get(s)?.ls ?? projectDuration));
    } else {
      node.lf = projectDuration;
    }
    node.ls = node.lf - node.duration;
    node.slack = node.ls - node.es;
  });

  const criticalPath = nodes.filter((n) => Math.abs(n.slack) < 1).map((n) => n.id);
  return { criticalPath, expectedDuration: projectDuration, nodes };
}

// ── 8-Factor Risk Breakdown ──

export interface RiskBreakdown {
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

// Weights for overall score
const WEIGHTS = {
  schedule: 0.25,
  cost: 0.15,
  resource: 0.20,
  weather: 0.10,
  permit: 0.10,
  scope: 0.10,
  safety: 0.05,
  supply: 0.05,
};

export function analyzeRisks(tasks: Task[], totalBudget: number): RiskBreakdown {
  if (tasks.length === 0) return { scheduleRisk: 0, costRisk: 0, resourceRisk: 0, weatherRisk: 0, permitRisk: 0, scopeRisk: 0, safetyRisk: 0, supplyRisk: 0, overallScore: 0, level: "Low", insights: [], recommendations: [] };

  const cpm = computeCriticalPath(tasks);
  const insights: string[] = [];
  const recommendations: string[] = [];

  // ── 1. Schedule Risk (25%) ──
  let scheduleRisk = 0;
  const criticalRatio = cpm.criticalPath.length / tasks.length;
  scheduleRisk += criticalRatio * 30;

  const lowSlackTasks = cpm.nodes.filter((n) => n.slack < 3 && n.slack >= 0);
  if (lowSlackTasks.length > tasks.length * 0.4) {
    scheduleRisk += 25;
    insights.push(`${lowSlackTasks.length} tasks have near-zero slack — any delay will cascade through the schedule.`);
    recommendations.push("Re-baseline schedule using CPM; fast-track non-critical tasks; consider adding overtime for critical path activities.");
  }

  const overlaps = detectOverlaps(tasks);
  if (overlaps > 3) {
    scheduleRisk += Math.min(20, overlaps * 3);
    insights.push(`${overlaps} task overlaps detected — concurrent work increases coordination risk.`);
  }

  const maxDepth = computeMaxDependencyDepth(tasks);
  if (maxDepth > 4) {
    scheduleRisk += Math.min(15, (maxDepth - 3) * 5);
    insights.push(`Deep dependency chain (${maxDepth} levels) — bottlenecks at early tasks will cascade.`);
  }

  const behindTasks = tasks.filter((t) => t.status === "delayed" || t.status === "at-risk");
  if (behindTasks.length > 0) {
    scheduleRisk += Math.min(20, behindTasks.length * 8);
    insights.push(`${behindTasks.length} task(s) are behind schedule, increasing delay probability.`);
    recommendations.push(`Address delayed tasks: ${behindTasks.map(t => t.name).join(", ")}. Add overtime or reallocate resources to recover schedule.`);
  }

  scheduleRisk = Math.min(100, Math.round(scheduleRisk));

  // ── 2. Cost Risk (15%) ──
  let costRisk = 0;
  const totalEstimated = tasks.reduce((s, t) => s + t.budget, 0);
  const totalActual = tasks.reduce((s, t) => s + t.actualCost, 0);
  const avgProgress = tasks.reduce((s, t) => s + t.progress, 0) / tasks.length;

  if (totalEstimated > 0 && avgProgress > 10) {
    const expectedSpend = totalEstimated * (avgProgress / 100);
    const costVariance = (totalActual - expectedSpend) / expectedSpend;
    if (costVariance > 0.1) {
      costRisk += Math.min(40, Math.round(costVariance * 100));
      const overrunPct = Math.round(costVariance * 100);
      insights.push(`Spending ${overrunPct}% above expected at current progress — cost overrun trend detected.`);
      recommendations.push("Perform detailed variance analysis; apply value engineering to reduce non-critical expenses; renegotiate vendor contracts.");
    }
  }

  const maxBudgetTask = tasks.reduce((max, t) => t.budget > max.budget ? t : max, tasks[0]);
  if (maxBudgetTask && totalEstimated > 0 && maxBudgetTask.budget / totalEstimated > 0.3) {
    costRisk += 20;
    insights.push(`"${maxBudgetTask.name}" accounts for ${Math.round(maxBudgetTask.budget / totalEstimated * 100)}% of total budget — high concentration risk.`);
  }

  const overBudgetTasks = tasks.filter((t) => t.actualCost > t.budget && t.budget > 0);
  if (overBudgetTasks.length > 0) {
    costRisk += Math.min(30, overBudgetTasks.length * 10);
    insights.push(`${overBudgetTasks.length} task(s) already exceeding budget.`);
    recommendations.push("Lock in material prices with forward contracts; maintain contingency reserves of at least 10%.");
  }

  costRisk = Math.min(100, Math.round(costRisk));

  // ── 3. Resource Risk (20%) ──
  let resourceRisk = 0;
  const totalResources = tasks.reduce((s, t) => s + (t.resourceCount || 1), 0);
  const avgResources = totalResources / tasks.length;

  const overAllocated = tasks.filter((t) => (t.resourceCount || 1) > avgResources * 1.8);
  if (overAllocated.length > 0) {
    resourceRisk += Math.min(35, overAllocated.length * 12);
    insights.push(`${overAllocated.length} task(s) have disproportionately high resource allocation — risk of bottleneck.`);
    recommendations.push("Hire temporary workers or redistribute resources; cross-train existing crew to improve flexibility.");
  }

  const concurrentResourceLoad = computeConcurrentResourceLoad(tasks);
  if (concurrentResourceLoad > totalResources * 0.6) {
    resourceRisk += 25;
    insights.push("High concurrent resource demand — potential worker shortage during peak periods.");
    recommendations.push("Stagger overlapping tasks to balance resource load; secure backup labor contracts.");
  }

  const singleResourceCritical = tasks.filter((t) => (t.resourceCount || 1) <= 1 && cpm.criticalPath.includes(t.id));
  if (singleResourceCritical.length > 0) {
    resourceRisk += singleResourceCritical.length * 10;
    insights.push(`${singleResourceCritical.length} critical-path task(s) have only 1 worker — single point of failure.`);
  }

  resourceRisk = Math.min(100, Math.round(resourceRisk));

  // ── 4. Weather Risk (10%) ──
  let weatherRisk = 0;
  const projectDurationMonths = cpm.expectedDuration / 30;

  if (projectDurationMonths > 3) weatherRisk += Math.min(25, Math.round((projectDurationMonths - 2) * 6));
  if (projectDurationMonths > 6) {
    insights.push(`${Math.round(projectDurationMonths)}-month project spans multiple weather seasons — weather disruption likely.`);
    recommendations.push("Reschedule weather-sensitive outdoor tasks to dry season; install temporary weather shields for structural work.");
  }

  const outdoorKeywords = ["site", "foundation", "roofing", "landscaping", "excavation", "grading", "paving", "concrete", "exterior"];
  const outdoorTasks = tasks.filter((t) => outdoorKeywords.some((kw) => t.name.toLowerCase().includes(kw)));
  if (outdoorTasks.length > 0) {
    weatherRisk += Math.min(30, outdoorTasks.length * 7);
    if (outdoorTasks.length > 2) {
      insights.push(`${outdoorTasks.length} outdoor/weather-sensitive tasks identified — weather delays could impact schedule.`);
    }
  }

  // Seasonal factor based on start month
  const startMonth = new Date().getMonth(); // Simulate current season
  const monsoonMonths = [5, 6, 7, 8]; // Jun–Sep
  if (monsoonMonths.includes(startMonth)) {
    weatherRisk += 20;
    insights.push("Current season falls within monsoon/rainy period — elevated weather risk for outdoor activities.");
  }

  weatherRisk = Math.min(100, Math.round(weatherRisk));

  // ── 5. Permit & Approval Risk (10%) ──
  let permitRisk = 0;
  const permitKeywords = ["inspection", "permit", "approval", "regulatory", "compliance", "clearance"];
  const permitTasks = tasks.filter((t) => permitKeywords.some((kw) => t.name.toLowerCase().includes(kw)));

  if (permitTasks.length > 0) {
    permitRisk += Math.min(40, permitTasks.length * 15);
    const pendingPermits = permitTasks.filter((t) => t.progress < 100);
    if (pendingPermits.length > 0) {
      permitRisk += pendingPermits.length * 10;
      insights.push(`${pendingPermits.length} pending permit/approval task(s) — regulatory delays can block downstream work.`);
      recommendations.push("Submit permits early; engage regulatory authorities proactively; use parallel approval processing where possible.");
    }
  }

  // Long projects have higher permit risk
  if (projectDurationMonths > 4) permitRisk += 10;

  permitRisk = Math.min(100, Math.round(permitRisk));

  // ── 6. Scope Creep Risk (10%) ──
  let scopeRisk = 0;

  // Heuristic: tasks with very different budget-to-duration ratios suggest scope inconsistency
  if (tasks.length > 3) {
    const ratios = tasks.map((t) => t.budget / Math.max(1, t.duration));
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const variance = ratios.reduce((s, r) => s + Math.pow(r - avgRatio, 2), 0) / ratios.length;
    const cv = Math.sqrt(variance) / Math.max(1, avgRatio); // coefficient of variation
    if (cv > 0.8) {
      scopeRisk += Math.min(35, Math.round(cv * 25));
      insights.push("High variance in cost-to-duration ratios across tasks — possible scope inconsistency or unplanned changes.");
      recommendations.push("Issue formal change orders for scope modifications; recalculate budget and timeline for any design changes.");
    }
  }

  // Many tasks = complex scope
  if (tasks.length > 15) {
    scopeRisk += 20;
    insights.push(`Large project scope (${tasks.length} tasks) — higher probability of scope creep and rework.`);
  }

  // Budget overrun often signals scope creep
  if (totalEstimated > 0 && totalActual > totalEstimated * 0.95 && avgProgress < 80) {
    scopeRisk += 25;
    recommendations.push("Budget nearly exhausted before completion — review scope for unauthorized changes; implement change control process.");
  }

  scopeRisk = Math.min(100, Math.round(scopeRisk));

  // ── 7. Safety Risk (5%) ──
  let safetyRisk = 0;
  const hazardousKeywords = ["demolition", "excavation", "roofing", "structural", "crane", "heavy", "welding", "scaffolding", "height"];
  const hazardousTasks = tasks.filter((t) => hazardousKeywords.some((kw) => t.name.toLowerCase().includes(kw)));

  if (hazardousTasks.length > 0) {
    safetyRisk += Math.min(40, hazardousTasks.length * 10);
    if (hazardousTasks.length > 3) {
      insights.push(`${hazardousTasks.length} tasks involve high-risk activities (heights, heavy machinery, excavation) — safety incidents could halt work.`);
      recommendations.push("Conduct safety briefings before hazardous tasks; ensure PPE compliance; have emergency protocols ready.");
    }
  }

  // High concurrent resource load = more safety risk
  if (concurrentResourceLoad > 20) {
    safetyRisk += 15;
    insights.push("High number of concurrent workers on site increases safety incident probability.");
  }

  safetyRisk = Math.min(100, Math.round(safetyRisk));

  // ── 8. Supply Chain Risk (5%) ──
  let supplyRisk = 0;

  const highCostTasks = tasks.filter((t) => t.budget > totalEstimated * 0.15);
  if (highCostTasks.length > 2) {
    supplyRisk += 25;
    insights.push("Multiple high-cost tasks increase exposure to material price volatility and supply chain delays.");
    recommendations.push("Pre-order materials with long lead times; identify alternative vendors; increase buffer stock for critical materials.");
  }

  const materialKeywords = ["concrete", "steel", "material", "supply", "procurement", "delivery"];
  const materialTasks = tasks.filter((t) => materialKeywords.some((kw) => t.name.toLowerCase().includes(kw)));
  if (materialTasks.length > 0) {
    supplyRisk += Math.min(30, materialTasks.length * 10);
    const delayedMaterials = materialTasks.filter((t) => t.status === "delayed" || t.status === "at-risk");
    if (delayedMaterials.length > 0) {
      supplyRisk += 20;
      insights.push(`${delayedMaterials.length} material-related task(s) are delayed — supply chain disruption detected.`);
      recommendations.push("Switch to alternative vendors; expedite critical material deliveries; increase safety stock levels.");
    }
  }

  // Long projects = more supply chain exposure
  if (projectDurationMonths > 4) supplyRisk += 10;

  supplyRisk = Math.min(100, Math.round(supplyRisk));

  // ── Overall Score (weighted) ──
  const overallScore = Math.round(
    scheduleRisk * WEIGHTS.schedule +
    costRisk * WEIGHTS.cost +
    resourceRisk * WEIGHTS.resource +
    weatherRisk * WEIGHTS.weather +
    permitRisk * WEIGHTS.permit +
    scopeRisk * WEIGHTS.scope +
    safetyRisk * WEIGHTS.safety +
    supplyRisk * WEIGHTS.supply
  );

  const level: RiskBreakdown["level"] = overallScore >= 70 ? "High" : overallScore >= 30 ? "Medium" : "Low";

  if (insights.length === 0) {
    insights.push("Project parameters are within acceptable risk thresholds.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue monitoring project metrics. No immediate corrective actions required.");
  }

  return { scheduleRisk, costRisk, resourceRisk, weatherRisk, permitRisk, scopeRisk, safetyRisk, supplyRisk, overallScore, level, insights, recommendations };
}

// ── Helpers ──

function detectOverlaps(tasks: Task[]): number {
  let count = 0;
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const a = tasks[i], b = tasks[j];
      if (a.start < b.start + b.duration && b.start < a.start + a.duration) count++;
    }
  }
  return count;
}

function computeMaxDependencyDepth(tasks: Task[]): number {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const cache = new Map<string, number>();
  function depth(id: string): number {
    if (cache.has(id)) return cache.get(id)!;
    const t = taskMap.get(id);
    if (!t || t.dependencies.length === 0) { cache.set(id, 0); return 0; }
    const d = 1 + Math.max(...t.dependencies.map((dep) => depth(dep)));
    cache.set(id, d);
    return d;
  }
  return Math.max(...tasks.map((t) => depth(t.id)), 0);
}

function computeConcurrentResourceLoad(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const maxDay = Math.max(...tasks.map((t) => t.start + t.duration));
  let maxLoad = 0;
  for (let d = 0; d <= maxDay; d += 7) {
    const load = tasks.filter((t) => d >= t.start && d < t.start + t.duration).reduce((s, t) => s + (t.resourceCount || 1), 0);
    maxLoad = Math.max(maxLoad, load);
  }
  return maxLoad;
}

// ── Delay Prediction ──

export interface DelayPrediction {
  expectedCompletionDate: string;
  expectedDurationDays: number;
  predictedDelayDays: number;
  criticalTasks: string[];
}

export function predictDelay(tasks: Task[], projectStartDate: string): DelayPrediction {
  if (tasks.length === 0) return { expectedCompletionDate: "N/A", expectedDurationDays: 0, predictedDelayDays: 0, criticalTasks: [] };

  const cpm = computeCriticalPath(tasks);
  const start = new Date(projectStartDate);
  const avgProgress = tasks.reduce((s, t) => s + t.progress, 0) / tasks.length;
  const completedWork = cpm.expectedDuration * (avgProgress / 100);
  const remainingWork = cpm.expectedDuration - completedWork;

  let efficiencyFactor = 1.0;
  const behindTasks = tasks.filter((t) => t.status === "delayed" || t.status === "at-risk");
  if (behindTasks.length > 0) efficiencyFactor += behindTasks.length * 0.08;

  const adjustedRemaining = Math.round(remainingWork * efficiencyFactor);
  const totalPredicted = Math.round(completedWork) + adjustedRemaining;
  const delayDays = Math.max(0, totalPredicted - cpm.expectedDuration);

  const completionDate = new Date(start);
  completionDate.setDate(completionDate.getDate() + totalPredicted);
  const formatted = completionDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return { expectedCompletionDate: formatted, expectedDurationDays: totalPredicted, predictedDelayDays: delayDays, criticalTasks: cpm.criticalPath };
}

// ── Generate Risk Items from Analysis ──

export function generateRiskItems(breakdown: RiskBreakdown): RiskItem[] {
  const items: RiskItem[] = [];
  const makeTrend = (score: number): RiskItem["trend"] => score >= 60 ? "up" : score >= 35 ? "stable" : "down";

  const categories: { id: string; category: string; score: number; defaultDesc: string; mitigation: string; keywords: string[] }[] = [
    { id: "R-schedule", category: "Schedule", score: breakdown.scheduleRisk, defaultDesc: "Schedule risk based on CPM and dependency analysis.", mitigation: "Add buffer time to critical path tasks; reduce dependencies.", keywords: ["slack", "cascade", "behind", "overlap", "dependency"] },
    { id: "R-cost", category: "Cost", score: breakdown.costRisk, defaultDesc: "Cost risk based on budget variance analysis.", mitigation: "Lock in material prices; maintain contingency reserves.", keywords: ["budget", "cost", "spend", "overrun", "concentration"] },
    { id: "R-resource", category: "Resource", score: breakdown.resourceRisk, defaultDesc: "Resource risk based on allocation and availability.", mitigation: "Cross-train workers; stagger overlapping tasks.", keywords: ["resource", "worker", "allocation", "concurrent", "shortage"] },
    { id: "R-weather", category: "Weather", score: breakdown.weatherRisk, defaultDesc: "Weather risk from outdoor activities and seasonal factors.", mitigation: "Schedule outdoor work in dry season; use protective measures.", keywords: ["weather", "outdoor", "season", "monsoon"] },
    { id: "R-permit", category: "Permit", score: breakdown.permitRisk, defaultDesc: "Permit risk from pending regulatory approvals.", mitigation: "Submit permits early; engage authorities proactively.", keywords: ["permit", "approval", "regulatory", "clearance"] },
    { id: "R-scope", category: "Scope", score: breakdown.scopeRisk, defaultDesc: "Scope creep risk from project complexity.", mitigation: "Implement change control process; issue formal change orders.", keywords: ["scope", "variance", "rework", "change"] },
    { id: "R-safety", category: "Safety", score: breakdown.safetyRisk, defaultDesc: "Safety risk from hazardous construction activities.", mitigation: "Conduct safety briefings; ensure PPE compliance.", keywords: ["safety", "hazard", "incident", "height", "machinery"] },
    { id: "R-supply", category: "Supply Chain", score: breakdown.supplyRisk, defaultDesc: "Supply chain risk from material and vendor dependencies.", mitigation: "Identify alternative vendors; increase buffer stock.", keywords: ["material", "supply", "vendor", "delivery", "procurement"] },
  ];

  for (const cat of categories) {
    const matchingInsight = breakdown.insights.find((i) => cat.keywords.some((kw) => i.toLowerCase().includes(kw)));
    items.push({
      id: cat.id, category: cat.category,
      description: matchingInsight || cat.defaultDesc,
      probability: Math.min(95, cat.score + 10), impact: Math.min(95, cat.score + 5),
      score: cat.score, trend: makeTrend(cat.score),
      mitigation: cat.mitigation,
    });
  }

  return items;
}

// ── Generate trend data ──

export function generateRiskTrendData(breakdown: RiskBreakdown): RiskTrendEntry[] {
  const months = ["M1", "M2", "M3", "M4", "M5"];
  return months.map((month, i) => {
    const factor = 0.6 + (i / 4) * 0.4;
    return {
      month,
      schedule: Math.round(breakdown.scheduleRisk * factor),
      cost: Math.round(breakdown.costRisk * factor * 0.9),
      resource: Math.round(breakdown.resourceRisk * factor),
      weather: Math.round(breakdown.weatherRisk * factor * (0.8 + Math.sin(i) * 0.2)),
      permit: Math.round(breakdown.permitRisk * factor * 0.85),
      scope: Math.round(breakdown.scopeRisk * factor * 0.9),
      safety: Math.round(breakdown.safetyRisk * factor),
      supply: Math.round(breakdown.supplyRisk * factor * 0.95),
    };
  });
}

// ── Generate cost data from tasks ──

export function generateCostData(tasks: Task[], durationDays: number): CostEntry[] {
  if (tasks.length === 0) return [];
  const months = Math.max(2, Math.ceil(durationDays / 30));
  const totalBudget = tasks.reduce((s, t) => s + t.budget, 0);
  const totalActual = tasks.reduce((s, t) => s + t.actualCost, 0);
  const avgProgress = tasks.length > 0 ? tasks.reduce((s, t) => s + t.progress, 0) / tasks.length : 0;

  const entries: CostEntry[] = [];
  for (let i = 0; i < Math.min(months, 8); i++) {
    const fraction = (i + 1) / months;
    const planned = Math.round(totalBudget * fraction);
    const actualFraction = Math.min(fraction, avgProgress / 100);
    const actual = avgProgress > 0 ? Math.round(totalActual * (actualFraction / (avgProgress / 100))) : 0;
    entries.push({ month: `M${i + 1}`, planned, actual: actual > 0 ? actual : 0 });
  }
  return entries;
}

// ── Generate progress data ──

export function generateProgressData(tasks: Task[], durationDays: number): ProgressEntry[] {
  if (tasks.length === 0) return [];
  const weeks = Math.max(2, Math.ceil(durationDays / 7));
  const avgProgress = tasks.reduce((s, t) => s + t.progress, 0) / tasks.length;

  return Array.from({ length: Math.min(weeks, 12) }, (_, i) => {
    const planned = Math.round(((i + 1) / weeks) * 100);
    const actualWeek = Math.round(((i + 1) / weeks) * avgProgress);
    return { week: `W${i + 1}`, planned: Math.min(100, planned), actual: Math.min(100, actualWeek) };
  });
}

// ── Chatbot Intelligence: Generate context-aware response ──

export function generateChatResponse(
  input: string,
  tasks: Task[],
  breakdown: RiskBreakdown,
  delay: DelayPrediction,
  projectName: string,
  totalBudget: number,
): string {
  if (tasks.length === 0) {
    return `No tasks have been added to **${projectName}** yet. Please upload a CSV or add tasks in the Project Planner to enable AI analysis.`;
  }

  const lower = input.toLowerCase();
  const totalSpent = tasks.reduce((s, t) => s + t.actualCost, 0);
  const totalEstimated = tasks.reduce((s, t) => s + t.budget, 0);
  const avgProgress = Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length);
  const behindTasks = tasks.filter((t) => t.status === "delayed" || t.status === "at-risk");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const criticalTaskNames = delay.criticalTasks.map((id) => tasks.find((t) => t.id === id)?.name || id);

  // ── Delay / Schedule questions ──
  if (lower.includes("delay") || lower.includes("late") || lower.includes("behind") || lower.includes("schedule") || lower.includes("timeline")) {
    let response = `## Schedule Analysis for ${projectName}\n\n`;
    if (delay.predictedDelayDays > 0) {
      response += `⚠️ **Predicted delay: ${delay.predictedDelayDays} days**\n`;
      response += `Expected completion: **${delay.expectedCompletionDate}**\n\n`;
      response += `### Root Causes:\n`;
      if (behindTasks.length > 0) {
        response += `- **${behindTasks.length} task(s) behind schedule**: ${behindTasks.map(t => t.name).join(", ")}\n`;
      }
      if (breakdown.scheduleRisk >= 50) {
        response += `- **Schedule Risk: ${breakdown.scheduleRisk}%** — ${breakdown.insights.find(i => i.toLowerCase().includes("slack") || i.toLowerCase().includes("cascade") || i.toLowerCase().includes("behind")) || "Critical path pressure detected"}\n`;
      }
      if (breakdown.resourceRisk >= 40) {
        response += `- **Resource constraints**: ${breakdown.insights.find(i => i.toLowerCase().includes("resource") || i.toLowerCase().includes("worker")) || "Worker allocation issues"}\n`;
      }
      response += `\n### Recommendations:\n`;
      breakdown.recommendations.filter(r => r.toLowerCase().includes("schedule") || r.toLowerCase().includes("overtime") || r.toLowerCase().includes("fast-track") || r.toLowerCase().includes("re-baseline")).forEach(r => { response += `- ${r}\n`; });
      if (!response.includes("Recommendations:\n-")) {
        response += `- Re-baseline schedule using CPM analysis\n- Fast-track non-critical tasks\n- Add overtime for critical path: ${criticalTaskNames.slice(0, 3).join(", ")}\n`;
      }
    } else {
      response += `✅ **No delay predicted** — project is on track.\n`;
      response += `- Overall progress: ${avgProgress}%\n`;
      response += `- ${completedTasks.length}/${tasks.length} tasks completed\n`;
      response += `- Critical path: ${criticalTaskNames.slice(0, 3).join(" → ")}\n`;
    }
    return response;
  }

  // ── Cost / Budget questions ──
  if (lower.includes("cost") || lower.includes("budget") || lower.includes("money") || lower.includes("spend") || lower.includes("overrun") || lower.includes("expense")) {
    const costOverrun = totalEstimated > 0 && avgProgress > 0 ? Math.round(((totalSpent / (totalEstimated * (avgProgress / 100))) - 1) * 100) : 0;
    let response = `## Cost Analysis for ${projectName}\n\n`;
    response += `| Metric | Value |\n|---|---|\n`;
    response += `| Total Budget | $${totalEstimated.toLocaleString()} |\n`;
    response += `| Spent So Far | $${totalSpent.toLocaleString()} |\n`;
    response += `| Progress | ${avgProgress}% |\n`;
    response += `| Cost Variance | ${costOverrun > 0 ? `+${costOverrun}% overrun` : "On track"} |\n`;
    response += `| Cost Risk Score | ${breakdown.costRisk}% |\n\n`;

    const overBudgetTasks = tasks.filter((t) => t.actualCost > t.budget && t.budget > 0);
    if (overBudgetTasks.length > 0) {
      response += `### Over-Budget Tasks:\n`;
      overBudgetTasks.forEach((t) => {
        response += `- **${t.name}**: $${t.actualCost.toLocaleString()} / $${t.budget.toLocaleString()} (+${Math.round(((t.actualCost / t.budget) - 1) * 100)}%)\n`;
      });
      response += `\n`;
    }
    response += `### Recommendations:\n`;
    breakdown.recommendations.filter(r => r.toLowerCase().includes("cost") || r.toLowerCase().includes("budget") || r.toLowerCase().includes("variance") || r.toLowerCase().includes("vendor")).forEach(r => { response += `- ${r}\n`; });
    if (!response.includes("Recommendations:\n-")) {
      response += `- Perform variance analysis on over-budget tasks\n- Apply value engineering to reduce costs\n- Negotiate bulk pricing with suppliers\n`;
    }
    return response;
  }

  // ── Risk questions ──
  if (lower.includes("risk") || lower.includes("danger") || lower.includes("threat") || lower.includes("safe")) {
    let response = `## Risk Analysis for ${projectName}\n\n`;
    response += `**Overall Risk Score: ${breakdown.overallScore} (${breakdown.level})**\n\n`;
    response += `| Category | Score | Level |\n|---|---|---|\n`;
    const cats = [
      { name: "Schedule", score: breakdown.scheduleRisk },
      { name: "Cost", score: breakdown.costRisk },
      { name: "Resource", score: breakdown.resourceRisk },
      { name: "Weather", score: breakdown.weatherRisk },
      { name: "Permit", score: breakdown.permitRisk },
      { name: "Scope", score: breakdown.scopeRisk },
      { name: "Safety", score: breakdown.safetyRisk },
      { name: "Supply Chain", score: breakdown.supplyRisk },
    ];
    cats.sort((a, b) => b.score - a.score);
    cats.forEach((c) => {
      const lvl = c.score >= 70 ? "🔴 High" : c.score >= 30 ? "🟡 Medium" : "🟢 Low";
      response += `| ${c.name} | ${c.score}% | ${lvl} |\n`;
    });

    const topRisks = cats.filter(c => c.score >= 40);
    if (topRisks.length > 0) {
      response += `\n### Key Findings:\n`;
      breakdown.insights.slice(0, 4).forEach((i) => { response += `- ${i}\n`; });
    }
    return response;
  }

  // ── Resource questions ──
  if (lower.includes("resource") || lower.includes("worker") || lower.includes("team") || lower.includes("labor") || lower.includes("staff")) {
    const totalRes = tasks.reduce((s, t) => s + (t.resourceCount || 1), 0);
    let response = `## Resource Analysis for ${projectName}\n\n`;
    response += `- **Total workers allocated**: ${totalRes}\n`;
    response += `- **Resource Risk Score**: ${breakdown.resourceRisk}%\n`;
    response += `- **Tasks in progress**: ${tasks.filter(t => t.progress > 0 && t.progress < 100).length}\n\n`;

    const resInsights = breakdown.insights.filter(i => i.toLowerCase().includes("resource") || i.toLowerCase().includes("worker") || i.toLowerCase().includes("concurrent"));
    if (resInsights.length > 0) {
      response += `### Issues Detected:\n`;
      resInsights.forEach((i) => { response += `- ${i}\n`; });
    }
    response += `\n### Recommendations:\n`;
    response += `- Balance resource allocation across concurrent tasks\n`;
    response += `- Cross-train workers to improve flexibility\n`;
    response += `- Secure backup labor contracts for critical phases\n`;
    return response;
  }

  // ── Progress / Status questions ──
  if (lower.includes("progress") || lower.includes("status") || lower.includes("update") || lower.includes("how") || lower.includes("overview")) {
    let response = `## Project Status: ${projectName}\n\n`;
    response += `| Metric | Value |\n|---|---|\n`;
    response += `| Overall Progress | ${avgProgress}% |\n`;
    response += `| Tasks Completed | ${completedTasks.length}/${tasks.length} |\n`;
    response += `| Behind Schedule | ${behindTasks.length} task(s) |\n`;
    response += `| Risk Level | ${breakdown.level} (${breakdown.overallScore}) |\n`;
    response += `| Predicted Delay | ${delay.predictedDelayDays > 0 ? `+${delay.predictedDelayDays} days` : "None"} |\n`;
    response += `| Budget Used | $${totalSpent.toLocaleString()} / $${totalEstimated.toLocaleString()} |\n\n`;

    if (behindTasks.length > 0) {
      response += `### ⚠️ Attention Needed:\n`;
      behindTasks.forEach((t) => {
        response += `- **${t.name}**: ${t.progress}% complete (${t.status})\n`;
      });
    }

    if (breakdown.insights.length > 0) {
      response += `\n### AI Insights:\n`;
      breakdown.insights.slice(0, 3).forEach((i) => { response += `- ${i}\n`; });
    }
    return response;
  }

  // ── Recommendation questions ──
  if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("what should") || lower.includes("action") || lower.includes("improve")) {
    let response = `## AI Recommendations for ${projectName}\n\n`;
    response += `Based on current analysis (Risk: ${breakdown.overallScore}, Progress: ${avgProgress}%):\n\n`;
    breakdown.recommendations.forEach((r, i) => { response += `${i + 1}. ${r}\n`; });
    return response;
  }

  // ── Default: overview ──
  let response = `## ${projectName} — Quick Summary\n\n`;
  response += `- **Progress**: ${avgProgress}% | **Risk**: ${breakdown.overallScore} (${breakdown.level})\n`;
  response += `- **Budget**: $${totalSpent.toLocaleString()} / $${totalEstimated.toLocaleString()}\n`;
  response += `- **Delay**: ${delay.predictedDelayDays > 0 ? `+${delay.predictedDelayDays} days predicted` : "On track"}\n\n`;
  response += `I can help you with:\n`;
  response += `- **"Why is my project delayed?"** — Schedule analysis\n`;
  response += `- **"Show risk breakdown"** — 8-factor risk analysis\n`;
  response += `- **"How is my budget?"** — Cost variance analysis\n`;
  response += `- **"Resource status"** — Worker allocation review\n`;
  response += `- **"What should I do?"** — AI recommendations\n`;
  return response;
}
