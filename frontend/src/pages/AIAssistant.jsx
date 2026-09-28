import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiApi } from '../services/aiApi';
import { 
  Sparkles, 
  Send, 
  Bot, 
  RefreshCw, 
  AlertCircle,
  Info
} from 'lucide-react';

export function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const query = inputPrompt.trim();
    if (!query || loading) return;

    setError(null);
    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await aiApi.chat(query);
      const assistantMessage = {
        role: 'assistant',
        content: response.response || response.summary || response.explanation,
        disclaimer: response.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat failed:', err);
      setError(err.message || 'Unable to connect to AI Assistant. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6 py-2 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">CareKey AI Assistant</h1>
            <p className="text-xs text-slate-500">Intelligent clinical inquiries and evidence-based healthcare decision support.</p>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col overflow-hidden min-h-0">
        
        {/* Chat Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {/* Empty State when no messages */}
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h3 className="text-sm font-bold text-slate-800">
                  How can CareKey AI assist your health today?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ask regarding symptoms, general medical terminology, preventive wellness measures, or medication safety considerations.
                </p>
              </div>

              {/* Sample inquiry prompt chips */}
              <div className="flex flex-wrap gap-2 pt-2 justify-center max-w-lg">
                {[
                  "What questions should I ask my doctor about hypertension?",
                  "Explain the difference between Type 1 and Type 2 diabetes.",
                  "What are common preventive screening tests for adults?"
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setInputPrompt(sample); }}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-slate-600 hover:text-purple-700 transition-colors text-left cursor-pointer"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs'
              }`}>
                <div className="whitespace-pre-line font-normal">
                  {msg.content}
                </div>
                {msg.disclaimer && (
                  <div className="pt-2 mt-2 border-t border-slate-200/60 text-[10px] text-slate-400 italic flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>{msg.disclaimer}</span>
                  </div>
                )}
                <div className={`text-[10px] text-right ${msg.role === 'user' ? 'text-sky-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
              <Bot className="w-5 h-5 text-purple-600 animate-pulse" />
              <span>CareKey AI is synthesizing medical guidance...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">AI Service Unavailable</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask CareKey AI about symptoms, health terminology, or clinical guidance..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            CareKey AI provides assistive information and does not substitute professional medical diagnosis.
          </p>
        </div>

      </div>

    </div>
  );
}
