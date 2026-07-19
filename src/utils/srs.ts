export interface SRSItem {
  id: string;
  interval: number; // in days
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string; // ISO date string
  lastReviewedAt?: string;
}

export function calculateSM2(
  quality: number, // 0 - 5
  prevInterval = 0,
  prevRepetitions = 0,
  prevEaseFactor = 2.5
): SRSItem {
  let interval = 1;
  let repetitions = prevRepetitions;
  let easeFactor = prevEaseFactor;

  if (quality >= 3) {
    if (prevRepetitions === 0) {
      interval = 1;
    } else if (prevRepetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * prevEaseFactor);
    }
    repetitions = prevRepetitions + 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Update Ease Factor
  easeFactor = prevEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    id: "",
    interval,
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewDate: nextDate.toISOString(),
    lastReviewedAt: new Date().toISOString(),
  };
}

export function isItemDueForReview(nextReviewDate?: string): boolean {
  if (!nextReviewDate) return true; // Never reviewed or default due
  return new Date(nextReviewDate).getTime() <= new Date().getTime();
}
