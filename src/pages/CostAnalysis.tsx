import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useProjectStore, useCurrentProject, useKpis } from "@/store/projectStore";
import { DollarSign, TrendingDown, TrendingUp, PieChart, Pencil, Lightbulb } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CostAnalysis() {
  const project = useCurrentProject();
  const { tasks, costData, riskBreakdown } = project;
  const updateCostEntry = useProjectStore((s) => s.updateCostEntry);
  const kpis = useKpis();
  const [editMonth, setEditMonth] = useState<{ month: string; planned: number; actual: number } | null>(null);

  const totalBudget = tasks.reduce((s, t) => s + t.budget, 0);
  const totalActual = tasks.reduce((s, t) => s + t.actualCost, 0);
  const variance = totalBudget - totalActual;
  const variancePct = totalBudget > 0 ? ((variance / totalBudget) * 100).toFixed(1) : "0";
  const costOverrun = kpis.costOverrun;
  const predictedFinal = Math.round(totalBudget * (1 + costOverrun / 100));

  const taskBudgets = tasks.map((t) => ({
    name: t.name.length > 15 ? t.name.slice(0, 15) + "…" : t.name,
    budget: t.budget,
    actual: t.actualCost,
  }));

  const handleSaveCost = () => {
    if (!editMonth) return;
    updateCostEntry(editMonth.month, { planned: editMonth.planned, actual: editMonth.actual });
    setEditMonth(null);
  };

  // AI-driven cost recommendations based on actual data
  const recommendations = [];
  const overBudgetTasks = tasks.filter((t) => t.actualCost > t.budget && t.budget > 0);
  if (overBudgetTasks.length > 0) {
    recommendations.push({ title: "Over-Budget Task Alert", desc: `${overBudgetTasks.map((t) => `"${t.name}"`).join(", ")} exceeded budget. Review resource allocation and negotiate revised quotes.`, icon: TrendingUp });
  }
  const highBudgetTasks = tasks.filter((t) => t.budget > totalBudget * 0.2);
  if (highBudgetTasks.length > 0) {
    recommendations.push({ title: "Bulk Procurement Opportunity", desc: `High-cost tasks (${highBudgetTasks.map((t) => t.name).join(", ")}) can benefit from bulk material ordering to save ~${Math.round(totalBudget * 0.015).toLocaleString()}.`, icon: TrendingDown });
  }
  if (riskBreakdown.costRisk > 40) {
    recommendations.push({ title: "Contingency Reallocation", desc: `Cost risk is ${riskBreakdown.costRisk}% — redistribute contingency from completed tasks to at-risk tasks.`, icon: TrendingUp });
  }
  if (tasks.some((t) => (t.resourceCount || 1) > 8)) {
    recommendations.push({ title: "Labor Optimization", desc: "Stagger shifts for resource-heavy tasks to reduce overtime costs and improve utilization.", icon: TrendingDown });
  }
  if (recommendations.length === 0) {
    recommendations.push({ title: "Budget On Track", desc: "Current spending aligns with project progress. Continue monitoring for deviations.", icon: TrendingDown });
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <AnimatedSection>
        <h1 className="page-header">Cost Overrun Analyzer</h1>
        <p className="page-subheader">{project.name} — AI-predicted cost analysis</p>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedSection delay={0.05}><div className="kpi-card"><p className="text-xs text-muted-foreground uppercase tracking-wider">Total Budget</p><p className="text-2xl font-bold tabular-nums mt-1">${totalBudget.toLocaleString()}</p></div></AnimatedSection>
        <AnimatedSection delay={0.1}><div className="kpi-card"><p className="text-xs text-muted-foreground uppercase tracking-wider">Spent to Date</p><p className="text-2xl font-bold tabular-nums mt-1">${totalActual.toLocaleString()}</p><p className={`text-xs mt-1 ${variance >= 0 ? "text-success" : "text-destructive"}`}>{variance >= 0 ? `${variancePct}% under budget` : `${Math.abs(+variancePct)}% over budget`}</p></div></AnimatedSection>
        <AnimatedSection delay={0.15}><div className="kpi-card"><p className="text-xs text-muted-foreground uppercase tracking-wider">AI Predicted Final</p><p className="text-2xl font-bold tabular-nums mt-1">${predictedFinal.toLocaleString()}</p><p className={`text-xs mt-1 ${costOverrun <= 5 ? "text-accent" : "text-destructive"}`}>+{costOverrun}% overrun predicted</p></div></AnimatedSection>
        <AnimatedSection delay={0.2}><div className="kpi-card"><p className="text-xs text-muted-foreground uppercase tracking-wider">Cost Risk</p><p className="text-2xl font-bold tabular-nums mt-1">{riskBreakdown.costRisk}%</p><p className={`text-xs mt-1 ${riskBreakdown.costRisk < 30 ? "text-success" : riskBreakdown.costRisk < 50 ? "text-accent" : "text-destructive"}`}>{riskBreakdown.costRisk < 30 ? "Low risk" : riskBreakdown.costRisk < 50 ? "Medium risk" : "High risk"}</p></div></AnimatedSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatedSection delay={0.25} className="section-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Monthly Cost: Planned vs Actual</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { const first = costData.find((c) => c.actual === 0) || costData[costData.length - 1]; if (first) setEditMonth({ month: first.month, planned: first.planned, actual: first.actual }); }}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(210,16%,89%)" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} /><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Bar dataKey="planned" fill="hsl(210,29%,24%)" radius={[4, 4, 0, 0]} /><Bar dataKey="actual" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </AnimatedSection>
        <AnimatedSection delay={0.3} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Budget by Task</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={taskBudgets} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(210,16%,89%)" /><XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} /><YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} /><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Bar dataKey="budget" fill="hsl(210,29%,24%)" radius={[0, 4, 4, 0]} barSize={14} /><Bar dataKey="actual" fill="hsl(38,92%,50%)" radius={[0, 4, 4, 0]} barSize={14} /></BarChart>
          </ResponsiveContainer>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.35} className="section-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent" /> AI Cost Optimization Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
              <rec.icon className="w-4 h-4 text-success mt-0.5 shrink-0" />
              <div><p className="text-sm font-medium">{rec.title}</p><p className="text-xs text-muted-foreground mt-1">{rec.desc}</p></div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      <Dialog open={!!editMonth} onOpenChange={(open) => !open && setEditMonth(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Cost: {editMonth?.month}</DialogTitle></DialogHeader>
          {editMonth && (
            <div className="space-y-3">
              <div><Label>Planned ($)</Label><Input type="number" value={editMonth.planned} onChange={(e) => setEditMonth({ ...editMonth, planned: +e.target.value })} /></div>
              <div><Label>Actual ($)</Label><Input type="number" value={editMonth.actual} onChange={(e) => setEditMonth({ ...editMonth, actual: +e.target.value })} /></div>
              <Button onClick={handleSaveCost} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
