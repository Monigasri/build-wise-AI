import { AnimatedSection } from "@/components/AnimatedSection";
import { useCurrentProject, useProjectStore } from "@/store/projectStore";
import { Bell, AlertTriangle, DollarSign, Clock } from "lucide-react";
import { useEffect } from "react";

const iconMap = { risk: AlertTriangle, budget: DollarSign, delay: Clock };
const sevColor = {
  high: "bg-destructive/10 border-destructive/20 text-destructive",
  medium: "bg-accent/10 border-accent/20 text-accent",
  low: "bg-success/10 border-success/20 text-success",
};

export default function Alerts() {
  const project = useCurrentProject();
  const alerts = project.alerts;
  const recalculate = useProjectStore((s) => s.recalculate);

  useEffect(() => { recalculate(); }, [recalculate]);

  return (
    <div className="space-y-6 max-w-[900px]">
      <AnimatedSection>
        <h1 className="page-header flex items-center gap-2"><Bell className="w-6 h-6 text-accent" /> Alert System</h1>
        <p className="page-subheader">{project.name}</p>
      </AnimatedSection>

      {alerts.length === 0 ? (
        <AnimatedSection delay={0.05}>
          <div className="section-card p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No active alerts</p>
            <p className="text-xs text-muted-foreground mt-1">All systems operating within normal parameters</p>
          </div>
        </AnimatedSection>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = iconMap[alert.type as keyof typeof iconMap] || Bell;
            return (
              <AnimatedSection key={alert.id} delay={0.05 * Math.min(i, 10)}>
                <div className="section-card p-4 flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${sevColor[alert.severity]}`}><Icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${sevColor[alert.severity]}`}>{alert.severity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{alert.time}</p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      )}
    </div>
  );
}
