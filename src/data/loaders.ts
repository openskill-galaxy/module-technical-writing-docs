/// <reference types="vite/client" />

import type {
  ModuleMeta,
  Course,
  Lesson,
  KnowledgePoint,
  Question,
  Exam,
  Case,
  LearningRoute,
  Tag,
  GlossaryTerm,
  FaqItem,
} from "../types";

const BASE = import.meta.env.BASE_URL || "/module-template/";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function loadModule(): Promise<ModuleMeta> {
  return fetchJson<ModuleMeta>("data/module.json");
}

export async function loadCourses(): Promise<Course[]> {
  return fetchJson<Course[]>("data/courses.json");
}

export async function loadLessons(): Promise<Lesson[]> {
  return fetchJson<Lesson[]>("data/lessons.json");
}

export async function loadKnowledgePoints(): Promise<KnowledgePoint[]> {
  return fetchJson<KnowledgePoint[]>("data/knowledge-points.json");
}

export async function loadQuestions(): Promise<Question[]> {
  return fetchJson<Question[]>("data/questions.json");
}

export async function loadExams(): Promise<Exam[]> {
  return fetchJson<Exam[]>("data/exams.json");
}

export async function loadCases(): Promise<Case[]> {
  return fetchJson<Case[]>("data/cases.json");
}

export async function loadRoutes(): Promise<LearningRoute[]> {
  return fetchJson<LearningRoute[]>("data/routes.json");
}

export async function loadTags(): Promise<Tag[]> {
  return fetchJson<Tag[]>("data/tags.json");
}

export async function loadGlossary(): Promise<GlossaryTerm[]> {
  return fetchJson<GlossaryTerm[]>("data/glossary.json");
}

export async function loadFaqs(): Promise<FaqItem[]> {
  return fetchJson<FaqItem[]>("data/faqs.json");
}

export interface ModuleData {
  module: ModuleMeta;
  courses: Course[];
  lessons: Lesson[];
  knowledgePoints: KnowledgePoint[];
  questions: Question[];
  exams: Exam[];
  cases: Case[];
  routes: LearningRoute[];
  tags: Tag[];
  glossary: GlossaryTerm[];
  faqs: FaqItem[];
}

export async function loadAll(): Promise<ModuleData> {
  const [
    module,
    courses,
    lessons,
    knowledgePoints,
    questions,
    exams,
    cases,
    routes,
    tags,
    glossary,
    faqs,
  ] = await Promise.all([
    loadModule(),
    loadCourses(),
    loadLessons(),
    loadKnowledgePoints(),
    loadQuestions(),
    loadExams(),
    loadCases(),
    loadRoutes(),
    loadTags(),
    loadGlossary(),
    loadFaqs(),
  ]);
  return {
    module,
    courses,
    lessons,
    knowledgePoints,
    questions,
    exams,
    cases,
    routes,
    tags,
    glossary,
    faqs,
  };
}
