'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface SkillRadarProps {
  phaseProgress: { phase: number; completed: number; total: number }[]
}

const skillMap = [
  { skill: 'Programming', phase: 1 },
  { skill: 'Algorithms', phase: 2 },
  { skill: 'Systems', phase: 3 },
  { skill: 'Software Eng', phase: 4 },
  { skill: 'Networking', phase: 3 },
  { skill: 'Web Security', phase: 4 },
  { skill: 'Binary Exploit', phase: 5 },
  { skill: 'Cryptography', phase: 5 },
  { skill: 'Forensics', phase: 5 },
  { skill: 'Cloud Security', phase: 6 },
]

export function SkillRadar({ phaseProgress }: SkillRadarProps) {
  // Build data array for Recharts
  const data = skillMap.map(({ skill, phase }) => {
    const phaseData = phaseProgress.find(p => p.phase === phase)
    const score = phaseData && phaseData.total > 0 
      ? Math.round((phaseData.completed / phaseData.total) * 100) 
      : 0
    return { skill, score, fullMark: 100 }
  })

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis 
          dataKey="skill" 
          tick={{ fill: '#9ca3af', fontSize: 11 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Skill Level"
          dataKey="score"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#111118', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff'
          }}
          formatter={(value: number) => [`${value}%`, 'Mastery']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
