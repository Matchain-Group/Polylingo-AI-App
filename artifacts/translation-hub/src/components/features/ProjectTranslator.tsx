import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Plus, Trash2, Download, Loader2, FileStack, Check, X, UploadCloud } from "lucide-react";
import { useListLanguages } from "@workspace/api-client-react";
import { SelectBox } from "@/components/ui/SelectBox";
import { toast } from "sonner";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

interface ProjectFile {
  filename: string;
  content: string;
}

interface TranslatedFile {
  filename: string;
  originalContent: string;
  translatedContent: string;
}

export function ProjectTranslator() {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [results, setResults] = useState<TranslatedFile[]>([]);
  const [targetLang, setTargetLang] = useState("es");
  const [sourceLang, setSourceLang] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: languages } = useListLanguages();

  const langOptions = [
    { value: "auto", label: "Auto Detect" },
    ...(languages?.map(l => ({ value: l.code, label: l.name })) ?? [])
  ];
  const targetLangOptions = languages?.map(l => ({ value: l.code, label: l.name })) ?? [
    { value: "es", label: "Spanish" }, { value: "fr", label: "French" },
  ];

  const onDrop = useCallback((accepted: File[]) => {
    const textTypes = ["text/plain", "text/html", "text/css", "application/javascript", "application/json", "text/markdown", "text/csv"];
    const textExtensions = [".txt", ".md", ".json", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".csv", ".xml", ".yaml", ".yml", ".py", ".java", ".cs", ".go", ".rs", ".php", ".rb", ".swift", ".kt", ".vue"];
    const validFiles = accepted.filter(f =>
      textTypes.some(t => f.type.startsWith(t)) ||
      textExtensions.some(ext => f.name.toLowerCase().endsWith(ext)) ||
      f.type === ""
    );
    if (validFiles.length !== accepted.length) toast.warning("Some files were skipped (only text files supported)");
    validFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        setFiles(prev => {
          if (prev.some(p => p.filename === f.name)) return prev;
          return [...prev, { filename: f.name, content: reader.result as string }];
        });
      };
      reader.readAsText(f);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: files.length > 0,
  });

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const addManual = () => {
    if (!newFilename.trim() || !newContent.trim()) { toast.error("Filename and content required"); return; }
    setFiles(prev => [...prev, { filename: newFilename.trim(), content: newContent }]);
    setNewFilename("");
    setNewContent("");
    setShowAddForm(false);
  };

  const handleTranslate = async () => {
    if (!files.length) { toast.error("Add at least one file"); return; }
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API}/translate/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang === "auto" ? undefined : sourceLang,
        }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json() as { files: TranslatedFile[] };
      setResults(data.files);
      setSelectedResult(0);
      toast.success(`Translated ${data.files.length} file${data.files.length !== 1 ? "s" : ""}!`);
    } catch {
      toast.error("Project translation failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (file: TranslatedFile) => {
    const blob = new Blob([file.translatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated_${file.filename}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => results.forEach(downloadFile);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <SelectBox label="Source Language" value={sourceLang} onChange={e => setSourceLang(e.target.value)} options={langOptions} />
        <SelectBox label="Translate To" value={targetLang} onChange={e => setTargetLang(e.target.value)} options={targetLangOptions} />
      </div>

      <div {...getRootProps()} className={`glass-panel rounded-2xl border-2 border-dashed p-6 transition-all duration-300 ${isDragActive ? "border-primary bg-primary/5" : "border-foreground/20 hover:border-primary/40"}`}>
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground">Drop text files here</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Supports .txt, .md, .json, .js, .ts, .html, .css and more</p>
            <button
              onClick={e => { e.stopPropagation(); setShowAddForm(v => !v); }}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add text manually
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">{files.length} file{files.length !== 1 ? "s" : ""}</span>
                <span className="text-xs text-muted-foreground">— drag more or</span>
                <button
                  onClick={e => { e.stopPropagation(); setShowAddForm(v => !v); }}
                  type="button"
                  className="text-xs text-primary hover:underline"
                >add manually</button>
              </div>
            </div>
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 group">
                <div className="flex items-center gap-3 min-w-0">
                  <FileStack className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{f.filename}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{(f.content.length / 1024).toFixed(1)} KB</span>
                </div>
                <button onClick={() => removeFile(i)} className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-panel rounded-2xl p-6 space-y-4">
            <h4 className="font-semibold text-foreground">Add file manually</h4>
            <input
              type="text"
              value={newFilename}
              onChange={e => setNewFilename(e.target.value)}
              placeholder="filename.txt"
              className="auth-input w-full"
            />
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Paste your text content here..."
              className="auth-input w-full h-32 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddForm(false)} className="auth-btn-ghost flex-1 flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={addManual} className="auth-btn flex-1 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Add File
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {files.length > 0 && (
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="w-full auth-btn py-4 flex items-center justify-center gap-2 text-base"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileStack className="w-5 h-5" />}
          {loading ? `Translating ${files.length} file${files.length !== 1 ? "s" : ""}...` : `Translate Project (${files.length} file${files.length !== 1 ? "s" : ""})`}
        </button>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-foreground">Results</h3>
              <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> Download All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {results.map((f, i) => (
                <button key={i} onClick={() => setSelectedResult(i)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedResult === i ? "bg-primary text-white" : "bg-foreground/5 text-foreground hover:bg-foreground/10"}`}>
                  {f.filename}
                </button>
              ))}
            </div>
            {results[selectedResult] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel rounded-2xl p-5">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">Original</h4>
                  <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono overflow-auto max-h-80">{results[selectedResult].originalContent}</pre>
                </div>
                <div className="glass-panel rounded-2xl p-5 border-primary/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">Translated</h4>
                    <button onClick={() => downloadFile(results[selectedResult])} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-mono overflow-auto max-h-80">{results[selectedResult].translatedContent}</pre>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
