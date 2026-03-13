import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Flame, ChevronDown } from 'lucide-react';
import { getQuestions } from '@/api/generateApi';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useQuery } from '@tanstack/react-query';
import type { Question } from '@/types';

// ── helper to fetch distinct subjects ──────────────────────────────────────
async function getSubjects(): Promise<string[]> {
  // Reuse the same questions endpoint with no filters and extract unique subjects.
  // If your backend exposes a dedicated /subjects endpoint, replace this call.
  const all = await getQuestions(undefined, undefined, undefined, undefined);
  return Array.from(new Set((all as Question[]).map((q) => q.subject).filter(Boolean))).sort();
}

// ── DiffBadge ───────────────────────────────────────────────────────────────
function DiffBadge({ d }: { d: string }) {
  const c =
    {
      EASY: 'bg-success/20 text-success',
      MEDIUM: 'bg-warning/20 text-warning',
      HARD: 'bg-destructive/20 text-destructive',
    }[d] || 'bg-muted text-muted-foreground';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{d}</span>
  );
}

// ── SubjectDropdown ─────────────────────────────────────────────────────────
function SubjectDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });

  const handleSelect = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  return (
    <div className="relative w-44">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || 'Subject'}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden"
          >
            {/* Clear / All option */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-accent ${
                value === '' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              All Subjects
            </button>

            {isLoading ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">Loading…</div>
            ) : subjects.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">No subjects found</div>
            ) : (
              <div className="max-h-52 overflow-y-auto">
                {subjects.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-accent ${
                      value === s ? 'text-primary font-medium bg-primary/5' : 'text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-outside overlay */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

// ── QBCard ──────────────────────────────────────────────────────────────────
function QBCard({ q }: { q: Question }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-green hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <DiffBadge d={q.difficulty} />
        <span className="px-2 py-0.5 rounded-full text-xs border border-border text-muted-foreground">
          {q.type}
        </span>
        {q.repeatCount && q.repeatCount > 0 && (
          <span className="ml-auto text-xs text-warning flex items-center gap-1">
            <Flame className="h-3 w-3" /> Asked {q.repeatCount}x
          </span>
        )}
      </div>

      <p className="font-medium text-foreground mb-3">{q.questionText}</p>

      {q.type === 'MCQ' && q.options && (
        <div className="space-y-1.5 mb-3">
          {q.options.map((opt) => (
            <div
              key={opt.label}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                showAnswer && opt.label === q.correctAnswer
                  ? 'border-success bg-success/10 text-success'
                  : 'border-border text-foreground'
              }`}
            >
              <span className="font-medium mr-2">{opt.label}.</span>
              {opt.text}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="text-sm text-primary hover:text-primary-hover font-medium"
      >
        {showAnswer ? 'Hide Answer' : 'View Answer'}
      </button>

      <AnimatePresence>
        {showAnswer && q.type !== 'MCQ' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 rounded-md bg-success/5 border border-success/20 text-sm text-foreground"
          >
            {q.correctAnswer}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground mt-3">
        {q.subject} • {q.chapter}
      </p>
    </div>
  );
}

// ── QuestionsPage ────────────────────────────────────────────────────────────
export default function QuestionsPage() {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [searchParams, setSearchParams] = useState<{
    subject?: string;
    chapter?: string;
    difficulty?: string;
    type?: string;
  }>({});

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions', searchParams],
    queryFn: () =>
      getQuestions(
        searchParams.subject,
        searchParams.chapter,
        searchParams.difficulty,
        searchParams.type,
      ),
  });

  const handleSearch = () => {
    setSearchParams({
      subject: subject || undefined,
      chapter: chapter || undefined,
      difficulty: difficulty || undefined,
      type: type || undefined,
    });
  };

  const handleClear = () => {
    setSubject('');
    setChapter('');
    setDifficulty('');
    setType('');
    setSearchParams({});
  };

  const mcqCount = questions.filter((q) => q.type === 'MCQ').length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse all AI-generated questions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl border border-border bg-card">
        {/* ← Subject is now a custom dropdown */}
        <SubjectDropdown value={subject} onChange={setSubject} />

        <input
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="Chapter"
          className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-40"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Types</option>
          <option value="MCQ">MCQ</option>
          <option value="SHORT_ANSWER">Short Answer</option>
          <option value="DESCRIPTIVE">Descriptive</option>
        </select>
        <button
          onClick={handleSearch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors active:scale-[0.98]"
        >
          <Search className="h-4 w-4" /> Search
        </button>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors active:scale-[0.98]"
        >
          <X className="h-4 w-4" /> Clear
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Questions', value: questions.length },
          { label: 'MCQ Count', value: mcqCount },
          { label: 'Other Types', value: questions.length - mcqCount },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 text-center shadow-green"
          >
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Questions grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No questions found.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Generate some from the Practice page!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {questions.map((q, i) => (
            <motion.div
              key={q.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <QBCard q={q} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}