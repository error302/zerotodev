import LessonViewer from "@/components/LessonViewer";
import CodeEditor from "@/components/CodeEditor";

export default function Home() {
  return (
    <main className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Left Pane: Lesson Content */}
      <section className="w-1/3 border-r border-slate-800 flex flex-col">
        <LessonViewer />
      </section>

      {/* Right Pane: Code Editor and Console */}
      <section className="flex-1 flex flex-col min-w-0">
        <CodeEditor />
      </section>
    </main>
  );
}
