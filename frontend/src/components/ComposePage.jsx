import React, { useState, useRef } from 'react';
import Icon from './Icon';

function ComposePage({ onPublish }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodType, setMoodType] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef(null);

  const moodOptions = [
    ['平静', 'sentiment_satisfied', 'calm'],
    ['喜悦', 'sentiment_very_satisfied', 'happy'],
    ['焦虑', 'sentiment_neutral', 'anxious'],
    ['忧伤', 'sentiment_dissatisfied', 'sad'],
  ];

  const suggestedTags = ['期末周碎碎念', '食堂新品测评', '南大星空', '科研日常', '校园猫', '保研', '求建议', '校园生活', '求职实习', '情绪树洞'];

  const moodLabel = moodOptions.find(([, , t]) => t === moodType)?.[0] || '';

  const addTag = (t) => {
    const cleaned = t.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const removeTag = (t) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const canPublish = content.trim().length > 0;

  const handlePublish = () => {
    onPublish({
      title: title.trim() || '无标题',
      content: content.trim(),
      mood: moodLabel || '平静',
      moodType: moodType || 'calm',
      tags: tags.length > 0 ? tags : ['树洞'],
      campus: '仙林校区',
      image: imageUrl || undefined,
    });
  };

  return (
    <div className="compose-page max-w-[1180px] mx-auto">
      <section className="compose-heading max-w-[760px] mb-6">
        <p className="eyebrow mb-6 text-blue text-xs font-bold tracking-widest uppercase">Create Treehole</p>
        <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">发布新动态</h1>
        <p className="mt-[9px] mb-0 text-text-2 leading-relaxed">分享你此刻的想法，或记录一段校园回忆。前台匿名展示，后台仅在合规审计中可追责。</p>
      </section>
      <section className="editor-card overflow-hidden rounded-lg border border-line-soft bg-surface shadow-sm">
        <input
          className="w-full p-[18px_20px] border-b border-line-soft bg-transparent text-xl font-bold"
          placeholder="在此输入标题（选填）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full min-h-[240px] p-5 border-0 bg-transparent text-base leading-relaxed resize-y"
          maxLength={1000}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在这里写下你的内容..."
          value={content}
        />
        {/* image preview */}
        {imageUrl && (
          <div className="editor-image-preview relative p-3 border-t border-line-soft bg-[#fafbfc]">
            <img src={imageUrl} alt="preview" className="w-full max-h-[200px] rounded-md object-cover" />
            <button onClick={() => setImageUrl('')} type="button" className="editor-image-remove absolute top-4 right-6 grid w-7 h-7 place-items-center px-0 py-0 border-0 rounded-full bg-black/50 text-white text-lg cursor-pointer">&times;</button>
          </div>
        )}
        <div className="editor-tools flex flex-wrap items-center gap-3 p-[14px_20px] border-t border-line-soft bg-[#fafbfc]">
          <button type="button" className="inline-flex items-center gap-1.5 px-[10px] py-2 border border-dashed border-[#ccc] rounded-sm bg-white text-text-2 font-semibold cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Icon name="image" /> {imageUrl ? '更换图片' : '添加图片'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
          <button type="button" className="inline-flex items-center gap-1.5 px-[10px] py-2 border border-dashed border-[#ccc] rounded-sm bg-white text-text-2 font-semibold cursor-pointer" onClick={() => setShowTagInput(!showTagInput)}>
            <Icon name="tag" /> 添加话题
          </button>
          <span className="ml-auto text-text-3 text-[13px] font-bold">{content.length}/1000</span>
        </div>
        {/* tag area */}
        {(tags.length > 0 || showTagInput) && (
          <div className="editor-tag-area p-3 border-t border-line-soft bg-[#fafbfc]">
            {tags.length > 0 && (
              <div className="editor-tags flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span className="editor-tag inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-soft text-blue text-sm font-semibold" key={t}>
                    #{t}
                    <button onClick={() => removeTag(t)} type="button" className="grid w-4 h-4 place-items-center px-0 py-0 border-0 rounded-full bg-transparent text-blue text-base cursor-pointer opacity-60 transition-opacity duration-150 hover:opacity-100">&times;</button>
                  </span>
                ))}
              </div>
            )}
            {showTagInput && (
              <>
                <div className="tag-input-inline flex items-center mt-2">
                  <span className="tag-input-inline-htag flex items-center justify-center w-9 h-9 border border-line border-r-0 rounded-l-sm bg-blue-soft text-blue text-base font-bold">#</span>
                  <input
                    autoFocus
                    className="h-9 min-w-0 flex-1 px-2.5 border border-line bg-white text-sm"
                    placeholder="输入话题"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                  />
                  <button type="button" className="h-9 px-[14px] border border-l-0 border-line rounded-r-sm bg-blue text-white text-sm font-bold cursor-pointer disabled:bg-surface-soft disabled:text-text-3 disabled:cursor-not-allowed" onClick={() => addTag(tagInput)} disabled={!tagInput.trim()}>添加</button>
                </div>
                <div className="tag-suggestions flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="tag-suggestions-label text-text-3 text-xs font-semibold">热门话题：</span>
                  {suggestedTags
                    .filter((st) => !tags.includes(st))
                    .slice(0, 8)
                    .map((st) => (
                      <button key={st} className="tag-suggestion px-[10px] py-1 border border-line rounded-full bg-white text-blue text-xs font-semibold cursor-pointer transition-colors duration-150 hover:bg-blue-soft hover:border-[#b0c4de]" type="button" onClick={() => addTag(st)}>#{st}</button>
                    ))}
                </div>
              </>
            )}
          </div>
        )}
        <div className="emotion-picker flex flex-wrap items-center gap-3 p-[14px_20px] border-t border-line-soft bg-[#fafbfc]">
          {moodOptions.map(([label, icon, type]) => (
            <button
              className={`mood mood-${type} inline-flex items-center gap-[5px] px-[10px] py-2 border border-transparent rounded-full text-xs font-semibold leading-none cursor-pointer ${moodType === type ? 'selected' : ''}`}
              key={label}
              onClick={() => setMoodType(type)}
              type="button"
            >
              <Icon name={icon} /> {label}
            </button>
          ))}
        </div>
        <div className="publish-row flex flex-wrap items-center justify-between gap-3 p-[14px_20px] border-t border-line-soft bg-[#fafbfc]">
          <p className="publish-hint m-0 text-text-3 text-sm font-medium">将以匿名身份发布，身份在帖子内保持一致</p>
          <div className="flex flex-wrap gap-2.5">
            <button className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-4 py-[10px] bg-white text-text-2 font-semibold transition-all duration-150" type="button">保存草稿</button>
            <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canPublish} onClick={handlePublish} type="button">发布动态</button>
          </div>
        </div>
      </section>
      <div className="guidance-grid grid grid-cols-2 gap-[18px] mt-[22px] max-sm:grid-cols-1">
        <section className="dark-callout overflow-hidden p-5 rounded-md text-white shadow-sm bg-[#1e3a5f]">
          <h3 className="m-0 mb-2 text-xl tracking-tight">发布贴士</h3>
          <p className="m-0 text-white/76 leading-relaxed">友善发言是树洞的基石。请遵守社区公约，避免泄露自己或他人的真实身份。</p>
        </section>
        <section className="blue-callout overflow-hidden p-5 rounded-md text-white shadow-sm bg-gradient-to-br from-[#0e4a8a] to-blue">
          <h3 className="m-0 mb-2 text-xl tracking-tight">话题推荐</h3>
          <p className="m-0 text-white/76 leading-relaxed">#期末周碎碎念 #食堂新品测评 #南大星空 #科研日常</p>
        </section>
      </div>
    </div>
  );
}

export default ComposePage;