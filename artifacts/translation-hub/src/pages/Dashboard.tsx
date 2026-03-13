import { motion } from "framer-motion";
import { User, Mail, Calendar, Globe2, Mic, FileStack, FileText, MessageSquare, Radio, Send, LogOut } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

interface DashboardProps {
  onClose: () => void;
}

const features = [
  { icon: Radio, label: "Live Subtitle", desc: "Real-time subtitle translation" },
  { icon: FileText, label: "PDF Translator", desc: "Extract & translate PDF documents" },
  { icon: MessageSquare, label: "Chat Translator", desc: "Bilingual conversation translator" },
  { icon: Send, label: "Telegram Bot", desc: "Automated Telegram translation" },
  { icon: Mic, label: "Voice Translation", desc: "Record & translate spoken words" },
  { icon: FileStack, label: "Project Translator", desc: "Translate entire projects at once" },
];

export function Dashboard({ onClose }: DashboardProps) {
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-6"
      >
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg shadow-primary/30 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-display font-bold text-foreground">{user?.name}</h2>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>Member since {joined}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <span>Account ID: {user?.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">Available Features</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 auth-btn-ghost py-3"
          >
            Back to App
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
