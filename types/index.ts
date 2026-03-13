import { Timestamp } from "firebase/firestore";

export type Urgency = "santai" | "butuh-cepat" | "urgent";
export type ProblemStatus = "open" | "in-progress" | "solved";
export type Level = "Newcomer" | "Helper" | "Solver" | "Expert" | "Legend";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  skills: string[];
  mayarLink?: string;
  reputation: number;
  level: Level;
  badges: string[];
  notifyOnSkillMatch: boolean;
  onboardingComplete: boolean;
  createdAt: Timestamp;
}

export interface Problem {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  title: string;
  description: string;
  attachmentURL?: string;
  tags: string[];
  urgency: Urgency;
  status: ProblemStatus;
  solvedByUid?: string;
  solvedByName?: string;
  upvoteCount: number;
  upvotedBy: string[];
  replyCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Reply {
  id: string;
  problemId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  upvoteCount: number;
  upvotedBy: string[];
  isChosen: boolean;
  parentId?: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  type: "skill-match" | "upvote" | "solved" | "reply";
  problemId: string;
  problemTitle: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}
