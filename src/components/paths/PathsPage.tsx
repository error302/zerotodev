"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronRight,
  Code2,
  Globe,
  Shield,
  Terminal,
  Server,
  Lock,
  Zap,
  Coffee,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react"

const iconMap: Record<string, any> = {
  Code2,
  Globe,
  Shield,
  Terminal,
  Server,
  Lock,
  Zap,
  Coffee,
  BookOpen,
  Award,
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-400 border-red-500/30",
}

interface Track {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  color: string
  difficulty: string
  lessonCount: number
  progress: { completed: boolean; exercisesCompleted: number; totalExercises: number } | null
}

interface Certification {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  requiredProjects: number
  estimatedHours: number
  projectCount: number
  userCert: { completedAt: string; projects: string[] } | null
}

interface PathsPageProps {
  onNavigate: (view: string) => void
  onSelectTrack?: (slug: string) => void
  onSelectCertification?: (slug: string) => void
}

export function PathsPage({ onNavigate, onSelectTrack, onSelectCertification }: PathsPageProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/tracks").then((r) => r.json()),
      fetch("/api/certifications").then((r) => r.json()),
    ]).then(([tracksData, certsData]) => {
      setTracks(tracksData.tracks || [])
      setCertifications(certsData.certifications || [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#1a1a24] rounded w-48" />
          <div className="h-4 bg-[#1a1a24] rounded w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-[#1a1a24] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("dashboard")}
          className="text-muted-foreground"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Paths</h1>
          <p className="text-muted-foreground">Choose your path to mastery</p>
        </div>
      </div>

      <Tabs defaultValue="tracks" className="space-y-6">
        <TabsList className="bg-[#111118] border-border/50">
          <TabsTrigger value="tracks" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            Language Tracks
          </TabsTrigger>
          <TabsTrigger value="certifications" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Certifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => {
              const Icon = iconMap[track.icon] || Code2
              const progressPercent = track.progress
                ? track.progress.totalExercises > 0
                  ? Math.round((track.progress.exercisesCompleted / track.progress.totalExercises) * 100)
                  : 0
                : 0

              return (
                <Card
                  key={track.id}
                  className="bg-[#111118] border-border/50 hover:border-l-2 cursor-pointer transition-all"
                  style={{
                    borderLeftColor: track.progress ? track.color : undefined,
                    borderLeftWidth: track.progress ? "2px" : undefined,
                  }}
                  onClick={() => onSelectTrack?.(track.slug)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${track.color}20` }}
                        >
                          <Icon size={20} style={{ color: track.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{track.name}</h3>
                          <Badge
                            variant="outline"
                            className={difficultyColors[track.difficulty]}
                          >
                            {track.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {track.description}
                    </p>

                    {track.progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-white font-medium">
                            {progressPercent}%
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{track.lessonCount} lessons</span>
                      {track.progress?.completed && (
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Complete
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert) => {
              const Icon = iconMap[cert.icon] || Award
              const isComplete = cert.userCert && cert.userCert.projects.length >= cert.requiredProjects
              const progressPercent = cert.userCert
                ? Math.round((cert.userCert.projects.length / cert.requiredProjects) * 100)
                : 0

              return (
                <Card
                  key={cert.id}
                  className={`bg-[#111118] border-border/50 hover:border-l-2 cursor-pointer transition-all ${
                    isComplete ? "border-l-amber-500" : ""
                  }`}
                  onClick={() => onSelectCertification?.(cert.slug)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Icon size={20} className={isComplete ? "text-amber-400" : "text-muted-foreground"} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{cert.title}</h3>
                          {isComplete ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                              <CheckCircle2 size={12} className="mr-1" /> Earned
                            </Badge>
                          ) : cert.userCert ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                              In Progress
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
                              Not Started
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {cert.description}
                    </p>

                    {cert.userCert && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Projects</span>
                          <span className="text-white font-medium">
                            {cert.userCert.projects.length}/{cert.requiredProjects}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} /> {cert.requiredProjects} projects
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> ~{cert.estimatedHours}h
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
