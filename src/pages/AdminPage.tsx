import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, Trash2, FileText, RefreshCw } from 'lucide-react';
import { uploadDocument, getAllDocuments, deleteDocument, getDocumentStatus, uploadDocumentAndGenerateQuestions } from '@/api/uploadApi';
import { Spinner } from '@/components/ui/Spinner';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Document } from '@/types';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: Document['status'] }) {
  const styles = {
    PROCESSING: 'bg-warning/20 text-warning animate-status-pulse',
    READY: 'bg-success/20 text-success',
    FAILED: 'bg-destructive/20 text-destructive',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
  localStorage.getItem("admin-auth") === "true"
);

const [passwordInput, setPasswordInput] = useState("");

const ADMIN_PASSWORD = "admin123";

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getAllDocuments(),
    refetchInterval: 15000,
  });

  const handleAdminLogin = () => {
  if (passwordInput === ADMIN_PASSWORD) {
    setIsAuthenticated(true);
    localStorage.setItem("admin-auth", "true");
    toast.success("Admin access granted");
  } else {
    toast.error("Wrong password");
  }
};
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const { uploadResponse, generatedQuestions } = await uploadDocumentAndGenerateQuestions(file!, subject, chapter);
      setUploadedId(uploadResponse.documentId);
      toast.success('Document uploaded and questions generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] }); // Refresh questions in Question Bank
      setFile(null);
    },
    onError: () => toast.error('Upload failed. Is the server running?'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => toast.error('Delete failed'),
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const canSubmit = file && subject.trim() && chapter.trim() && !uploadMutation.isPending;

  if (!isAuthenticated) {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-xl p-6 w-80 space-y-4 shadow-lg">

        <h2 className="text-lg font-semibold text-center text-foreground">
          Admin Login
        </h2>

        <input
          type="password"
          placeholder="Enter admin password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          onClick={handleAdminLogin}
          className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover"
        >
          Login
        </button>

      </div>
    </div>
  );
}
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

  <button
    onClick={() => {
      localStorage.removeItem("admin-auth");
      setIsAuthenticated(false);
    }}
    className="px-3 py-1 text-sm bg-destructive text-white rounded-md"
  >
    Logout
  </button>
</div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Upload form */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-green">
            <h2 className="text-lg font-semibold text-foreground mb-1">Upload Study Material</h2>
            <p className="text-sm text-muted-foreground mb-5">Supported formats: PDF, DOCX, PPTX, TXT</p>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input')?.click()}
              className="border-2 border-dashed border-primary/40 rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto text-primary mb-3" />
              {file ? (
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Drag & drop or click to browse</p>
              )}
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.pptx,.txt"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Cloud Computing"
                className="px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Introduction"
                className="px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              disabled={!canSubmit}
              onClick={() => uploadMutation.mutate()}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              {uploadMutation.isPending ? <Spinner /> : <Upload className="h-4 w-4" />}
              Upload & Process
            </button>
          </div>

          <AnimatePresence>
            {uploadedId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-success/30 bg-success/10 p-5 flex items-center gap-3"
              >
                <CheckCircle className="h-6 w-6 text-success" />
                <div>
                  <p className="font-medium text-foreground">Upload successful!</p>
                  <p className="text-xs text-muted-foreground font-mono">ID: {uploadedId}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Documents list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Uploaded Documents</h2>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No documents yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload your first PDF!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {documents.map((doc) => (
                <motion.div
                  key={doc.documentId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-border bg-card p-4 shadow-green hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-foreground text-sm truncate flex-1">{doc.fileName}</p>
                    <button
                      onClick={() => deleteMutation.mutate(doc.documentId)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors ml-2"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary font-medium">{doc.subject}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs border border-border text-muted-foreground">{doc.chapter}</span>
                    <StatusBadge status={doc.status} />
                  </div>
                  {doc.totalChunks > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">{doc.totalChunks} chunks</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
