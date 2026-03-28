import { useState, useRef } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useProjectStore, useCurrentProject } from "@/store/projectStore";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Trash2, Upload, Download, AlertTriangle } from "lucide-react";
import type { Task } from "@/store/projectStore";
import { parseProjectCsv, generateSampleCsv } from "@/lib/csvParser";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/20",
  "on-track": "bg-primary/10 text-primary border-primary/20",
  "at-risk": "bg-accent/10 text-accent border-accent/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Planner() {
  const project = useCurrentProject();
  const tasks = project.tasks;
  const updateTask = useProjectStore((s) => s.updateTask);
  const addTask = useProjectStore((s) => s.addTask);
  const removeTask = useProjectStore((s) => s.removeTask);
  const importCsvTasks = useProjectStore((s) => s.importCsvTasks);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", duration: 7, budget: 10000, assignee: "", start: 0, resourceCount: 1 });
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalDays = Math.max(105, ...tasks.map((t) => t.start + t.duration));

  const handleSaveEdit = () => {
    if (!editTask) return;
    updateTask(editTask.id, editTask);
    setEditTask(null);
  };

  const handleAddTask = () => {
    const id = `T${tasks.length + 1}`;
    addTask({
      id, name: newTask.name || "New Task", start: newTask.start, duration: newTask.duration,
      dependencies: [], progress: 0, budget: newTask.budget, actualCost: 0, status: "on-track",
      assignee: newTask.assignee || "Unassigned", resourceCount: newTask.resourceCount,
    });
    setShowAdd(false);
    setNewTask({ name: "", duration: 7, budget: 10000, assignee: "", start: 0, resourceCount: 1 });
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseProjectCsv(text, project.startDate);
      if (result.tasks.length > 0) {
        importCsvTasks(result.tasks, result.totalBudget);
        setCsvErrors(result.errors);
        if (result.errors.length > 0) toast.warning(`Imported with ${result.errors.length} warning(s)`);
      } else {
        setCsvErrors(result.errors);
        toast.error("CSV import failed — check errors below");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([generateSampleCsv()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sample_project.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <AnimatedSection>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-header">Project Planner</h1>
            <p className="page-subheader">{project.name} — Gantt chart view</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload CSV
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" onClick={downloadSampleCsv}>
              <Download className="w-4 h-4" /> Sample CSV
            </Button>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Task</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Task Name</Label><Input value={newTask.name} onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} placeholder="Enter task name" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Start (Day)</Label><Input type="number" value={newTask.start} onChange={(e) => setNewTask({ ...newTask, start: +e.target.value })} /></div>
                    <div><Label>Duration (Days)</Label><Input type="number" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: +e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Budget ($)</Label><Input type="number" value={newTask.budget} onChange={(e) => setNewTask({ ...newTask, budget: +e.target.value })} /></div>
                    <div><Label>Resources</Label><Input type="number" value={newTask.resourceCount} onChange={(e) => setNewTask({ ...newTask, resourceCount: +e.target.value })} /></div>
                  </div>
                  <div><Label>Assignee</Label><Input value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} placeholder="Assignee name" /></div>
                  <Button onClick={handleAddTask} className="w-full">Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </AnimatedSection>

      {csvErrors.length > 0 && (
        <AnimatedSection delay={0.05}>
          <div className="section-card p-4 border-accent/40">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-accent" /><span className="text-sm font-semibold">CSV Import Warnings</span></div>
            <ul className="text-xs text-muted-foreground space-y-1">{csvErrors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
            <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setCsvErrors([])}>Dismiss</Button>
          </div>
        </AnimatedSection>
      )}

      {tasks.length === 0 ? (
        <AnimatedSection delay={0.1}>
          <div className="section-card p-12 text-center">
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Upload CSV to Begin Planning</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Upload a CSV file with your project tasks including task name, dates, duration, dependencies, resources, and estimated costs.</p>
            <div className="flex gap-3 justify-center mt-6">
              <Button onClick={() => fileInputRef.current?.click()} className="gap-1"><Upload className="w-4 h-4" /> Upload CSV</Button>
              <Button variant="outline" onClick={downloadSampleCsv} className="gap-1"><Download className="w-4 h-4" /> Download Sample</Button>
            </div>
          </div>
        </AnimatedSection>
      ) : (
        <>
          <AnimatedSection delay={0.1} className="section-card overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[250px_1fr] border-b">
                <div className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task</div>
                <div className="p-3 flex">
                  {Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => (
                    <div key={i} className="flex-1 text-[10px] text-muted-foreground text-center tabular-nums">W{i + 1}</div>
                  ))}
                </div>
              </div>
              {tasks.map((task) => {
                const isCritical = project.delayPrediction.criticalTasks.includes(task.id);
                return (
                  <div key={task.id} className={`grid grid-cols-[250px_1fr] border-b last:border-b-0 hover:bg-muted/30 transition-colors ${isCritical ? "bg-destructive/5" : ""}`}>
                    <div className="p-3 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                        <span className="text-sm font-medium">{task.name}</span>
                        {isCritical && <span className="text-[9px] px-1 rounded bg-destructive/10 text-destructive border border-destructive/20">CP</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColor[task.status]}`}>{task.status}</span>
                        <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                      </div>
                    </div>
                    <div className="p-3 flex items-center relative">
                      <div className="w-full h-8 relative">
                        <div className={`absolute top-1 h-6 rounded-md border ${isCritical ? "bg-destructive/15 border-destructive/30" : "bg-primary/15 border-primary/20"}`} style={{ left: `${(task.start / totalDays) * 100}%`, width: `${(task.duration / totalDays) * 100}%` }}>
                          <div className={`h-full rounded-md ${isCritical ? "bg-destructive/40" : "bg-primary/40"}`} style={{ width: `${task.progress}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium tabular-nums">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="section-card">
            <div className="p-4 border-b"><h3 className="text-sm font-semibold">Task Details</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Task</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Resources</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Budget</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actual</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Progress</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>{tasks.map((t) => (
                  <tr key={t.id} className={`border-b last:border-b-0 hover:bg-muted/20 transition-colors ${project.delayPrediction.criticalTasks.includes(t.id) ? "bg-destructive/5" : ""}`}>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 tabular-nums">{t.duration}d</td>
                    <td className="p-3 tabular-nums">{t.resourceCount}</td>
                    <td className="p-3 tabular-nums">${t.budget.toLocaleString()}</td>
                    <td className="p-3 tabular-nums">${t.actualCost.toLocaleString()}</td>
                    <td className="p-3"><div className="flex items-center gap-2"><Progress value={t.progress} className="h-1.5 w-16" /><span className="text-xs tabular-nums">{t.progress}%</span></div></td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded border ${statusColor[t.status]}`}>{t.status}</span></td>
                    <td className="p-3"><div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditTask({ ...t })}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeTask(t.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </AnimatedSection>
        </>
      )}

      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Task: {editTask?.name}</DialogTitle></DialogHeader>
          {editTask && (
            <div className="space-y-3">
              <div><Label>Task Name</Label><Input value={editTask.name} onChange={(e) => setEditTask({ ...editTask, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start (Day)</Label><Input type="number" value={editTask.start} onChange={(e) => setEditTask({ ...editTask, start: +e.target.value })} /></div>
                <div><Label>Duration (Days)</Label><Input type="number" value={editTask.duration} onChange={(e) => setEditTask({ ...editTask, duration: +e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Budget ($)</Label><Input type="number" value={editTask.budget} onChange={(e) => setEditTask({ ...editTask, budget: +e.target.value })} /></div>
                <div><Label>Actual ($)</Label><Input type="number" value={editTask.actualCost} onChange={(e) => setEditTask({ ...editTask, actualCost: +e.target.value })} /></div>
                <div><Label>Resources</Label><Input type="number" value={editTask.resourceCount} onChange={(e) => setEditTask({ ...editTask, resourceCount: +e.target.value })} /></div>
              </div>
              <div><Label>Progress (%)</Label><Input type="number" min={0} max={100} value={editTask.progress} onChange={(e) => setEditTask({ ...editTask, progress: +e.target.value })} /></div>
              <div><Label>Status</Label>
                <Select value={editTask.status} onValueChange={(v) => setEditTask({ ...editTask, status: v as Task["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-track">On Track</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Assignee</Label><Input value={editTask.assignee} onChange={(e) => setEditTask({ ...editTask, assignee: e.target.value })} /></div>
              <Button onClick={handleSaveEdit} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
