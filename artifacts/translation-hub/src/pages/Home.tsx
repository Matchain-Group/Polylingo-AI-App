import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText, FileText, MessageCircle, BotMessageSquare,
  Mic, FileStack, Globe2, LogIn, UserPlus, User, Sun, Moon
} from "lucide-react";
import { LiveSubtitle } from "@/components/features/LiveSubtitle";
import { PdfTranslator } from "@/components/features/PdfTranslator";
import { ChatTranslator } from "@/components/features/ChatTranslator";
import { TelegramBot } from "@/components/features/TelegramBot";
import { VoiceTranslator } from "@/components/features/VoiceTranslator";
import { ProjectTranslator } from "@/components/features/ProjectTranslator";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const TABS = [
  { id: "subtitle", label: "Live Subtitle", icon: MessageSquareText, component: LiveSubtitle },
  { id: "pdf", label: "PDF", icon: FileText, component: PdfTranslator },
  { id: "chat", label: "Chat", icon: MessageCircle, component: ChatTranslator },
  { id: "voice", label: "Voice", icon: Mic, component: VoiceTranslator },
  { id: "project", label: "Project", icon: FileStack, component: ProjectTranslator },
  { id: "bot", label: "Telegram Bot", icon: BotMessageSquare, component: TelegramBot },
];

interface HomeProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
  onGoDashboard: () => void;
}

export function Home({ onGoLogin, onGoRegister, onGoDashboard }: HomeProps) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const { user } = useAuthContext();
  const { theme, toggleTheme } = useTheme();

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component ?? LiveSubtitle;
  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen relative overflow-x-hidden selection:bg-primary/30"
      style={{ background: "var(--bg)" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/8 blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-30 border-b border-[var(--border-glass)] glass-panel sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
              <Globe2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg" style={{ color: "var(--fg)" }}>
              Polylingo <span className="text-primary">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--border-glass)" }}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark
                ? <Sun className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4 text-primary" />}
            </button>

            {user ? (
              <button
                onClick={onGoDashboard}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--border-glass)", color: "var(--fg)" }}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-bold">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onGoLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: "var(--glass-bg)", border: "1px solid var(--border-glass)", color: "var(--fg)" }}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign in</span>
                </button>
                <button
                  onClick={onGoRegister}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">Sign up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <header className="text-center mb-12 mt-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full glass-panel text-xs font-bold tracking-widest text-primary uppercase">
              AI Powered Translation
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--fg)" }}
          >
            Poly<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">lingo</span> AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: "var(--muted-fg)" }}
          >
            Break language barriers instantly — subtitles, documents, voice, full projects and live bilingual chat.
          </motion.p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 relative z-20">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors duration-300"
                style={{
                  color: isActive ? "var(--fg)" : "var(--muted-fg)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--border-glass)",
                      backdropFilter: "blur(12px)",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-primary" : ""}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <main className="relative z-20 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
