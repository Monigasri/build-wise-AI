import { AnimatedSection } from "@/components/AnimatedSection";
import { BookOpen, Target, Lightbulb, CheckCircle2, BarChart3, Globe, BookMarked } from "lucide-react";

const sections = [
  {
    icon: Target,
    title: "Problem Statement",
    content: `Construction projects often face delays and cost overruns due to:

• **Poor planning and scheduling** — Traditional tools lack predictive capabilities
• **Unforeseen risks** — Weather events, labor shortages, material delays, equipment failures
• **Inefficient resource allocation** — Manual scheduling cannot optimize across complex dependencies
• **Lack of real-time monitoring** — Delayed feedback loops prevent timely corrective action
• **Human errors in estimation** — Cognitive biases lead to optimistic schedules and budgets

Traditional project management tools do not predict risks, cannot adapt dynamically to changing conditions, and lack intelligent decision support. The result is systematic delays, budget overruns, and operational inefficiency across the construction industry.`
  },
  {
    icon: Lightbulb,
    title: "Proposed Solution",
    content: `BuildWise AI is an AI-powered construction planning and risk analysis system that:

• **Analyzes project plans** — Parses task structures, dependencies, resource assignments, and constraints
• **Predicts risks** — Uses ML classification models to detect weather, labor, material, equipment, and regulatory risks with probability and impact scores
• **Suggests optimized schedules** — Combines Critical Path Method (CPM) with AI-driven recommendations to minimize delays
• **Monitors in real-time** — Tracks progress against baselines and alerts stakeholders to deviations
• **Enables what-if analysis** — Allows managers to simulate schedule and resource changes and instantly see predicted outcomes`
  },
  {
    icon: CheckCircle2,
    title: "Core Features",
    content: `**1. Smart Project Planner**
Input tasks, durations, dependencies, budgets, and resources. Auto-generates Gantt charts and dependency graphs with an editable interface.

**2. AI Risk Prediction Engine**
Predicts weather delays, labor shortages, material delays, and equipment failures. Outputs risk scores (0–100), risk categories, and mitigation alerts.

**3. Delay Prediction System**
Predicts delay probability and expected completion dates. Suggests optimized schedules and identifies bottlenecks using regression and time-series models.

**4. Cost Overrun Analyzer**
Predicts final cost vs initial budget using regression models. Suggests cost optimization strategies and resource balancing.

**5. Real-Time Progress Tracker**
Accepts daily progress updates. Compares planned vs actual with progress percentages and delay visualization charts.

**6. AI Chat Assistant**
Conversational interface that answers questions about delay reasons, cost optimization tips, and risk explanations.

**7. Executive Dashboard**
KPIs: Delay Risk %, Budget Health, Completion Forecast. Charts: Risk trends, cost vs time, progress tracking.

**8. Alert System**
Notifies when risk increases, budget is exceeded, or delay probability rises above threshold.

**9. What-If Simulation**
Allows users to modify duration/resources and instantly see new predictions — enabling data-driven decision making.`
  },
  {
    icon: BarChart3,
    title: "Feasibility Analysis",
    content: `**Technical Feasibility:**
Built with React.js (frontend), Python/FastAPI (backend), and Scikit-learn (ML). All technologies are mature, well-documented, and widely adopted. The system architecture supports modular development and testing.

**Economic Feasibility:**
Construction delays cost the industry $177 billion annually (McKinsey). Even a 10% reduction in delays yields significant ROI. The SaaS model provides recurring revenue with low marginal cost per user.

**Operational Feasibility:**
Intuitive UI designed for project managers and site engineers. Minimal training required. Role-based access ensures appropriate information delivery to each stakeholder.

**Schedule Feasibility:**
Phased development approach:
• Phase 1 (Weeks 1–4): Core planner and dashboard
• Phase 2 (Weeks 5–8): AI risk and cost prediction
• Phase 3 (Weeks 9–12): Real-time tracking and chat assistant
• Phase 4 (Weeks 13–16): Testing, optimization, and deployment`
  },
  {
    icon: Globe,
    title: "Viability & Impact",
    content: `**Market Viability:**
Global construction management software market is projected to reach $19.4 billion by 2028. Target segments include commercial construction, infrastructure projects, and smart city initiatives. The platform is scalable and supports sustainability-focused construction practices.

**Economic Impact:**
Reduces cost overruns by 15–25% through AI-driven budget forecasting and optimization. Minimizes idle resources and rework costs.

**Operational Impact:**
Improves planning accuracy by integrating CPM with ML-based predictions. Enables proactive risk management rather than reactive firefighting.

**Social Impact:**
Faster infrastructure delivery benefits communities. Improved worker scheduling reduces safety risks and labor exploitation.

**Environmental Impact:**
Optimized resource allocation reduces material waste. Better scheduling minimizes equipment idle time and associated emissions.

**Technological Impact:**
Demonstrates practical AI adoption in traditional industries. Sets precedent for data-driven construction management.`
  },
  {
    icon: BookMarked,
    title: "References",
    content: `1. Kerzner, H. (2022). *Project Management: A Systems Approach to Planning, Scheduling, and Controlling*. 13th Edition. Wiley.

2. Project Management Institute. (2021). *A Guide to the Project Management Body of Knowledge (PMBOK Guide)*. 7th Edition.

3. Pan, Y., & Zhang, L. (2021). "Roles of Artificial Intelligence in Construction Engineering and Management." *IEEE Access*, 9, 49820–49834.

4. Gondia, A., et al. (2020). "Machine Learning Algorithms for Construction Projects Delay Risk Prediction." *Journal of Construction Engineering and Management*, 146(1).

5. Scikit-learn Documentation. https://scikit-learn.org/stable/documentation.html

6. React.js Documentation. https://react.dev

7. FastAPI Documentation. https://fastapi.tiangolo.com

8. World Bank. (2022). *Infrastructure Finance in Developing Countries*. World Bank Group Report.

9. McKinsey Global Institute. (2017). *Reinventing Construction: A Route to Higher Productivity*. McKinsey & Company.

10. Bilal, M., et al. (2019). "Big Data with Deep Learning for Benchmarking Profitability in Construction." *Automation in Construction*, 106.`
  },
];

export default function Documentation() {
  return (
    <div className="space-y-6 max-w-[900px]">
      <AnimatedSection>
        <h1 className="page-header flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Project Documentation
        </h1>
        <p className="page-subheader">BuildWise AI — Construction Planning & Risk Analyzer — Academic & Technical Overview</p>
      </AnimatedSection>

      {sections.map((section, i) => (
        <AnimatedSection key={section.title} delay={0.05 * (i + 1)}>
          <div className="section-card p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <section.icon className="w-5 h-5 text-accent" />
              {section.title}
            </h2>
            <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed">
              {section.content.split("\n").map((line, j) => {
                if (line.trim() === "") return <br key={j} />;
                // Bold handling
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <p key={j} className="mb-1.5">
                    {parts.map((part, k) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={k} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
                      }
                      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
                        return <em key={k}>{part.slice(1, -1)}</em>;
                      }
                      return <span key={k}>{part}</span>;
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}
