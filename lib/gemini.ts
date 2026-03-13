import { GoogleGenerativeAI } from "@google/generative-ai";
import { SKILLS } from "@/constants/skills";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractSkillTags(
  title: string,
  description: string,
): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Kamu adalah AI yang membantu menganalisis masalah dan mengidentifikasi skill yang dibutuhkan.

Daftar skill yang tersedia: ${SKILLS.join(", ")}

Judul masalah: "${title}"
Deskripsi masalah: "${description}"

Tentukan 1-3 skill dari daftar di atas yang paling relevan untuk membantu menyelesaikan masalah ini.
Jawab HANYA dengan JSON array berisi nama skill yang tepat sesuai daftar, tanpa penjelasan tambahan.
Contoh: ["Design", "Marketing"] atau ["Coding"]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) return [];
    const tags: string[] = JSON.parse(jsonMatch[0]);
    return tags.filter((t) => (SKILLS as readonly string[]).includes(t));
  } catch {
    return [];
  }
}
