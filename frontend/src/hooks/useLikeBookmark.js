import { useCallback } from 'react';
import usePostStore from '../store/postStore';
import useBookmarkStore from '../store/bookmarkStore';
import useUiStore from '../store/uiStore';

export default function useLikeBookmark() {
  const toggleLike = usePostStore((s) => s.toggleLike);
  const updateSaves = usePostStore((s) => s.updateSaves);
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const selectFolder = useBookmarkStore((s) => s.selectFolder);
  const showToast = useUiStore((s) => s.showToast);

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
