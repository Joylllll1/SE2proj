import { useCallback } from 'react';
import usePostStore from '../store/postStore';
import useUiStore from '../store/uiStore';

export default function usePostActions() {
  const setSelectedPost = usePostStore((s) => s.setSelectedPost);
  const navigate = useUiStore((s) => s.navigate);

  const openPost = useCallback((post) => {
    setSelectedPost(post);
    navigate('detail');
  }, [setSelectedPost, navigate]);

  return { openPost };
}
