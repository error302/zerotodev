'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Home, Code2, CheckCircle2, Play, Loader2, ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), { ssr: false })

interface Problem {
  id: string; title: string; slug: string; difficulty: string; category: string; xpReward: number; pattern?: string | null; solved: boolean
}

interface InterviewPageProps { onNavigate: (view: string) => void }

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function InterviewPage({ onNavigate }: InterviewPageProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [problemDetail, setProblemDetail] = useState<any>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<{ total: number; solved: number; categoryBreakdown: any[]; difficultyBreakdown: any[] } | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => { fetchProblems(); fetchProgress() }, [])

  const fetchProblems = () => {
    const params = new URLSearchParams()
    if (filterDifficulty !== 'all') params.set('difficulty', filterDifficulty)
    if (filterCategory !== 'all') params.set('category', filterCategory)
    fetch(`/api/interview/problems?${params}`).then((r) => r.json()).then((data) => setProblems(data.problems || []))
  }

  const fetchProgress = () => { fetch('/api/interview/progress').then((r) => r.json()).then((data) => setProgress(data)) }

  const selectProblem = (problem: Problem) => {
    setSelectedProblem(problem)
    fetch(`/api/interview/problems/${problem.slug}`).then((r) => r.json()).then((data) => {
      setProblemDetail(data.problem); setCode(data.problem.starterCode); setOutput('')
    })
  }

  const runCode = async () => {
    if (!selectedProblem) return
    setIsRunning(true); setOutput('Running...')
    try {
      const res = await fetch(`/api/interview/problems/${selectedProblem.slug}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.passed) { setOutput(`✅ All test cases passed! +${data.xpEarned} XP`); fetchProblems(); fetchProgress() }
      else { const failed = data.results?.filter((r: any) => !r.passed).length || 0; setOutput(`❌ ${failed} test case(s) failed.`) }
    } catch { setOutput('Error: Could not execute code.') }
    finally { setIsRunning(false) }
  }

  if (selectedProblem && problemDetail) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <button onClick={() => { setSelectedProblem(null); setProblemDetail(null) }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft size={14} /> Back to Problems</button>
            <h2 className="text-lg font-bold text-white mt-2">{problemDetail.title}</h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className={`text-xs ${difficultyColors[problemDetail.difficulty]}`}>{problemDetail.difficulty}</Badge>
              <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">{problemDetail.category}</Badge>
              {problemDetail.pattern && <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">{problemDetail.pattern}</Badge>}
              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">{problemDetail.xpReward} XP</Badge>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4"><pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{problemDetail.description}</pre></ScrollArea>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col bg-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
            <span className="text-xs text-muted-foreground">{problemDetail.language}</span>
            <Button onClick={runCode} disabled={isRunning} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">{isRunning ? <Loader2 className="animate-spin mr-1" size={14} /> : <Play size={14} className="mr-1" />}Run Code</Button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <MonacoEditor height="100%" language={problemDetail.language} theme="vs-dark" value={code} onChange={(val) => setCode(val || '')} options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, lineNumbers: 'on', automaticLayout: true }} />
          </div>
          <div className="h-32 border-t border-[#333] bg-[#1a1a1a] p-3">
            <ScrollArea className="h-full"><pre className={`text-sm font-mono whitespace-pre-wrap ${output.includes('✅') ? 'text-emerald-400' : output.includes('❌') ? 'text-red-400' : 'text-white'}`}>{output}</pre></ScrollArea>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Interview Prep</h1><p className="text-muted-foreground text-sm mt-1">Practice LeetCode-style problems</p></div>
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-muted-foreground"><Home size={16} className="mr-1" /> Dashboard</Button>
      </div>
      {progress && (
        <Card className="bg-[#111118] border-border/50">
          <CardHeader><CardTitle className="text-white text-base">Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center"><p className="text-3xl font-bold text-white">{progress.solved}</p><p className="text-xs text-muted-foreground">of {progress.total} solved</p></div>
              <Progress value={(progress.solved / progress.total) * 100} className="flex-1 h-2" />
              <p className="text-lg font-bold text-emerald-400">{Math.round((progress.solved / progress.total) * 100)}%</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {progress.difficultyBreakdown.map((d: any) => (
                <div key={d.difficulty} className="flex items-center justify-between p-2 rounded bg-[#1a1a24]">
                  <Badge variant="outline" className={`text-xs ${difficultyColors[d.difficulty]}`}>{d.difficulty}</Badge>
                  <span className="text-sm text-white font-medium">{d.solved}/{d.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex gap-2 flex-wrap">
        {['all', 'easy', 'medium', 'hard'].map((d) => (
          <button key={d} onClick={() => { setFilterDifficulty(d); fetchProblems() }} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${filterDifficulty === d ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1a1a24] text-muted-foreground hover:text-white'}`}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
        ))}
        <Separator orientation="vertical" className="h-6" />
        {['all', 'arrays', 'strings', 'trees', 'graphs', 'dp', 'security', 'design'].map((c) => (
          <button key={c} onClick={() => { setFilterCategory(c); fetchProblems() }} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${filterCategory === c ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[#1a1a24] text-muted-foreground hover:text-white'}`}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
        ))}
      </div>
      <div className="space-y-2">
        {problems.filter((p) => {
          if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false
          if (filterCategory !== 'all' && p.category !== filterCategory) return false
          return true
        }).map((problem) => (
          <Card key={problem.id} onClick={() => selectProblem(problem)} className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              {problem.solved ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Code2 size={20} className="text-muted-foreground" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm">{problem.title}</h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className={`text-xs ${difficultyColors[problem.difficulty]}`}>{problem.difficulty}</Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">{problem.category}</Badge>
                  {problem.pattern && <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">{problem.pattern}</Badge>}
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">{problem.xpReward} XP</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      {problems.length === 0 && <div className="text-center py-12 text-muted-foreground"><Code2 size={48} className="mx-auto mb-4 opacity-50" /><p>No problems match your filters.</p></div>}
    </div>
  )
}
