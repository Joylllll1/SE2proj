import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

function AIPanel({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '你好呀！今天有什么想聊的吗？无论是学习压力还是生活琐事，我都在这里。' },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'me', text }]);
    setInput('');

    // simulate AI reply
    setTimeout(() => {
      const replies = [
        '听起来你最近压力不小，想具体聊聊是什么事情让你焦虑吗？',
        '我理解你的感受，这种情绪很多人都会经历。你可以试试把事情拆成小步骤来处理。',
        '谢谢你的分享。有时候把想法说出来本身就能缓解一些压力。',
        '期末确实不容易，但每一步都算数。你有制定过复习计划吗？',
        '深呼吸，你现在做得已经很好了。需要我帮你梳理一下思路吗？',
      ];
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: replies[Math.floor(Math.random() * replies.length)] },
      ]);
    }, 800);
  };

  return (
    <div className={`ai-slide-panel fixed inset-0 z-[100] ${open ? 'open pointer-events-auto' : 'pointer-events-none'}`}>
      <div className="ai-slide-overlay absolute inset-0 opacity-0 bg-black/30 transition-opacity duration-[250ms] ai-slide-panel-open:opacity-100" onClick={onClose} />
      <aside className="ai-slide-content absolute top-0 right-0 bottom-0 w-[380px] flex flex-col p-6 border-l border-line bg-white shadow-md translate-x-full transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ai-slide-panel-open:translate-x-0">
        <div className="ai-slide-head flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="live-dot w-2 h-2 rounded-full bg-[#24c26a] shadow-[0_0_0_5px_rgba(36,194,106,0.12)]" />
            <strong className="text-base tracking-tight">树洞 AI</strong>
          </div>
          <button className="ai-slide-close grid w-8 h-8 place-items-center border border-line rounded-full bg-white text-text-3 transition-colors duration-150 hover:text-text hover:border-text-3" onClick={onClose} type="button">
            <Icon name="add" />
          </button>
        </div>
        <p className="ai-intro mb-[15px] text-text-2 text-[13px] leading-relaxed">我是你的树洞 AI 伙伴，随时可以和我聊聊学习、生活、情绪，或者任何你想说的话。</p>
        <div className="chat-messages flex-1 overflow-y-auto mb-3">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble w-fit max-w-[94%] my-2 px-3 py-[10px] rounded-lg text-[13px] leading-snug ${msg.role === 'ai' ? 'bg-surface-soft rounded-tl-sm' : 'ml-auto text-white bg-blue rounded-tr-sm'}`}>{msg.text}</div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="ai-chat-input flex gap-2 pt-4 border-t border-line-soft">
          <input
            className="flex-1 min-w-0 h-10 px-[14px] border border-line rounded-full bg-surface-soft text-text text-sm placeholder:text-text-3"
            placeholder="和树洞 AI 聊聊..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="primary-button flex-shrink-0 h-10 px-4 inline-flex items-center justify-center gap-[7px] border-0 rounded-full text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2" onClick={handleSend} type="button">
            <Icon name="send" />
          </button>
        </div>
      </aside>
    </div>
  );
}

export default AIPanel;