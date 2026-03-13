import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, Volume2, Globe2, Copy, Check } from "lucide-react";
import { useListLanguages } from "@workspace/api-client-react";
import { SelectBox } from "@/components/ui/SelectBox";
import { toast } from "sonner";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

export function VoiceTranslator() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translated, setTranslated] = useState("");
  const [targetLang, setTargetLang] = useState("es");
  const [sourceLang, setSourceLang] = useState("auto");
  const [copied, setCopied] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { data: languages } = useListLanguages();

  const langOptions = [
    { value: "auto", label: "Auto Detect" },
    ...(languages?.map(l => ({ value: l.code, label: `${l.name} (${l.nativeName})` })) ?? [])
  ];
  const targetLangOptions = languages?.map(l => ({ value: l.code, label: `${l.name} (${l.nativeName})` })) ?? [
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  const startRecording = async () => {
    setTranscript("");
    setTranslated("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => { void processAudio(mimeType); stream.getTracks().forEach(t => t.stop()); };
      recorder.start(250);
      mediaRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const processAudio = async (mimeType: string) => {
    setLoading(true);
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const res = await fetch(`${API}/translate/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: base64,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang === "auto" ? undefined : sourceLang,
        }),
      });

      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json() as { transcript: string; translatedText: string };
      setTranscript(data.transcript);
      setTranslated(data.translatedText);
    } catch (e) {
      toast.error("Voice translation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyTranslation = () => {
    void navigator.clipboard.writeText(translated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectBox label="Source Language" value={sourceLang} onChange={e => setSourceLang(e.target.value)} options={langOptions} />
        <SelectBox label="Translate To" value={targetLang} onChange={e => setTargetLang(e.target.value)} options={targetLangOptions} />
      </div>

      <div className="glass-panel rounded-2xl p-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <h3 className="text-xl font-display font-bold text-foreground mb-1">Voice Translation</h3>
          <p className="text-sm text-muted-foreground">Tap the microphone to start recording your voice</p>
        </div>

        <motion.button
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 disabled:opacity-60 ${
            recording
              ? "bg-red-500 shadow-red-500/40 shadow-2xl"
              : "bg-gradient-to-br from-primary to-accent shadow-primary/40"
          }`}
        >
          {recording && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500/40"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {loading ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : recording ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </motion.button>

        <p className="text-sm font-medium">
          {loading ? <span className="text-primary animate-pulse">Processing audio...</span>
            : recording ? <span className="text-red-400 animate-pulse">Recording — tap to stop</span>
            : <span className="text-muted-foreground">Tap to start recording</span>}
        </p>
      </div>

      <AnimatePresence>
        {(transcript || translated) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-foreground/10">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-foreground">Transcript</h4>
              </div>
              <p className="text-foreground/80 leading-relaxed">{transcript || "..."}</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-primary/30">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-foreground/10">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-foreground">Translation</h4>
                </div>
                <button onClick={copyTranslation} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-foreground leading-relaxed font-medium">{translated || "..."}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
