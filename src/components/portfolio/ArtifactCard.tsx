import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Code2, FileText, Trophy, BookOpen, ExternalLink, Star } from 'lucide-react'

interface ArtifactCardProps {
  artifact: {
    id: string
    type: string
    title: string
    description: string
    url?: string | null
    featured: boolean
    createdAt: string
  }
}

const typeIcons: Record<string, React.ElementType> = {
  lab: Shield, exercise: Code2, project: FileText, assessment: Trophy, writeup: BookOpen,
}

const typeColors: Record<string, string> = {
  lab: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  exercise: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  project: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
  assessment: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
  writeup: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
}

export default function ArtifactCard({ artifact }: ArtifactCardProps) {
  const Icon = typeIcons[artifact.type] || Code2
  const colorClass = typeColors[artifact.type] || typeColors.exercise

  return (
    <Card className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-xs ${colorClass}`}>
            <Icon size={10} className="mr-1" />{artifact.type}
          </Badge>
          {artifact.featured && <Star size={14} className="text-yellow-400" />}
        </div>
        <CardTitle className="text-white text-base">{artifact.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{artifact.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">{new Date(artifact.createdAt).toLocaleDateString()}</span>
          {artifact.url && (
            <a href={artifact.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View <ExternalLink size={10} />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
