import Papa from "papaparse";
import type { Task } from "@/store/projectStore";

export interface CsvRow {
  taskName: string;
  startDate: string;
  endDate: string;
  duration: number;
  dependencies: string;
  resourceCount: number;
  estimatedCost: number;
}

export interface CsvParseResult {
  success: boolean;
  tasks: Task[];
  errors: string[];
  totalBudget: number;
}

function parseDateToDayOffset(dateStr: string, projectStart: Date): number {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, Math.round((d.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
}

function calcDuration(startStr: string, endStr: string, durationVal: number): number {
  if (durationVal > 0) return durationVal;
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
    return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
  }
  return 7;
}

export function parseProjectCsv(csvString: string, projectStartDate: string): CsvParseResult {
  const errors: string[] = [];
  const projectStart = new Date(projectStartDate);
  if (isNaN(projectStart.getTime())) {
    return { success: false, tasks: [], errors: ["Invalid project start date"], totalBudget: 0 };
  }

  const parsed = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/[\s_]+/g, ""),
  });

  if (parsed.errors.length > 0) {
    parsed.errors.forEach((e) => errors.push(`Row ${e.row}: ${e.message}`));
  }

  if (parsed.data.length === 0) {
    return { success: false, tasks: [], errors: ["CSV file is empty or has no valid rows"], totalBudget: 0 };
  }

  const tasks: Task[] = [];
  let totalBudget = 0;

  parsed.data.forEach((row, idx) => {
    const taskName = row["taskname"] || row["task"] || row["name"] || row["activity"] || "";
    const startDate = row["startdate"] || row["start"] || "";
    const endDate = row["enddate"] || row["end"] || row["finish"] || "";
    const durationRaw = row["duration"] || row["days"] || "0";
    const deps = row["dependencies"] || row["predecessors"] || row["deps"] || "";
    const resources = row["resourcecount"] || row["resources"] || row["workers"] || "1";
    const cost = row["estimatedcost"] || row["cost"] || row["budget"] || "0";

    if (!taskName.trim()) {
      errors.push(`Row ${idx + 2}: Missing task name`);
      return;
    }

    const duration = calcDuration(startDate, endDate, parseInt(durationRaw) || 0);
    const start = parseDateToDayOffset(startDate, projectStart);
    const estimatedCost = parseFloat(cost.replace(/[,$]/g, "")) || 0;
    const resourceCount = parseInt(resources) || 1;

    totalBudget += estimatedCost;

    const depList = deps
      .split(/[,;]/)
      .map((d) => d.trim())
      .filter(Boolean);

    tasks.push({
      id: `T${idx + 1}`,
      name: taskName.trim(),
      start,
      duration,
      dependencies: depList,
      progress: 0,
      budget: estimatedCost,
      actualCost: 0,
      status: "on-track",
      assignee: `Team (${resourceCount} workers)`,
      resourceCount,
    });
  });

  if (tasks.length === 0) {
    return { success: false, tasks: [], errors: ["No valid tasks found in CSV"], totalBudget: 0 };
  }

  // Resolve dependency IDs — if deps reference task names, map to IDs
  const nameToId = new Map(tasks.map((t) => [t.name.toLowerCase(), t.id]));
  tasks.forEach((t) => {
    t.dependencies = t.dependencies.map((dep) => {
      if (tasks.find((x) => x.id === dep)) return dep;
      return nameToId.get(dep.toLowerCase()) || dep;
    }).filter((dep) => tasks.find((x) => x.id === dep));
  });

  return { success: errors.length === 0 || tasks.length > 0, tasks, errors, totalBudget };
}

export function generateSampleCsv(): string {
  return `Task Name,Start Date,End Date,Duration,Dependencies,Resource Count,Estimated Cost
Site Preparation,2025-01-06,2025-01-20,14,,5,45000
Foundation Work,2025-01-20,2025-02-10,21,T1,8,120000
Structural Framing,2025-02-10,2025-03-10,28,T2,12,200000
Electrical Rough-In,2025-02-24,2025-03-10,14,T2,4,55000
Plumbing Installation,2025-02-24,2025-03-14,18,T2,6,68000
Roofing,2025-03-10,2025-03-22,12,T3,7,95000
HVAC Installation,2025-03-10,2025-03-26,16,T3,5,78000
Interior Finishing,2025-03-22,2025-04-12,21,"T4,T5,T6",10,150000
Landscaping,2025-04-12,2025-04-22,10,T8,4,35000
Final Inspection,2025-04-22,2025-04-27,5,"T8,T9",2,12000`;
}
