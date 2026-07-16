// =============================================================================
// DeepTrust-Edu — Evaluation Logic Helper
// Generates evaluation notes based on SABLE scores (hardcoded rules from PRD)
// =============================================================================

export interface EvaluationInput {
  score_verification: number;
  score_deepfake: number;
  score_financial: number;
}

/**
 * Generates an evaluation note string based on SABLE score thresholds.
 *
 * Rules (from PRD §Evaluation Note):
 * - score_verification < 60 → "Gagal memverifikasi legalitas/sumber."
 * - score_financial < 60    → "Tingkat kehati-hatian rendah, rentan FOMO."
 * - score_deepfake < 60     → "Gagal mendeteksi anomali visual/audio."
 * - All >= 60               → "Lulus evaluasi SABLE. Analisis tajam."
 */
export function generateEvaluationNote(input: EvaluationInput): string {
  const notes: string[] = [];

  if (input.score_verification < 60) {
    notes.push("Gagal memverifikasi legalitas/sumber.");
  }
  if (input.score_financial < 60) {
    notes.push("Tingkat kehati-hatian rendah, rentan FOMO.");
  }
  if (input.score_deepfake < 60) {
    notes.push("Gagal mendeteksi anomali visual/audio.");
  }

  if (notes.length === 0) {
    return "Lulus evaluasi SABLE. Analisis tajam.";
  }

  return notes.join(" | ");
}

/**
 * Normalizes a raw game score to 0-100 scale.
 *
 * The Ren'Py game sends small integer scores:
 * - Story A: max 2 per category (verification: 0-2, deepfake: 0-1, financial: -1 to 1)
 * - Story D: max 2 per category (verification: 0-2, deepfake: 0-2, financial: 0-2)
 *
 * We normalize using the provided maxScore for each category.
 */
export function normalizeScore(rawScore: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  const normalized = Math.round((Math.max(0, rawScore) / maxScore) * 100);
  return Math.min(100, Math.max(0, normalized));
}

/**
 * Score normalization configs per story mode.
 */
export const SCORE_MAX: Record<string, { verification: number; deepfake: number; financial: number }> = {
  "Story A": { verification: 2, deepfake: 1, financial: 1 },
  "Story D": { verification: 2, deepfake: 2, financial: 2 },
};
