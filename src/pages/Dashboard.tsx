import { KpiCard } from "@/components/KpiCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useCurrentProject, useKpis } from "@/store/projectStore";
import {
  TrendingUp, AlertTriangle, DollarSign, CalendarCheck, Bell, Clock, Lightbulb,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const RISK_COLORS = ["hsl(210,29%,24%)", "hsl(38,92%,50%)", "hsl(152,60%,40%)", "hsl(0,72%,51%)", "hsl(280,60%,50%)", "hsl(200,70%,50%)", "hsl(45,90%,50%)", "hsl(330,60%,50%)"];

export default function Dashboard() {
  const kpis = useKpis();
  const project = useCurrentProject();
  const { progressData, riskTrendData, costData, riskBreakdown, delayPrediction } = project;

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

  return (
    <div className="space-y-6 max-w-[1400px]">
      <AnimatedSection>
        <div>
          <h1 className="page-header">Executive Dashboard</h1>
          <p className="page-subheader">{project.name}</p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Overall Progress" value={`${kpis.overallProgress}%`} subtitle={`${kpis.tasksCompleted} of ${kpis.totalTasks} tasks completed`} icon={<TrendingUp className="w-4 h-4" />} trend={{ value: "Live", positive: true }} delay={0.05} />
        <KpiCard title="Risk Score" value={`${kpis.delayRisk}`} subtitle={`Level: ${kpis.riskLevel}`} icon={<AlertTriangle className="w-4 h-4" />} trend={{ value: kpis.riskLevel, positive: kpis.delayRisk <= 35 }} delay={0.1} />
        <KpiCard title="Budget Health" value={`${kpis.budgetHealth}%`} subtitle={`$${(kpis.spentSoFar / 1000).toFixed(0)}k of $${(kpis.totalBudget / 1000).toFixed(0)}k spent`} icon={<DollarSign className="w-4 h-4" />} trend={{ value: kpis.costOverrun > 0 ? `+${kpis.costOverrun}% overrun` : "On track", positive: kpis.costOverrun <= 5 }} delay={0.15} />
        <KpiCard title="Delay Prediction" value={delayPrediction.predictedDelayDays > 0 ? `+${delayPrediction.predictedDelayDays}d` : "On Time"} subtitle={delayPrediction.expectedCompletionDate} icon={<Clock className="w-4 h-4" />} trend={{ value: `${delayPrediction.criticalTasks.length} critical tasks`, positive: delayPrediction.predictedDelayDays === 0 }} delay={0.2} />
      </div>

      {/* Risk Breakdown + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnimatedSection delay={0.25} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Risk Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [`${v}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: RISK_COLORS[i] }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-semibold tabular-nums ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="section-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent" /> AI Insights</h3>
          <div className="space-y-3">
            {riskBreakdown.insights.length > 0 ? riskBreakdown.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${i === 0 ? "bg-destructive" : i === 1 ? "bg-accent" : "bg-success"}`} />
                <p className="text-xs leading-relaxed">{insight}</p>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground">Upload project data to generate AI insights.</p>
            )}
          </div>
        </AnimatedSection>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatedSection delay={0.35} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Progress: Planned vs Actual</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="plannedG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(210,29%,24%)" stopOpacity={0.15} /><stop offset="100%" stopColor="hsl(210,29%,24%)" stopOpacity={0} /></linearGradient>
                <linearGradient id="actualG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(38,92%,50%)" stopOpacity={0.15} /><stop offset="100%" stopColor="hsl(38,92%,50%)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,16%,89%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="planned" stroke="hsl(210,29%,24%)" fill="url(#plannedG)" strokeWidth={2} />
              <Area type="monotone" dataKey="actual" stroke="hsl(38,92%,50%)" fill="url(#actualG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </AnimatedSection>

        <AnimatedSection delay={0.4} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4">Risk Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,16%,89%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="schedule" stroke="hsl(210,29%,24%)" strokeWidth={2} dot={false} name="Schedule" />
              <Line type="monotone" dataKey="cost" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={false} name="Cost" />
              <Line type="monotone" dataKey="resource" stroke="hsl(152,60%,40%)" strokeWidth={2} dot={false} name="Resource" />
              <Line type="monotone" dataKey="weather" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={false} name="Weather" />
            </LineChart>
          </ResponsiveContainer>
        </AnimatedSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnimatedSection delay={0.45} className="section-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Cost: Planned vs Actual</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,16%,89%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="planned" fill="hsl(210,29%,24%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnimatedSection>

        <AnimatedSection delay={0.5} className="section-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-accent" /> Active Alerts
          </h3>
          <div className="space-y-3">
            {project.alerts.length > 0 ? project.alerts.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${r.severity === "high" ? "bg-destructive" : r.severity === "medium" ? "bg-accent" : "bg-success"}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{r.desc}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground">No active alerts</p>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
