import React from 'react';
import Toast from './components/common/Toast';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import AIPanel from './components/features/AIPanel';
import HomePage from './components/pages/HomePage';
import SettingsPage from './components/pages/SettingsPage';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ForgetPasswordPage from './components/pages/ForgetPasswordPage';
import BookmarksPage from './components/pages/BookmarksPage';
import DetailPage from './components/pages/DetailPage';
import ComposePage from './components/pages/ComposePage';
import UnderConstruction from './components/common/UnderConstruction';
import useAuth from './hooks/useAuth';
import useAuthStore from './store/authStore';
import { getUserId } from './utils';

// ─── Stores ───
import useBookmarkStore from './store/bookmarkStore';
import useCommentStore from './store/commentStore';
import usePostStore from './store/postStore';
import useUiStore from './store/uiStore';

// ─── Hooks ───
import useLikeBookmark from './hooks/useLikeBookmark';
import usePostActions from './hooks/usePostActions';

/* ─── App Root ─── */

function App() {
  // ── Auth ──
  const { isAuthenticated, restoreSession } = useAuth();
  const initialized = useAuthStore((s) => s.initialized);

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ── SPA History: 浏览器前进/后退 ──
  React.useEffect(() => {
    const onPop = () => useUiStore.getState().handlePopState();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ── Stores ──
  const folderSelectorOpen = useBookmarkStore((s) => s.folderSelectorOpen);
  const closeFolderSelector = useBookmarkStore((s) => s.closeFolderSelector);
  const collectionFolders = useBookmarkStore((s) => s.collectionFolders);
  const selectFolder = useBookmarkStore((s) => s.selectFolder);

  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);
  const showToast = useUiStore((s) => s.showToast);
  const aiOpen = useUiStore((s) => s.aiOpen);
  const closeAi = useUiStore((s) => s.closeAi);
  const notifs = useUiStore((s) => s.notifs);
  const markAllNotifsRead = useUiStore((s) => s.markAllNotifsRead);
  const activePage = useUiStore((s) => s.activePage);
  const navigate = useUiStore((s) => s.navigate);

  // ── 已登录用户不可访问 auth 页面（如通过后退回到 /login） ──
  const AUTH_PAGES = ['login', 'register', 'forgot-password', 'reset-password'];
  React.useEffect(() => {
    if (isAuthenticated && AUTH_PAGES.includes(activePage)) {
      navigate('home');
    }
  }, [isAuthenticated, activePage, navigate]);

  const query = useUiStore((s) => s.query);
  const setQuery = useUiStore((s) => s.setQuery);

  // ── Detail Page ──
  const selectedPost = usePostStore((s) => s.selectedPost);
  const likedPosts = usePostStore((s) => s.likedPosts);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const comments = useCommentStore((s) => s.commentsMap[selectedPost?.id] || []);
  const fetchComments = useCommentStore((s) => s.fetchComments);
  const addComment = useCommentStore((s) => s.addComment);

  // ── Hooks ──
  const { toggleLike, toggleBookmark, selectFolder: handleSelectFolder } = useLikeBookmark();
  const { openPost } = usePostActions();

  // ── Bookmarks page needs ──
  const posts = usePostStore((s) => s.posts);
  const bookmarkFolders = useBookmarkStore((s) => s.bookmarkFolders);
  const updateFolders = useBookmarkStore((s) => s.updateFolders);
  const updateBookmarkFolders = useBookmarkStore((s) => s.updateBookmarkFolders);

  // ── Landing page / Auth gate ──
  if (!initialized) return null;

  if (!isAuthenticated) {
    if (activePage === 'login') {
      return <LoginPage onNavigate={navigate} />;
    }
    if (activePage === 'register') {
      return <RegisterPage onNavigate={navigate} />;
    }
    if (activePage === 'forgot-password') {
      return <ForgetPasswordPage onNavigate={navigate} />;
    }
    return (
      <LandingPage
        onGetStarted={() => {
          if (!localStorage.getItem('nju_user_id')) {
            getUserId();
          }
          navigate('login');
        }}
        onLogin={() => navigate('login')}
        onRegister={() => navigate('register')}
      />
    );
  }

  // ── Handlers ──
  const handleToggleAi = () => {
    useUiStore.getState().toggleAi();
  };

  const handlePublish = async (postData) => {
    try {
      const { image, ...rest } = postData;
      await usePostStore.getState().addPost({ ...rest, images: image ? [image] : [] });
      navigate('home');
    } catch (err) {
      showToast(err.message || '发布失败');
    }
  };

  // ── Load comments when entering detail page ──
  React.useEffect(() => {
    if (activePage === 'detail' && selectedPost?.id) {
      fetchComments(selectedPost.id);
    }
  }, [activePage, selectedPost?.id, fetchComments]);

  const handleComment = async (content) => {
    if (!selectedPost) return;
    try {
      await addComment(selectedPost.id, content);
      usePostStore.getState().updateCommentCount(selectedPost.id, 1);
    } catch (err) {
      showToast(err.message || '评论失败');
    }
  };

  const handleReport = () => {
    showToast('举报功能即将上线');
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
          {activePage === 'home' && <HomePage />}
          {activePage === 'trending' && <UnderConstruction feature="热门" />}
          {activePage === 'detail' && (
            selectedPost ? (
              <DetailPage
                post={selectedPost}
                comments={comments}
                liked={likedPosts.includes(selectedPost.id)}
                bookmarked={bookmarks.includes(selectedPost.id)}
                onLike={() => toggleLike(selectedPost.id)}
                onBookmark={() => toggleBookmark(selectedPost.id)}
                onComment={handleComment}
                onNavigate={navigate}
                onReport={handleReport}
              />
            ) : (
              <UnderConstruction feature="帖子详情" />
            )
          )}
          {activePage === 'compose' && <ComposePage onPublish={handlePublish} />}
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
              onUpdateFolders={updateFolders}
              onUpdateBookmarkFolders={updateBookmarkFolders}
            />
          )}
          {activePage === 'announcements' && <UnderConstruction feature="公告活动" />}
          {activePage === 'admin' && <UnderConstruction feature="管理后台" />}
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
