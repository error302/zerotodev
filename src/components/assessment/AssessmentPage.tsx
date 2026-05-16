'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Home, Play, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react'
import AssessmentTimer from './AssessmentTimer'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), { ssr: false })

interface Problem {
  id: string
  title: string
  type: string
  description: string
  starterCode?: string | null
  language?: string | null
  points: number
  order: number
}

interface AssessmentPageProps {
  slug: string
  onNavigate: (view: string) => void
}

export default function AssessmentPage({ slug, onNavigate }: AssessmentPageProps) {
  const [assessment, setAssessment] = useState<{ title: string; description: string; timeLimit: number; passScore: number; problems: Problem[] } | null>(null)
  const [activeProblemIdx, setActiveProblemIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean; earnedPoints: number; totalPoints: number; passScore: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/assessments/${slug}`).then((r) => r.json()).then((data) => { setAssessment(data.assessment); setLoading(false) }).catch(() => setLoading(false))
  }, [slug])

  const handleSubmit = useCallback(async () => {
    const res = await fetch(`/api/assessments/${slug}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    const data = await res.json()
    setResult(data)
    setSubmitted(true)
  }, [slug, answers])

  const handleTimeUp = useCallback(() => { handleSubmit() }, [handleSubmit])

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  if (!assessment) return <div className="text-center py-12 text-muted-foreground">Assessment not found</div>

  if (submitted && result) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <Card className={`bg-[#111118] border-2 ${result.passed ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              {result.passed ? <CheckCircle2 className="text-emerald-400" size={28} /> : <XCircle className="text-red-400" size={28} />}
              {result.passed ? 'Assessment Passed!' : 'Assessment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-white">{result.score}%</p>
              <p className="text-muted-foreground mt-2">{result.earnedPoints}/{result.totalPoints} points earned</p>
              <p className="text-sm text-muted-foreground mt-1">Passing score: {result.passScore}%</p>
            </div>
            <Separator />
            <div className="flex gap-3 justify-center">
              <Button onClick={() => onNavigate('dashboard')} className="bg-emerald-500 hover:bg-emerald-600"><Home size={16} className="mr-1" /> Dashboard</Button>
              {!result.passed && <Button variant="outline" onClick={() => { setSubmitted(false); setResult(null) }}>Retry Assessment</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-muted-foreground"><ArrowLeft size={16} className="mr-1" /> Back</Button>
        <Card className="bg-[#111118] border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{assessment.title}</CardTitle>
            <CardDescription className="text-muted-foreground text-base">{assessment.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-[#1a1a24]"><p className="text-2xl font-bold text-white">{assessment.timeLimit}m</p><p className="text-xs text-muted-foreground">Time Limit</p></div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a24]"><p className="text-2xl font-bold text-white">{assessment.problems.length}</p><p className="text-xs text-muted-foreground">Problems</p></div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a24]"><p className="text-2xl font-bold text-white">{assessment.passScore}%</p><p className="text-xs text-muted-foreground">Pass Score</p></div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle size={18} className="text-yellow-400" />
              <p className="text-sm text-yellow-400">Once started, the timer cannot be paused.</p>
            </div>
            <Button onClick={() => setStarted(true)} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold">
              <Play size={16} className="mr-2" /> Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const problem = assessment.problems[activeProblemIdx]

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 border-r border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-bold text-white">{assessment.title}</h2>
          <AssessmentTimer timeLimitMinutes={assessment.timeLimit} onTimeUp={handleTimeUp} />
        </div>
        <div className="flex border-b border-border/50 bg-[#0d0d14] overflow-x-auto">
          {assessment.problems.map((p, idx) => (
            <button key={p.id} onClick={() => setActiveProblemIdx(idx)} className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${idx === activeProblemIdx ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' : 'text-muted-foreground hover:text-foreground'}`}>
              {p.order}. {p.title}<Badge variant="outline" className="ml-2 text-xs border-yellow-500/30 text-yellow-400">{p.points}pt</Badge>
            </button>
          ))}
        </div>
        <ScrollArea className="flex-1 p-4">
          <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{problem.description}</p>
        </ScrollArea>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col bg-[#1e1e1e]">
        {problem.type === 'coding' ? (
          <>
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
              <span className="text-xs text-muted-foreground">{problem.language || 'python'}</span>
            </div>
            <div className="flex-1 min-h-[300px]">
              <MonacoEditor height="100%" language={problem.language || 'python'} theme="vs-dark" value={(answers[problem.id]?.code) || problem.starterCode || ''} onChange={(val) => setAnswers((prev) => ({ ...prev, [problem.id]: { ...prev[problem.id], code: val || '' } }))} options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, lineNumbers: 'on', automaticLayout: true }} />
            </div>
          </>
        ) : (
          <div className="flex-1 p-4">
            <textarea value={answers[problem.id]?.text || ''} onChange={(e) => setAnswers((prev) => ({ ...prev, [problem.id]: { ...prev[problem.id], text: e.target.value } }))} className="w-full h-full bg-[#1a1a24] border border-border/30 rounded-lg p-4 text-white font-mono text-sm resize-none" placeholder="Type your answer here..." />
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-t border-[#333]">
          <span className="text-sm text-muted-foreground">{activeProblemIdx + 1} / {assessment.problems.length} problems</span>
          <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-600 text-white"><CheckCircle2 size={16} className="mr-1" /> Submit Assessment</Button>
        </div>
      </div>
    </div>
  )
}
