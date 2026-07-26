import { create } from "zustand";
import type {
  ProgressRecord,
  FavoriteRecord,
  WrongQuestionRecord,
  ExamRecord,
  Lesson,
} from "../types";
import { readJson, writeJson, nowIso, clearAll } from "../utils/storage";
import { calculateSM2 } from "../utils/srs";

interface ProgressState {
  progress: Record<string, ProgressRecord>;
  favorites: FavoriteRecord[];
  wrongs: Record<string, WrongQuestionRecord>;
  exams: ExamRecord[];

  setLessonStatus: (lessonId: string, status: ProgressRecord["status"]) => void;
  getLessonStatus: (lessonId: string) => ProgressRecord["status"];

  toggleFavorite: (rec: Omit<FavoriteRecord, "addedAt">) => void;
  isFavorite: (type: FavoriteRecord["type"], id: string) => boolean;

  recordAnswer: (questionId: string, userAnswer: string[], correct: boolean) => void;
  clearWrong: (questionId: string) => void;
  clearAllWrongs: () => void;

  addExam: (rec: ExamRecord) => void;

  resetAll: () => void;
  hydrate: () => void;
}

const EMPTY: ProgressState = {
  progress: {},
  favorites: [],
  wrongs: {},
  exams: [],
  setLessonStatus: () => {},
  getLessonStatus: () => "not-started",
  toggleFavorite: () => {},
  isFavorite: () => false,
  recordAnswer: () => {},
  clearWrong: () => {},
  clearAllWrongs: () => {},
  addExam: () => {},
  resetAll: () => {},
  hydrate: () => {},
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...EMPTY,

  hydrate: () => {
    set({
      progress: readJson<Record<string, ProgressRecord>>("progress", {}),
      favorites: readJson<FavoriteRecord[]>("favorites", []),
      wrongs: readJson<Record<string, WrongQuestionRecord>>("wrongs", {}),
      exams: readJson<ExamRecord[]>("exams", []),
    });
  },

  setLessonStatus: (lessonId, status) => {
    const progress = {
      ...get().progress,
      [lessonId]: { lessonId, status, updatedAt: nowIso() },
    };
    set({ progress });
    writeJson("progress", progress);
  },

  getLessonStatus: (lessonId) => {
    return get().progress[lessonId]?.status || "not-started";
  },

  toggleFavorite: (rec) => {
    const favorites = [...get().favorites];
    const idx = favorites.findIndex(
      (f) => f.type === rec.type && f.id === rec.id
    );
    if (idx >= 0) {
      favorites.splice(idx, 1);
    } else {
      favorites.push({ ...rec, addedAt: nowIso() });
    }
    set({ favorites });
    writeJson("favorites", favorites);
  },

  isFavorite: (type, id) => {
    return get().favorites.some((f) => f.type === type && f.id === id);
  },

  recordAnswer: (questionId, userAnswer, correct) => {
    const wrongs = { ...get().wrongs };
    const prev = wrongs[questionId];
    if (correct) {
      if (prev) {
        // 答对：SM-2 推进复习间隔；连续答对达 3 次视为掌握，移出错题本
        const sm2 = calculateSM2(
          4,
          prev.interval ?? 0,
          prev.repetitions ?? 0,
          prev.easeFactor ?? 2.5
        );
        if (sm2.repetitions >= 3) {
          delete wrongs[questionId];
        } else {
          wrongs[questionId] = {
            ...prev,
            lastAnswer: userAnswer,
            lastAt: nowIso(),
            interval: sm2.interval,
            repetitions: sm2.repetitions,
            easeFactor: sm2.easeFactor,
            nextReviewDate: sm2.nextReviewDate,
          };
        }
      }
      set({ wrongs });
      writeJson("wrongs", wrongs);
      return;
    }
    // 答错：重置重复次数，间隔回到 1 天
    const sm2 = calculateSM2(1, prev?.interval ?? 0, 0, prev?.easeFactor ?? 2.5);
    wrongs[questionId] = {
      questionId,
      wrongCount: (prev?.wrongCount || 0) + 1,
      lastAnswer: userAnswer,
      lastAt: nowIso(),
      interval: sm2.interval,
      repetitions: sm2.repetitions,
      easeFactor: sm2.easeFactor,
      nextReviewDate: sm2.nextReviewDate,
    };
    set({ wrongs });
    writeJson("wrongs", wrongs);
  },

  clearWrong: (questionId) => {
    const wrongs = { ...get().wrongs };
    if (wrongs[questionId]) delete wrongs[questionId];
    set({ wrongs });
    writeJson("wrongs", wrongs);
  },

  clearAllWrongs: () => {
    set({ wrongs: {} });
    writeJson("wrongs", {});
  },

  addExam: (rec) => {
    const exams = [rec, ...get().exams];
    set({ exams });
    writeJson("exams", exams);
  },

  resetAll: () => {
    clearAll();
    set({
      progress: {},
      favorites: [],
      wrongs: {},
      exams: [],
    });
  },
}));

// 计算课程进度（已完成讲义数 / 总讲义数）
export function courseProgress(
  course: { lessons: string[] },
  progress: Record<string, ProgressRecord>
): { completed: number; total: number; percent: number } {
  const total = course.lessons.length;
  const completed = course.lessons.filter(
    (lid) => progress[lid]?.status === "completed"
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

// 全局讲义进度
export function lessonsOverall(
  lessons: Lesson[],
  progress: Record<string, ProgressRecord>
): { completed: number; total: number; percent: number } {
  const total = lessons.length;
  const completed = lessons.filter(
    (l) => progress[l.id]?.status === "completed"
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}
