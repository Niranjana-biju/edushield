import React, { useState } from 'react';
import { useInsurance } from '../../context/InsuranceContext';
import { GeminiService } from '../../services/geminiService';
import {
  Sparkles,
  Send,
  HelpCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const AIPolicyAssistant: React.FC = () => {
  const { policies } = useInsurance();
  const currentPolicy = policies[0];

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    sender: 'user' | 'assistant';
    text: string;
    clause?: string;
    source?: string;
    disclaimer?: string;
  }>>([
    {
      sender: 'assistant',
      text: 'Hello, I am the EduShield Continuity Intelligence Assistant. Ask me any question about your education policy, statutory waiting periods, standard exclusions, or direct university tuition disbursement rules. I cite specific clauses for all explanations.',
      clause: 'Scope: EduShield Demonstration Terms & Conditions Schedule',
      disclaimer: 'Advisory only. Official claim adjudications require licensed claims officer validation.',
    }
  ]);

  const samplePrompts = [
    'What is the statutory waiting period?',
    'How does direct university fee disbursement work?',
    'What are the standard exclusions?',
    'Is involuntary sponsor layoff covered?',
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim() || loading) return;

    setConversation(prev => [...prev, { sender: 'user', text: q }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await GeminiService.queryPolicyAssistant(q, currentPolicy);
      setConversation(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: response.answer,
          clause: response.citedClause,
          source: response.source === 'gemini_api' ? 'Gemini 1.5' : 'EduShield Continuity Intelligence Rule Engine',
          disclaimer: response.disclaimer,
        }
      ]);
    } catch (e) {
      setConversation(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach advisory service. Please consult your policy bond schedule.',
          clause: 'General Inquiries Section',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 bg-teal-50 text-teal-800 text-xs px-3 py-1 rounded-full mb-1 border border-teal-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EduShield Continuity Intelligence &bull; Policy Clause Explainer</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          AI Policy Clause & Coverage Assistant
        </h1>
        <p className="text-xs text-slate-500">
          Explain legal insurance terms in simple language with explicit clause citations. Does not make automated coverage determinations.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-slate-400 font-medium py-1">Frequently Asked:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(p)}
            className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-400 text-slate-700 hover:text-brand-700 transition shadow-2xs font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Conversation Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl rounded-2xl p-4 text-xs space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-semibold text-[11px] mb-1">
                  {msg.sender === 'user' ? (
                    <span>You</span>
                  ) : (
                    <span className="flex items-center text-teal-700">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
                      Continuity Assistant
                    </span>
                  )}
                </div>

                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {msg.clause && (
                  <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500">
                    <strong className="text-slate-700">Referenced Clause:</strong> {msg.clause}
                  </div>
                )}

                {msg.disclaimer && (
                  <p className="text-[9px] text-slate-400 italic">
                    {msg.disclaimer}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                <span>Consulting policy terms & conditions...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask about waiting periods, direct payouts, exclusions..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 bg-white"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center transition"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};
