import Link from "next/link";
import { BookOpen, Terminal, Shield, Database } from "lucide-react";

interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  phase: number;
}

interface SidebarProps {
  lessons: LessonSummary[];
  currentSlug: string;
}

export default function Sidebar({ lessons, currentSlug }: SidebarProps) {
  // Group lessons by phase
  const phases = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.phase]) acc[lesson.phase] = [];
    acc[lesson.phase].push(lesson);
    return acc;
  }, {} as Record<number, LessonSummary[]>);

  const getPhaseIcon = (phase: number) => {
    switch(phase) {
      case 1: return <Terminal className="w-4 h-4 mr-2 text-green-400" />;
      case 2: return <Database className="w-4 h-4 mr-2 text-blue-400" />;
      case 3: return <Shield className="w-4 h-4 mr-2 text-red-400" />;
      default: return <BookOpen className="w-4 h-4 mr-2 text-slate-400" />;
    }
  };

  const getPhaseName = (phase: number) => {
    switch(phase) {
      case 1: return "Core CS & Systems";
      case 2: return "Networking & Protocols";
      case 3: return "Cybersecurity Foundations";
      default: return `Phase ${phase}`;
    }
  };

  return (
    <div className="w-64 bg-[#0a0f18] border-r border-slate-800 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Terminal className="w-5 h-5 mr-2 text-blue-500" />
          ZeroToDev
        </h2>
      </div>
      
      <div className="flex-1 py-4">
        {Object.entries(phases).map(([phaseStr, phaseLessons]) => {
          const phase = parseInt(phaseStr);
          return (
            <div key={phase} className="mb-6">
              <div className="px-4 mb-2 flex items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                {getPhaseIcon(phase)}
                {getPhaseName(phase)}
              </div>
              <ul className="space-y-1">
                {phaseLessons.map(lesson => (
                  <li key={lesson.id}>
                    <Link 
                      href={`/?lesson=${lesson.slug}`}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        currentSlug === lesson.slug 
                          ? "bg-blue-600/10 text-blue-400 border-r-2 border-blue-500" 
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      }`}
                    >
                      {lesson.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
