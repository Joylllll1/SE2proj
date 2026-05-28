import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../common/Icon';
import useNotificationStore from '../../store/notificationStore';
import usePostStore from '../../store/postStore';
import useUiStore from '../../store/uiStore';

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
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  const notifDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  const activePage = useUiStore((s) => s.activePage);
  const requestFeedScroll = useUiStore((s) => s.requestFeedScroll);

  // Track viewport width for mobile detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Collapse search and optionally trigger scroll when confirming with content
  const collapseSearch = useCallback((isConfirm = false) => {
    setSearchExpanded(false);
    if (isConfirm && query.trim() && activePage === 'home') {
      requestFeedScroll();
    }
  }, [query, activePage, requestFeedScroll]);

  // Close dropdown & expanded search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifs && notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
      if (searchExpanded && searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        collapseSearch(!!query.trim());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifs, searchExpanded, collapseSearch, query]);

  // ESC key to collapse search
  useEffect(() => {
    if (!searchExpanded) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        collapseSearch(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchExpanded, collapseSearch]);

  // Focus input after expand animation
  useEffect(() => {
    if (searchExpanded && inputRef.current) {
      const timer = setTimeout(() => inputRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [searchExpanded]);

  // Get notification state from store
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const setSelectedPost = usePostStore((s) => s.setSelectedPost);

  // Handle notification click
  const handleNotifClick = (notification) => {
    markAsRead(notification._id);

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

  // Expand search on mobile
  const handleSearchFocus = () => {
    if (isMobile && !searchExpanded) {
      setSearchExpanded(true);
    }
  };

  // Clear search input
  const handleClearSearch = () => {
    onQueryChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Action button handler (取消/确认)
  const handleSearchAction = () => {
    collapseSearch(!!query.trim());
  };

  const mobilePlaceholder = '搜索帖子、话题...';
  const desktopPlaceholder = '搜索帖子、话题或匿名 ID...';

  const isExpanded = isMobile && searchExpanded;

  return (
    <header
      className={`topbar sticky top-0 z-20 flex items-center justify-between gap-5 h-[60px] px-7 border-b border-line bg-white/82 backdrop-blur-xs max-sm:h-[48px] max-sm:px-3 max-sm:gap-2 ${isExpanded ? 'topbar-search-expanded' : ''}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {isExpanded ? (
        /* ── Mobile expanded search layout ── */
        <div ref={searchContainerRef} className="search-box">
          <Icon name="search" />
          <input
            ref={inputRef}
            className="w-full border-0 outline-0 text-text bg-transparent text-sm"
            aria-label="搜索树洞"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={desktopPlaceholder}
            value={query}
          />
          {query && (
            <button
              className="search-clear-btn"
              onClick={handleClearSearch}
              type="button"
              aria-label="清除搜索"
            >
              ×
            </button>
          )}
        </div>
      ) : (
        /* ── Normal layout ── */
        <>
          <div className="search-box">
            <Icon name="search" />
            <input
              className="w-full border-0 outline-0 text-text bg-transparent text-sm"
              aria-label="搜索树洞"
              onFocus={handleSearchFocus}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={isMobile ? mobilePlaceholder : desktopPlaceholder}
              value={query}
            />
          </div>
          <div className="topbar-actions flex items-center gap-2.5 max-sm:gap-1.5">
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
                <div ref={notifDropdownRef} className="notif-dropdown">
                  <div className="notif-header flex items-center justify-between px-4 py-[14px] border-b border-line-soft bg-surface-soft max-sm:px-3 max-sm:py-3">
                    <strong className="text-[15px] max-sm:text-sm">通知</strong>
                    <div className="flex items-center gap-2 max-sm:gap-1.5">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="notif-mark-read px-[10px] py-1 border-0 rounded-full bg-blue-soft text-blue text-xs font-semibold max-sm:px-[8px] max-sm:text-[11px]"
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
                        className={`notif-item flex gap-3 px-4 py-3 border-b border-line-soft transition-colors duration-150 last:border-0 hover:bg-surface-soft cursor-pointer max-sm:px-3 max-sm:py-2.5 ${n.read ? '' : 'unread bg-blue/[0.04]'}`}
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
            <button className="icon-button max-sm:hidden grid w-[38px] h-[38px] place-items-center rounded-full border border-line bg-white text-text-2 shadow-xs transition-all duration-150 hover:text-blue hover:border-[#b0c4de] hover:-translate-y-px" type="button" aria-label="个人设置" onClick={() => onNavigate('settings')}>
              <Icon name="person" />
            </button>
          </div>
        </>
      )}

      {/* Action button next to expanded search box */}
      {isExpanded && (
        <button
          className="search-action-btn"
          onClick={handleSearchAction}
          type="button"
        >
          {query.trim() ? '确认' : '取消'}
        </button>
      )}
    </header>
  );
}

export default TopBar;
