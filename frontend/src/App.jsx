import React, { useState, useEffect, useCallback } from 'react';
import Icon from './components/Icon';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AIPanel from './components/AIPanel';
import HomePage from './components/HomePage';
import DetailPage from './components/DetailPage';
import ComposePage from './components/ComposePage';
import BookmarksPage from './components/BookmarksPage';
import AnnouncementsPage from './components/AnnouncementsPage';
import TrendingPage from './components/TrendingPage';
import SettingsPage from './components/SettingsPage';
import AdminPage from './components/AdminPage';
import { genId, loadJSON, saveJSON, CURRENT_USER_ID } from './utils';

/* ─── mock seed data ─── */

const SEED_POSTS = [
  {
    id: 'P-4921',
    ownerUserId: 'U-SEED01',
    time: '12分钟前',
    campus: '仙林校区',
    title: '杜厦图书馆五楼的夕阳',
    content:
      '今天刚好赶在闭馆前完成了一篇难啃的论文，走出大楼那一刻吹着晚风，感觉所有的焦虑都消失了。生活不仅有 DDL，还有此刻的晚霞。',
    mood: '宁静',
    moodType: 'calm',
    likes: 124,
    comments: 32,
    saves: 18,
    tags: ['杜厦图书馆', '考研倒计时'],
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'P-8820',
    ownerUserId: 'U-SEED02',
    time: '45分钟前',
    campus: '鼓楼校区',
    title: '保研面试前的自我怀疑',
    content:
      '这周就要保研面试了，每天都在疯狂刷题。可是看着周围厉害的大佬，总觉得自己还不够好。有没有学长学姐分享一下当年跨过这个阶段的心情？',
    mood: '焦虑',
    moodType: 'anxious',
    likes: 88,
    comments: 56,
    saves: 41,
    tags: ['保研', '求建议'],
  },
  {
    id: 'P-2105',
    ownerUserId: 'U-SEED03',
    time: '2小时前',
    campus: '仙林校区',
    title: '六食堂门口的三花猫',
    content:
      '在六食堂偶遇了一只超级粘人的三花猫。它在台阶上晒太阳，看到人走近还会慢慢伸懒腰。今天的好运被承包了。',
    mood: '快乐',
    moodType: 'happy',
    likes: 2400,
    comments: 412,
    saves: 206,
    tags: ['校园猫', '校园生活'],
    image:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'P-1020',
    ownerUserId: 'U-SEED04',
    time: '5小时前',
    campus: '仙林校区',
    title: '实验又失败了',
    content:
      '感觉自己像是在无尽的黑夜里行走。明明很努力，但结果总是不尽如人意。有没有人也在这个点还没睡？',
    mood: '忧伤',
    moodType: 'sad',
    likes: 512,
    comments: 89,
    saves: 77,
    tags: ['科研日常', '情绪树洞'],
  },
];

const SEED_COMMENTS = {
  'P-4921': [
    {
      id: 5928763,
      userId: 'U-SEED05',
      content: '插座问题确实该修了，上次我带了充电宝才敢去，五楼真的太难抢位置了。',
      time: '1小时前',
      likes: 24,
      official: false,
      replies: [
        { id: 5928764, userId: 'U-SEED06', content: '同感，建议早点去四楼，四楼插座好一点，就是没那么安静。', time: '45分钟前', likes: 5 },
      ],
    },
    {
      id: 5928765,
      userId: 'U-OFFICIAL',
      content: '感谢反馈，我们已记录您的建议。后勤部门会在本周末对五楼插座与空调进行集中排查和维护。',
      time: '30分钟前',
      likes: 89,
      official: true,
      replies: [],
    },
  ],
};

const SEED_REPORTS = [
  { id: '#R10283', type: '辱骂/攻击', source: '举报人: 用户1922', time: '3分钟前', risk: 'medium', content: '这学期的期末考也太离谱了吧，出题完全不考虑学生实际复习节奏。' },
  { id: '#R10279', type: '敏感内容', source: '系统自动拦截', time: '12分钟前', risk: 'high', content: '[该内容包含高敏词，已由 AI 初筛隐藏，请管理员人工复核。]' },
  { id: '#R10275', type: '垃圾广告', source: '举报人: 用户0032', time: '45分钟前', risk: 'low', content: '诚招打字员，时间自由，日入过百，加群了解。' },
];

/* ─── App Root ─── */

function App() {
  // --- persisted state ---
  const [posts, setPosts] = useState(() => loadJSON('nju_posts', SEED_POSTS));
  const [commentsMap, setCommentsMap] = useState(() => loadJSON('nju_comments', SEED_COMMENTS));
  const [bookmarks, setBookmarks] = useState(() => loadJSON('nju_bookmarks', []));
  const [likedPosts, setLikedPosts] = useState(() => loadJSON('nju_liked', []));
  const [collectionFolders, setCollectionFolders] = useState(() => {
    const saved = loadJSON('nju_collection_folders', null);
    if (saved) return saved;
    // First time - create default folders
    return [
      { id: 'all', name: '全部', isDefault: true },
    ];
  });
  const [bookmarkFolders, setBookmarkFolders] = useState(() => {
    const saved = loadJSON('nju_bookmark_folders', null);
    if (saved) return saved;
    // First time - migrate existing bookmarks to 'all' folder (implicit, no need to store)
    return {};
  });
  const [folderSelectorOpen, setFolderSelectorOpen] = useState(false);
  const [pendingBookmarkItem, setPendingBookmarkItem] = useState(null);

  // Migration: check if we need to migrate old bookmarks to new folder structure
  useEffect(() => {
    const hasMigrated = localStorage.getItem('nju_bookmarks_migrated');
    if (!hasMigrated) {
      // Mark as migrated - old bookmarks are already in the 'bookmarks' array
      // which is automatically included in the 'all' folder
      localStorage.setItem('nju_bookmarks_migrated', 'true');
    }
  }, []);

  // --- ephemeral state ---
  const [activePage, setActivePage] = useState('home');
  const [selectedPost, setSelectedPost] = useState(null);
  const [eventToOpen, setEventToOpen] = useState(null);
  const [query, setQuery] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [reports, setReports] = useState(SEED_REPORTS);
  const [pendingEvents, setPendingEvents] = useState(() => loadJSON('nju_pending_events', []));
  const [approvedEvents, setApprovedEvents] = useState(() => loadJSON('nju_approved_events', []));
  const [rejectedEvents, setRejectedEvents] = useState(() => loadJSON('nju_rejected_events', []));
  const [archivedEvents, setArchivedEvents] = useState(() => loadJSON('nju_archived_events', []));
  const [carouselItems, setCarouselItems] = useState(() => loadJSON('nju_carousel_items', []));
  const [notifs, setNotifs] = useState(() => loadJSON('nju_notifs', [
    { id: 'N-1', text: '你的帖子「杜厦图书馆五楼的夕阳」获得了 10 个新赞', time: '2分钟前', read: false },
    { id: 'N-2', text: '温柔的小蓝鲸 回复了你的评论', time: '15分钟前', read: false },
    { id: 'N-3', text: '校园音乐节 2026 报名即将截止，快来参加', time: '1小时前', read: true },
  ]));

  // persist on change
  useEffect(() => saveJSON('nju_posts', posts), [posts]);
  useEffect(() => saveJSON('nju_comments', commentsMap), [commentsMap]);
  useEffect(() => saveJSON('nju_bookmarks', bookmarks), [bookmarks]);
  useEffect(() => saveJSON('nju_liked', likedPosts), [likedPosts]);
  useEffect(() => saveJSON('nju_notifs', notifs), [notifs]);
  useEffect(() => saveJSON('nju_pending_events', pendingEvents), [pendingEvents]);
  useEffect(() => saveJSON('nju_approved_events', approvedEvents), [approvedEvents]);
  useEffect(() => saveJSON('nju_rejected_events', rejectedEvents), [rejectedEvents]);
  useEffect(() => saveJSON('nju_archived_events', archivedEvents), [archivedEvents]);
  useEffect(() => saveJSON('nju_carousel_items', carouselItems), [carouselItems]);
  useEffect(() => saveJSON('nju_collection_folders', collectionFolders), [collectionFolders]);
  useEffect(() => saveJSON('nju_bookmark_folders', bookmarkFolders), [bookmarkFolders]);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  const filteredPosts = posts.filter((post) => {
    const text = `${post.title} ${post.content} ${post.tags.join(' ')}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const openPost = (post) => {
    setSelectedPost(post);
    setActivePage('detail');
  };

  const openEventFromCarousel = (eventId) => {
    setEventToOpen(eventId);
    setActivePage('announcements');
    // Clear the event ID after navigation so it doesn't persist
    setTimeout(() => setEventToOpen(null), 100);
  };

  const toggleLike = (postId) => {
    setLikedPosts((prev) => {
      const next = prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId];
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: likedPosts.includes(postId) ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  };

  const toggleBookmark = (itemId) => {
    const isBookmarked = bookmarks.includes(itemId);

    if (isBookmarked) {
      // Remove bookmark
      setBookmarks((prev) => {
        showToast('已取消收藏');
        return prev.filter((id) => id !== itemId);
      });
      // Remove from all folders
      const updatedFolders = {};
      Object.keys(bookmarkFolders).forEach((folderId) => {
        updatedFolders[folderId] = bookmarkFolders[folderId].filter((id) => id !== itemId);
      });
      setBookmarkFolders(updatedFolders);

      // Update saves count on the post
      setPosts((prev) =>
        prev.map((p) =>
          p.id === itemId ? { ...p, saves: Math.max(0, p.saves - 1) } : p,
        ),
      );
    } else {
      // Show folder selector
      setPendingBookmarkItem({ id: itemId, type: 'post' });
      setFolderSelectorOpen(true);
    }
  };

  const handleSelectFolder = (folderId) => {
    if (!pendingBookmarkItem) return;

    const { id: itemId } = pendingBookmarkItem;

    // Add to bookmarks list
    setBookmarks((prev) => [...prev, itemId]);

    // Add to specific folder if not 'all'
    if (folderId !== 'all') {
      setBookmarkFolders((prev) => ({
        ...prev,
        [folderId]: [...(prev[folderId] || []), itemId],
      }));
    }

    // Update saves count on the post
    setPosts((prev) =>
      prev.map((p) =>
        p.id === itemId ? { ...p, saves: p.saves + 1 } : p,
      ),
    );

    showToast('已收藏');
    setFolderSelectorOpen(false);
    setPendingBookmarkItem(null);
  };

  const addPost = (post) => {
    const newPost = {
      ...post,
      id: genId(),
      ownerUserId: CURRENT_USER_ID,
      time: '刚刚',
      likes: 0,
      comments: 0,
      saves: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
    showToast('发布成功');
    setActivePage('home');
  };

  const addComment = (postId, content) => {
    const newComment = {
      id: Date.now(),
      userId: CURRENT_USER_ID,
      content,
      time: '刚刚',
      likes: 0,
      official: false,
      replies: [],
    };
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)),
    );
  };

  const dismissReport = (reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    showToast('已处理');
  };

  const handleReport = (postId, reason) => {
    const newReport = {
      id: '#R' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      type: reason,
      source: '举报人: 用户' + CURRENT_USER_ID.slice(-4),
      time: '刚刚',
      risk: 'medium',
      postId: postId, // Store postId directly for easier access
      content: `帖子 ${postId} 被举报，原因：${reason}`,
    };
    setReports((prev) => [newReport, ...prev]);
    showToast('举报已提交，感谢反馈');
  };

  const handleApproveEvent = (event) => {
    const approvedEvent = {
      id: event.id,
      title: event.title,
      type: event.type,
      place: event.place,
      time: event.time,
      image: event.poster,
      description: event.description,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
    };
    setApprovedEvents((prev) => [approvedEvent, ...prev]);
    setPendingEvents((prev) => prev.filter((e) => e.id !== event.id));
    setNotifs((prev) => [
      {
        id: 'N-' + Date.now(),
        text: `你的活动「${event.title}」已通过审核，已在校园公告展示`,
        time: '刚刚',
        read: false,
      },
      ...prev,
    ]);
    showToast('活动已通过审核');
  };

  const handleRejectEvent = (eventId, reason) => {
    const event = pendingEvents.find((e) => e.id === eventId);
    if (!event) return;
    const rejectedEvent = {
      ...event,
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString(),
    };
    setRejectedEvents((prev) => [rejectedEvent, ...prev]);
    setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
    setNotifs((prev) => [
      {
        id: 'N-' + Date.now(),
        text: `你的活动「${event.title}」审核未通过。拒绝理由：${reason}`,
        time: '刚刚',
        read: false,
      },
      ...prev,
    ]);
    showToast('活动申请已拒绝');
  };

  const handleArchiveEvent = (event) => {
    setArchivedEvents((prev) => [event, ...prev]);
    setApprovedEvents((prev) => prev.filter((e) => e.id !== event.id));
    showToast('活动已归档');
  };

  const handleUpdateFolders = (newFolders) => {
    setCollectionFolders(newFolders);
  };

  const handleUpdateBookmarkFolders = (newBookmarkFolders) => {
    setBookmarkFolders(newBookmarkFolders);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="min-w-0 flex-1">
        <TopBar query={query} onQueryChange={setQuery} onNavigate={setActivePage} onAIOpen={() => setAiOpen(true)} notifs={notifs} onMarkAllRead={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))} />
        <main className="p-6 pb-12 max-md:px-4 max-md:pt-5 max-md:pb-24">
          {activePage === 'home' && (
            <HomePage
              posts={filteredPosts}
              query={query}
              onOpenPost={openPost}
              onNavigate={setActivePage}
              likedPosts={likedPosts}
              bookmarks={bookmarks}
              onLike={toggleLike}
              onBookmark={toggleBookmark}
              onReport={handleReport}
              carouselItems={carouselItems}
              onCarouselItemClick={openEventFromCarousel}
              showToast={showToast}
              userId={CURRENT_USER_ID}
            />
          )}
          {activePage === 'trending' && <TrendingPage onOpenPost={openPost} />}
          {activePage === 'detail' && selectedPost && (
            <DetailPage
              post={selectedPost}
              comments={commentsMap[selectedPost.id] || []}
              liked={likedPosts.includes(selectedPost.id)}
              bookmarked={bookmarks.includes(selectedPost.id)}
              onLike={() => toggleLike(selectedPost.id)}
              onBookmark={() => toggleBookmark(selectedPost.id)}
              onComment={(content) => addComment(selectedPost.id, content)}
              onNavigate={setActivePage}
              onReport={handleReport}
            />
          )}
          {activePage === 'compose' && <ComposePage onPublish={addPost} />}
          {activePage === 'bookmarks' && (
            <BookmarksPage
              posts={posts}
              bookmarks={bookmarks}
              likedPosts={likedPosts}
              onOpenPost={openPost}
              onLike={toggleLike}
              onBookmark={toggleBookmark}
              onReport={handleReport}
              collectionFolders={collectionFolders}
              bookmarkFolders={bookmarkFolders}
              onUpdateFolders={handleUpdateFolders}
              onUpdateBookmarkFolders={handleUpdateBookmarkFolders}
            />
          )}
          {activePage === 'announcements' && <AnnouncementsPage showToast={showToast} pendingEvents={pendingEvents} approvedEvents={approvedEvents} archivedEvents={archivedEvents} onArchiveEvent={handleArchiveEvent} onSubmitEvent={(ev) => { setPendingEvents((prev) => [...prev, ev]); showToast('活动申请已提交，等待管理员审核'); }} initialEventId={activePage === 'announcements' ? eventToOpen : null} />}
          {activePage === 'admin' && <AdminPage reports={reports} onDismiss={dismissReport} pendingEvents={pendingEvents} onApproveEvent={handleApproveEvent} onRejectEvent={handleRejectEvent} carouselItems={carouselItems} onUpdateCarousel={setCarouselItems} approvedEvents={approvedEvents} posts={posts} />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Folder Selector Modal */}
      {folderSelectorOpen && (
        <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 animate-modal-fade-in" onClick={() => setFolderSelectorOpen(false)}>
          <div className="modal-content w-[min(400px,90vw)] rounded-lg bg-white shadow-md animate-modal-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl tracking-tight mb-2">选择收藏文件夹</h2>
            <p className="text-text-2 text-sm mb-6">将内容保存到收藏文件夹</p>
            <div className="space-y-2 mb-6">
              {collectionFolders.map((folder) => (
                <button
                  key={folder.id}
                  className="w-full text-left px-4 py-3 border border-line-soft rounded-md text-sm text-text-2 hover:bg-blue-soft hover:text-blue hover:border-blue transition-all duration-150"
                  onClick={() => handleSelectFolder(folder.id)}
                  type="button"
                >
                  <span className="font-semibold">{folder.name}</span>
                  {folder.isDefault && <span className="ml-2 text-text-3 text-xs">(默认)</span>}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-4 py-[10px] bg-white text-text-2 text-sm font-semibold transition-all duration-150" onClick={() => setFolderSelectorOpen(false)} type="button">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;