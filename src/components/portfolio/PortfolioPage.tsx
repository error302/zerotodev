'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Star, Plus, Home, Zap, Target, Shield, BookOpen, Trophy, Code2 } from 'lucide-react'
import ArtifactCard from './ArtifactCard'

interface Artifact {
  id: string
  type: string
  title: string
  description: string
  url?: string | null
  featured: boolean
  createdAt: string
}

interface PortfolioPageProps {
  onNavigate: (view: string) => void
}

export default function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newArtifact, setNewArtifact] = useState({ type: 'writeup', title: '', description: '', url: '', sourceId: '' })

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((data) => { setArtifacts(data.artifacts || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleAddArtifact = async () => {
    if (!newArtifact.title || !newArtifact.sourceId) return
    const res = await fetch('/api/portfolio', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArtifact),
    })
    if (res.ok) {
      const data = await res.json()
      setArtifacts((prev) => [data.artifact, ...prev])
      setShowAddForm(false)
      setNewArtifact({ type: 'writeup', title: '', description: '', url: '', sourceId: '' })
    }
  }

  const toggleFeatured = (id: string, current: boolean) => {
    setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, featured: !current } : a)))
  }

  const stats = {
    total: artifacts.length,
    labs: artifacts.filter((a) => a.type === 'lab').length,
    exercises: artifacts.filter((a) => a.type === 'exercise').length,
    projects: artifacts.filter((a) => a.type === 'project').length,
    assessments: artifacts.filter((a) => a.type === 'assessment').length,
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-1">Your CS & cybersecurity achievements</p>
        </div>
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-muted-foreground">
          <Home size={16} className="mr-1" /> Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Star, color: 'text-white' },
          { label: 'Labs', value: stats.labs, icon: Shield, color: 'text-purple-400' },
          { label: 'Exercises', value: stats.exercises, icon: Code2, color: 'text-emerald-400' },
          { label: 'Projects', value: stats.projects, icon: BookOpen, color: 'text-cyan-400' },
          { label: 'Assessments', value: stats.assessments, icon: Trophy, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-[#111118] border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <Icon size={18} className={color} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline" size="sm">
          <Plus size={14} className="mr-1" /> Add Artifact
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-[#111118] border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Type</label>
                <select value={newArtifact.type} onChange={(e) => setNewArtifact({ ...newArtifact, type: e.target.value })} className="w-full bg-[#1a1a24] border border-border/50 rounded-md px-3 py-2 text-sm text-white">
                  <option value="writeup">Writeup</option>
                  <option value="project">Project</option>
                  <option value="lab">Lab</option>
                  <option value="exercise">Exercise</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <Input value={newArtifact.title} onChange={(e) => setNewArtifact({ ...newArtifact, title: e.target.value })} className="bg-[#1a1a24] border-border/50" placeholder="My awesome project" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Input value={newArtifact.description} onChange={(e) => setNewArtifact({ ...newArtifact, description: e.target.value })} className="bg-[#1a1a24] border-border/50" placeholder="What did you build?" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">URL (optional)</label>
              <Input value={newArtifact.url} onChange={(e) => setNewArtifact({ ...newArtifact, url: e.target.value })} className="bg-[#1a1a24] border-border/50" placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Source ID</label>
              <Input value={newArtifact.sourceId} onChange={(e) => setNewArtifact({ ...newArtifact, sourceId: e.target.value })} className="bg-[#1a1a24] border-border/50" placeholder="lab-id or exercise-id" />
            </div>
            <Button onClick={handleAddArtifact} className="bg-emerald-500 hover:bg-emerald-600 text-white">Add to Portfolio</Button>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-border/30" />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : artifacts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>No artifacts yet. Complete lessons, labs, and exercises to build your portfolio!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artifacts.map((artifact) => (
            <div key={artifact.id} className="relative group">
              <ArtifactCard artifact={artifact} />
              <button onClick={() => toggleFeatured(artifact.id, artifact.featured)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Star size={14} className={artifact.featured ? 'text-yellow-400' : 'text-muted-foreground'} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
