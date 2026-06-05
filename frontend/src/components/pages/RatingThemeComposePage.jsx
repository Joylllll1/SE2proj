import React, { useState } from 'react';
import Icon from '../common/Icon';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';

export default function RatingThemeComposePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const createTheme = useRatingStore((s) => s.createTheme);
  const creatingTheme = useRatingStore((s) => s.creatingTheme);
  const navigate = useUiStore((s) => s.navigate);
  const showToast = useUiStore((s) => s.showToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('请填写主题名称');
      return;
    }
    setError('');
    try {
      const theme = await createTheme({
        name: name.trim(),
        description: description.trim(),
      });
      showToast('主题创建成功');
      navigate('rating-theme-detail', { themeId: theme.id });
    } catch (err) {
      setError(err.message || '创建失败');
    }
  };

  return (
    <div className="rating-theme-compose-page collection-page max-w-[720px] mx-auto">
      <button
        type="button"
        className="flex items-center gap-1 mb-4 text-text-2 text-sm font-semibold hover:text-blue transition-colors"
        onClick={() => navigate('rating')}
      >
        <Icon name="arrow_back" style={{ fontSize: '18px' }} />
        返回列表
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">创建评分主题</h1>
        <p className="mt-1 text-text-2 text-sm">第一步：创建主题类别；第二步：在主题内添加具体评分帖</p>
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
          <label className="block text-sm font-bold mb-2" htmlFor="rating-theme-name">
            主题名称 <span className="text-blue">*</span>
          </label>
          <input
            id="rating-theme-name"
            type="text"
            className="w-full px-4 py-3 border border-line rounded-lg text-sm focus:outline-none focus:border-blue"
            placeholder="例如：本学期选修课推荐"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            maxLength={100}
            disabled={creatingTheme}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="rating-theme-desc">
            主题描述
          </label>
          <textarea
            id="rating-theme-desc"
            className="w-full px-4 py-3 border border-line rounded-lg text-sm min-h-[100px] resize-y focus:outline-none focus:border-blue"
            placeholder="简要说明这个主题下会收录哪些评分内容…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            disabled={creatingTheme}
          />
        </div>

        <button
          type="submit"
          className="primary-button w-full py-3 text-sm font-bold disabled:opacity-50"
          disabled={creatingTheme || !name.trim()}
        >
          {creatingTheme ? '创建中…' : '创建主题'}
        </button>
      </form>
    </div>
  );
}
