import { NextRequest, NextResponse } from "next/server";
import { askLLM } from "@/services/llm";
import { supabase } from "@/app/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { id, question, clues } = await req.json();
    if (!id || !question) {
      return NextResponse.json(
        { error: "Missing id or question" },
        { status: 400 }
      );
    }
    // 查 supabase 取得 description, answer
    const { data: puzzle, error } = await supabase
      .from("puzzles")
      .select("description, answer")
      .eq("id", id)
      .single();
    if (error || !puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }
    // 呼叫 LLM，只傳 description, question, clues
    const result = await askLLM({
      puzzle: puzzle.description,
      answer: puzzle.answer,
      question,
      clues,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
