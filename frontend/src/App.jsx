import React from 'react';
import Icon from './components/common/Icon';
import Toast from './components/common/Toast';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import AIPanel from './components/features/AIPanel';
import HomePage from './components/pages/HomePage';
import DetailPage from './components/pages/DetailPage';
import ComposePage from './components/pages/ComposePage';
import BookmarksPage from './components/pages/BookmarksPage';
import AnnouncementsPage from './components/pages/AnnouncementsPage';
import TrendingPage from './components/pages/TrendingPage';
import SettingsPage from './components/pages/SettingsPage';
import AdminPage from './components/pages/AdminPage';
import { getUserId } from './utils';

// ─── Stores ───
import usePostStore from './store/postStore';
import useCommentStore from './store/commentStore';
import useBookmarkStore from './store/bookmarkStore';
import useEventStore from './store/eventStore';
import useUiStore from './store/uiStore';

// ─── Hooks ───
import usePostActions from './hooks/usePostActions';
import useLikeBookmark from './hooks/useLikeBookmark';
import useEventActions from './hooks/useEventActions';

// ─── Services ───
import { getReports, createReport, dismissReport } from './services/reportService';

/* ─── App Root ─── */

function App() {
  // ── Stores ──
  const posts = usePostStore((s) => s.posts);
  const likedPosts = usePostStore((s) => s.likedPosts);
  const selectedPost = usePostStore((s) => s.selectedPost);
  const addPost = usePostStore((s) => s.addPost);

  const commentsMap = useCommentStore((s) => s.commentsMap);
  const addCommentStore = useCommentStore((s) => s.addComment);

  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const collectionFolders = useBookmarkStore((s) => s.collectionFolders);
  const bookmarkFolders = useBookmarkStore((s) => s.bookmarkFolders);
  const folderSelectorOpen = useBookmarkStore((s) => s.folderSelectorOpen);
  const selectFolder = useBookmarkStore((s) => s.selectFolder);
  const closeFolderSelector = useBookmarkStore((s) => s.closeFolderSelector);
  const updateFolders = useBookmarkStore((s) => s.updateFolders);
  const updateBookmarkFolders = useBookmarkStore((s) => s.updateBookmarkFolders);
  const migrateBookmarks = useBookmarkStore((s) => s.migrateBookmarks);
  const toggleBookmarkStore = useBookmarkStore((s) => s.toggleBookmark);

  const pendingEvents = useEventStore((s) => s.pendingEvents);
  const approvedEvents = useEventStore((s) => s.approvedEvents);
  const archivedEvents = useEventStore((s) => s.archivedEvents);
  const carouselItems = useEventStore((s) => s.carouselItems);
  const updateCarousel = useEventStore((s) => s.updateCarousel);
  const submitEvent = useEventStore((s) => s.submitEvent);

  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);
  const aiOpen = useUiStore((s) => s.aiOpen);
  const closeAi = useUiStore((s) => s.closeAi);
  const notifs = useUiStore((s) => s.notifs);
  const markAllNotifsRead = useUiStore((s) => s.markAllNotifsRead);
  const activePage = useUiStore((s) => s.activePage);
  const navigate = useUiStore((s) => s.navigate);
  const query = useUiStore((s) => s.query);
  const setQuery = useUiStore((s) => s.setQuery);
  const showToast = useUiStore((s) => s.showToast);
  const eventToOpen = useUiStore((s) => s.eventToOpen);
  const openEventFromCarousel = useUiStore((s) => s.openEventFromCarousel);

  // ── Hooks ──
  const { openPost } = usePostActions();
  const { toggleLike: handleLike, toggleBookmark: handleBookmark, selectFolder: handleSelectFolder } = useLikeBookmark();
  const { approveEvent, rejectEvent, archiveEvent } = useEventActions();

  // ── Local state (reports are admin-only, no store needed) ──
  const [reports, setReports] = React.useState([]);
  React.useEffect(() => {
    getReports().then(setReports);
  }, []);

  // Migration for bookmarks
  React.useEffect(() => {
    migrateBookmarks();
  }, [migrateBookmarks]);

  // ── Computed ──
  const filteredPosts = React.useMemo(() => {
    if (!query || !query.trim()) return posts;
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const text = `${p.title} ${p.content} ${(p.tags || []).join(' ')}`.toLowerCase();
      return text.includes(q);
    });
  }, [posts, query]);

  const CURRENT_USER_ID = getUserId();

  // ── Handlers ──
  const addComment = (postId, content, official = false) => {
    addCommentStore(postId, content, official);
  };

  const handleReport = (postId, reason) => {
    createReport(postId, reason, '举报人: 用户' + CURRENT_USER_ID.slice(-4)).then((newReport) => {
      setReports((prev) => [newReport, ...prev]);
    });
    showToast('举报已提交，感谢反馈');
  };

  const handleDismissReport = (reportId) => {
    dismissReport(reportId).then(() => {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    });
    showToast('已处理');
  };

  const handleToggleAi = () => {
    useUiStore.getState().toggleAi();
  };

  // ── Render ──
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} onNavigate={navigate} />
      <div className="min-w-0 flex-1">
        <TopBar
          query={query}
          onQueryChange={setQuery}
          onNavigate={navigate}
          onAIOpen={handleToggleAi}
          notifs={notifs}
          onMarkAllRead={markAllNotifsRead}
        />
        <main className="p-6 pb-12 max-md:px-4 max-md:pt-5 max-md:pb-24">
          {activePage === 'home' && (
            <HomePage
              posts={filteredPosts}
              query={query}
              onOpenPost={openPost}
              onNavigate={navigate}
              likedPosts={likedPosts}
              bookmarks={bookmarks}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onReport={handleReport}
              carouselItems={carouselItems}
              onCarouselItemClick={openEventFromCarousel}
              showToast={showToast}
              userId={CURRENT_USER_ID}
            />
          )}
          {activePage === 'trending' && (
            <TrendingPage onOpenPost={openPost} />
          )}
          {activePage === 'detail' && selectedPost && (
            <DetailPage
              post={selectedPost}
              comments={commentsMap[selectedPost.id] || []}
              liked={likedPosts.includes(selectedPost.id)}
              bookmarked={bookmarks.includes(selectedPost.id)}
              onLike={() => handleLike(selectedPost.id)}
              onBookmark={() => handleBookmark(selectedPost.id)}
              onComment={(content) => addComment(selectedPost.id, content)}
              onNavigate={navigate}
              onReport={handleReport}
            />
          )}
          {activePage === 'compose' && (
            <ComposePage onPublish={addPost} />
          )}
          {activePage === 'bookmarks' && (
            <BookmarksPage
              posts={posts}
              bookmarks={bookmarks}
              likedPosts={likedPosts}
              onOpenPost={openPost}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onReport={handleReport}
              collectionFolders={collectionFolders}
              bookmarkFolders={bookmarkFolders}
              onUpdateFolders={updateFolders}
              onUpdateBookmarkFolders={updateBookmarkFolders}
            />
          )}
          {activePage === 'announcements' && (
            <AnnouncementsPage
              showToast={showToast}
              pendingEvents={pendingEvents}
              approvedEvents={approvedEvents}
              archivedEvents={archivedEvents}
              onArchiveEvent={archiveEvent}
              onSubmitEvent={(ev) => {
                submitEvent(ev);
                showToast('活动申请已提交，等待管理员审核');
              }}
              initialEventId={eventToOpen}
            />
          )}
          {activePage === 'admin' && (
            <AdminPage
              posts={posts}
              reports={reports}
              onDismiss={handleDismissReport}
              pendingEvents={pendingEvents}
              onApproveEvent={approveEvent}
              onRejectEvent={rejectEvent}
              carouselItems={carouselItems}
              onUpdateCarousel={updateCarousel}
              approvedEvents={approvedEvents}
            />
          )}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
      <AIPanel open={aiOpen} onClose={closeAi} />
      {toast && <Toast message={toast} onDone={clearToast} />}

      {/* Folder Selector Modal */}
      {folderSelectorOpen && (
        <div
          className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 animate-modal-fade-in"
          onClick={closeFolderSelector}
        >
          <div
            className="modal-content w-[min(400px,90vw)] rounded-lg bg-white shadow-md animate-modal-scale-in p-6"
            onClick={(e) => e.stopPropagation()}
          >
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
              <button
                className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-4 py-[10px] bg-white text-text-2 text-sm font-semibold transition-all duration-150"
                onClick={closeFolderSelector}
                type="button"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
