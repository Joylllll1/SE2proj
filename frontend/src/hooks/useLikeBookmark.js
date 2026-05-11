import { useCallback } from 'react';
import usePostStore from '../store/postStore';
import useBookmarkStore from '../store/bookmarkStore';
import useUiStore from '../store/uiStore';

// ─── Stable store selectors ───
const selectToggleLike = (s) => s.toggleLike;
const selectUpdateSaves = (s) => s.updateSaves;
const selectToggleBookmark = (s) => s.toggleBookmark;
const selectSelectFolder = (s) => s.selectFolder;
const selectShowToast = (s) => s.showToast;

export default function useLikeBookmark() {
  const toggleLike = usePostStore(selectToggleLike);
  const updateSaves = usePostStore(selectUpdateSaves);
  const toggleBookmark = useBookmarkStore(selectToggleBookmark);
  const selectFolder = useBookmarkStore(selectSelectFolder);
  const showToast = useUiStore(selectShowToast);

  const handleToggleLike = useCallback((postId) => {
    toggleLike(postId);
  }, [toggleLike]);

  const handleToggleBookmark = useCallback((itemId) => {
    const result = toggleBookmark(itemId);
    if (result === 'removed') {
      updateSaves(itemId, -1);
      showToast('已取消收藏');
    } else if (result === 'selecting_folder') {
      // folder selector will handle the rest
    }
  }, [toggleBookmark, updateSaves, showToast]);

  const handleSelectFolder = useCallback((folderId) => {
    const result = selectFolder(folderId);
    if (result === 'added') {
      const store = useBookmarkStore.getState();
      if (store.pendingBookmarkItem) {
        updateSaves(store.pendingBookmarkItem.id, 1);
      }
      showToast('已收藏');
    }
  }, [selectFolder, updateSaves, showToast]);

  return {
    toggleLike: handleToggleLike,
    toggleBookmark: handleToggleBookmark,
    selectFolder: handleSelectFolder,
  };
}
