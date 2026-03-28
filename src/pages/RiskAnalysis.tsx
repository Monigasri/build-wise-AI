import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useProjectStore, useCurrentProject } from "@/store/projectStore";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ShieldAlert, Pencil, Lightbulb, Wrench } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RiskItem } from "@/store/projectStore";

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };
const RISK_COLORS = ["hsl(210,29%,24%)", "hsl(38,92%,50%)", "hsl(152,60%,40%)", "hsl(0,72%,51%)", "hsl(280,60%,50%)", "hsl(200,70%,50%)", "hsl(45,90%,50%)", "hsl(330,60%,50%)"];

function riskBadge(score: number) {
  if (score >= 70) return "risk-high";
  if (score >= 30) return "risk-medium";
  return "risk-low";
}

export default function RiskAnalysis() {
  const project = useCurrentProject();
  const { risks, riskTrendData, riskBreakdown, delayPrediction } = project;
  const updateRisk = useProjectStore((s) => s.updateRisk);
  const [editRisk, setEditRisk] = useState<RiskItem | null>(null);

  const radarData = risks.map((r) => ({ category: r.category, score: r.score }));

  const pieData = [
    { name: "Schedule", value: riskBreakdown.scheduleRisk },
    { name: "Cost", value: riskBreakdown.costRisk },
    { name: "Resource", value: riskBreakdown.resourceRisk },
    { name: "Weather", value: riskBreakdown.weatherRisk },
    { name: "Permit", value: riskBreakdown.permitRisk },
    { name: "Scope", value: riskBreakdown.scopeRisk },
    { name: "Safety", value: riskBreakdown.safetyRisk },
    { name: "Supply", value: riskBreakdown.supplyRisk },
  ];

  const handleSave = () => {
    if (!editRisk) return;
    updateRisk(editRisk.id, { probability: editRisk.probability, impact: editRisk.impact, description: editRisk.description, mitigation: editRisk.mitigation });
    setEditRisk(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <AnimatedSection>
        <h1 className="page-header">AI Risk Prediction Engine</h1>
        <p className="page-subheader">{project.name} — 8-factor construction risk analysis</p>
      </AnimatedSection>

      {/* Summary Strip */}
      <AnimatedSection delay={0.05}>
        <div className="section-card p-5 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${riskBreakdown.overallScore >= 70 ? "bg-destructive/10" : riskBreakdown.overallScore >= 30 ? "bg-accent/10" : "bg-success/10"}`}>
              <ShieldAlert className={`w-6 h-6 ${riskBreakdown.overallScore >= 70 ? "text-destructive" : riskBreakdown.overallScore >= 30 ? "text-accent" : "text-success"}`} />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{riskBreakdown.overallScore}</p>
              <p className="text-xs text-muted-foreground">Overall Risk — <span className="font-semibold">{riskBreakdown.level}</span></p>
            </div>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div className="flex gap-4 flex-wrap">
            {pieData.map((d) => (
              <div key={d.name} className="text-center">
                <p className="text-lg font-bold tabular-nums">{d.value}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{d.name}</p>
              </div>
            ))}
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div>
            <p className="text-sm font-semibold">{delayPrediction.predictedDelayDays > 0 ? `+${delayPrediction.predictedDelayDays} day delay predicted` : "No delay predicted"}</p>
            <p className="text-xs text-muted-foreground">{delayPrediction.criticalTasks.length} tasks on critical path</p>
          </div>
        </div>
      </AnimatedSection>

      {/* AI Insights + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {riskBreakdown.insights.length > 0 && (
          <AnimatedSection delay={0.08}>
            <div className="section-card p-5 h-full">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent" /> AI Risk Insights</h3>
              <div className="space-y-2">
                {riskBreakdown.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${i === 0 ? "text-destructive" : "text-accent"}`} />
                    <p className="text-xs leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
        {riskBreakdown.recommendations.length > 0 && (
          <AnimatedSection delay={0.1}>
            <div className="section-card p-5 h-full">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" /> AI Recommendations</h3>
              <div className="space-y-2">
                {riskBreakdown.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                    <span className="text-xs font-bold text-primary mt-0.5 shrink-0">{i + 1}.</span>
                    <p className="text-xs leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnimatedSection delay={0.12} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Risk Breakdown (8 Factors)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [`${v}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: RISK_COLORS[i % RISK_COLORS.length] }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-semibold tabular-nums ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.15} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Risk Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}><PolarGrid stroke="hsl(210,16%,89%)" /><PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} /><Radar dataKey="score" stroke="hsl(0,72%,51%)" fill="hsl(0,72%,51%)" fillOpacity={0.15} strokeWidth={2} /></RadarChart>
          </ResponsiveContainer>
        </AnimatedSection>
        <AnimatedSection delay={0.2} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Risk Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,16%,89%)" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip />
              <Line type="monotone" dataKey="schedule" stroke="hsl(210,29%,24%)" strokeWidth={2} dot={false} name="Schedule" />
              <Line type="monotone" dataKey="cost" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={false} name="Cost" />
              <Line type="monotone" dataKey="resource" stroke="hsl(152,60%,40%)" strokeWidth={2} dot={false} name="Resource" />
              <Line type="monotone" dataKey="weather" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={false} name="Weather" />
            </LineChart>
          </ResponsiveContainer>
        </AnimatedSection>
      </div>

      {/* Risk Cards */}
      <AnimatedSection delay={0.25}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map((risk) => {
            const TrendIcon = trendIcon[risk.trend];
            return (
              <div key={risk.id} className="section-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-semibold">{risk.category}</span></div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-md text-xs font-bold border tabular-nums ${riskBadge(risk.score)}`}>{risk.score}</div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditRisk({ ...risk })}><Pencil className="w-3 h-3" /></Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Probability</p><p className="text-sm font-semibold tabular-nums">{risk.probability}%</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact</p><p className="text-sm font-semibold tabular-nums">{risk.impact}%</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Trend</p><p className="text-sm font-semibold flex items-center gap-1"><TrendIcon className="w-3 h-3" />{risk.trend}</p></div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mitigation</p>
                  <p className="text-xs">{risk.mitigation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </AnimatedSection>

      <Dialog open={!!editRisk} onOpenChange={(open) => !open && setEditRisk(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Risk: {editRisk?.category}</DialogTitle></DialogHeader>
          {editRisk && (
            <div className="space-y-3">
              <div><Label>Description</Label><Input value={editRisk.description} onChange={(e) => setEditRisk({ ...editRisk, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Probability (%)</Label><Input type="number" min={0} max={100} value={editRisk.probability} onChange={(e) => setEditRisk({ ...editRisk, probability: +e.target.value })} /></div>
                <div><Label>Impact (%)</Label><Input type="number" min={0} max={100} value={editRisk.impact} onChange={(e) => setEditRisk({ ...editRisk, impact: +e.target.value })} /></div>
              </div>
              <div><Label>Mitigation</Label><Input value={editRisk.mitigation} onChange={(e) => setEditRisk({ ...editRisk, mitigation: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
