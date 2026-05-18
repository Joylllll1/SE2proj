import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../common/Icon';
import useAIStore from '../../store/aiStore';

function formatRelativeTime(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(date).toLocaleDateString('zh-CN');
}

// Message bubble component
function MessageBubble({ message, isLastAssistant, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy errors
    }
  };

  const isAI = message.role === 'assistant';

  return (
    <div
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
      onMouseEnter={() => isAI && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`relative max-w-[85%] group`}>
        {isAI && showActions && (
          <div className="absolute -top-7 left-0 flex items-center gap-1 bg-white border border-line-soft rounded-full px-2 py-1 shadow-sm">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-text-3 hover:text-text transition-colors"
            >
              <Icon name={copied ? 'check' : 'content_copy'} size={14} />
              <span>{copied ? '已复制' : '复制'}</span>
            </button>
            {isLastAssistant && (
              <>
                <span className="text-line">|</span>
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 text-xs text-text-3 hover:text-text transition-colors"
                >
                  <Icon name="refresh" size={14} />
                  <span>重新生成</span>
                </button>
              </>
            )}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isAI
              ? 'bg-surface-soft text-text rounded-tl-sm'
              : 'bg-blue text-white rounded-tr-sm'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

// Session list item
function SessionItem({ session, isActive, onClick, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`relative p-3 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-blue-soft' : 'hover:bg-surface-soft'
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text truncate pr-2">{session.title}</p>
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('确定要删除这个会话吗？')) {
                onDelete();
              }
            }}
            className="p-1 text-text-3 hover:text-red transition-colors"
          >
            <Icon name="delete" size={16} />
          </button>
        )}
      </div>
      <p className="text-xs text-text-3 mt-1">{formatRelativeTime(session.updatedAt)}</p>
    </div>
  );
}

function AIPanel({ open, onClose }) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get AI store state
  const {
    sessions,
    currentSession,
    messages,
    showSessionList,
    isLoading,
    error,
    fetchSessions,
    createSession,
    switchSession,
    deleteSession,
    sendMessage,
    regenerateMessage,
    toggleSessionList,
    closeSessionList,
    clearError,
  } = useAIStore();

  // Load sessions on mount
  useEffect(() => {
    if (open) {
      fetchSessions();
      // If no current session, create one
      if (!currentSession && sessions.length === 0) {
        createSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    try {
      await sendMessage(text);
    } catch {
      // Error handled in store
    }
  }, [input, isLoading, sendMessage]);

  const handleRegenerate = useCallback(async () => {
    try {
      await regenerateMessage();
    } catch {
      // Error handled in store
    }
  }, [regenerateMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Find last assistant message index
  const lastAssistantIndex = [...messages].reverse().findIndex(m => m.role === 'assistant');
  const lastAssistantId = lastAssistantIndex >= 0 ? messages[messages.length - 1 - lastAssistantIndex]._id : null;

  return (
    <div className={`ai-slide-panel fixed inset-0 z-[100] ${open ? 'open pointer-events-auto' : 'pointer-events-none'}`}>
      <div
        className="ai-slide-overlay absolute inset-0 opacity-0 bg-black/30 transition-opacity duration-[250ms] ai-slide-panel-open:opacity-100"
        onClick={onClose}
      />
      <aside
        className="ai-slide-content absolute top-0 right-0 bottom-0 w-[480px] flex flex-col p-6 border-l border-line bg-white shadow-md translate-x-full transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ai-slide-panel-open:translate-x-0"
      >
        {/* Header */}
        <div className="ai-slide-head flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSessionList}
              className="p-1 text-text-2 hover:text-text transition-colors"
              title="会话列表"
            >
              <Icon name="menu" size={20} />
            </button>
            <span className="live-dot w-2 h-2 rounded-full bg-[#24c26a] shadow-[0_0_0_5px_rgba(36,194,106,0.12)]" />
            <strong className="text-base tracking-tight truncate max-w-[200px]">
              {currentSession?.title || '树洞 AI'}
            </strong>
          </div>
          <button
            className="ai-slide-close grid w-8 h-8 place-items-center border border-line rounded-full bg-white text-text-3 transition-colors duration-150 hover:text-text hover:border-text-3"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Session List Sidebar */}
        {showSessionList && (
          <div className="absolute inset-y-0 left-0 w-64 bg-white border-r border-line z-10 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text">会话列表</h3>
              <button
                onClick={closeSessionList}
                className="p-1 text-text-3 hover:text-text"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {sessions.map((session) => (
                <SessionItem
                  key={session._id}
                  session={session}
                  isActive={session._id === currentSession?._id}
                  onClick={() => switchSession(session._id)}
                  onDelete={() => deleteSession(session._id)}
                />
              ))}
            </div>
            <button
              onClick={() => createSession()}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 border border-line rounded-lg text-sm text-text hover:bg-surface-soft transition-colors"
            >
              <Icon name="add" size={16} />
              新建会话
            </button>
          </div>
        )}

        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue to-[#6c5ce7] flex items-center justify-center">
              <Icon name="smart_toy" className="text-white text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-text mb-2">你好呀！</h2>
            <p className="text-sm text-text-2">我是你的树洞 AI 伙伴，随时可以和我聊聊。</p>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto mb-3 px-1">
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isLastAssistant={msg._id === lastAssistantId}
              onRegenerate={handleRegenerate}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="px-4 py-3 rounded-2xl bg-surface-soft rounded-tl-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 px-3 py-2 bg-red-soft text-red text-sm rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-red hover:opacity-70">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="ai-chat-input flex gap-2 pt-4 border-t border-line-soft">
          <input
            ref={inputRef}
            className="flex-1 min-w-0 h-10 px-[14px] border border-line rounded-full bg-surface-soft text-text text-sm placeholder:text-text-3 outline-none focus:border-blue transition-colors"
            placeholder="和树洞 AI 聊聊..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="primary-button flex-shrink-0 h-10 px-4 inline-flex items-center justify-center gap-[7px] border-0 rounded-full text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSend}
            type="button"
            disabled={isLoading || !input.trim()}
          >
            <Icon name="send" />
          </button>
        </div>
      </aside>
    </div>
  );
}

export default AIPanel;
