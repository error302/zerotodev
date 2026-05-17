"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronRight,
  Code2,
  BookOpen,
  CheckCircle2,
  Zap,
} from "lucide-react"

const iconMap: Record<string, any> = {
  Code2,
  BookOpen,
  CheckCircle2,
  Zap,
}

interface Exercise {
  id: string
  title: string
  slug: string
  description: string
  language: string
  order: number
  xpReward: number
  completed: boolean
}

interface Lesson {
  id: string
  title: string
  slug: string
  description: string
  contentMdx: string
  order: number
  xpReward: number
  category: string
  exercises: Exercise[]
}

interface TrackData {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  color: string
  difficulty: string
  lessons: Lesson[]
  progress: { completed: boolean; exercisesCompleted: number; totalExercises: number } | null
}

interface TrackDetailProps {
  slug: string
  onNavigate: (view: string) => void
  onBack: () => void
  onOpenLesson?: (lessonSlug: string) => void
}

export function TrackDetail({ slug, onNavigate, onBack, onOpenLesson }: TrackDetailProps) {
  const [track, setTrack] = useState<TrackData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/tracks/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setTrack(data.track)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#1a1a24] rounded w-64" />
          <div className="h-4 bg-[#1a1a24] rounded w-96" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-[#1a1a24] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 text-center">
        <h2 className="text-xl text-white">Track not found</h2>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Paths
        </Button>
      </div>
    )
  }

  const Icon = iconMap[track.icon] || Code2
  const totalExercises = track.lessons.reduce((sum, l) => sum + l.exercises.length, 0)
  const completedExercises = track.lessons.reduce(
    (sum, l) => sum + l.exercises.filter((e) => e.completed).length,
    0
  )
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0

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
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${track.color}20` }}
          >
            <Icon size={24} style={{ color: track.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{track.name}</h1>
            <p className="text-muted-foreground">{track.description}</p>
          </div>
        </div>
      </div>

      <Card className="bg-[#111118] border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-lg font-bold text-white">
                {completedExercises}/{totalExercises} exercises
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                track.difficulty === "beginner"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : track.difficulty === "intermediate"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }
            >
              {track.difficulty}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {track.progress?.completed && (
            <p className="text-green-400 text-sm flex items-center gap-1">
              <CheckCircle2 size={14} /> Track Complete!
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Lessons</h2>
        {track.lessons.map((lesson) => {
          const lessonCompleted = lesson.exercises.every((e) => e.completed) && lesson.exercises.length > 0
          const lessonExerciseCount = lesson.exercises.length
          const lessonCompletedCount = lesson.exercises.filter((e) => e.completed).length

          return (
            <Card
              key={lesson.id}
              className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer"
              onClick={() => onOpenLesson?.(lesson.slug)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${track.color}20` }}
                >
                  {lessonCompleted ? (
                    <CheckCircle2 size={18} className="text-green-400" />
                  ) : (
                    <BookOpen size={18} style={{ color: track.color }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Lesson {lesson.order}
                    </span>
                    <h3 className="font-semibold text-white">{lesson.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lesson.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {lessonCompletedCount}/{lessonExerciseCount}
                    </p>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <Zap size={10} /> {lesson.xpReward} XP
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
