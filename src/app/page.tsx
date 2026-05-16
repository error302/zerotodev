import LessonViewer from "@/components/LessonViewer";
import CodeEditor from "@/components/CodeEditor";
import Sidebar from "@/components/Sidebar";
import { query } from "@/utils/db";

// Force dynamic since we're fetching from DB
export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ lesson?: string }> }) {
  const params = await searchParams;
  const currentSlug = params?.lesson || 'memory-allocation-c';

  let lesson = null;
  let code = "";
  let language = "c";
  let lessonsList = [];

  try {
    // Fetch all lessons for the sidebar
    const listResult = await query(`SELECT id, title, slug, phase FROM lessons ORDER BY phase, order_index`);
    lessonsList = listResult.rows;

    // Attempt to fetch the specific lesson
    const result = await query(`
      SELECT l.title, l.content_mdx as description, e.instructions, e.starter_code, e.language,
             json_agg(json_build_object('id', h.id, 'level', 'Hint ' || h.level::text, 'cost', h.xp_cost, 'content', h.content)) as hints
      FROM lessons l
      JOIN exercises e ON e.lesson_id = l.id
      LEFT JOIN hints h ON h.exercise_id = e.id
      WHERE l.slug = $1
      GROUP BY l.id, e.id
    `, [currentSlug]);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      lesson = {
        title: row.title,
        description: row.description,
        instructions: row.instructions,
        hints: row.hints && row.hints[0].id !== null ? row.hints : [] // handle case with no hints
      };
      code = row.starter_code;
      language = row.language;
    }
  } catch (error) {
    console.error("Failed to fetch data from DB, using fallback", error);
  }

  // Fallback if DB is not seeded yet
  if (!lesson) {
    lessonsList = [{ id: '1', title: 'Memory Allocation in C', slug: 'memory-allocation-c', phase: 1 }];
    lesson = {
      title: "Memory Allocation in C (Fallback)",
      description: "To truly understand how computers work, you must understand memory. High-level languages like Python or JavaScript hide this from you. In this lesson, you will drop down to C to manipulate memory directly. We will build a simple version of `malloc`.",
      instructions: "Implement the `simple_malloc` function. It must return a pointer to the current offset in the `heap` array, and then advance the offset by the requested size. Do not worry about freeing memory for now.",
      hints: [
        { id: 1, level: "Nudge", cost: 5, content: "You need to return a pointer. `heap` is an array, so `&heap[current_offset]` or `heap + current_offset` gives you the address." }
      ]
    };
    code = `#include <stdio.h>\n#include <stddef.h>\n\n#define HEAP_SIZE 1024\nchar heap[HEAP_SIZE];\nsize_t current_offset = 0;\n\nvoid* simple_malloc(size_t size) {\n    // Your code here\n    return NULL;\n}\n\nint main() {\n    int* ptr1 = (int*)simple_malloc(sizeof(int));\n    if (ptr1 == NULL) {\n        printf("Failed to allocate\\n");\n        return 1;\n    }\n    *ptr1 = 42;\n    printf("Value: %d\\n", *ptr1);\n    return 0;\n}`;
    language = "c";
  }

  return (
    <main className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar: Navigation */}
      <Sidebar lessons={lessonsList} currentSlug={currentSlug} />

      {/* Center Pane: Lesson Content */}
      <section className="w-1/3 border-r border-slate-800 flex flex-col">
        <LessonViewer lesson={lesson} />
      </section>

      {/* Right Pane: Code Editor and Console */}
      <section className="flex-1 flex flex-col min-w-0">
        <CodeEditor initialCode={code} language={language} />
      </section>
    </main>
  );
}
