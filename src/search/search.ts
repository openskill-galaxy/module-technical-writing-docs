import Fuse from "fuse.js";
import type {
  Course,
  Lesson,
  KnowledgePoint,
  Question,
  Case,
  LearningRoute,
  FaqItem,
  GlossaryTerm,
  SearchResult,
} from "../types";

export interface SearchSource {
  courses: Course[];
  lessons: Lesson[];
  knowledgePoints: KnowledgePoint[];
  questions: Question[];
  cases: Case[];
  routes: LearningRoute[];
  faqs: FaqItem[];
  glossary: GlossaryTerm[];
}

interface IndexEntry {
  type: SearchResult["type"];
  id: string;
  title: string;
  summary: string;
  url: string;
  tags: string[];
}

export function buildSearchEntries(src: SearchSource): IndexEntry[] {
  const courses: IndexEntry[] = src.courses.map((c) => ({
    type: "course",
    id: c.id,
    title: c.title,
    summary: c.summary,
    url: `/courses/${c.slug}`,
    tags: c.tags,
  }));
  const lessons: IndexEntry[] = src.lessons.map((l) => ({
    type: "lesson",
    id: l.id,
    title: l.title,
    summary: l.summary,
    url: `/lessons/${l.slug}`,
    tags: [],
  }));
  const kps: IndexEntry[] = src.knowledgePoints.map((k) => ({
    type: "knowledge",
    id: k.id,
    title: k.title,
    summary: k.summary,
    url: `/knowledge/${k.slug}`,
    tags: k.tags,
  }));
  const questions: IndexEntry[] = src.questions.map((q) => ({
    type: "question",
    id: q.id,
    title: q.stem.length > 60 ? q.stem.slice(0, 60) + "…" : q.stem,
    summary: (q.explanation || q.analysis || "").slice(0, 120),
    url: `/questions/${q.slug}`,
    tags: q.tags,
  }));
  const cases: IndexEntry[] = src.cases.map((c) => ({
    type: "case",
    id: c.id,
    title: c.title,
    summary: c.summary,
    url: `/cases/${c.slug}`,
    tags: c.tags,
  }));
  const routes: IndexEntry[] = src.routes.map((r) => ({
    type: "route",
    id: r.id,
    title: r.title,
    summary: r.summary,
    url: `/routes#${r.slug}`,
    tags: [],
  }));
  const faqs: IndexEntry[] = src.faqs.map((f) => ({
    type: "faq",
    id: f.id,
    title: f.question,
    summary: f.answer.slice(0, 120),
    url: `/faq#${f.id}`,
    tags: [],
  }));
  const glossary: IndexEntry[] = src.glossary.map((g) => ({
    type: "glossary",
    id: g.id,
    title: g.term,
    summary: g.definition,
    url: `/knowledge#glossary-${g.id}`,
    tags: [],
  }));
  return [...courses, ...lessons, ...kps, ...questions, ...cases, ...routes, ...faqs, ...glossary];
}

export function createFuse(entries: IndexEntry[]): Fuse<IndexEntry> {
  return new Fuse(entries, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "summary", weight: 0.3 },
      { name: "tags", weight: 0.1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });
}

export function runSearch(
  fuse: Fuse<IndexEntry>,
  query: string,
  limit = 30
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  return fuse
    .search(q, { limit })
    .map((r) => ({
      type: r.item.type,
      id: r.item.id,
      title: r.item.title,
      summary: r.item.summary,
      url: r.item.url,
      tags: r.item.tags,
    }));
}

export const typeLabel: Record<SearchResult["type"], string> = {
  course: "课程",
  lesson: "讲义",
  knowledge: "知识点",
  question: "题目",
  case: "案例",
  route: "路线",
  faq: "FAQ",
  glossary: "术语",
};
