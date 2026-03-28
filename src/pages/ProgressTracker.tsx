import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useProjectStore, useCurrentProject } from "@/store/projectStore";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ClipboardCheck, AlertTriangle } from "lucide-react";

export default function ProgressTracker() {
  const project = useCurrentProject();
  const { tasks, progressData, completionForecast, delayPrediction, riskBreakdown } = project;
  const submitDailyProgress = useProjectStore((s) => s.submitDailyProgress);
  const [selectedTask, setSelectedTask] = useState("");
  const [newProgress, setNewProgress] = useState(0);

  const overallProgress = tasks.length > 0 ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0;

  const handleSubmit = () => {
    if (!selectedTask) return;
    submitDailyProgress(selectedTask, newProgress);
    setNewProgress(0);
    setSelectedTask("");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <AnimatedSection>
        <h1 className="page-header">Real-Time Progress Tracker</h1>
        <p className="page-subheader">{project.name}</p>
      </AnimatedSection>

      {/* Delay Banner */}
      {delayPrediction.predictedDelayDays > 0 && (
        <AnimatedSection delay={0.03}>
          <div className={`section-card p-4 flex items-center gap-3 ${delayPrediction.predictedDelayDays > 14 ? "border-destructive/40" : "border-accent/40"}`}>
            <AlertTriangle className={`w-5 h-5 shrink-0 ${delayPrediction.predictedDelayDays > 14 ? "text-destructive" : "text-accent"}`} />
            <div>
              <p className="text-sm font-semibold">Predicted Delay: +{delayPrediction.predictedDelayDays} days</p>
              <p className="text-xs text-muted-foreground">Expected completion: {delayPrediction.expectedCompletionDate} • {delayPrediction.criticalTasks.length} critical path tasks • Risk level: {riskBreakdown.level}</p>
            </div>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection delay={0.05} className="section-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-accent" /> Update Daily Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div><Label>Select Task</Label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger><SelectValue placeholder="Choose task..." /></SelectTrigger>
              <SelectContent>{tasks.filter((t) => t.status !== "completed").map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.id} — {t.name} ({t.progress}%)</SelectItem>
              ))}</SelectContent>
            </Select>
          </div>
          <div><Label>New Progress (%)</Label><Input type="number" min={0} max={100} value={newProgress} onChange={(e) => setNewProgress(+e.target.value)} placeholder="e.g. 65" /></div>
          <Button onClick={handleSubmit} disabled={!selectedTask}>Submit Update</Button>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="section-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Overall Project Progress</h3>
          <span className="text-2xl font-bold tabular-nums">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">Start: {project.startDate}</span>
          <span className="text-xs text-muted-foreground">Forecast: {completionForecast}</span>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatedSection delay={0.15} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Weekly Progress: Planned vs Actual</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="pG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(210,29%,24%)" stopOpacity={0.15} /><stop offset="100%" stopColor="hsl(210,29%,24%)" stopOpacity={0} /></linearGradient>
                <linearGradient id="aG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(38,92%,50%)" stopOpacity={0.15} /><stop offset="100%" stopColor="hsl(38,92%,50%)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,16%,89%)" /><XAxis dataKey="week" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} unit="%" /><Tooltip />
              <Area type="monotone" dataKey="planned" stroke="hsl(210,29%,24%)" fill="url(#pG2)" strokeWidth={2} />
              <Area type="monotone" dataKey="actual" stroke="hsl(38,92%,50%)" fill="url(#aG2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </AnimatedSection>
        <AnimatedSection delay={0.2} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Delay Visualization</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={progressData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(210,16%,89%)" /><XAxis dataKey="week" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="planned" fill="hsl(210,29%,24%)" radius={[4, 4, 0, 0]} name="Planned %" /><Bar dataKey="actual" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} name="Actual %" /></BarChart>
          </ResponsiveContainer>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.25} className="section-card">
        <div className="p-4 border-b"><h3 className="text-sm font-semibold">Task-Level Progress</h3></div>
        <div className="divide-y">
          {tasks.map((t) => {
            const isCritical = delayPrediction.criticalTasks.includes(t.id);
            return (
              <div key={t.id} className={`p-4 flex items-center gap-4 ${isCritical ? "bg-destructive/5" : ""}`}>
                <span className="text-xs font-mono text-muted-foreground w-8">{t.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    {isCritical && <span className="text-[9px] px-1 rounded bg-destructive/10 text-destructive border border-destructive/20">Critical</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{t.assignee}</p>
                </div>
                <div className="w-32"><Progress value={t.progress} className="h-2" /></div>
                <span className="text-sm font-semibold tabular-nums w-12 text-right">{t.progress}%</span>
              </div>
            );
          })}
        </div>
      </AnimatedSection>
    </div>
  );
}
