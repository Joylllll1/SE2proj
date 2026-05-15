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
import LikesPage from './components/pages/LikesPage';
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
import * as postService from './services/postService';

// ─── Stable store selectors (prevents zustand getSnapshot churn) ───
const selectInitialized = (s) => s.initialized;
const selectFolderSelectorOpen = (s) => s.folderSelectorOpen;
const selectCloseFolderSelector = (s) => s.closeFolderSelector;
const selectCollectionFolders = (s) => s.collectionFolders;
const selectSelectFolder = (s) => s.selectFolder;
const selectToast = (s) => s.toast;
const selectClearToast = (s) => s.clearToast;
const selectShowToast = (s) => s.showToast;
const selectAiOpen = (s) => s.aiOpen;
const selectCloseAi = (s) => s.closeAi;
const selectNotifs = (s) => s.notifs;
const selectMarkAllNotifsRead = (s) => s.markAllNotifsRead;
const selectActivePage = (s) => s.activePage;
const selectNavigate = (s) => s.navigate;
const selectQuery = (s) => s.query;
const selectSetQuery = (s) => s.setQuery;
const selectSelectedPost = (s) => s.selectedPost;
const selectLikedPosts = (s) => s.likedPosts;
const selectBookmarks = (s) => s.bookmarks;
const selectCommentsMap = (s) => s.commentsMap;
const selectFetchComments = (s) => s.fetchComments;
const selectAddComment = (s) => s.addComment;
const selectPosts = (s) => s.posts;
const selectBookmarkFolders = (s) => s.bookmarkFolders;
const selectUpdateFolders = (s) => s.updateFolders;
const selectUpdateBookmarkFolders = (s) => s.updateBookmarkFolders;

/* ─── App Root ─── */

function App() {
  // ── Auth ──
  const { isAuthenticated, restoreSession } = useAuth();
  const initialized = useAuthStore(selectInitialized);

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
  const folderSelectorOpen = useBookmarkStore(selectFolderSelectorOpen);
  const closeFolderSelector = useBookmarkStore(selectCloseFolderSelector);
  const collectionFolders = useBookmarkStore(selectCollectionFolders);
  const selectFolder = useBookmarkStore(selectSelectFolder);

  const toast = useUiStore(selectToast);
  const clearToast = useUiStore(selectClearToast);
  const showToast = useUiStore(selectShowToast);
  const aiOpen = useUiStore(selectAiOpen);
  const closeAi = useUiStore(selectCloseAi);
  const notifs = useUiStore(selectNotifs);
  const markAllNotifsRead = useUiStore(selectMarkAllNotifsRead);
  const activePage = useUiStore(selectActivePage);
  const navigate = useUiStore(selectNavigate);

  // ── 已登录用户不可访问 auth 页面（如通过后退回到 /login） ──
  const AUTH_PAGES = ['login', 'register', 'forgot-password', 'reset-password'];
  React.useEffect(() => {
    if (isAuthenticated && AUTH_PAGES.includes(activePage)) {
      navigate('home');
    }
  }, [isAuthenticated, activePage, navigate]);

  const query = useUiStore(selectQuery);
  const setQuery = useUiStore(selectSetQuery);

  // ── Detail Page ──
  const selectedPost = usePostStore(selectSelectedPost);
  const likedPosts = usePostStore(selectLikedPosts);
  const bookmarks = useBookmarkStore(selectBookmarks);
  const commentsMap = useCommentStore(selectCommentsMap);
  const comments = commentsMap[selectedPost?.id] || [];
  const fetchComments = useCommentStore(selectFetchComments);
  const addComment = useCommentStore(selectAddComment);

  // ── Hooks ──
  const { toggleLike, toggleBookmark, selectFolder: handleSelectFolder } = useLikeBookmark();
  const { openPost } = usePostActions();

  // ── Bookmarks page needs ──
  const posts = usePostStore(selectPosts);
  const bookmarkFolders = useBookmarkStore(selectBookmarkFolders);
  const updateFolders = useBookmarkStore(selectUpdateFolders);
  const updateBookmarkFolders = useBookmarkStore(selectUpdateBookmarkFolders);

  // ── Load comments when entering detail page ──
  React.useEffect(() => {
    if (activePage === 'detail' && selectedPost?.id) {
      fetchComments(selectedPost.id);
    }
  }, [activePage, selectedPost?.id, fetchComments]);

  // ── Load post from URL when refreshing on detail page ──
  React.useEffect(() => {
    if (activePage === 'detail' && !selectedPost) {
      const match = window.location.pathname.match(/^\/detail\/(.+)/);
      if (match) {
        const postId = match[1];
        postService.fetchPostById(postId)
          .then((post) => { usePostStore.getState().setSelectedPost(post); })
          .catch(() => showToast('加载帖子失败'));
      }
    }
  }, [activePage, selectedPost, showToast]);

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

  const handleComment = async (content) => {
    if (!selectedPost) return;
    try {
      await addComment(selectedPost.id, content);
      usePostStore.getState().updateCommentCount(selectedPost.id, 1);
    } catch (err) {
      showToast(err.message || '评论失败');
    }
  };

  const handleReply = async (commentId, content, replyToId = null) => {
    if (!selectedPost) return;
    try {
      await useCommentStore.getState().addReply(commentId, content, false, replyToId);
      usePostStore.getState().updateCommentCount(selectedPost.id, 1);
    } catch (err) {
      showToast(err.message || '回复失败');
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
                bookmarked={selectedPost.isSaved}
                onLike={() => toggleLike(selectedPost.id)}
                onBookmark={() => toggleBookmark(selectedPost.id)}
                onComment={handleComment}
                onReply={handleReply}
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
          {activePage === 'likes' && (
            <LikesPage
              posts={posts}
              likedPosts={likedPosts}
              onOpenPost={openPost}
              onReport={handleReport}
              onUnlikeConfirm={(postId) => {
                // 直接更新 store 的 likedPosts，不再次调用 API
                usePostStore.setState((state) => ({
                  likedPosts: state.likedPosts.filter((id) => id !== postId),
                  posts: state.posts.map((p) =>
                    p.id === postId ? { ...p, isLiked: false } : p
                  ),
                }));
              }}
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
