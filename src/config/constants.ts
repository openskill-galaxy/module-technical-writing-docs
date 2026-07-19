export const PLATFORM_CONFIG = {
  name: "OpenSkill Galaxy",
  version: "1.2.0",
  portalUrl: "https://openskill-galaxy.github.io/",
  license: "MIT",
  author: "OpenSkill Community",
};

export const STORAGE_KEYS = {
  THEME: "theme",
  SOUND_MUTED: "openskill-sound-muted",
  ACTIVE_DATES: "openskill-active-dates",
  APPWRITE_CONFIG: "openskill-appwrite-config",
  BACKUP_PREFIX: "openskill-",
  NOTE_PREFIX: "openskill-note-",
};

export const DEFAULT_APPWRITE = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "openskill_galaxy",
  databaseId: "openskill_db",
  collectionId: "user_progress",
};

export const DIFFICULTY_COLORS = {
  easy: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  hard: "text-rose-300 bg-rose-500/10 border-rose-500/20",
};
