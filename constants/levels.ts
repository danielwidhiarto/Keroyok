import type { Level } from "@/types";

export const LEVELS: {
  name: Level;
  minRep: number;
  color: string;
  emoji: string;
}[] = [
  { name: "Newcomer", minRep: 0, color: "text-gray-500", emoji: "🌱" },
  { name: "Helper", minRep: 50, color: "text-blue-500", emoji: "🤝" },
  { name: "Solver", minRep: 150, color: "text-green-500", emoji: "⚡" },
  { name: "Expert", minRep: 400, color: "text-purple-500", emoji: "🎯" },
  { name: "Legend", minRep: 1000, color: "text-yellow-500", emoji: "👑" },
];

export function getLevelFromRep(reputation: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (reputation >= LEVELS[i].minRep) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(reputation: number) {
  for (const level of LEVELS) {
    if (reputation < level.minRep) return level;
  }
  return null;
}

export const POINTS = {
  POST_PROBLEM: 5,
  GIVE_SOLUTION: 10,
  SOLUTION_UPVOTED: 25,
  SOLUTION_CHOSEN: 50,
} as const;
