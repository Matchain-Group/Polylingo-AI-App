import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, UploadCloud, Download, Loader2, FileCheck2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { useTranslatePdf, useListLanguages } from "@workspace/api-client-react";
import { SelectBox } from "@/components/ui/SelectBox";
import { toast } from "sonner";

// Set worker source for PDF.js safely using cdn
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function PdfTranslator() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [targetLang, setTargetLang] = useState("es");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  
  const { data: languages } = useListLanguages();
  const translatePdfMutation = useTranslatePdf();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setOriginalText("");
      setTranslatedText("");
      
      // Client side preview logic
      try {
        const arrayBuffer = await selected.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPageCount(pdf.numPages);
      } catch (err) {
        console.error("Failed to read PDF preview", err);
      }
    } else {
      toast.error("Please upload a valid PDF file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1
  });

  const handleTranslate = async () => {
    if (!file) return;
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        
        const result = await translatePdfMutation.mutateAsync({
          data: {
            pdfBase64: base64,
            targetLanguage: targetLang
          }
        });
        
        setOriginalText(result.originalText);
        setTranslatedText(result.translatedText);
        toast.success("PDF translation complete!");
      };
    } catch (err) {
      toast.error("Translation failed. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated_${file?.name || "document"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const targetLangOptions = languages?.map(l => ({ value: l.code, label: `${l.name} (${l.nativeName})` })) || [
    { value: "es", label: "Spanish" }, { value: "fr", label: "French" }, { value: "zh", label: "Chinese" }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/3">
          <SelectBox 
            label="Translate to" 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            options={targetLangOptions}
          />
        </div>
        <div className="w-full md:w-2/3">
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/50 hover:bg-white/5'}`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold text-foreground">Drop your PDF here</h3>
              <p className="text-sm text-muted-foreground mt-1">or click to browse from your computer</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <FileCheck2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground line-clamp-1">{file.name}</h4>
                  <p className="text-xs text-muted-foreground">{pageCount > 0 ? `${pageCount} pages` : 'Reading...'} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setFile(null); setOriginalText(''); setTranslatedText(''); }} className="text-sm text-muted-foreground hover:text-white px-3 py-2">
                  Change
                </button>
                <button 
                  onClick={handleTranslate}
                  disabled={translatePdfMutation.isPending}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
                >
                  {translatePdfMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Translate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(originalText || translatedText) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10"
          >
            <div className="glass-panel rounded-2xl p-6 flex flex-col h-[600px]">
              <h3 className="text-lg font-bold mb-4 pb-4 border-b border-white/10 text-white flex justify-between items-center">
                Original Text
              </h3>
              <div className="flex-1 overflow-y-auto pr-4 text-white/80 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {originalText || "No text extracted."}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex flex-col h-[600px] border-primary/30 shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)]">
              <h3 className="text-lg font-bold mb-4 pb-4 border-b border-white/10 text-white flex justify-between items-center">
                Translated Text
                <button 
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary transition-colors flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </h3>
              <div className="flex-1 overflow-y-auto pr-4 text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {translatedText || "Translating..."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
