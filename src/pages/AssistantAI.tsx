import { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Sparkles, Trash2, ChevronDown, Square,
  Home, DollarSign, BarChart2, Wrench, UserCheck, TrendingUp,
} from 'lucide-react';
import { api } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

const SUGGESTIONS = [
  { icon: Home,       text: 'Quels logements sont libres en ce moment ?' },
  { icon: DollarSign, text: 'Combien de loyers sont en retard ce mois-ci ?' },
  { icon: BarChart2,  text: 'Donne-moi un résumé de la situation financière' },
  { icon: Wrench,     text: 'Y a-t-il des tickets de maintenance urgents ?' },
  { icon: UserCheck,  text: 'Quelles candidatures sont en attente ?' },
  { icon: TrendingUp, text: 'Comment calculer une révision de loyer IRL ?' },
];

const MODELS = [
  { id: 'google/gemini-2.5-flash',              label: 'Gemini 2.5 Flash' },
  { id: 'google/gemini-2.5-flash-lite',         label: 'Gemini 2.5 Flash Lite' },
  { id: 'openai/gpt-4o-mini',                   label: 'GPT-4o Mini' },
  { id: 'anthropic/claude-3-haiku',             label: 'Claude 3 Haiku' },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (gratuit)' },
];

// ── Rendu Markdown minimaliste ─────────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="font-bold text-base mt-4 mb-1" style={{ color: 'var(--color-base-content)' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="font-bold text-lg mt-5 mb-2" style={{ color: 'var(--color-base-content)' }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={key++} className="font-semibold" style={{ color: 'var(--color-base-content)' }}>{line.slice(2, -2)}</p>);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start py-0.5">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--color-primary)' }} />
          <span className="text-sm" style={{ color: 'var(--color-base-content)', opacity: 0.85 }}
            dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      );
    } else if (line.match(/^\d+\./)) {
      const num = line.match(/^(\d+)\.(.*)/);
      if (num) elements.push(
        <div key={key++} className="flex gap-3 items-start py-0.5">
          <span className="text-xs font-bold mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-content)' }}>{num[1]}</span>
          <span className="text-sm" style={{ color: 'var(--color-base-content)', opacity: 0.85 }}
            dangerouslySetInnerHTML={{ __html: num[2].trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      );
    } else if (line.startsWith('```')) {
      // Bloc code : on accumule jusqu'au prochain ```
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={key++} className="rounded-xl px-4 py-3 text-xs overflow-x-auto my-2"
          style={{ background: 'var(--color-base-300)', color: 'var(--color-base-content)', fontFamily: 'monospace' }}>
          {codeLines.join('\n')}
        </pre>
      );
    } else if (line.trim() === '') {
      if (elements.length > 0) elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="text-sm leading-relaxed"
          style={{ color: 'var(--color-base-content)', opacity: 0.85 }}
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code style="background:var(--color-base-300);padding:1px 5px;border-radius:4px;font-size:0.8em">$1</code>') }} />
      );
    }
  }
  return elements;
}

function MessageRow({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`w-full py-6 ${isUser ? '' : ''}`}
      style={{ borderBottom: '1px solid var(--color-base-300)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-4">

        {/* Icône */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: isUser ? 'var(--color-base-300)' : 'var(--color-primary)',
            color: isUser ? 'var(--color-base-content)' : 'var(--color-primary-content)',
          }}>
          {isUser ? <User size={13} /> : <Bot size={13} />}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: 'var(--color-base-content)', opacity: 0.4 }}>
            {isUser ? 'Vous' : 'Simi IA'}
          </div>
          {isUser
            ? <p className="text-sm leading-relaxed" style={{ color: 'var(--color-base-content)', opacity: 0.9 }}>{msg.content}</p>
            : <div className="flex flex-col gap-1">{renderMarkdown(msg.content)}</div>
          }
          <div className="text-xs mt-3" style={{ color: 'var(--color-base-content)', opacity: 0.25 }}>
            {msg.ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThinkingRow() {
  return (
    <div className="w-full py-6" style={{ borderBottom: '1px solid var(--color-base-300)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-content)' }}>
          <Bot size={13} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: 'var(--color-base-content)', opacity: 0.4 }}>Simi IA</div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: 'var(--color-primary)', animationDelay: `${i * 0.15}s` }} />
            ))}
            <span className="text-xs ml-2" style={{ color: 'var(--color-base-content)', opacity: 0.35 }}>
              En train de réfléchir...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssistantAI() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [model, setModel]           = useState('google/gemini-2.5-flash');
  const [showModels, setShowModels] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, ts: new Date() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);
    // Reset textarea height
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }
    try {
      const { reply } = await api.post<{ reply: string }>('/api/chat', {
        messages: history.map(m => ({ role: m.role, content: m.content })),
        model,
      });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant', content: reply, ts: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Erreur : impossible de contacter le modèle. Vérifie ta clé `OPENROUTER_API_KEY` dans le `.env`.',
        ts: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 64px)', background: 'var(--color-base-100)' }}>

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 h-12 border-b"
        style={{ borderColor: 'var(--color-base-300)', background: 'var(--color-base-200)' }}>

        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-base-content)' }}>
            Assistant Simi Bail
          </span>
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--color-base-300)', color: 'var(--color-base-content)', opacity: 0.5 }}>
            Connecté à la base de données
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Modèle */}
          <div className="relative">
            <button onClick={() => setShowModels(o => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--color-base-300)', color: 'var(--color-base-content)', opacity: 0.7 }}>
              {MODELS.find(m => m.id === model)?.label}
              <ChevronDown size={11} />
            </button>
            {showModels && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModels(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-2xl min-w-[200px]"
                  style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)' }}>
                  {MODELS.map(m => (
                    <button key={m.id} onClick={() => { setModel(m.id); setShowModels(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors"
                      style={{
                        background: model === m.id ? 'var(--color-primary)' : 'transparent',
                        color: model === m.id ? 'var(--color-primary-content)' : 'var(--color-base-content)',
                      }}
                      onMouseEnter={e => { if (model !== m.id) (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)'; }}
                      onMouseLeave={e => { if (model !== m.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Clear */}
          {messages.length > 0 && (
            <button onClick={() => setMessages([])}
              title="Nouvelle conversation"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.4'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* État vide */}
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-primary)', color: 'var(--color-primary-content)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ color: 'var(--color-base-content)' }}>
                  Bonjour, je suis Simi IA
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-base-content)', opacity: 0.45 }}>
                  Je connais en temps réel votre parc locatif. Comment puis-je vous aider ?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-10">
              {SUGGESTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.text} onClick={() => send(s.text)}
                    className="text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3"
                    style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)', color: 'var(--color-base-content)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-base-300)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-base-200)'; }}>
                    <Icon size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <span style={{ opacity: 0.8 }}>{s.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => <MessageRow key={msg.id} msg={msg} />)}
        {loading && <ThinkingRow />}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 sm:px-6 py-4"
        style={{ borderTop: '1px solid var(--color-base-300)', background: 'var(--color-base-100)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl"
            style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)' }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={handleKey}
              placeholder="Posez votre question sur votre parc locatif…"
              disabled={loading}
              className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed px-4 pt-3.5 pb-12"
              style={{ color: 'var(--color-base-content)', maxHeight: '200px', minHeight: '24px' }}
            />

            {/* Bas de l'input : hint + bouton */}
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 pb-3 pointer-events-none">
              <span className="text-xs pointer-events-none" style={{ color: 'var(--color-base-content)', opacity: 0.25 }}>
                Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
              </span>
              <button
                onClick={() => loading ? undefined : send(input)}
                disabled={!input.trim() && !loading}
                className="pointer-events-auto w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: (input.trim() || loading) ? 'var(--color-primary)' : 'var(--color-base-300)',
                  color: (input.trim() || loading) ? 'var(--color-primary-content)' : 'var(--color-base-content)',
                  opacity: (!input.trim() && !loading) ? 0.4 : 1,
                }}>
                {loading ? <Square size={12} /> : <Send size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
