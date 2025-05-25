import { NextRequest, NextResponse } from "next/server";
import { askLLM } from "@/services/llm";

export async function POST(req: NextRequest) {
  try {
    const { puzzle, question, clues } = await req.json();
    if (!puzzle || !question) {
      return NextResponse.json(
        { error: "Missing puzzle or question" },
        { status: 400 }
      );
    }
    const result = await askLLM({ puzzle, question, clues });
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
