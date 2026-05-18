import React, { useState, useEffect, useRef } from 'react';
import Icon from '../common/Icon';
import useNotificationStore from '../../store/notificationStore';
import usePostStore from '../../store/postStore';

function formatRelativeTime(date) {
  if (!date) return '';
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

function TopBar({ query, onQueryChange, onNavigate, onAIOpen }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifDropdownRef = useRef(null);

  // Get notification state from store
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const setSelectedPost = usePostStore((s) => s.setSelectedPost);

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

  // Handle notification click
  const handleNotifClick = (notification) => {
    // Mark as read
    markAsRead(notification._id);

    // Navigate based on notification type
    if (notification.relatedType === 'post' && notification.relatedId) {
      setSelectedPost(null);
      onNavigate('detail', { selectedPost: { id: notification.relatedId } });
    } else if (notification.relatedType === 'event' && notification.relatedId) {
      onNavigate('announcements');
    }

    setShowNotifs(false);
  };

  // Handle mark all as read
  const handleMarkAllRead = () => {
    markAllAsRead();
  };

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
          <button
            className={`icon-button grid w-[38px] h-[38px] place-items-center rounded-full border border-line bg-white text-text-2 shadow-xs transition-all duration-150 hover:text-blue hover:border-[#b0c4de] hover:-translate-y-px ${unreadCount > 0 ? 'notification' : ''}`}
            type="button"
            aria-label="通知"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Icon name="notifications" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red text-white text-xs font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div ref={notifDropdownRef} className="notif-dropdown absolute top-[calc(100%+8px)] right-0 w-[340px] max-h-[400px] overflow-y-auto border border-line rounded-xl bg-surface backdrop-blur-md shadow-glass z-[100] animate-notif-in">
              <div className="notif-header flex items-center justify-between px-4 py-[14px] border-b border-line-soft bg-surface-soft">
                <strong className="text-[15px]">通知</strong>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notif-mark-read px-[10px] py-1 border-0 rounded-full bg-blue-soft text-blue text-xs font-semibold"
                      onClick={handleMarkAllRead}
                    >
                      全部已读
                    </button>
                  )}
                  <button
                    type="button"
                    className="notif-close-btn grid w-7 h-7 place-items-center border border-line rounded-full bg-white text-text-3 text-sm cursor-pointer transition-colors duration-150 hover:text-text hover:border-text-3"
                    onClick={() => setShowNotifs(false)}
                    aria-label="关闭通知"
                  >
                    ×
                  </button>
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="notif-empty py-8 px-4 text-center text-text-3">暂无通知</div>
              ) : (
                notifications.map((n) => (
                  <div
                    className={`notif-item flex gap-3 px-4 py-3 border-b border-line-soft transition-colors duration-150 last:border-0 hover:bg-surface-soft cursor-pointer ${n.read ? '' : 'unread bg-blue/[0.04]'}`}
                    key={n._id}
                    onClick={() => handleNotifClick(n)}
                  >
                    <span className={`notif-dot w-2 h-2 flex-shrink-0 mt-1.5 rounded-full bg-blue ${n.read ? 'opacity-0' : 'opacity-1'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-sm leading-normal text-text truncate">{n.title}</p>
                      <p className="m-0 text-sm leading-normal text-text-2 truncate">{n.content}</p>
                      <small className="block mt-1 text-text-3 text-xs">{formatRelativeTime(n.createdAt)}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <button className="icon-button grid w-[38px] h-[38px] place-items-center rounded-full border border-line bg-white text-text-2 shadow-xs transition-all duration-150 hover:text-blue hover:border-[#b0c4de] hover:-translate-y-px" type="button" aria-label="个人设置" onClick={() => onNavigate('settings')}>
          <Icon name="person" />
        </button>
      </div>
    </header>
  );
}

export default TopBar;
