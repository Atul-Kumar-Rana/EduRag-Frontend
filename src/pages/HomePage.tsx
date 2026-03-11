import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Target, Bot, BookOpen, FileText, Sparkles, ArrowRight } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: Upload,
    title: 'Upload Materials',
    description: 'Upload PDFs and let AI process them automatically',
    link: '/admin',
    cta: 'Go to Admin',
  },
  {
    icon: Target,
    title: 'Practice & Learn',
    description: 'Ask questions and get AI answers from your own material',
    link: '/practice',
    cta: 'Start Practice',
  },
  {
    icon: Bot,
    title: 'AI Doubt Solver',
    description: 'Chat with AI to clear your doubts instantly',
    link: '/chatbot',
    cta: 'Ask Now',
  },
];

const steps = [
  { icon: FileText, label: 'Upload PDF' },
  { icon: Sparkles, label: 'AI Processes' },
  { icon: BookOpen, label: 'Learn & Practice' },
];

export default function HomePage() {
  return (
    <div className="px-4 py-10 md:px-8 lg:px-16 max-w-6xl mx-auto space-y-20">
      {/* Hero */}
      <motion.section
        className="text-center space-y-6 pt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-shimmer">
          EduRAG
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
          AI-Powered Study Platform
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors active:scale-[0.98]"
          >
            Start Practicing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors active:scale-[0.98]"
          >
            Upload Material
          </Link>
        </div>
      </motion.section>

      {/* Feature cards */}
      <motion.section
        className="grid md:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {features.map((f) => (
          <motion.div key={f.title} variants={fadeUp}>
            <Link
              to={f.link}
              className="group block rounded-xl border border-border bg-card p-6 shadow-green hover:-translate-y-1 hover:shadow-green-lg transition-all duration-300"
            >
              <f.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{f.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-primary-hover transition-colors">
                {f.cta} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      {/* How it works */}
      <motion.section
        className="text-center space-y-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4 md:gap-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
