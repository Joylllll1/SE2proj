import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

function TopBar({ query, onQueryChange, onNavigate, onAIOpen, notifs, onMarkAllRead }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifDropdownRef = useRef(null);
  const unreadCount = notifs.filter((n) => !n.read).length;

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifs && notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifs]);

  return (
    <header className="topbar sticky top-0 z-20 flex items-center justify-between gap-5 h-[60px] px-7 border-b border-line bg-white/82 backdrop-blur-xs">
      <div className="search-box flex items-center gap-2 w-[min(480px,100%)] h-[38px] px-[14px] border border-line rounded-full bg-white text-text-3 shadow-xs">
        <Icon name="search" />
        <input
          className="w-full border-0 outline-0 text-text bg-transparent text-sm"
          aria-label="搜索树洞"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="搜索帖子、话题或匿名 ID..."
          value={query}
        />
      </div>
      <div className="topbar-actions flex items-center gap-2.5">
        <button className="ai-topbar-btn flex items-center gap-1.5 h-[38px] px-4 border-0 rounded-full text-white bg-gradient-to-br from-blue to-[#6c5ce7] text-[13px] font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:shadow-md" onClick={onAIOpen} type="button" aria-label="树洞 AI">
          <Icon name="smart_toy" filled />
          <span>AI</span>
        </button>
        <div className="notif-wrapper relative">
          <button className={`icon-button grid w-[38px] h-[38px] place-items-center rounded-full border border-line bg-white text-text-2 shadow-xs transition-all duration-150 hover:text-blue hover:border-[#b0c4de] hover:-translate-y-px ${unreadCount > 0 ? 'notification' : ''}`} type="button" aria-label="通知" onClick={() => setShowNotifs(!showNotifs)}>
            <Icon name="notifications" />
          </button>
          {showNotifs && (
            <div ref={notifDropdownRef} className="notif-dropdown absolute top-[calc(100%+8px)] right-0 w-[340px] max-h-[400px] overflow-y-auto border border-line rounded-xl bg-surface backdrop-blur-md shadow-glass z-[100] animate-notif-in">
              <div className="notif-header flex items-center justify-between px-4 py-[14px] border-b border-line-soft bg-surface-soft">
                <strong className="text-[15px]">通知</strong>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && <button type="button" className="notif-mark-read px-[10px] py-1 border-0 rounded-full bg-blue-soft text-blue text-xs font-semibold" onClick={onMarkAllRead}>全部已读</button>}
                  <button type="button" className="notif-close-btn grid w-7 h-7 place-items-center border border-line rounded-full bg-white text-text-3 text-sm cursor-pointer transition-colors duration-150 hover:text-text hover:border-text-3" onClick={() => setShowNotifs(false)} aria-label="关闭通知">×</button>
                </div>
              </div>
              {notifs.length === 0 ? (
                <div className="notif-empty py-8 px-4 text-center text-text-3">暂无通知</div>
              ) : (
                notifs.map((n) => (
                  <div className={`notif-item flex gap-3 px-4 py-3 border-b border-line-soft transition-colors duration-150 last:border-0 hover:bg-surface-soft ${n.read ? '' : 'unread bg-blue/[0.04]'}`} key={n.id}>
                    <span className={`notif-dot w-2 h-2 flex-shrink-0 mt-1.5 rounded-full bg-blue ${n.read ? 'opacity-0' : 'opacity-1'}`} />
                    <div>
                      <p className="m-0 text-sm leading-normal text-text">{n.text}</p>
                      <small className="block mt-1 text-text-3 text-xs">{n.time}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <button className="profile-button flex items-center gap-2 h-[38px] py-1 px-3 border border-line rounded-full bg-white text-text-2 shadow-xs transition-all duration-150 hover:text-blue hover:border-[#b0c4de] hover:-translate-y-px" type="button">
          <span className="grid w-7 h-7 place-items-center rounded-full text-white bg-[#1d1d1f] text-xs font-bold">W</span>
          <strong className="text-xs font-semibold max-sm:hidden">校园邮箱已验证</strong>
        </button>
      </div>
    </header>
  );
}

export default TopBar;