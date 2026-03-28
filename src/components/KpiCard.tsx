import { ReactNode } from "react";
import { AnimatedSection } from "./AnimatedSection";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

export function KpiCard({ title, value, subtitle, icon, trend, delay = 0 }: Props) {
  return (
    <AnimatedSection delay={delay}>
      <div className="kpi-card">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
          <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          {trend && (
            <span className={`text-xs font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}
