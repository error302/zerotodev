"use client";

import { Terminal } from "lucide-react";

interface ConsoleOutputProps {
  output: string | null;
  error: string | null;
  isLoading: boolean;
}

export default function ConsoleOutput({ output, error, isLoading }: ConsoleOutputProps) {
  return (
    <div className="h-1/3 border-t border-slate-800 bg-[#0a0f18] flex flex-col font-mono text-sm">
      <div className="flex items-center px-4 py-2 bg-[#0f1523] border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
        <Terminal className="w-4 h-4 mr-2" />
        Console
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-slate-500 animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Executing...</span>
          </div>
        ) : error ? (
          <pre className="text-red-400 whitespace-pre-wrap font-mono">{error}</pre>
        ) : output ? (
          <pre className="text-slate-300 whitespace-pre-wrap font-mono">{output}</pre>
        ) : (
          <div className="text-slate-600 italic">Run your code to see output here...</div>
        )}
      </div>
    </div>
  );
}
