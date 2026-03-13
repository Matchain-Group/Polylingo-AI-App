import { useState } from 'react';

export function useSubtitleStream() {
  const [text, setText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = async (input: string, targetLanguage: string, sourceLanguage?: string) => {
    setIsTranslating(true);
    setText('');
    
    try {
      const res = await fetch('/api/translate/subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, targetLanguage, sourceLanguage })
      });
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]' || dataStr === '{"done":true}') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                setText(p => p + data.content);
              } else if (data.text) {
                setText(p => p + data.text);
              }
            } catch (e) {
              // Ignore malformed JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const clear = () => setText('');

  return { text, isTranslating, translate, clear, setText };
}
