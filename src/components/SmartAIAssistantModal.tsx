import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, CheckCircle2, FileQuestion, BookOpen } from 'lucide-react';

interface SmartAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  flatNumber: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const SmartAIAssistantModal: React.FC<SmartAIAssistantModalProps> = ({
  isOpen,
  onClose,
  flatNumber,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello Flat ${flatNumber}! I am the Sapana Park Society AI Assistant. Ask me anything about maintenance calculation, NOC requirements, Goa Co-operative Societies Act 2001 rules, or filing a ticket.`,
      time: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'What is the late fee policy for maintenance?',
    'How do I apply for a Tenant NOC?',
    'What are the rules for flat renovation hours?',
    'Who is in the Managing Committee?',
  ];

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput('');
    setIsLoading(true);

    try {
      // Call server API for Gemini AI or fallback response
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, flatNumber }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Fallback logic');
      }
    } catch {
      // Smart localized fallback logic
      let reply = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('late fee') || lower.includes('due date')) {
        reply = 'Under Sapana Park Bye-law Chapter 2 & Goa Act Sec 69: Maintenance bills are due on the 20th of every month. Overdue payments accrue simple interest at 18% per annum pro-rata from the 21st day.';
      } else if (lower.includes('tenant') || lower.includes('noc')) {
        reply = 'To obtain a Tenant NOC: 1) Fill out the NOC form under Bye-Laws & NOCs tab, 2) Attach Leave & License agreement draft and Police Verification form N-1, 3) Non-occupancy fee is 10% of service charges. Approval is usually issued within 24-48 hours.';
      } else if (lower.includes('renovation') || lower.includes('timing') || lower.includes('noise')) {
        reply = 'Renovation work is allowed strictly between 9:00 AM and 6:00 PM (Monday to Saturday). No structural beams or pillars may be altered. Debris must be cleared from corridors within 48 hours.';
      } else if (lower.includes('committee') || lower.includes('secretary')) {
        reply = 'Sapana Park Managing Committee: Hon. Chairman: Mr. S. Kulkarni, Hon. Secretary: Mr. Rajesh Naik (A-302), Hon. Treasurer: Mrs. Anjali Deshmukh (B-101). Society Office hours: 6 PM - 8 PM (Tue & Sat).';
      } else {
        reply = `Thank you for your inquiry regarding "${textToSend}". Under Sapana Park CHS guidelines, all queries are logged and aligned with the Goa Co-operative Societies Act 2001. You can also raise a formal complaint ticket under the Complaints tab if needed!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/80 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Sapana Park AI Society Assistant</h3>
              <p className="text-slate-400 text-xs">Powered by Gemini • Goa Co-operative Act Knowledge Base</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-900/60 text-teal-300 border border-teal-700/50'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="block text-[10px] opacity-60 mt-1 text-right">{msg.time}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-emerald-400 text-xs p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing society bye-laws & drafting response...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-3 py-1.5 rounded-full border border-slate-700/80 whitespace-nowrap transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about maintenance, NOCs, complaints, or bye-laws..."
            className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center space-x-1 transition"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
