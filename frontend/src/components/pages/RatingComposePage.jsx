import React, { useState, useRef } from 'react';
import Icon from '../common/Icon';
import ClickableImage from '../common/ClickableImage';
import EmptyState from '../common/EmptyState';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';
import { fileToOptimizedDataUrl } from '../../utils/image';

const MAX_IMAGES = 3;

function getThemeIdFromUrl() {
  const match = window.location.pathname.match(/^\/rating\/themes\/([^/]+)\/compose$/);
  return match ? match[1] : null;
}

export default function RatingComposePage({ themeId: propThemeId }) {
  const themeId = propThemeId || getThemeIdFromUrl();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  const createTopic = useRatingStore((s) => s.createTopic);
  const creatingTopic = useRatingStore((s) => s.creatingTopic);
  const navigate = useUiStore((s) => s.navigate);
  const showToast = useUiStore((s) => s.showToast);
  const fileInputRef = useRef(null);

  const addTag = (t) => {
    const cleaned = t.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned) && tags.length < 8) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      showToast(`最多上传 ${MAX_IMAGES} 张图片`);
      e.target.value = '';
      return;
    }

    Promise.all(files.slice(0, remaining).map((file) => fileToOptimizedDataUrl(file)))
      .then((urls) => setImages((prev) => [...prev, ...urls]))
      .catch((err) => showToast(err.message || '读取图片失败'));

    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('请填写评分帖标题');
      return;
    }
    setError('');
    try {
      const topic = await createTopic({
        themeId,
        title: title.trim(),
        description: description.trim(),
        tags,
        images,
      });
      showToast('评分帖创建成功');
      navigate('rating-detail', { topicId: topic.id, themeId });
    } catch (err) {
      setError(err.message || '创建失败');
    }
  };

  if (!themeId) {
    return (
      <EmptyState
        title="请先选择主题"
        description="评分帖需要在某个主题下创建，请从主题页进入"
        actionLabel="返回列表"
        onAction={() => navigate('rating')}
      />
    );
  }

  return (
    <div className="rating-compose-page collection-page max-w-[720px] mx-auto">
      <button
        type="button"
        className="flex items-center gap-1 mb-4 text-text-2 text-sm font-semibold hover:text-blue transition-colors"
        onClick={() => navigate('rating-theme-detail', { themeId })}
      >
        <Icon name="arrow_back" style={{ fontSize: '18px' }} />
        返回主题
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">创建评分帖</h1>
        <p className="mt-1 text-text-2 text-sm">在当前主题下添加具体评分项，邀请大家来打分</p>
      </header>

      <form
        className="rounded-2xl border border-line bg-surface p-5 sm:p-6 grid gap-5"
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            <Icon name="error_outline" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="rating-topic-title">
            评分帖标题 <span className="text-blue">*</span>
          </label>
          <input
            id="rating-topic-title"
            type="text"
            className="w-full px-4 py-3 border border-line rounded-lg text-sm focus:outline-none focus:border-blue"
            placeholder="例如：数据结构"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            maxLength={100}
            disabled={creatingTopic}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="rating-topic-desc">
            评分帖描述
          </label>
          <textarea
            id="rating-topic-desc"
            className="w-full px-4 py-3 border border-line rounded-lg text-sm min-h-[120px] resize-y focus:outline-none focus:border-blue"
            placeholder="介绍一下这个评分项的背景、规则或你想收集的反馈…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            disabled={creatingTopic}
          />
        </div>

        <div>
          <span className="block text-sm font-bold mb-2">标签</span>
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="pill blue text-xs px-3 py-1 flex items-center gap-1"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                disabled={creatingTopic}
              >
                {tag}
                <Icon name="close" style={{ fontSize: '14px' }} />
              </button>
            ))}
            {showTagInput ? (
              <input
                type="text"
                className="px-3 py-1 text-sm border border-line rounded-full w-28 focus:outline-none focus:border-blue"
                placeholder="标签名"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                    setShowTagInput(false);
                  }
                  if (e.key === 'Escape') setShowTagInput(false);
                }}
                onBlur={() => {
                  if (tagInput.trim()) addTag(tagInput);
                  setShowTagInput(false);
                }}
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="pill text-xs px-3 py-1 text-text-3 hover:text-blue"
                onClick={() => setShowTagInput(true)}
                disabled={creatingTopic || tags.length >= 8}
              >
                + 添加标签
              </button>
            )}
          </div>
        </div>

        <div>
          <span className="block text-sm font-bold mb-2">评分帖图片</span>
          <div className="flex flex-wrap gap-3">
            {images.map((src) => (
              <div key={src.slice(0, 32)} className="relative w-24 h-24 rounded-lg overflow-hidden border border-line">
                <ClickableImage src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 grid w-6 h-6 place-items-center rounded-full bg-black/50 text-white"
                  onClick={() => setImages(images.filter((item) => item !== src))}
                  aria-label="删除图片"
                >
                  <Icon name="close" style={{ fontSize: '14px' }} />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                className="w-24 h-24 rounded-lg border border-dashed border-line flex flex-col items-center justify-center text-text-3 hover:border-blue hover:text-blue transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={creatingTopic}
              >
                <Icon name="image" />
                <span className="text-[10px] mt-1">上传</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
          <p className="text-text-3 text-xs mt-2">最多 {MAX_IMAGES} 张，单张不超过 3MB</p>
        </div>

        <button
          type="submit"
          className="primary-button w-full py-3 text-sm font-bold disabled:opacity-50"
          disabled={creatingTopic || !title.trim()}
        >
          {creatingTopic ? '创建中…' : '发布评分帖'}
        </button>
      </form>
    </div>
  );
}
