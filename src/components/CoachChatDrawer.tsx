import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Bot, RefreshCw, MessageSquare } from 'lucide-react';
import { FitnessPlan, UserProfile } from '../types/fitness';

interface CoachChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: FitnessPlan;
  userProfile: UserProfile;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const CoachChatDrawer: React.FC<CoachChatDrawerProps> = ({
  isOpen,
  onClose,
  currentPlan,
  userProfile,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hey ${userProfile.name || 'Athlete'}! I'm your AI Coach at FitBuddy. I have your full ${currentPlan.title} plan and profile right here. Ask me anything about exercise technique, nutrition timing, progression rules, or soreness management!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: messageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const planSummary = `${currentPlan.title} (${currentPlan.splitType}). Weekly days: ${currentPlan.weeklySchedule.map(d => d.dayTitle).join(' | ')}. Goal: ${userProfile.primaryGoal}.`;

      const res = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          planSummary,
          userProfile,
          chatHistory: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) {
        throw new Error('Coach server is busy. Please try again.');
      }

      const data = await res.json();
      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: data.reply || 'Let me know if you need more details on that exercise!',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: `Apologies, I encountered a brief issue: ${err.message}. Please ask again.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    'How do I avoid lower back strain on hinges?',
    'What should I eat 45 mins before training?',
    'Can I swap Day 2 and Day 3 if sore?',
    'How do I know when to increase weight?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Coach FitBuddy</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Grounded in your plan</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            <span>Coach is analyzing biomechanics...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-3 py-2 bg-slate-950/50 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex gap-1.5">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            disabled={isTyping}
            className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Coach FitBuddy anything..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
