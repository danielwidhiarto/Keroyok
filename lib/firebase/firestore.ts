import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { UserProfile, Problem, Reply, Notification } from "@/types";
import { getLevelFromRep } from "@/constants/levels";

// ─── Users ───────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>,
) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    uid,
    displayName: "",
    email: "",
    photoURL: null,
    skills: [],
    reputation: 0,
    level: "Newcomer",
    badges: [],
    notifyOnSkillMatch: true,
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    ...data,
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
) {
  await updateDoc(doc(db, "users", uid), data);
}

export async function addReputation(uid: string, points: number) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data() as UserProfile;
  const newRep = current.reputation + points;
  const level = getLevelFromRep(newRep).name;
  await updateDoc(ref, { reputation: newRep, level });
}

// ─── Problems ────────────────────────────────────────────────────────────────

export async function createProblem(
  data: Omit<
    Problem,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "upvoteCount"
    | "upvotedBy"
    | "replyCount"
  >,
) {
  const ref = await addDoc(collection(db, "problems"), {
    ...data,
    upvoteCount: 0,
    upvotedBy: [],
    replyCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getProblems(
  type: "latest" | "trending" | "match",
  userSkills?: string[],
): Promise<Problem[]> {
  let q;

  if (type === "latest") {
    q = query(
      collection(db, "problems"),
      orderBy("createdAt", "desc"),
      limit(30),
    );
  } else if (type === "trending") {
    q = query(
      collection(db, "problems"),
      orderBy("upvoteCount", "desc"),
      limit(30),
    );
  } else {
    // match — filter on client side since Firestore array-contains-any has limits
    q = query(
      collection(db, "problems"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
  }

  const snap = await getDocs(q);
  const problems = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Problem);

  if (type === "match" && userSkills?.length) {
    return problems.filter((p) =>
      p.tags.some((tag) => userSkills.includes(tag)),
    );
  }
  return problems;
}

export async function getProblem(id: string): Promise<Problem | null> {
  const snap = await getDoc(doc(db, "problems", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Problem) : null;
}

export async function upvoteProblem(
  problemId: string,
  userId: string,
  hasUpvoted: boolean,
) {
  const ref = doc(db, "problems", problemId);
  await updateDoc(ref, {
    upvoteCount: increment(hasUpvoted ? -1 : 1),
    upvotedBy: hasUpvoted ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function markProblemSolved(
  problemId: string,
  solvedByUid: string,
  solvedByName: string,
) {
  await updateDoc(doc(db, "problems", problemId), {
    status: "solved",
    solvedByUid,
    solvedByName,
    updatedAt: serverTimestamp(),
  });
}

// ─── Replies ─────────────────────────────────────────────────────────────────

export async function createReply(
  data: Omit<
    Reply,
    "id" | "createdAt" | "upvoteCount" | "upvotedBy" | "isChosen"
  >,
) {
  const ref = await addDoc(
    collection(db, "problems", data.problemId, "replies"),
    {
      ...data,
      upvoteCount: 0,
      upvotedBy: [],
      isChosen: false,
      createdAt: serverTimestamp(),
    },
  );
  await updateDoc(doc(db, "problems", data.problemId), {
    replyCount: increment(1),
    status: "in-progress",
  });
  return ref.id;
}

export async function getReplies(problemId: string): Promise<Reply[]> {
  const snap = await getDocs(
    query(
      collection(db, "problems", problemId, "replies"),
      orderBy("createdAt", "asc"),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reply);
}

export async function upvoteReply(
  problemId: string,
  replyId: string,
  userId: string,
  hasUpvoted: boolean,
) {
  const ref = doc(db, "problems", problemId, "replies", replyId);
  await updateDoc(ref, {
    upvoteCount: increment(hasUpvoted ? -1 : 1),
    upvotedBy: hasUpvoted ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function setReplyChosen(problemId: string, replyId: string) {
  await updateDoc(doc(db, "problems", problemId, "replies", replyId), {
    isChosen: true,
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function createNotification(
  data: Omit<Notification, "id" | "createdAt" | "read">,
) {
  await addDoc(collection(db, "notifications"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function getNotifications(
  userId: string,
): Promise<Notification[]> {
  const snap = await getDocs(
    query(collection(db, "notifications"), where("userId", "==", userId)),
  );
  const notifs = snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Notification,
  );
  return notifs
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 20);
}

export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getTopHelpers(): Promise<UserProfile[]> {
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("reputation", "desc"), limit(10)),
  );
  return snap.docs.map((d) => d.data() as UserProfile);
}

// ─── Skill matching for notifications ────────────────────────────────────────

export async function getUsersWithSkills(
  skills: string[],
): Promise<UserProfile[]> {
  if (!skills.length) return [];
  const snap = await getDocs(
    query(
      collection(db, "users"),
      where("skills", "array-contains-any", skills),
    ),
  );
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => u.notifyOnSkillMatch);
}
