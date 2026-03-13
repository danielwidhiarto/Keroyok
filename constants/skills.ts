export const SKILLS = [
  "Design",
  "Coding",
  "Marketing",
  "Hukum",
  "Keuangan",
  "Teknik",
  "Masak",
  "Bisnis",
  "Kesehatan",
  "Pendidikan",
  "Fotografi",
  "Videografi",
  "Menulis",
  "Musik",
  "Olahraga",
  "Bahasa",
  "Psikologi",
  "Arsitektur",
  "Pertanian",
  "Otomotif",
] as const;

export type Skill = (typeof SKILLS)[number];
