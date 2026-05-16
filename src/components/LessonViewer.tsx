"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Lock, Lightbulb, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Hint {
  id: number;
  level: "Nudge" | "Approach" | "Near Answer";
  cost: number;
  content: string;
}

const mockLesson = {
  title: "Reverse a String",
  description: "Strings are fundamental to programming and computer science. Often, we need to manipulate them to solve complex problems or find hidden flags in cybersecurity. Let's start with a classic: reversing a string.",
  instructions: "Write a Python function `reverse_string(text)` that takes a string as input and returns the reversed version of that string.",
  hints: [
    {
      id: 1,
      level: "Nudge",
      cost: 5,
      content: "Think about how you would read a word backwards letter by letter. Is there a way to iterate through a string in reverse?"
    },
    {
      id: 2,
      level: "Approach",
      cost: 10,
      content: "Python strings can be sliced. Try using slice notation with a step value. What does [::-1] do?"
    },
    {
      id: 3,
      level: "Near Answer",
      cost: 20,
      content: "String slicing with a negative step reverses the sequence. Your function should return the string with [::-1] applied to it."
    }
  ] as Hint[]
};

export default function LessonViewer() {
  const [xp, setXp] = useState(100);
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]);
  const [expandedHint, setExpandedHint] = useState<number | null>(null);

  const unlockHint = (hint: Hint) => {
    if (xp >= hint.cost && !unlockedHints.includes(hint.id)) {
      setXp(xp - hint.cost);
      setUnlockedHints([...unlockedHints, hint.id]);
      setExpandedHint(hint.id);
    }
  };

  const toggleHint = (id: number) => {
    setExpandedHint(expandedHint === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0f18] text-slate-300 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-[#0f1523] flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white tracking-tight">{mockLesson.title}</h1>
        <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50 shadow-inner">
          <span className="text-blue-400 font-bold">XP</span>
          <span className="font-mono text-slate-100">{xp}</span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Lesson Description */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Overview</h2>
          <p className="text-slate-300 leading-relaxed text-sm">{mockLesson.description}</p>
        </section>

        {/* Instructions */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Instructions</h2>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 text-sm leading-relaxed shadow-sm">
            {mockLesson.instructions}
          </div>
        </section>

        {/* Hint System */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Hints
          </h2>
          <div className="space-y-3">
            {mockLesson.hints.map((hint) => {
              const isUnlocked = unlockedHints.includes(hint.id);
              const isExpanded = expandedHint === hint.id;
              const canAfford = xp >= hint.cost;

              return (
                <div 
                  key={hint.id} 
                  className={`border rounded-xl overflow-hidden transition-all duration-300 ${isUnlocked ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-800 bg-slate-900/30'}`}
                >
                  <button
                    onClick={() => isUnlocked ? toggleHint(hint.id) : unlockHint(hint)}
                    disabled={!isUnlocked && !canAfford}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${!isUnlocked && !canAfford ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/50'}`}
                  >
                    <div className="flex items-center space-x-3">
                      {isUnlocked ? (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                      <div>
                        <span className={`text-sm font-semibold ${isUnlocked ? 'text-blue-100' : 'text-slate-400'}`}>
                          Hint {hint.id}: {hint.level}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {!isUnlocked && (
                        <span className={`text-xs font-mono px-2 py-1 rounded bg-slate-800 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                          -{hint.cost} XP
                        </span>
                      )}
                      {isUnlocked && (
                        isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && isUnlocked && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800/50 bg-slate-900/50"
                      >
                        <div className="p-4 text-sm text-slate-300 leading-relaxed italic">
                          "{hint.content}"
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
