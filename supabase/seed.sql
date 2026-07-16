-- Reset data terlebih dahulu sebelum melakukan seed ulang
TRUNCATE TABLE students_evaluation;

INSERT INTO students_evaluation (student_name, story_mode, score_verification, score_deepfake, score_financial, evaluation_note, created_at) VALUES
(
  'Aisyah Putri',
  'Story D',
  85,
  90,
  88,
  'Lulus evaluasi SABLE. Analisis tajam.',
  now() - interval '2 hours'
),
(
  'Budi Hartono',
  'Story A',
  72,
  65,
  30,
  'Tingkat kehati-hatian rendah, rentan FOMO.',
  now() - interval '1 hour 30 minutes'
),
(
  'Citra Dewi',
  'Story D',
  40,
  75,
  70,
  'Gagal memverifikasi legalitas/sumber.',
  now() - interval '1 hour'
),
(
  'Dimas Pratama',
  'Story A',
  55,
  50,
  58,
  'Gagal memverifikasi legalitas/sumber. | Tingkat kehati-hatian rendah, rentan FOMO. | Gagal mendeteksi anomali visual/audio.',
  now() - interval '30 minutes'
);
