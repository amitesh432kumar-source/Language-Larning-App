import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export function TextTutor({ language, proficiency }: { language: string; proficiency: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const chatRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are a helpful, encouraging language tutor for ${language} at the ${proficiency} level. 
        Converse with the user in ${language}. If they make mistakes, gently correct them. 
        Keep responses concise and conversational. Provide English translations in parentheses if explaining a complex grammar rule.`,
      }
    });
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: `Hello! I am your ${language} text tutor. Let's practice! What would you like to talk about today?`
    }]);
  }, [language, proficiency]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message: userText });
      
      const modelMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, text: msg.text + chunk.text } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!input.trim() || isChecking) return;
    setIsChecking(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: `Correct the grammar and spelling of this ${language} text. Only output the corrected text, nothing else. If it's already correct, output it exactly as is. Text: "${input}"`
      });
      if (response.text) {
        setInput(response.text.trim());
      }
    } catch (error) {
      console.error("Grammar check error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-full bg-black/20 rounded-xl border border-white/10 overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-sm' 
                  : 'bg-white/10 text-neutral-200 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-neutral-200 rounded-2xl rounded-bl-sm px-4 py-2 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      
      <div className="p-3 bg-black/40 border-t border-white/10 flex gap-2 items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
          onClick={handleGrammarCheck}
          disabled={!input.trim() || isChecking || isLoading}
          title="Fix Grammar (AI)"
        >
          {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        </Button>
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Type in ${language}...`}
          className="flex-1 bg-white/5 border-white/10 focus-visible:ring-purple-500 text-white placeholder:text-neutral-500"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading}
          size="icon"
          className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
