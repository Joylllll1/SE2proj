import React from 'react';
import Toast from './components/common/Toast';
import ConfirmLeaveDialog from './components/common/ConfirmLeaveDialog';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MobileNav from './components/layout/MobileNav';
import AIPanel from './components/features/AIPanel';
import HomePage from './components/pages/HomePage';
import SettingsPage from './components/pages/SettingsPage';
import PasswordChangePage from './components/pages/PasswordChangePage';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ForgetPasswordPage from './components/pages/ForgetPasswordPage';
import BookmarksPage from './components/pages/BookmarksPage';
import MyPage from './components/pages/MyPage';
import DetailPage from './components/pages/DetailPage';
import ComposePage from './components/pages/ComposePage';
import DraftsPage from './components/pages/DraftsPage';
import LikesPage from './components/pages/LikesPage';
import MyPostsPage from './components/pages/MyPostsPage';
import AdminDashboard from './components/pages/AdminDashboard';
import AnnouncementsPage from './components/pages/AnnouncementsPage';
import UnderConstruction from './components/common/UnderConstruction';
import EmptyState from './components/common/EmptyState';
import useAuth from './hooks/useAuth';
import useAuthStore from './store/authStore';
import { getUserId } from './utils';

// ─── Stores ───
import useBookmarkStore from './store/bookmarkStore';
import useCommentStore from './store/commentStore';
import usePostStore from './store/postStore';
import useUiStore, { ADMIN_ROUTE_PAGES } from './store/uiStore';

// ─── Hooks ───
import useLikeBookmark from './hooks/useLikeBookmark';
import usePostActions from './hooks/usePostActions';
import useNotificationPolling from './hooks/useNotificationPolling';
import * as postService from './services/postService';
import * as reportService from './services/reportService';
import useNotificationStore from './store/notificationStore';

// ─── Stable store selectors (prevents zustand getSnapshot churn) ───
const selectInitialized = (s) => s.initialized;
const selectFolderSelectorOpen = (s) => s.folderSelectorOpen;
const selectCloseFolderSelector = (s) => s.closeFolderSelector;
const selectCollectionFolders = (s) => s.collectionFolders;
const selectToast = (s) => s.toast;
const selectClearToast = (s) => s.clearToast;
const selectShowToast = (s) => s.showToast;
const selectAiOpen = (s) => s.aiOpen;
const selectCloseAi = (s) => s.closeAi;
const selectActivePage = (s) => s.activePage;
const selectUiDraftId = (s) => s.draftId;
const selectLeaveConfirm = (s) => s.leaveConfirm;
const selectCloseLeaveConfirm = (s) => s.closeLeaveConfirm;
const selectConfirmPendingNavigation = (s) => s.confirmPendingNavigation;
const selectDiscardPendingNavigation = (s) => s.discardPendingNavigation;
const selectNavigate = (s) => s.navigate;
const selectQuery = (s) => s.query;
const selectSetQuery = (s) => s.setQuery;
const selectSelectedPost = (s) => s.selectedPost;
const selectLikedPosts = (s) => s.likedPosts;
const selectGetPostLikeView = (s) => s.getPostLikeView;
const selectBookmarks = (s) => s.bookmarks;
const selectCommentsMap = (s) => s.commentsMap;
const selectFetchComments = (s) => s.fetchComments;
const selectAddComment = (s) => s.addComment;
const selectDeleteComment = (s) => s.deleteComment;
const selectDeleteReply = (s) => s.deleteReply;
const selectUpsertComment = (s) => s.upsertComment;
const selectRemoveComment = (s) => s.removeComment;
const selectUpsertReply = (s) => s.upsertReply;
const selectRemoveReply = (s) => s.removeReply;
const selectPosts = (s) => s.posts;
const selectClearSelectedPost = (s) => s.clearSelectedPost;
const selectBookmarkFolders = (s) => s.bookmarkFolders;
const selectUpdateFolders = (s) => s.updateFolders;
const selectUpdateBookmarkFolders = (s) => s.updateBookmarkFolders;
const selectResetNotifications = (s) => s.reset;
const AUTH_PAGES = ['login', 'register', 'forgot-password', 'reset-password'];

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

  const toast = useUiStore(selectToast);
  const clearToast = useUiStore(selectClearToast);
  const showToast = useUiStore(selectShowToast);
  const aiOpen = useUiStore(selectAiOpen);
  const closeAi = useUiStore(selectCloseAi);
  const activePage = useUiStore(selectActivePage);
  const uiDraftId = useUiStore(selectUiDraftId);
  const leaveConfirm = useUiStore(selectLeaveConfirm);
  const closeLeaveConfirm = useUiStore(selectCloseLeaveConfirm);
  const confirmPendingNavigation = useUiStore(selectConfirmPendingNavigation);
  const discardPendingNavigation = useUiStore(selectDiscardPendingNavigation);
  const navigate = useUiStore(selectNavigate);
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  const currentUserId = useAuthStore((s) => s.user?._id);
  const isAdminRoute = activePage === 'admin' || ADMIN_ROUTE_PAGES.includes(activePage);

  // ── 已登录用户不可访问 auth 页面（如通过后退回到 /login） ──
  React.useEffect(() => {
    if (isAuthenticated && AUTH_PAGES.includes(activePage)) {
      navigate(isAdmin ? 'admin-events' : 'home', undefined, { force: true });
    }
  }, [isAuthenticated, isAdmin, activePage, navigate]);

  const query = useUiStore(selectQuery);
  const setQuery = useUiStore(selectSetQuery);

  // ── Detail Page ──
  const selectedPost = usePostStore(selectSelectedPost);
  const likedPosts = usePostStore(selectLikedPosts);
  const getPostLikeView = usePostStore(selectGetPostLikeView);
  const bookmarks = useBookmarkStore(selectBookmarks);
  const commentsMap = useCommentStore(selectCommentsMap);
  const comments = commentsMap[selectedPost?.id] || [];
  const fetchComments = useCommentStore(selectFetchComments);
  const addComment = useCommentStore(selectAddComment);
  const deleteComment = useCommentStore(selectDeleteComment);
  const deleteReply = useCommentStore(selectDeleteReply);
  const upsertComment = useCommentStore(selectUpsertComment);
  const removeComment = useCommentStore(selectRemoveComment);
  const upsertReply = useCommentStore(selectUpsertReply);
  const removeReply = useCommentStore(selectRemoveReply);
  const detailPost = selectedPost ? getPostLikeView(selectedPost) : null;
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  // ── Hooks ──
  const { toggleLike, toggleBookmark, selectFolder: handleSelectFolder } = useLikeBookmark();
  const { openPost } = usePostActions();

  // ── Bookmarks page needs ──
  const posts = usePostStore(selectPosts);
  const clearSelectedPost = usePostStore(selectClearSelectedPost);
  const bookmarkFolders = useBookmarkStore(selectBookmarkFolders);
  const updateFolders = useBookmarkStore(selectUpdateFolders);
  const updateBookmarkFolders = useBookmarkStore(selectUpdateBookmarkFolders);
  const resetNotifications = useNotificationStore(selectResetNotifications);

  // ── Global SSE connection ──
  React.useEffect(() => {
    let intervalId = null;

    const startPolling = () => {
      if (intervalId) return;
      intervalId = window.setInterval(() => {
        if (activePage === 'home' && !document.hidden) {
          usePostStore.getState().fetchPosts(1, '', { silent: true });
        }
      }, 60000);
    };

    if (!user || !accessToken) {
      startPolling();
      return () => {
        if (intervalId) {
          window.clearInterval(intervalId);
        }
      };
    }

    const es = new EventSource(`/api/stream?token=${encodeURIComponent(accessToken)}`);

    es.addEventListener('new-post', () => {
      if (activePage === 'home') {
        usePostStore.getState().fetchPosts(1, '', { silent: true });
      }
    });

    es.addEventListener('post-deleted', (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        if (data.postId) {
          usePostStore.getState().removePostById(data.postId);
        }
      } catch {
        // Ignore malformed SSE payloads from older clients or transient errors.
      }
    });

    es.onerror = () => {
      es.close();
      startPolling();
    };

    const currentPostId = selectedPost?.id;
    const parseCurrentPostEvent = (event) => {
      if (activePage !== 'detail' || !currentPostId) return null;
      try {
        const data = JSON.parse(event.data || '{}');
        return data.postId === currentPostId ? data : null;
      } catch {
        return null;
      }
    };

    es.addEventListener('comment-created', (event) => {
      const data = parseCurrentPostEvent(event);
      if (data?.comment) {
        const existingComments = useCommentStore.getState().commentsMap[currentPostId] || [];
        const alreadyExists = existingComments.some(
          (comment) => (comment.id || comment._id) === (data.comment.id || data.comment._id),
        );
        upsertComment(currentPostId, data.comment);
        if (!alreadyExists) {
          usePostStore.getState().updateCommentCount(currentPostId, 1);
        }
      }
    });

    es.addEventListener('comment-deleted', (event) => {
      const data = parseCurrentPostEvent(event);
      if (data?.commentId) {
        const existingComments = useCommentStore.getState().commentsMap[currentPostId] || [];
        const deletedComment = existingComments.find(
          (comment) => (comment.id || comment._id) === data.commentId,
        );
        const existedBeforeRemoval = Boolean(deletedComment);
        const removedItemCount = existedBeforeRemoval
          ? 1 + ((deletedComment?.replies || []).filter((reply) => !reply.isDeleted).length)
          : 0;
        removeComment(currentPostId, data.commentId);
        if (removedItemCount > 0) {
          usePostStore.getState().updateCommentCount(currentPostId, -removedItemCount);
        }
      }
    });

    es.addEventListener('reply-created', (event) => {
      const data = parseCurrentPostEvent(event);
      if (data?.commentId && data?.reply) {
        const existingComments = useCommentStore.getState().commentsMap[currentPostId] || [];
        const parentComment = existingComments.find(
          (comment) => (comment.id || comment._id) === data.commentId,
        );
        const alreadyExists = (parentComment?.replies || []).some(
          (reply) => (reply.id || reply._id) === (data.reply.id || data.reply._id),
        );
        upsertReply(currentPostId, data.commentId, data.reply);
        if (!alreadyExists) {
          usePostStore.getState().updateCommentCount(currentPostId, 1);
        }
      }
    });

    es.addEventListener('reply-deleted', (event) => {
      const data = parseCurrentPostEvent(event);
      if (data?.commentId && data?.replyId) {
        const existingComments = useCommentStore.getState().commentsMap[currentPostId] || [];
        const parentComment = existingComments.find(
          (comment) => (comment.id || comment._id) === data.commentId,
        );
        const existedBeforeRemoval = (parentComment?.replies || []).some(
          (reply) => (reply.id || reply._id) === data.replyId,
        );
        removeReply(currentPostId, data.commentId, data.replyId);
        if (existedBeforeRemoval) {
          usePostStore.getState().updateCommentCount(currentPostId, -1);
        }
      }
    });

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      es.close();
    };
  }, [
    accessToken,
    activePage,
    removeComment,
    removeReply,
    selectedPost?.id,
    upsertComment,
    upsertReply,
    user,
  ]);

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

  // ── Get draftId from URL for compose page ──
  const [composeDraftId, setComposeDraftId] = React.useState(null);
  React.useEffect(() => {
    if (activePage === 'compose') {
      const params = new URLSearchParams(window.location.search);
      const did = params.get('draftId');
      setComposeDraftId(did || null);
    } else {
      setComposeDraftId(null);
    }
  }, [activePage, uiDraftId]);

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    if (ADMIN_ROUTE_PAGES.includes(activePage)) return;
    navigate('admin-events', undefined, { force: true });
  }, [isAuthenticated, isAdmin, activePage, navigate]);

  // ── Notification polling ──
  useNotificationPolling(isAuthenticated && !isAdmin);

  React.useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      resetNotifications();
    }
  }, [isAuthenticated, isAdmin, resetNotifications]);

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

  // ── Admin: show AdminDashboard instead of regular app ──
  if (isAdmin) {
    return (
      <>
        <AdminDashboard />
        {toast && <Toast message={toast} onDone={clearToast} />}
      </>
    );
  }

  // ── Handlers ──
  const handleToggleAi = () => {
    useUiStore.getState().toggleAi();
  };

  const handlePublish = async (postData) => {
    try {
      const images = Array.isArray(postData.images)
        ? postData.images
        : postData.image
          ? [postData.image]
          : [];
      const payload = { ...postData, images };
      delete payload.image;
      delete payload.images;
      await usePostStore.getState().addPost({ ...payload, images });
    } catch (err) {
      showToast(err.message || '发布失败');
      throw err;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await usePostStore.getState().deletePost(postId, { clearSelectedPost: false });
      if (activePage === 'detail') {
        navigate('home', undefined, { force: true });
        clearSelectedPost();
      }
      showToast('帖子已删除');
    } catch (err) {
      showToast(err.message || '删除失败');
      throw err;
    }
  };

  const handleComment = async (content, image = '') => {
    if (!selectedPost) return;
    try {
      await addComment(selectedPost.id, content, image);
    } catch (err) {
      showToast(err.message || '评论失败');
    }
  };

  const handleReply = async (commentId, content, image = '', replyToId = null) => {
    if (!selectedPost) return;
    try {
      await useCommentStore.getState().addReply(commentId, content, image, false, replyToId);
    } catch (err) {
      showToast(err.message || '回复失败');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedPost) return;
    try {
      await deleteComment(commentId);
      showToast('评论已删除');
    } catch (err) {
      showToast(err.message || '删除评论失败');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!selectedPost) return;
    try {
      await deleteReply(commentId, replyId);
      showToast('回复已删除');
    } catch (err) {
      showToast(err.message || '删除回复失败');
    }
  };

  const handleReport = async (targetId, reason, targetType = 'post') => {
    try {
      await reportService.createReport(targetId, reason, targetType);
      showToast('举报已提交');
    } catch (err) {
      showToast(err.message || '举报失败');
    }
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
        />
        <main className="min-w-0 overflow-x-hidden p-6 pb-12 max-md:px-4 max-md:pt-5 max-md:pb-24">
          {activePage === 'home' && <HomePage />}
          {activePage === 'detail' && (
            selectedPost ? (
              <DetailPage
                post={detailPost}
                comments={comments}
                liked={detailPost?.isLiked}
                bookmarked={detailPost?.isSaved}
                isOwner={currentUserId && detailPost?.ownerUserId === currentUserId}
                currentUserId={currentUserId}
                onLike={() => toggleLike(selectedPost.id)}
                onBookmark={() => toggleBookmark(selectedPost.id)}
                onComment={handleComment}
                onReply={handleReply}
                onDeleteComment={handleDeleteComment}
                onDeleteReply={handleDeleteReply}
                onDelete={handleDeletePost}
                onNavigate={navigate}
                onReport={handleReport}
              />
            ) : (
              <UnderConstruction feature="帖子详情" />
            )
          )}
          {activePage === 'compose' && <ComposePage onPublish={handlePublish} draftId={composeDraftId} />}
          {activePage === 'drafts' && <DraftsPage onNavigate={navigate} />}
          {activePage === 'my' && (
            <MyPage
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
              onNavigate={navigate}
            />
          )}
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
            />
          )}
          {activePage === 'announcements' && <AnnouncementsPage showToast={showToast} />}
          {isAdminRoute && (
            <EmptyState
              title="无权访问管理后台"
              description="当前账号没有管理员权限。"
            />
          )}
          {activePage === 'myposts' && (
            <MyPostsPage onNavigate={navigate} />
          )}
          {activePage === 'settings' && <SettingsPage />}
          {activePage === 'settings-password' && <PasswordChangePage />}
        </main>
        <MobileNav activePage={activePage} onNavigate={navigate} />
      </div>
      <AIPanel open={aiOpen} onClose={closeAi} />
      {toast && <Toast message={toast} onDone={clearToast} />}
      <ConfirmLeaveDialog
        open={leaveConfirm.open}
        title={leaveConfirm.title}
        description={leaveConfirm.description}
        confirmText={leaveConfirm.confirmText}
        discardText={leaveConfirm.discardText}
        cancelText={leaveConfirm.cancelText}
        mode={leaveConfirm.mode}
        onConfirm={confirmPendingNavigation}
        onDiscard={discardPendingNavigation}
        onCancel={closeLeaveConfirm}
      />

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
