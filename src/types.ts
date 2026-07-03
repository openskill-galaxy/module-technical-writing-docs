// =============== 模块元数据 ===============
export interface ModuleMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  version: string;
  license: string;
  authors: string[];
  tags: string[];
  estimatedHours: number;
  difficulty: Difficulty;
  updatedAt: string;
  coverEmoji: string;
  repoUrl?: string;
  portalUrl?: string;
}

export type Difficulty = "easy" | "medium" | "hard";

// =============== 课程 ===============
export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  tags: string[];
  estimatedHours: number;
  lessons: string[]; // lesson ids in order
  order: number;
}

// =============== 课程章节讲义 ===============
export interface Lesson {
  id: string;
  slug: string;
  courseId: string;
  title: string;
  summary: string;
  order: number;
  contentMarkdown: string;
  knowledgePoints: string[]; // kp ids
  estimatedMinutes: number;
}

// =============== 知识点 ===============
export interface KnowledgePoint {
  id: string;
  slug: string;
  title: string;
  summary: string;
  courseId?: string;
  tags: string[];
  difficulty: Difficulty;
  contentMarkdown: string;
  relatedQuestions: string[];
  relatedCases: string[];
  glossary: string[]; // glossary term ids
}

// =============== 题目 ===============
export type QuestionType = "single" | "multiple" | "judge" | "short";

export interface QuestionOption {
  key: string; // "A" "B" ...
  text: string;
}

export interface Question {
  id: string;
  slug: string;
  type: QuestionType;
  difficulty: Difficulty;
  tags: string[];
  stem: string;
  options: QuestionOption[];
  answer: string[]; // option keys, or short answer text
  analysis: string; // markdown
  knowledgePoints: string[];
  estimatedMinutes: number;
}

// =============== 模拟考试 ===============
export interface Exam {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  questionIds: string[];
  timeLimitMinutes: number;
  passingScore: number; // 0-100
}

// =============== 案例训练 ===============
export interface Case {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  tags: string[];
  backgroundMarkdown: string;
  tasksMarkdown: string;
  referenceMarkdown: string;
  knowledgePoints: string[];
  estimatedMinutes: number;
}

// =============== 学习路线 ===============
export interface LearningRoute {
  id: string;
  slug: string;
  title: string;
  summary: string;
  steps: LearningRouteStep[];
}

export interface LearningRouteStep {
  order: number;
  title: string;
  description: string;
  courseId?: string;
  lessonId?: string;
  knowledgePointId?: string;
}

// =============== 标签 ===============
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// =============== 术语表 ===============
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  aliases?: string[];
}

// =============== FAQ ===============
export interface FaqItem {
  id: string;
  question: string;
  answer: string; // markdown
  category: string;
}

// =============== 搜索结果 ===============
export interface SearchResult {
  type:
    | "course"
    | "lesson"
    | "knowledge"
    | "question"
    | "case"
    | "route"
    | "faq"
    | "glossary";
  id: string;
  title: string;
  summary: string;
  url: string;
  tags?: string[];
}

// =============== localStorage 进度模型 ===============
export interface ProgressRecord {
  lessonId: string;
  status: "not-started" | "in-progress" | "completed";
  updatedAt: string;
}

export interface FavoriteRecord {
  type: "lesson" | "knowledge" | "question" | "case";
  id: string;
  addedAt: string;
}

export interface WrongQuestionRecord {
  questionId: string;
  wrongCount: number;
  lastAnswer: string[];
  lastAt: string;
}

export interface ExamRecord {
  examId: string;
  startedAt: string;
  finishedAt: string;
  score: number; // 0-100
  passed: boolean;
  durationSeconds: number;
  details: ExamDetailItem[];
}

export interface ExamDetailItem {
  questionId: string;
  userAnswer: string[];
  correct: boolean;
}
