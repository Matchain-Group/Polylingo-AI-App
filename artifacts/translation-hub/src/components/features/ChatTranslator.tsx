import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Send, User, Bot, Languages } from "lucide-react";
import { useSendChatMessage, useListLanguages } from "@workspace/api-client-react";
import { SelectBox } from "@/components/ui/SelectBox";

interface ChatMsg {
  id: string;
  text: string;
  translation: string;
  role: 'me' | 'them';
  timestamp: string;
}

export function ChatTranslator() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [myLang, setMyLang] = useState("en");
  const [theirLang, setTheirLang] = useState("es");
  const [sessionId] = useState(() => uuidv4());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: languages } = useListLanguages();
  const chatMutation = useSendChatMessage();

  useEffect(() => {
    const saved = sessionStorage.getItem("translator_chat");
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("translator_chat", JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput("");
    
    // Optimistic me message
    const tempId = uuidv4();
    setMessages(p => [...p, {
      id: tempId,
      text: currentInput,
      translation: "Translating...",
      role: 'me',
      timestamp: new Date().toISOString()
    }]);

    try {
      const res = await chatMutation.mutateAsync({
        data: {
          message: currentInput,
          sourceLanguage: myLang,
          targetLanguage: theirLang,
          sessionId
        }
      });
      
      setMessages(p => p.map(m => m.id === tempId ? {
        ...m,
        translation: res.translatedMessage
      } : m));

      // Simulate a reply from 'them' (echoing back translated)
      const replyRes = await chatMutation.mutateAsync({
        data: {
          message: res.translatedMessage,
          sourceLanguage: theirLang,
          targetLanguage: myLang,
          sessionId
        }
      });

      setMessages(p => [...p, {
        id: uuidv4(),
        text: replyRes.originalMessage,
        translation: replyRes.translatedMessage,
        role: 'them',
        timestamp: new Date().toISOString()
      }]);

    } catch (e) {
      console.error(e);
      setMessages(p => p.map(m => m.id === tempId ? { ...m, translation: "Error translating." } : m));
    }
  };

  const langOptions = languages?.map(l => ({ value: l.code, label: l.name })) || [
    { value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[75vh]">
      <div className="glass-panel p-4 rounded-t-2xl border-b-0 flex gap-4 md:gap-8 items-center justify-between bg-black/40 relative z-10">
        <div className="flex-1 flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg"><User className="w-5 h-5 text-primary" /></div>
          <SelectBox className="py-2 text-sm bg-transparent border-none focus:ring-0 pl-1 font-bold" value={myLang} onChange={(e) => setMyLang(e.target.value)} options={langOptions} />
        </div>
        <Languages className="w-6 h-6 text-white/20 shrink-0" />
        <div className="flex-1 flex items-center gap-3 justify-end text-right">
          <SelectBox className="py-2 text-sm bg-transparent border-none focus:ring-0 pl-1 font-bold" value={theirLang} onChange={(e) => setTheirLang(e.target.value)} options={langOptions} />
          <div className="p-2 bg-accent/20 rounded-lg"><Bot className="w-5 h-5 text-accent" /></div>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-none border-y-0 overflow-y-auto p-6 space-y-6 flex flex-col">
        {messages.length === 0 ? (
          <div className="m-auto text-center text-white/30 flex flex-col items-center">
            <Languages className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Send a message to start translating</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                m.role === 'me' 
                  ? 'bg-gradient-to-br from-primary/90 to-primary/70 rounded-tr-sm text-white' 
                  : 'bg-white/10 rounded-tl-sm text-white'
              }`}>
                <p className="text-[15px] font-medium leading-relaxed">{m.text}</p>
                <div className={`mt-2 pt-2 text-sm border-t ${m.role === 'me' ? 'border-white/20 text-white/80' : 'border-white/10 text-white/60'}`}>
                  {m.translation}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="glass-panel p-4 rounded-b-2xl border-t-0 bg-black/40">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
