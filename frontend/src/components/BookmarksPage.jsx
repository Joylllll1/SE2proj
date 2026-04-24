import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import PostCard from './PostCard';
import EmptyState from './EmptyState';

function BookmarksPage({ posts, bookmarks, likedPosts, onOpenPost, onLike, onBookmark, onReport, collectionFolders = [], bookmarkFolders = {}, onUpdateFolders, onUpdateBookmarkFolders }) {
  const [activeFolder, setActiveFolder] = useState('all');
  const [showFolderMenu, setShowFolderMenu] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const menuRefs = useRef({});

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFolderMenu && menuRefs.current[showFolderMenu]) {
        const menuContainer = menuRefs.current[showFolderMenu];
        if (!menuContainer.contains(event.target)) {
          setShowFolderMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFolderMenu]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: 'folder-' + Date.now(),
        name: newFolderName.trim(),
        isDefault: false,
      };
      onUpdateFolders([...collectionFolders, newFolder]);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleRenameFolder = () => {
    if (editingFolder && editFolderName.trim()) {
      onUpdateFolders(collectionFolders.map((f) =>
        f.id === editingFolder ? { ...f, name: editFolderName.trim() } : f
      ));
      setEditingFolder(null);
      setEditFolderName('');
    }
  };

  const handleDeleteFolder = (folderId) => {
    if (window.confirm('确定要删除这个文件夹吗？文件夹中的内容将被移至"全部"。')) {
      // Move bookmarks from deleted folder to 'all'
      const updatedBookmarkFolders = { ...bookmarkFolders };
      delete updatedBookmarkFolders[folderId];
      onUpdateBookmarkFolders(updatedBookmarkFolders);

      // Remove the folder
      onUpdateFolders(collectionFolders.filter((f) => f.id !== folderId));
      if (activeFolder === folderId) {
        setActiveFolder('all');
      }
    }
    setShowFolderMenu(null);
  };

  // Get bookmarked posts for the active folder
  const getBookmarksForFolder = (folderId) => {
    if (folderId === 'all') {
      // Return all bookmarked posts
      return posts.filter((p) => bookmarks.includes(p.id));
    }
    // Return posts bookmarked in this specific folder
    const bookmarkIds = bookmarkFolders[folderId] || [];
    return posts.filter((p) => bookmarkIds.includes(p.id));
  };

  const folderPosts = getBookmarksForFolder(activeFolder);
  const totalItems = folderPosts.length;

  return (
    <div className="collection-page max-w-[1180px] mx-auto">
      <section className="collection-hero flex items-center justify-between gap-5 max-sm:grid max-sm:grid-cols-1">
        <div>
          <p className="eyebrow mb-[18px] text-blue text-xs font-bold tracking-widest uppercase">Saved Moments</p>
          <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">我的收藏</h1>
          <p className="mt-[9px] mb-0 text-text-2 leading-relaxed">整理并分类你在树洞中发现的精彩瞬间。</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2"
          onClick={() => setShowNewFolderModal(true)}
          type="button"
        >
          <Icon name="add_circle" /> 新建文件夹
        </button>
      </section>

      <div className="category-row flex flex-wrap gap-3 my-[22px] items-center">
        {collectionFolders.map((folder) => {
          const folderPosts = getBookmarksForFolder(folder.id);
          const count = folderPosts.length;
          const isMenuOpen = showFolderMenu === folder.id;
          const isActive = activeFolder === folder.id;
          const hasMenu = !folder.isDefault;

          return (
            <div key={folder.id} className="folder-pill-container inline-flex items-center gap-1" ref={(el) => menuRefs.current[folder.id] = el}>
              {/* Folder name button - click to switch */}
              <button
                className={`folder-name-btn px-4 py-[10px] text-sm font-semibold rounded-full border transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-md'
                    : 'bg-white text-text-2 border-line hover:border-blue/40 hover:text-blue hover:shadow-sm'
                }`}
                onClick={() => setActiveFolder(folder.id)}
                type="button"
              >
                {folder.name}
                <span className={`ml-1.5 text-xs ${isActive ? 'text-white/60' : 'text-text-3'}`}>
                  ({count})
                </span>
              </button>

              {/* Action dot button - click to show menu */}
              {hasMenu && (
                <>
                  <button
                    className={`action-dot w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                      isMenuOpen
                        ? 'bg-surface text-text shadow-sm'
                        : 'bg-surface-soft text-text-3 hover:bg-surface hover:text-text hover:shadow-sm'
                    }`}
                    onClick={(e) => { e.stopPropagation(); setShowFolderMenu(isMenuOpen ? null : folder.id); }}
                    type="button"
                    aria-label="文件夹操作"
                  >
                    <Icon name="more_horiz" style={{ fontSize: '16px' }} />
                  </button>
                  {isMenuOpen && (
                    <div className="folder-menu-dropdown absolute top-full left-0 mt-2 z-20 w-40 overflow-hidden rounded-xl border border-line-soft/80 bg-white shadow-xl shadow-black/8 animate-menu-in">
                      <div className="p-1.5">
                        <button
                          className="menu-item w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm text-text-2 rounded-lg transition-all duration-150 hover:bg-surface-soft"
                          onClick={(e) => { e.stopPropagation(); setEditingFolder(folder.id); setEditFolderName(folder.name); setShowFolderMenu(null); }}
                          type="button"
                        >
                          <Icon name="edit_square" style={{ fontSize: '15px' }} />
                          重命名
                        </button>
                        <button
                          className="menu-item w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm text-red rounded-lg transition-all duration-150 hover:bg-red-soft/40"
                          onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                          type="button"
                        >
                          <Icon name="delete" style={{ fontSize: '15px' }} />
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {totalItems === 0 ? (
        <EmptyState title={activeFolder === 'all' ? '还没有收藏内容' : `"${collectionFolders.find((f) => f.id === activeFolder)?.name || '此文件夹'}" 暂无收藏`} description="浏览树洞时点击书签图标即可收藏。" />
      ) : (
        <section className="masonry-grid [column-count:2] [column-gap:18px] max-sm:[column-count:1]">
          {folderPosts.map((post) => (
            <div key={post.id} className="inline-block w-full mb-[18px]">
              <PostCard
                compact
                post={post}
                onOpen={() => onOpenPost(post)}
                liked={likedPosts.includes(post.id)}
                bookmarked
                onLike={() => onLike(post.id)}
                onBookmark={() => onBookmark(post.id)}
                onReport={onReport}
              />
            </div>
          ))}
        </section>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 animate-modal-fade-in" onClick={() => setShowNewFolderModal(false)}>
          <div className="modal-content w-[min(400px,90vw)] rounded-lg bg-white shadow-md animate-modal-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl tracking-tight mb-4">新建文件夹</h2>
            <input
              autoFocus
              className="w-full px-[14px] py-[10px] border border-line rounded-sm bg-white text-text text-sm mb-4"
              placeholder="文件夹名称"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
            />
            <div className="flex justify-end gap-3">
              <button className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-4 py-[10px] bg-white text-text-2 text-sm font-semibold transition-all duration-150" onClick={() => setShowNewFolderModal(false)} type="button">取消</button>
              <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleCreateFolder} disabled={!newFolderName.trim()} type="button">创建</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {editingFolder && (
        <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 animate-modal-fade-in" onClick={() => { setEditingFolder(null); setEditFolderName(''); }}>
          <div className="modal-content w-[min(400px,90vw)] rounded-lg bg-white shadow-md animate-modal-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl tracking-tight mb-4">重命名文件夹</h2>
            <input
              autoFocus
              className="w-full px-[14px] py-[10px] border border-line rounded-sm bg-white text-text text-sm mb-4"
              placeholder="文件夹名称"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameFolder(); }}
            />
            <div className="flex justify-end gap-3">
              <button className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-4 py-[10px] bg-white text-text-2 text-sm font-semibold transition-all duration-150" onClick={() => { setEditingFolder(null); setEditFolderName(''); }} type="button">取消</button>
              <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleRenameFolder} disabled={!editFolderName.trim()} type="button">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookmarksPage;
