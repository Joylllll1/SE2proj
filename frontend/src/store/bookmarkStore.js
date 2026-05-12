import { create } from 'zustand';
import { loadJSON, saveJSON } from '../utils';

const useBookmarkStore = create((set, get) => ({
  bookmarks: loadJSON('nju_bookmarks', []),
  collectionFolders: (() => {
    const saved = loadJSON('nju_collection_folders', null);
    if (saved) return saved;
    return [{ id: 'all', name: '全部', isDefault: true }];
  })(),
  bookmarkFolders: loadJSON('nju_bookmark_folders', {}),
  folderSelectorOpen: false,
  pendingBookmarkItem: null,

  migrateBookmarks: () => {
    const hasMigrated = localStorage.getItem('nju_bookmarks_migrated');
    if (!hasMigrated) {
      localStorage.setItem('nju_bookmarks_migrated', 'true');
    }
  },

  toggleBookmark: (itemId) => {
    const { bookmarks } = get();
    if (bookmarks.includes(itemId)) {
      // Remove bookmark
      const newBookmarks = bookmarks.filter((id) => id !== itemId);
      const folders = { ...get().bookmarkFolders };
      Object.keys(folders).forEach((folderId) => {
        folders[folderId] = folders[folderId].filter((id) => id !== itemId);
      });
      set({ bookmarks: newBookmarks, bookmarkFolders: folders });
      saveJSON('nju_bookmarks', newBookmarks);
      saveJSON('nju_bookmark_folders', folders);
      return 'removed';
    } else {
      // Open folder selector
      set({ pendingBookmarkItem: { id: itemId, type: 'post' }, folderSelectorOpen: true });
      return 'selecting_folder';
    }
  },

  selectFolder: (folderId) => {
    const { pendingBookmarkItem, bookmarks, bookmarkFolders } = get();
    if (!pendingBookmarkItem) return;

    const { id: itemId } = pendingBookmarkItem;
    const newBookmarks = [...bookmarks, itemId];
    const newFolders = { ...bookmarkFolders };

    if (folderId !== 'all') {
      newFolders[folderId] = [...(newFolders[folderId] || []), itemId];
    }

    set({
      bookmarks: newBookmarks,
      bookmarkFolders: newFolders,
      folderSelectorOpen: false,
      pendingBookmarkItem: null,
    });
    saveJSON('nju_bookmarks', newBookmarks);
    saveJSON('nju_bookmark_folders', newFolders);

    return 'added';
  },

  closeFolderSelector: () => {
    set({ folderSelectorOpen: false, pendingBookmarkItem: null });
  },

  updateFolders: (newFolders) => {
    set({ collectionFolders: newFolders });
    saveJSON('nju_collection_folders', newFolders);
  },

  updateBookmarkFolders: (newBookmarkFolders) => {
    set({ bookmarkFolders: newBookmarkFolders });
    saveJSON('nju_bookmark_folders', newBookmarkFolders);
  },
}));

export default useBookmarkStore;
