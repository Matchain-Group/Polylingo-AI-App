import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, SquareSquare, Trash2, Globe2 } from "lucide-react";
import { useListLanguages } from "@workspace/api-client-react";
import { useSubtitleStream } from "@/hooks/use-translation";
import { SelectBox } from "@/components/ui/SelectBox";

export function LiveSubtitle() {
  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const { data: languages } = useListLanguages();
  const { text: subtitle, isTranslating, translate, clear } = useSubtitleStream();

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    translate(sourceText, targetLang, sourceLang === "auto" ? undefined : sourceLang);
  };

  const handleClear = () => {
    setSourceText("");
    clear();
  };

  const langOptions = [
    { value: "auto", label: "Auto Detect" },
    ...(languages?.map(l => ({ value: l.code, label: `${l.name} (${l.nativeName})` })) || [])
  ];

  const targetLangOptions = languages?.map(l => ({ value: l.code, label: `${l.name} (${l.nativeName})` })) || [
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "ja", label: "Japanese" }
  ];

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectBox 
          label="Source Language" 
          value={sourceLang} 
          onChange={(e) => setSourceLang(e.target.value)}
          options={langOptions}
        />
        <SelectBox 
          label="Target Language" 
          value={targetLang} 
          onChange={(e) => setTargetLang(e.target.value)}
          options={targetLangOptions}
        />
      </div>

      <div className="glass-panel rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 hover:border-primary/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Paste or type text here to translate..."
          className="w-full h-40 bg-transparent text-lg text-foreground placeholder:text-white/20 resize-none focus:outline-none"
        />
        <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Clear</span>
          </button>
          
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all duration-200"
          >
            {isTranslating ? (
              <SquareSquare className="w-5 h-5 animate-pulse" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            {isTranslating ? 'Translating...' : 'Translate Live'}
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-8 min-h-[160px] flex flex-col justify-center items-center text-center relative overflow-hidden"
      >
        {!subtitle && !isTranslating ? (
          <div className="flex flex-col items-center text-white/20">
            <Globe2 className="w-12 h-12 mb-3" />
            <p className="font-medium">Live subtitles will appear here</p>
          </div>
        ) : (
          <p className="text-2xl md:text-4xl font-display font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
            {subtitle}
            {isTranslating && <motion.span animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-3 h-8 bg-primary ml-2 align-middle" />}
          </p>
        )}
      </motion.div>
    </div>
  );
}
