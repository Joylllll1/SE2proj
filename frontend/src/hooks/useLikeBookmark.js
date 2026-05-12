import { useCallback } from 'react';
import usePostStore from '../store/postStore';
import useBookmarkStore from '../store/bookmarkStore';
import useUiStore from '../store/uiStore';

// ─── Stable store selectors ───
const selectToggleLike = (s) => s.toggleLike;
const selectToggleSave = (s) => s.toggleSave;
const selectToggleBookmark = (s) => s.toggleBookmark;
const selectSelectFolder = (s) => s.selectFolder;
const selectShowToast = (s) => s.showToast;

export default function useLikeBookmark() {
  const toggleLike = usePostStore(selectToggleLike);
  const toggleSave = usePostStore(selectToggleSave);
  const toggleBookmark = useBookmarkStore(selectToggleBookmark);
  const selectFolder = useBookmarkStore(selectSelectFolder);
  const showToast = useUiStore(selectShowToast);

  const handleToggleLike = useCallback((postId) => {
    toggleLike(postId);
  }, [toggleLike]);

  const handleToggleBookmark = useCallback((itemId) => {
    const result = toggleBookmark(itemId);
    if (result === 'removed') {
      toggleSave(itemId);
      showToast('已取消收藏');
    } else if (result === 'selecting_folder') {
      // folder selector will handle the rest
    }
  }, [toggleBookmark, toggleSave, showToast]);

  const handleSelectFolder = useCallback((folderId) => {
    // Capture itemId BEFORE selectFolder clears pendingBookmarkItem
    const store = useBookmarkStore.getState();
    const itemId = store.pendingBookmarkItem?.id;
    const result = selectFolder(folderId);
    if (result === 'added') {
      if (itemId) {
        toggleSave(itemId);
      }
      showToast('已收藏');
    }
  }, [selectFolder, toggleSave, showToast]);

  return {
    toggleLike: handleToggleLike,
    toggleBookmark: handleToggleBookmark,
    selectFolder: handleSelectFolder,
  };
}
