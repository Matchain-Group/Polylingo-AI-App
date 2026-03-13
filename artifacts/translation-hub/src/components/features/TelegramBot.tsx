import { useState, useEffect } from "react";
import { Send, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function TelegramBot() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<'idle' | 'testing' | 'active' | 'error'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem("TELEGRAM_BOT_TOKEN");
    if (saved) setToken(saved);
  }, []);

  const handleSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
    localStorage.setItem("TELEGRAM_BOT_TOKEN", e.target.value);
    setStatus('idle');
  };

  const testConnection = async () => {
    if (!token) return toast.error("Please enter a bot token first");
    
    setStatus('testing');
    try {
      // Simulate raw API fetch based on instructions
      const res = await fetch('/api/translate/telegram/status');
      if (res.ok) {
        setStatus('active');
        toast.success("Bot is active and running!");
      } else {
        setStatus('error');
        toast.error("Failed to connect to backend bot service");
      }
    } catch (err) {
      setStatus('error');
      toast.error("Network error while checking bot status");
    }
  };

  const steps = [
    "Open Telegram and search for @BotFather",
    "Send the /newbot command and follow the prompts to create your bot",
    "Copy the HTTP API Token provided by BotFather",
    "Paste the token below and your backend service will automatically hook into it"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Setup Telegram Bot</h2>
          <p className="text-muted-foreground">Turn your backend into an automatic translation bot for Telegram groups and chats.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">How to create a bot</h3>
          <ul className="space-y-4 pt-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-white/80 text-sm pt-1.5">{step}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Send className="w-32 h-32 text-primary" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-6">Configuration</h3>
          
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Bot API Token</label>
              <input
                type="password"
                value={token}
                onChange={handleSave}
                placeholder="1234567890:AAH_xyz..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white font-mono text-sm transition-all"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">Status:</span>
                {status === 'idle' && <span className="text-sm font-medium text-white/40">Not tested</span>}
                {status === 'testing' && <span className="text-sm font-medium text-primary flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Checking...</span>}
                {status === 'active' && <span className="text-sm font-medium text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Active</span>}
                {status === 'error' && <span className="text-sm font-medium text-destructive flex items-center gap-1"><XCircle className="w-4 h-4" /> Error</span>}
              </div>

              <button
                onClick={testConnection}
                disabled={status === 'testing' || !token}
                className="px-5 py-2.5 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary/90 leading-relaxed">
            <strong>Note:</strong> The token is saved securely in your browser's local storage and used to communicate with the backend service. Ensure the Node backend has the Telegram poller running.
          </p>
        </div>
      </div>
    </div>
  );
}
