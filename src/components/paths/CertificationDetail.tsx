"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Code2,
  Clock,
  BookOpen,
  Upload,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Project {
  id: string
  title: string
  description: string
  requirements: string[]
  starterCode: string | null
  language: string
  order: number
  completed: boolean
}

interface CertificationData {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  requiredProjects: number
  estimatedHours: number
  projects: Project[]
  userCert: { completedAt: string; projects: string[] } | null
}

interface CertificationDetailProps {
  slug: string
  onNavigate: (view: string) => void
  onBack: () => void
}

export function CertificationDetail({ slug, onNavigate, onBack }: CertificationDetailProps) {
  const [cert, setCert] = useState<CertificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [submissionDescription, setSubmissionDescription] = useState("")
  const [submissionUrl, setSubmissionUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/certifications/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCert(data.certification)
        setLoading(false)
      })
  }, [slug])

  const handleSubmitProject = async () => {
    if (!selectedProject || !cert) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/certifications/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          submission: {
            description: submissionDescription,
            url: submissionUrl,
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      } else {
        toast({
          title: "Project Submitted",
          description: data.isComplete
            ? "All projects complete! You can claim your certification."
            : `${data.completedCount}/${data.requiredCount} projects complete.`,
        })
        setSubmitDialogOpen(false)
        setSubmissionDescription("")
        setSubmissionUrl("")
        fetch(`/api/certifications/${slug}`)
          .then((r) => r.json())
          .then((d) => setCert(d.certification))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit project",
        variant: "destructive",
      })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#1a1a24] rounded w-64" />
          <div className="h-4 bg-[#1a1a24] rounded w-96" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#1a1a24] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!cert) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 text-center">
        <h2 className="text-xl text-white">Certification not found</h2>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Paths
        </Button>
      </div>
    )
  }

  const completedCount = cert.userCert ? cert.userCert.projects.length : 0
  const progressPercent = Math.round((completedCount / cert.requiredProjects) * 100)
  const isComplete = completedCount >= cert.requiredProjects

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Award size={24} className={isComplete ? "text-amber-400" : "text-muted-foreground"} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{cert.title}</h1>
            <p className="text-muted-foreground">{cert.description}</p>
          </div>
        </div>
      </div>

      <Card className="bg-[#111118] border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-lg font-bold text-white">
                {completedCount}/{cert.requiredProjects} projects
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen size={14} /> {cert.requiredProjects} projects
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> ~{cert.estimatedHours}h
              </span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {isComplete && (
            <div className="flex items-center justify-between">
              <p className="text-amber-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> All projects complete!
              </p>
              <Button
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600"
              >
                <Award size={16} className="mr-2" /> Claim Certification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Required Projects</h2>
        {cert.projects.map((project) => (
          <Card
            key={project.id}
            className={`bg-[#111118] border-border/50 transition-colors ${
              project.completed
                ? "border-l-2 border-l-green-500"
                : "hover:border-emerald-500/30"
            }`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#1a1a24]">
                    {project.completed ? (
                      <CheckCircle2 size={18} className="text-green-400" />
                    ) : (
                      <Code2 size={18} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Project {project.order}
                      </span>
                      <h3 className="font-semibold text-white">{project.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                </div>
                {project.completed ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                    Complete
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProject(project)
                      setSubmitDialogOpen(true)
                    }}
                  >
                    <Upload size={14} className="mr-1" /> Submit
                  </Button>
                )}
              </div>

              <div className="pl-11">
                <p className="text-xs text-muted-foreground mb-2">Requirements:</p>
                <ul className="space-y-1">
                  {project.requirements.map((req, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pl-11 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {project.language}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="bg-[#111118] border-border/50">
          <DialogHeader>
            <DialogTitle>Submit Project: {selectedProject?.title}</DialogTitle>
            <DialogDescription>
              Provide a description of your solution and a link to your code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Solution Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your approach, key decisions, and any challenges..."
                value={submissionDescription}
                onChange={(e) => setSubmissionDescription(e.target.value)}
                className="bg-[#1a1a24] border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Repository URL</Label>
              <Input
                id="url"
                placeholder="https://github.com/yourusername/project"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                className="bg-[#1a1a24] border-border/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitProject}
              disabled={submitting || !submissionDescription || !submissionUrl}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500"
            >
              {submitting ? "Submitting..." : "Submit Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
