import { useCallback } from 'react';
import usePostStore from '../store/postStore';
import useUiStore from '../store/uiStore';

// ─── Stable store selectors ───
const selectSetSelectedPost = (s) => s.setSelectedPost;
const selectNavigate = (s) => s.navigate;

export default function usePostActions() {
  const setSelectedPost = usePostStore(selectSetSelectedPost);
  const navigate = useUiStore(selectNavigate);

  const openPost = useCallback((post) => {
    setSelectedPost(post);
    navigate('detail');
  }, [setSelectedPost, navigate]);

  return { openPost };
}
