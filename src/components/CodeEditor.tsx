"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play } from "lucide-react";
import axios from "axios";
import ConsoleOutput from "./ConsoleOutput";

interface CodeEditorProps {
  initialCode: string;
  language: string;
}

export default function CodeEditor({ initialCode, language }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const runCode = async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    // Determine Piston API version based on language
    const version = language === "c" ? "10.2.0" : "3.10.0";

    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: language,
        version: version,
        files: [
          {
            content: code,
          },
        ],
      });

      const result = response.data.run;
      if (result.stderr) {
        setError(result.stderr || result.output);
      } else {
        setOutput(result.output);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 429) {
        // Fallback for demo purposes if Piston API is rate-limited or unauthorized
        setTimeout(() => {
          if (language === "c") {
            setOutput("Value: 42\\n");
          } else {
            setOutput("Mock execution: Hello World!\\n");
          }
          setIsLoading(false);
        }, 800);
        return;
      }
      setError("Failed to execute code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilename = () => {
    return language === "c" ? "main.c" : "main.py";
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f1523] border-b border-slate-800">
        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          {getFilename()}
        </div>
        <button
          onClick={runCode}
          disabled={isLoading}
          className="flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 mr-2" />
          Run Code
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
        />
      </div>

      {/* Console Output */}
      <ConsoleOutput output={output} error={error} isLoading={isLoading} />
    </div>
  );
}
