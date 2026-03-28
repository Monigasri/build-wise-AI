import { useState, useRef } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/store/projectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, MapPin, Calendar, Trash2, ArrowRight, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parseProjectCsv, generateSampleCsv } from "@/lib/csvParser";
import { toast } from "sonner";

export default function Projects() {
  const projects = useProjectStore((s) => s.projects);
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const addProject = useProjectStore((s) => s.addProject);
  const removeProject = useProjectStore((s) => s.removeProject);
  const switchProject = useProjectStore((s) => s.switchProject);
  const importCsvTasks = useProjectStore((s) => s.importCsvTasks);
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", startDate: "", budget: 500000 });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const startDate = form.startDate || new Date().toISOString().slice(0, 10);
    addProject(form.name.trim(), form.location || "N/A", startDate, form.budget);

    // If CSV was attached, import after project creation
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const result = parseProjectCsv(text, startDate);
        if (result.tasks.length > 0) {
          importCsvTasks(result.tasks, result.totalBudget);
          if (result.errors.length > 0) toast.warning(`Imported with ${result.errors.length} warning(s)`);
        } else {
          toast.error("CSV import failed — add tasks manually in the Planner");
        }
      };
      reader.readAsText(csvFile);
    }

    setShowNew(false);
    setForm({ name: "", location: "", startDate: "", budget: 500000 });
    setCsvFile(null);
  };

  const downloadSample = () => {
    const blob = new Blob([generateSampleCsv()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sample_project.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelect = (p: Project) => {
    switchProject(p.id);
    navigate("/");
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <AnimatedSection>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">Construction Projects</h1>
            <p className="page-subheader">Manage all your construction plans independently</p>
          </div>
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button className="gap-1"><Plus className="w-4 h-4" /> New Construction Plan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Project Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Highway Expansion Phase III" /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Delhi, India" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div><Label>Budget ($)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: +e.target.value })} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Project CSV (Optional)</Label>
                  <div className="flex gap-2">
                    <input ref={fileRef} type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} className="hidden" />
                    <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => fileRef.current?.click()}>
                      <Upload className="w-3 h-3" /> {csvFile ? csvFile.name : "Upload CSV"}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1" onClick={downloadSample}>
                      <Download className="w-3 h-3" /> Sample
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">CSV with: Task Name, Start Date, End Date, Duration, Dependencies, Resource Count, Estimated Cost</p>
                </div>
                <Button onClick={handleCreate} className="w-full">Create Project</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p, i) => {
          const tasks = p.tasks;
          const progress = tasks.length > 0 ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0;
          const riskScore = p.riskBreakdown.overallScore;
          const isActive = p.id === currentProjectId;

          return (
            <AnimatedSection key={p.id} delay={0.05 * i}>
              <div className={`section-card p-5 flex flex-col gap-4 ${isActive ? "ring-2 ring-primary" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold truncate">{p.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {p.location}</div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground"><Calendar className="w-3 h-3" /> {p.startDate}</div>
                  </div>
                  {isActive && <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">Active</span>}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold tabular-nums">{progress}%</p><p className="text-[10px] text-muted-foreground uppercase">Progress</p></div>
                  <div><p className={`text-lg font-bold tabular-nums ${riskScore > 60 ? "text-destructive" : riskScore > 35 ? "text-accent" : "text-success"}`}>{riskScore}</p><p className="text-[10px] text-muted-foreground uppercase">Risk</p></div>
                  <div><p className="text-lg font-bold tabular-nums">{tasks.length}</p><p className="text-[10px] text-muted-foreground uppercase">Tasks</p></div>
                </div>

                <Progress value={progress} className="h-1.5" />

                <div className="flex gap-2">
                  <Button variant={isActive ? "default" : "outline"} size="sm" className="flex-1 gap-1" onClick={() => handleSelect(p)}>
                    <ArrowRight className="w-3 h-3" /> {isActive ? "Active" : "Select"}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeProject(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          );
        })}
      </div>
    </div>
  );
}
