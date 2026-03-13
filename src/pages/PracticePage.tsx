import { askQuestion } from '@/api/askApi';
import { generateQuestions } from '@/api/generateApi';
import { fetchUploadedPDFs, uploadDocumentAndGenerateQuestions } from '@/api/uploadApi';
import { Spinner } from '@/components/ui/Spinner';
import type { AskResponse, Difficulty, Question, QuestionType } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, Send, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'MIXED'];
const types: QuestionType[] = ['MCQ', 'SHORT_ANSWER', 'MIXED'];

function DifficultyBadge({ d }: { d: string }) {
  const c = { EASY: 'bg-success/20 text-success', MEDIUM: 'bg-warning/20 text-warning', HARD: 'bg-destructive/20 text-destructive' }[d] || 'bg-muted text-muted-foreground';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{d}</span>;
}

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl border border-border bg-card p-5 shadow-green"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono text-muted-foreground">Q{index + 1}</span>
        <DifficultyBadge d={q.difficulty} />
        <span className="px-2 py-0.5 rounded-full text-xs border border-border text-muted-foreground">{q.type}</span>
      </div>
      <p className="font-medium text-foreground mb-3">{q.questionText}</p>

      {q.type === 'MCQ' && q.options && (
        <div className="space-y-2 mb-3">
          {q.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setSelected(opt.label)}
              className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                showAnswer && opt.label === q.correctAnswer
                  ? 'border-success bg-success/10 text-success'
                  : selected === opt.label
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:bg-accent'
              }`}
            >
              <span className="font-medium mr-2">{opt.label}.</span>
              {opt.text}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="text-sm text-primary hover:text-primary-hover font-medium"
      >
        {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
      </button>

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 rounded-md bg-success/5 border border-success/20"
          >
            <p className="text-sm text-foreground">{q.correctAnswer}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 mt-3">
        <span className="text-xs text-muted-foreground">{q.subject}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{q.chapter}</span>
      </div>
    </motion.div>
  );
}

export default function PracticePage() {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const [numQ, setNumQ] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('MIXED');
  const [qType, setQType] = useState<QuestionType>('MCQ');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [genLoading, setGenLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || !subject.trim() || !chapter.trim()) return;
    setAskLoading(true);
    try {
      const res = await askQuestion(question, subject, chapter);
      setAnswer(res);
    } catch {
      toast.error('Failed to get answer. Check server connection.');
    } finally {
      setAskLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!subject.trim() || !chapter.trim()) return;
    setGenLoading(true);
    try {
      const res = await generateQuestions(subject, chapter, numQ, difficulty, qType);
      setQuestions(res.questions);
      toast.success('Questions generated successfully!');
    } catch {
      toast.error('Failed to generate questions.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleUploadAndGenerate = async (file: File, subject: string, chapter: string) => {
    try {
      const { uploadResponse, generatedQuestions } = await uploadDocumentAndGenerateQuestions(file, subject, chapter);
      toast.success('File uploaded and questions generated successfully!');
      console.log('Generated Questions:', generatedQuestions);
    } catch (error) {
      toast.error('Failed to upload file or generate questions.');
    }
  };

  const [uploadedPDFs, setUploadedPDFs] = useState<string[]>([]);

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

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Practice</h1>

      {/* Subject / Chapter */}
      <div className="flex gap-3">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="flex-1 px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="Chapter"
          className="flex-1 px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Ask */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-green space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Ask a Question</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleAsk}
          disabled={askLoading || !question.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 active:scale-[0.98]"
        >
          {askLoading ? <Spinner /> : <Send className="h-4 w-4" />}
          Get Answer
        </button>

        <AnimatePresence>
          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3"
            >
              <p className="text-sm font-medium text-primary">{answer.question}</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{answer.answer}</p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(answer.answer); toast.success('Copied!'); }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>

                {answer.relevantChunks.length > 0 && (
                  <button
                    onClick={() => setShowSources(!showSources)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {showSources ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    Sources ({answer.relevantChunks.length})
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showSources && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {answer.relevantChunks.map((chunk, i) => (
                      <div key={i} className="p-3 rounded-md bg-card border border-border text-xs text-muted-foreground">
                        {chunk}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Generate */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-green space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Generate Practice Questions
        </h2>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Count:</label>
            <input
              type="number"
              min={1}
              max={10}
              value={numQ}
              onChange={(e) => setNumQ(Number(e.target.value))}
              className="w-16 px-2 py-1.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-1.5">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  difficulty === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setQType(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  qType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={genLoading || !subject.trim() || !chapter.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 active:scale-[0.98]"
        >
          {genLoading ? <Spinner /> : <Sparkles className="h-4 w-4" />}
          Generate Questions
        </button>

        {questions.length > 0 && (
          <div className="space-y-4 mt-4">
            {questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
          </div>
        )}
      </section>

      <input
        list="pdf-suggestions"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        className="flex-1 px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <datalist id="pdf-suggestions">
        {uploadedPDFs.map((pdf) => (
          <option key={pdf} value={pdf} />
        ))}
      </datalist>

      <input type="file" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          handleUploadAndGenerate(file, subject, chapter);
        }
      }} />
    </div>
  );
}
