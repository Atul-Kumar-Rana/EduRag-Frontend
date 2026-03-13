import { getQuestions } from '@/api/generateApi';
import { fetchUploadedPDFs } from '@/api/uploadApi';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import type { Question } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SubjectInput } from '@/components/ui/SubjectInput';

function DiffBadge({ d }: { d: string }) {
  const c =
    {
      EASY: 'bg-success/20 text-success',
      MEDIUM: 'bg-warning/20 text-warning',
      HARD: 'bg-destructive/20 text-destructive',
    }[d] || 'bg-muted text-muted-foreground';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{d}</span>;
}

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
      <p className="text-xs text-muted-foreground mt-3">{q.subject} • {q.chapter}</p>
    </div>
  );
}

export default function QuestionsPage() {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [searchParams, setSearchParams] = useState<{
    subject?: string; chapter?: string; difficulty?: string; type?: string;
  }>({});

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions', searchParams],
    queryFn: () => getQuestions(searchParams.subject, searchParams.chapter, searchParams.difficulty, searchParams.type),
  });

  const handleSearch = () => setSearchParams({
    subject: subject || undefined,
    chapter: chapter || undefined,
    difficulty: difficulty || undefined,
    type: type || undefined,
  });

  const handleClear = () => {
    setSubject(''); setChapter(''); setDifficulty(''); setType('');
    setSearchParams({});
  };

  const mcqCount = questions.filter((q) => q.type === 'MCQ').length;

  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const pdfs = await fetchUploadedPDFs();
        setUploadedPDFs(pdfs);
      } catch {
        toast.error('Failed to fetch uploaded PDFs.');
      }
    };
    fetchPDFs();
  }, []);

  const [uploadedPDFs, setUploadedPDFs] = useState<string[]>([]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse all AI-generated questions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl border border-border bg-card">
        {/* Subject with autocomplete from uploaded docs */}
        <SubjectInput value={subject} onChange={setSubject} className="w-44" />

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
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center shadow-green">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Questions grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No questions found.</p>
          <p className="text-xs text-muted-foreground mt-1">Generate some from the Practice page!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {questions.map((q, i) => (
            <motion.div key={q.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <QBCard q={q} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}