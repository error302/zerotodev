'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import dynamic from 'next/dynamic'
import {
  Code2, Shield, Trophy, Terminal, BookOpen, Lock,
  ChevronRight, Flame, Zap, Star, Eye, EyeOff,
  CheckCircle2, XCircle, Play, Loader2, LogOut,
  Github, ArrowRight, ChevronDown, Hash,
  Brain, Server, Lock as LockIcon, Bug, Search,
  Award, TrendingUp, Target, Users, Clock,
  AlertTriangle, Sparkles, Menu, X, Home as HomeIcon, Flag, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { SkillRadar } from '@/components/skill-radar'
import LessonRenderer from '@/components/mdx/LessonRenderer'
import PortfolioPage from '@/components/portfolio/PortfolioPage'
import AssessmentPage from '@/components/assessment/AssessmentPage'
import InterviewPage from '@/components/interview/InterviewPage'
import ExploitEditor from '@/components/exploit/ExploitEditor'

// Lazy load Monaco editor (heavy)
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-muted-foreground">
      <Loader2 className="animate-spin mr-2" size={20} /> Loading editor...
    </div>
  )
})

// ============================================================
// TYPES
// ============================================================

interface Phase {
  id: string
  number: number
  title: string
  description: string
  icon: string
  lessons: Lesson[]
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
  progress?: UserProgress | null
}

interface Exercise {
  id: string
  title: string
  slug: string
  description: string
  starterCode: string
  language: string
  order: number
  xpReward: number
  hints: Hint[]
  testCases: TestCase[]
}

interface Hint {
  id: string
  level: number
  content: string
  xpCost: number
}

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
  order: number
}

interface UserProgress {
  id: string
  completed: boolean
  completedAt: string | null
  hintsUsed: number
}

interface HackingLab {
  id: string
  title: string
  slug: string
  description: string
  phase: number
  difficulty: string
  category: string
  xpReward: number
  hintContent: string | null
  setupMdx: string
  toolsHint: string
  briefingMdx: string
  author: string
  order: number
  session?: LabSession | null
}

interface LabSession {
  id: string
  solved: boolean
  attempts: number
  startedAt: string
}

interface LeaderboardUser {
  id: string
  username: string
  xpTotal: number
  currentPhase: number
  streak: number
  completedLessons: number
}

interface ProgressData {
  completedLessons: number
  totalLessons: number
  completedExercises: number
  totalExercises: number
  solvedLabs: number
  totalLabs: number
  xpBreakdown: { signup: number; lessons: number; exercises: number; labs: number; achievements: number }
  phaseProgress: { phase: number; completed: number; total: number }[]
  streak: number
  achievements: { slug: string; title: string; icon: string; unlockedAt: string }[]
}

type View = 'auth' | 'dashboard' | 'lessons' | 'lesson-detail' | 'labs' | 'lab-detail' | 'leaderboard' | 'profile' | 'portfolio' | 'assessment' | 'interview' | 'exploit'

// ============================================================
// ICON MAP
// ============================================================

const iconMap: Record<string, React.ElementType> = {
  Code2, GitBranch: ChevronRight, Server, Shield, Lock: LockIcon, Trophy,
  Brain, Bug, Search, Terminal, Star, Zap, Flame,
}

function getPhaseIcon(iconName: string) {
  return iconMap[iconName] || Code2
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  expert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const categoryIcons: Record<string, React.ElementType> = {
  web: Globe,
  crypto: Lock,
  forensics: Search,
  reversing: Brain,
  pwn: Terminal,
}

// ============================================================
// MAIN APP
// ============================================================

export default function ZeroToDevApp() {
  const { data: session, status } = useSession()
  const [view, setView] = useState<View>('auth')
  const [phases, setPhases] = useState<Phase[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentLab, setCurrentLab] = useState<HackingLab | null>(null)
  const [allLabs, setAllLabs] = useState<HackingLab[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [userXP, setUserXP] = useState(100)
  const [userPhase, setUserPhase] = useState(1)
  const [userStreak, setUserStreak] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // New feature state
  const [currentAssessmentSlug, setCurrentAssessmentSlug] = useState<string>('')
  const [exploitExercise, setExploitExercise] = useState<{ id: string; title: string; description: string; language: string; starterCode: string } | null>(null)
  const [assessments, setAssessments] = useState<Array<{ id: string; title: string; slug: string; description: string; phaseNumber: number; timeLimit: number; passScore: number; problemCount: number; attempt: { score: number | null; passed: boolean | null } | null }>>([])

  // Editor state
  const [editorCode, setEditorCode] = useState('')
  const [consoleOutput, setConsoleOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0)
  const [unlockedHints, setUnlockedHints] = useState<number[]>([])
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; actual: string; isHidden: boolean }[] | null>(null)

  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Lab submission
  const [flagInput, setFlagInput] = useState('')
  const [flagSubmitting, setFlagSubmitting] = useState(false)

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const fetchPhasesWithLessons = useCallback(async () => {
    try {
      const res = await fetch('/api/lessons')
      if (!res.ok) return
      const data = await res.json()
      setPhases(data.phases || [])
    } catch (err) {
      console.error('Failed to fetch phases:', err)
    }
  }, [])

  const fetchLessonDetail = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/lessons/${slug}`)
      if (!res.ok) return
      const data = await res.json()
      setCurrentLesson(data.lesson)
      if (data.lesson.exercises?.[0]) {
        setEditorCode(data.lesson.exercises[0].starterCode)
        setActiveExerciseIdx(0)
        setUnlockedHints([])
        setTestResults(null)
      }
      setView('lesson-detail')
    } catch (err) {
      console.error('Failed to fetch lesson:', err)
    }
  }, [])

  const fetchLabs = useCallback(async () => {
    try {
      const res = await fetch('/api/labs')
      if (!res.ok) return
      const data = await res.json()
      setAllLabs(data.labs || [])
    } catch (err) {
      console.error('Failed to fetch labs:', err)
    }
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard')
      if (!res.ok) return
      const data = await res.json()
      setLeaderboard(data.users || [])
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    }
  }, [])

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/progress')
      if (!res.ok) return
      const data = await res.json()
      const stats = data.stats || {}
      const xp = data.xpBreakdown || {}
      setProgressData({
        completedLessons: stats.completedLessons || 0,
        totalLessons: stats.totalLessons || 0,
        completedExercises: stats.completedExercises || 0,
        totalExercises: stats.totalExercises || 0,
        solvedLabs: stats.solvedLabs || 0,
        totalLabs: stats.totalLabs || 0,
        xpBreakdown: { signup: xp.signup || 100, lessons: xp.lessons || 0, exercises: xp.exercises || 0, labs: xp.labs || 0, achievements: xp.achievements || 0 },
        phaseProgress: (data.phaseProgress || []).map((pp: any) => ({ phase: pp.number, completed: pp.completedLessons, total: pp.totalLessons })),
        streak: data.user?.streak || 0,
        achievements: (data.achievements || []).map((a: any) => ({ slug: a.slug, title: a.title, icon: a.icon, unlockedAt: a.unlockedAt })),
      })
      setUserXP(data.user?.xpTotal || 100)
      setUserPhase(data.user?.currentPhase || 1)
      setUserStreak(data.user?.streak || 0)
    } catch (err) {
      console.error('Failed to fetch progress:', err)
    }
  }, [])

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await fetch('/api/assessments')
      if (!res.ok) return
      const data = await res.json()
      setAssessments(data.assessments || [])
    } catch (err) {
      console.error('Failed to fetch assessments:', err)
    }
  }, [])

  // Load data when session changes
  useEffect(() => {
    if (session) {
      fetchPhasesWithLessons()
      fetchProgress()
      fetchAssessments()
      setView('dashboard')
    } else {
      setView('auth')
    }
  }, [session, fetchPhasesWithLessons, fetchProgress, fetchAssessments])

  // ============================================================
  // AUTH HANDLERS
  // ============================================================

  const handleAuth = async () => {
    setAuthLoading(true)
    try {
      if (authMode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, username: authUsername, password: authPassword })
        })
        const data = await res.json()
        if (!res.ok) {
          toast({ title: 'Registration Failed', description: data.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Account Created!', description: 'You can now log in.' })
        setAuthMode('login')
        setAuthPassword('')
      } else {
        const result = await signIn('credentials', {
          email: authEmail,
          password: authPassword,
          redirect: false,
        })
        if (result?.error) {
          toast({ title: 'Login Failed', description: 'Invalid email or password', variant: 'destructive' })
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setAuthLoading(false)
    }
  }

  // ============================================================
  // CODE EXECUTION
  // ============================================================

  const handleRunCode = async () => {
    if (!currentLesson || !currentLesson.exercises[activeExerciseIdx]) return
    setIsRunning(true)
    setConsoleOutput('Running...')
    setTestResults(null)

    try {
      const exercise = currentLesson.exercises[activeExerciseIdx]
      const res = await fetch(`/api/exercises/${exercise.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorCode, exerciseId: exercise.id })
      })
      const data = await res.json()

      if (data.passed) {
        setConsoleOutput(`✅ All test cases passed! +${data.xpEarned} XP`)
        setUserXP(prev => prev + (data.xpEarned || 0))
        toast({ title: 'Exercise Complete!', description: `You earned ${data.xpEarned} XP` })
        // Refresh lesson data
        if (currentLesson.slug) fetchLessonDetail(currentLesson.slug)
        fetchProgress()
      } else {
        const failedCount = data.results?.filter((r: any) => !r.passed).length || 0
        setConsoleOutput(`❌ ${failedCount} test case(s) failed. Keep trying!`)
      }

      if (data.results) {
        setTestResults(data.results.map((r: any) => ({
          passed: r.passed,
          input: r.input || '',
          expected: r.expectedOutput || '',
          actual: r.actualOutput || '',
          isHidden: r.isHidden || false
        })))
      }
    } catch (err) {
      setConsoleOutput('Error: Could not connect to execution server.')
    } finally {
      setIsRunning(false)
    }
  }

  // ============================================================
  // HINT SYSTEM
  // ============================================================

  const handleUnlockHint = (level: number, xpCost: number) => {
    if (unlockedHints.includes(level)) return
    if (userXP < xpCost) {
      toast({ title: 'Not enough XP', description: `You need ${xpCost} XP to unlock this hint`, variant: 'destructive' })
      return
    }
    setUnlockedHints(prev => [...prev, level])
    setUserXP(prev => prev - xpCost)
    toast({ title: `Hint ${level} Unlocked`, description: `-${xpCost} XP` })
  }

  // ============================================================
  // FLAG SUBMISSION
  // ============================================================

  const handleFlagSubmit = async () => {
    if (!currentLab || !flagInput.trim()) return
    setFlagSubmitting(true)
    try {
      const res = await fetch(`/api/labs/${currentLab.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedFlag: flagInput.trim() })
      })
      const data = await res.json()

      if (data.success || data.alreadySolved) {
        toast({ title: '🎉 Flag Correct!', description: data.alreadySolved ? 'Already solved!' : `+${data.xpEarned} XP` })
        setUserXP(prev => prev + (data.xpEarned || 0))
        setFlagInput('')
        fetchLabs()
        fetchProgress()
        setCurrentLab(prev => prev ? { ...prev, session: { id: '', solved: true, attempts: (prev.session?.attempts || 0) + 1, startedAt: '' } } : null)
      } else {
        toast({ title: 'Incorrect Flag', description: 'Try again!', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Could not submit flag', variant: 'destructive' })
    } finally {
      setFlagSubmitting(false)
    }
  }

  // ============================================================
  // NAV HELPER
  // ============================================================

  const navigateTo = (newView: View) => {
    setView(newView)
    setMobileMenuOpen(false)
    if (newView === 'leaderboard') fetchLeaderboard()
    if (newView === 'labs') fetchLabs()
    if (newView === 'dashboard') fetchProgress()
  }

  // ============================================================
  // AUTH SCREEN
  // ============================================================

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Terminal className="text-white" size={32} />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 opacity-30 blur-lg" />
          </div>
          <Loader2 className="animate-spin text-emerald-400" size={24} />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4 relative">
              <Terminal className="text-white" size={32} />
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 opacity-30 blur-lg" />
            </div>
            <h1 className="text-3xl font-bold text-white">Zero to Dev</h1>
            <p className="text-muted-foreground mt-2">Master CS & Cybersecurity through building</p>
          </div>

          <Card className="bg-[#111118] border-border/50">
            <CardHeader>
              <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2 bg-[#1a1a24]">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="bg-[#1a1a24] border-border/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
              </div>

              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Username</label>
                  <Input
                    placeholder="hacker123"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="bg-[#1a1a24] border-border/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="bg-[#1a1a24] border-border/50 pr-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAuth}
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
              >
                {authLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>

              {authMode === 'login' && (
                <div className="text-center text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-[#1a1a24]">
                  <p className="font-medium text-emerald-400 mb-1">Demo Account</p>
                  <p>Email: moe@zerotodev.dev</p>
                  <p>Password: password123</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ============================================================
  // MAIN APPLICATION
  // ============================================================

  const currentExercise = currentLesson?.exercises?.[activeExerciseIdx]
  const userName = session.user?.username || session.user?.name || 'Hacker'

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigateTo('dashboard')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Terminal className="text-white" size={16} />
              </div>
              <span className="font-bold text-white hidden sm:block">Zero to Dev</span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
                { key: 'lessons', label: 'Lessons', icon: BookOpen },
                { key: 'labs', label: 'Hacking Labs', icon: Shield },
                { key: 'interview', label: 'Interview', icon: Brain },
                { key: 'portfolio', label: 'Portfolio', icon: Award },
                { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => navigateTo(key as View)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    view === key ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* XP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
              <Zap size={14} /> {userXP} XP
            </div>

            {/* Streak */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">
              <Flame size={14} /> {userStreak}
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-xs">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button onClick={() => signOut()} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile menu */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-muted-foreground">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 p-2">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
              { key: 'lessons', label: 'Lessons', icon: BookOpen },
              { key: 'labs', label: 'Hacking Labs', icon: Shield },
              { key: 'interview', label: 'Interview', icon: Brain },
              { key: 'portfolio', label: 'Portfolio', icon: Award },
              { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => navigateTo(key as View)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                  view === key ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* ============================================================ */}
        {/* DASHBOARD */}
        {/* ============================================================ */}
        {view === 'dashboard' && (
          <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {userName} 👋</h1>
                <p className="text-muted-foreground mt-1">Continue your journey from zero to developer</p>
              </div>
              <Button onClick={() => navigateTo('lessons')} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                Continue Learning <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total XP', value: userXP, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Current Phase', value: userPhase, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: 'Streak', value: `${userStreak} days`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: 'Labs Solved', value: progressData?.solvedLabs || 0, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className="bg-[#111118] border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${bg}`}>
                        <Icon size={18} className={color} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-xl font-bold text-white">{value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Phase Progress */}
            <Card className="bg-[#111118] border-border/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" /> Phase Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {phases.map((phase) => {
                  const completedCount = phase.lessons?.filter(l => l.progress?.completed).length || 0
                  const total = phase.lessons?.length || 0
                  const pct = total > 0 ? (completedCount / total) * 100 : 0
                  const Icon = getPhaseIcon(phase.icon)
                  const isActive = phase.number === userPhase
                  const isLocked = phase.number > userPhase

                  return (
                    <div
                      key={phase.id}
                      onClick={() => !isLocked && navigateTo('lessons')}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer ${
                        isActive ? 'bg-emerald-500/10 border border-emerald-500/20' :
                        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                        <Icon size={20} className={isActive ? 'text-emerald-400' : 'text-muted-foreground'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">Phase {phase.number}: {phase.title}</span>
                          {isLocked && <Lock size={12} className="text-muted-foreground" />}
                          {pct === 100 && <CheckCircle2 size={14} className="text-emerald-400" />}
                        </div>
                        <Progress value={pct} className="h-1.5 mt-1.5" />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{completedCount}/{total}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Skill Radar */}
            {progressData && progressData.phaseProgress.length > 0 && (
              <Card className="bg-[#111118] border-border/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target size={18} className="text-cyan-400" /> Skill Radar
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Your mastery across all CS & Cybersecurity domains</CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillRadar phaseProgress={progressData.phaseProgress} />
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => navigateTo('lessons')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10"><BookOpen size={24} className="text-emerald-400" /></div>
                  <div><h3 className="font-semibold text-white">Continue Lessons</h3><p className="text-sm text-muted-foreground">Pick up where you left off</p></div>
                  <ChevronRight size={20} className="text-muted-foreground ml-auto" />
                </CardContent>
              </Card>

              <Card className="bg-[#111118] border-border/50 hover:border-cyan-500/30 transition-colors cursor-pointer" onClick={() => navigateTo('labs')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10"><Shield size={24} className="text-cyan-400" /></div>
                  <div><h3 className="font-semibold text-white">Hacking Labs</h3><p className="text-sm text-muted-foreground">Test your cybersecurity skills</p></div>
                  <ChevronRight size={20} className="text-muted-foreground ml-auto" />
                </CardContent>
              </Card>

              <Card className="bg-[#111118] border-border/50 hover:border-purple-500/30 transition-colors cursor-pointer" onClick={() => navigateTo('interview')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10"><Brain size={24} className="text-purple-400" /></div>
                  <div><h3 className="font-semibold text-white">Interview Prep</h3><p className="text-sm text-muted-foreground">LeetCode-style problems</p></div>
                  <ChevronRight size={20} className="text-muted-foreground ml-auto" />
                </CardContent>
              </Card>

              <Card className="bg-[#111118] border-border/50 hover:border-yellow-500/30 transition-colors cursor-pointer" onClick={() => navigateTo('portfolio')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10"><Award size={24} className="text-yellow-400" /></div>
                  <div><h3 className="font-semibold text-white">Portfolio</h3><p className="text-sm text-muted-foreground">Your achievements</p></div>
                  <ChevronRight size={20} className="text-muted-foreground ml-auto" />
                </CardContent>
              </Card>
            </div>

            {/* Assessments */}
            {assessments.length > 0 && (
              <Card className="bg-[#111118] border-border/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><Target size={18} className="text-red-400" /> Readiness Assessments</CardTitle>
                  <CardDescription className="text-muted-foreground">Timed challenges to prove you are ready for the next phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14] border border-border/30">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm">Phase {a.phaseNumber}: {a.title}</span>
                            {a.attempt?.passed && <CheckCircle2 size={14} className="text-emerald-400" />}
                            {a.attempt && !a.attempt.passed && <XCircle size={14} className="text-red-400" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">{a.problemCount} problems</p>
                            <p className="text-xs text-muted-foreground">{a.timeLimit} min · {a.passScore}% pass</p>
                          </div>
                          {a.attempt?.passed ? (
                            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">Passed ({a.attempt.score}%)</Badge>
                          ) : a.attempt ? (
                            <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">Failed ({a.attempt.score}%)</Badge>
                          ) : (
                            <Button size="sm" onClick={() => { setCurrentAssessmentSlug(a.slug); setView('assessment') }} className="bg-red-500 hover:bg-red-600 text-white text-xs">
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {progressData?.achievements && progressData.achievements.length > 0 && (
              <Card className="bg-[#111118] border-border/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award size={18} className="text-yellow-400" /> Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {progressData.achievements.map((a) => (
                      <Badge key={a.slug} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 py-1.5 px-3">
                        <Star size={12} className="mr-1.5" /> {a.title}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* LESSONS LIST */}
        {/* ============================================================ */}
        {view === 'lessons' && (
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Lessons</h1>
                <p className="text-muted-foreground text-sm mt-1">Master CS & Cybersecurity step by step</p>
              </div>
              <Button variant="ghost" onClick={() => navigateTo('dashboard')} className="text-muted-foreground">
                <HomeIcon size={16} className="mr-1" /> Dashboard
              </Button>
            </div>

            {phases.map((phase) => {
              const isLocked = phase.number > userPhase
              const Icon = getPhaseIcon(phase.icon)

              return (
                <div key={phase.id} className={isLocked ? 'opacity-50 pointer-events-none' : ''}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${isLocked ? 'bg-white/5' : 'bg-emerald-500/20'}`}>
                      <Icon size={20} className={isLocked ? 'text-muted-foreground' : 'text-emerald-400'} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        Phase {phase.number}: {phase.title}
                        {isLocked && <Lock size={14} className="text-muted-foreground" />}
                      </h2>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 ml-2">
                    {phase.lessons?.map((lesson) => (
                      <Card
                        key={lesson.id}
                        onClick={() => fetchLessonDetail(lesson.slug)}
                        className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer"
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            lesson.progress?.completed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 text-muted-foreground'
                          }`}>
                            {lesson.progress?.completed ? <CheckCircle2 size={16} /> : lesson.order}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm truncate">{lesson.title}</h3>
                            <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${
                              lesson.category === 'cyber' ? 'border-purple-500/30 text-purple-400' : 'border-emerald-500/30 text-emerald-400'
                            }`}>
                              {lesson.category === 'cyber' ? <Shield size={10} className="mr-1" /> : <Code2 size={10} className="mr-1" />}
                              {lesson.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                              <Zap size={10} className="mr-1" /> {lesson.xpReward}
                            </Badge>
                          </div>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Separator className="my-4 bg-border/30" />
                </div>
              )
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* LESSON DETAIL (SPLIT PANE) */}
        {/* ============================================================ */}
        {view === 'lesson-detail' && currentLesson && (
          <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
            {/* LEFT: Lesson Content */}
            <div className="w-full lg:w-1/2 border-r border-border/50 flex flex-col">
              {/* Lesson header */}
              <div className="p-4 border-b border-border/50 bg-[#111118]">
                <button onClick={() => navigateTo('lessons')} className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1">
                  ← Back to Lessons
                </button>
                <h2 className="text-lg font-bold text-white">{currentLesson.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{currentLesson.description}</p>
              </div>

              {/* Exercise tabs */}
              {currentLesson.exercises.length > 0 && (
                <div className="flex border-b border-border/50 bg-[#0d0d14] overflow-x-auto">
                  {currentLesson.exercises.map((ex, idx) => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        setActiveExerciseIdx(idx)
                        setEditorCode(ex.starterCode)
                        setUnlockedHints([])
                        setTestResults(null)
                      }}
                      className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                        idx === activeExerciseIdx
                          ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Hash size={12} className="inline mr-1" />
                      {ex.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Lesson content */}
              <ScrollArea className="flex-1 p-4">
                {currentExercise ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-md font-semibold text-white">{currentExercise.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{currentExercise.description}</p>
                    </div>

                    {/* Lesson MDX content */}
                    <LessonRenderer content={currentLesson.contentMdx} />

                    <Separator className="bg-border/30" />

                    {/* Hints */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                        <Sparkles size={14} className="text-yellow-400" /> Hints (costs XP)
                      </h4>
                      <div className="space-y-2">
                        {currentExercise.hints.sort((a, b) => a.level - b.level).map((hint) => {
                          const isUnlocked = unlockedHints.includes(hint.level)
                          const hintLabels = ['Nudge', 'Approach', 'Near Answer']

                          return (
                            <div key={hint.id} className="rounded-lg border border-border/30 bg-[#0d0d14] p-3">
                              {isUnlocked ? (
                                <div>
                                  <span className="text-xs font-medium text-emerald-400">{hintLabels[hint.level - 1]}</span>
                                  <p className="text-sm text-white mt-1">{hint.content}</p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleUnlockHint(hint.level, hint.xpCost)}
                                  className="w-full text-left flex items-center justify-between"
                                >
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Lock size={12} /> {hintLabels[hint.level - 1]}
                                  </span>
                                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                    -{hint.xpCost} XP
                                  </Badge>
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No exercises available for this lesson.</div>
                )}
              </ScrollArea>
            </div>

            {/* RIGHT: Code Editor + Console */}
            <div className="w-full lg:w-1/2 flex flex-col bg-[#1e1e1e]">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{currentExercise?.language || 'python'}</span>
                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                    <Zap size={10} className="mr-1" /> {currentExercise?.xpReward || 0} XP
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isRunning ? <Loader2 className="animate-spin mr-1" size={14} /> : <Play size={14} className="mr-1" />}
                    Run Code
                  </Button>
                  {currentExercise && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExploitExercise({
                          id: currentExercise.id,
                          title: currentExercise.title,
                          description: currentExercise.description,
                          language: currentExercise.language,
                          starterCode: currentExercise.starterCode,
                        })
                        setView('exploit')
                      }}
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      <Bug size={14} className="mr-1" /> Exploit
                    </Button>
                  )}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 min-h-[300px]">
                <MonacoEditor
                  height="100%"
                  language="python"
                  theme="vs-dark"
                  value={editorCode}
                  onChange={(val) => setEditorCode(val || '')}
                  options={{
                    fontSize: 14,
                    fontFamily: "'Geist Mono', 'Fira Code', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                    lineNumbers: 'on',
                    automaticLayout: true,
                    tabSize: 4,
                  }}
                />
              </div>

              {/* Console Output */}
              <div className="h-48 border-t border-[#333] bg-[#1a1a1a] flex flex-col">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333]">
                  <span className="text-xs text-muted-foreground font-medium">Console</span>
                  <button onClick={() => { setConsoleOutput(''); setTestResults(null) }} className="text-xs text-muted-foreground hover:text-foreground">
                    Clear
                  </button>
                </div>
                <ScrollArea className="flex-1 p-3">
                  {consoleOutput && (
                    <pre className={`text-sm font-mono whitespace-pre-wrap ${
                      consoleOutput.includes('✅') ? 'text-emerald-400' :
                      consoleOutput.includes('❌') ? 'text-red-400' :
                      'text-white'
                    }`}>
                      {consoleOutput}
                    </pre>
                  )}

                  {/* Test Results */}
                  {testResults && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium">Test Results:</p>
                      {testResults.map((result, idx) => (
                        <div key={idx} className={`flex items-center gap-2 text-xs p-2 rounded ${
                          result.passed ? 'bg-emerald-500/10' : 'bg-red-500/10'
                        }`}>
                          {result.passed ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
                          <span className="text-muted-foreground">
                            {result.isHidden ? 'Hidden test case' : `Input: ${result.input}`}
                          </span>
                          {!result.passed && !result.isHidden && (
                            <span className="text-red-400 ml-auto">
                              Expected: {result.expected} | Got: {result.actual}
                            </span>
                          )}
                          {result.passed && <span className="text-emerald-400 ml-auto">Passed</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* HACKING LABS */}
        {/* ============================================================ */}
        {view === 'labs' && (
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Hacking Labs</h1>
                <p className="text-muted-foreground text-sm mt-1">Capture The Flag challenges to sharpen your cybersecurity skills</p>
              </div>
              <Button variant="ghost" onClick={() => navigateTo('dashboard')} className="text-muted-foreground">
                <HomeIcon size={16} className="mr-1" /> Dashboard
              </Button>
            </div>

            {/* Filter badges */}
            <div className="flex flex-wrap gap-2">
              {['all', 'easy', 'medium', 'hard', 'expert'].map(d => (
                <Badge key={d} variant="outline" className="cursor-pointer hover:bg-white/5 border-border/50 capitalize">
                  {d === 'all' ? 'All' : d}
                </Badge>
              ))}
              <Separator orientation="vertical" className="h-5" />
              {['all', 'web', 'crypto', 'forensics', 'reversing', 'pwn'].map(c => (
                <Badge key={c} variant="outline" className="cursor-pointer hover:bg-white/5 border-border/50 capitalize">
                  {c === 'all' ? 'All' : c}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allLabs.map((lab) => {
                const isSolved = lab.session?.solved
                const isLocked = lab.phase > userPhase

                return (
                  <Card
                    key={lab.id}
                    onClick={() => { setCurrentLab(lab); setView('lab-detail'); setFlagInput('') }}
                    className={`bg-[#111118] border-border/50 transition-colors cursor-pointer ${
                      isSolved ? 'border-emerald-500/30' : isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-500/30'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${difficultyColors[lab.difficulty] || ''}`}>
                          {lab.difficulty}
                        </Badge>
                        {isSolved && <CheckCircle2 size={16} className="text-emerald-400" />}
                        {isLocked && <Lock size={14} className="text-muted-foreground" />}
                      </div>
                      <CardTitle className="text-white text-base">{lab.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-2">{lab.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400 capitalize">
                          {lab.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                          <Zap size={10} className="mr-1" /> {lab.xpReward} XP
                        </Badge>
                        {lab.session && !lab.session.solved && (
                          <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                            {lab.session.attempts} attempts
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {allLabs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield size={48} className="mx-auto mb-4 opacity-50" />
                <p>No labs available yet. Complete lessons to unlock hacking labs!</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* LAB DETAIL */}
        {/* ============================================================ */}
        {view === 'lab-detail' && currentLab && (
          <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
            <button onClick={() => navigateTo('labs')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              ← Back to Labs
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10">
                <Shield size={28} className="text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{currentLab.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`text-xs ${difficultyColors[currentLab.difficulty]}`}>{currentLab.difficulty}</Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400 capitalize">{currentLab.category}</Badge>
                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                    <Zap size={10} className="mr-1" /> {currentLab.xpReward} XP
                  </Badge>
                </div>
              </div>
            </div>

            <Card className="bg-[#111118] border-border/50">
              <CardContent className="p-6">
                <h3 className="font-medium text-white mb-2">Challenge Briefing</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentLab.briefingMdx || currentLab.description}</p>
              </CardContent>
            </Card>

            {currentLab.setupMdx && (
              <Card className="bg-[#111118] border-emerald-500/20">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-1 mb-2">
                    <Terminal size={14} /> Setup Instructions
                  </h4>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-[#0d0d14] rounded-lg p-3 border border-border/30 font-mono">{currentLab.setupMdx}</pre>
                </CardContent>
              </Card>
            )}

            {currentLab.toolsHint && (
              <Card className="bg-[#111118] border-cyan-500/20">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-cyan-400 flex items-center gap-1 mb-2">
                    <Search size={14} /> Tools & Concepts
                  </h4>
                  <p className="text-sm text-muted-foreground">{currentLab.toolsHint}</p>
                </CardContent>
              </Card>
            )}

            {currentLab.hintContent && (
              <Card className="bg-[#111118] border-yellow-500/20">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-1 mb-2">
                    <AlertTriangle size={14} /> Hint
                  </h4>
                  <p className="text-sm text-muted-foreground">{currentLab.hintContent}</p>
                </CardContent>
              </Card>
            )}

            {/* Flag submission */}
            <Card className="bg-[#111118] border-border/50">
              <CardContent className="p-6">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <Flag size={18} className="text-cyan-400" /> Submit Flag
                </h3>
                {currentLab.session?.solved ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                    <span className="text-emerald-400 font-medium">Challenge already solved!</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="ZTD{your_flag_here}"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      className="bg-[#1a1a24] border-border/50 font-mono"
                      onKeyDown={(e) => e.key === 'Enter' && handleFlagSubmit()}
                    />
                    <Button
                      onClick={handleFlagSubmit}
                      disabled={flagSubmitting || !flagInput.trim()}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      {flagSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* LEADERBOARD */}
        {/* ============================================================ */}
        {view === 'leaderboard' && (
          <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                <p className="text-muted-foreground text-sm mt-1">Top hackers ranked by XP</p>
              </div>
              <Button variant="ghost" onClick={() => navigateTo('dashboard')} className="text-muted-foreground">
                <HomeIcon size={16} className="mr-1" /> Dashboard
              </Button>
            </div>

            <div className="space-y-2">
              {leaderboard.map((user, idx) => {
                const isCurrentUser = user.username === userName
                const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`

                return (
                  <Card key={user.id} className={`bg-[#111118] border-border/50 ${isCurrentUser ? 'border-emerald-500/30' : ''}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className="text-lg w-10 text-center font-bold text-muted-foreground">{rankIcon}</span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={`text-xs ${isCurrentUser ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white' : 'bg-white/10'}`}>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
                          {user.username} {isCurrentUser && '(you)'}
                        </p>
                        <p className="text-xs text-muted-foreground">Phase {user.currentPhase} · {user.completedLessons} lessons · {user.streak} day streak</p>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                        <Zap size={14} /> {user.xpTotal}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                <p>No rankings yet. Be the first to earn XP!</p>
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO */}
        {view === 'portfolio' && <PortfolioPage onNavigate={(v) => navigateTo(v as View)} />}

        {/* INTERVIEW PREP */}
        {view === 'interview' && <InterviewPage onNavigate={(v) => navigateTo(v as View)} />}

        {/* ASSESSMENT */}
        {view === 'assessment' && <AssessmentPage slug={currentAssessmentSlug} onNavigate={(v) => navigateTo(v as View)} />}

        {/* EXPLOIT LAB */}
        {view === 'exploit' && exploitExercise && (
          <ExploitEditor
            exerciseId={exploitExercise.id}
            targetCode={exploitExercise.starterCode}
            exerciseLanguage={exploitExercise.language}
            exerciseTitle={exploitExercise.title}
            description={exploitExercise.description}
          />
        )}
      </main>
    </div>
  )
}
