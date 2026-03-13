import { NextRequest, NextResponse } from "next/server";
import { extractSkillTags } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();
    if (!title || !description) {
      return NextResponse.json(
        { error: "title and description required" },
        { status: 400 },
      );
    }
    const tags = await extractSkillTags(title, description);
    return NextResponse.json({ tags });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI error" }, { status: 500 });
  }
}
