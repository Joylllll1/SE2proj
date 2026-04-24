import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { formatEventTime } from '../utils';

const SEED_ANNOUNCEMENTS = [
  {
    id: 'A-001',
    title: '校园音乐节 2026：星空下的合唱',
    type: '官方活动',
    place: '仙林校区大草坪',
    time: '本周五 19:00',
    status: '报名中',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'A-002',
    title: '春季大型双选会',
    type: '校招资讯',
    place: '方肇周体育馆',
    time: '4月28日 09:00',
    status: '500+ 岗位',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'A-003',
    title: '人工智能如何重塑人文学科研究',
    type: '学术讲座',
    place: '邵逸夫楼 B102',
    time: '5月6日 14:00',
    status: '无需预约',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  },
];

function AnnouncementsPage({ showToast, pendingEvents, approvedEvents = [], archivedEvents = [], onArchiveEvent, onSubmitEvent, initialEventId = null }) {
  const [category, setCategory] = useState('全部活动');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', place: '', time: '', type: '官方活动', description: '', poster: '' });
  const [posterPreview, setPosterPreview] = useState('');
  const posterInputRef = useRef(null);
  const categories = ['全部活动', '学术讲座', '文艺展览', '体育赛事', '科技竞赛', '志愿公益', '答辩', '校招', '实习招聘', '校园招聘会'];

  // Open event detail if initialEventId is provided
  useEffect(() => {
    if (initialEventId) {
      const eventToOpen = approvedEvents.find((e) => e.id === initialEventId) || pendingEvents.find((e) => e.id === initialEventId);
      if (eventToOpen) {
        setSelectedAnnouncement(eventToOpen);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEventId]);

  // Helper function to format time for display
  const formatTimeForDisplay = (timeStr, item) => {
    // If it's an approved event with datetime-local format, format it
    if (item && approvedEvents.some(e => e.id === item.id) && timeStr && timeStr.includes('T')) {
      return formatEventTime(timeStr);
    }
    return timeStr;
  };

  // Merge official announcements with approved events
  const allAnnouncements = [...SEED_ANNOUNCEMENTS, ...approvedEvents];

  // Filter by category
  const filteredAnnouncements = category === '全部活动'
    ? allAnnouncements
    : allAnnouncements.filter((item) => item.type === category);

  const handlePosterSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPosterPreview(url);
      setNewEvent((prev) => ({ ...prev, poster: url }));
    }
  };

  const handlePublishEvent = () => {
    if (!newEvent.title.trim()) return;
    onSubmitEvent({
      id: 'PE-' + Date.now(),
      ...newEvent,
      status: 'pending',
      submittedAt: '刚刚',
    });
    setShowPublishForm(false);
    setNewEvent({ title: '', place: '', time: '', type: '官方活动', description: '', poster: '' });
    setPosterPreview('');
  };

  const handleArchive = () => {
    if (selectedAnnouncement && approvedEvents.some((e) => e.id === selectedAnnouncement.id)) {
      onArchiveEvent(selectedAnnouncement);
      setSelectedAnnouncement(null);
    }
  };

  const isApprovedEvent = selectedAnnouncement && approvedEvents.some((e) => e.id === selectedAnnouncement.id);

  return (
    <div className="announcements-page max-w-[1180px] mx-auto">
      <section className="section-head large flex items-center justify-between gap-[18px]">
        <div>
          <p className="eyebrow mb-6 text-blue text-xs font-bold tracking-widest uppercase">Campus Center</p>
          <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">校园公告 & 活动中心</h1>
          <p className="mt-[9px] mb-0 text-text-2 leading-relaxed">探索南大校园最新资讯、讲座、比赛与活动。</p>
        </div>
        <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2" onClick={() => setShowPublishForm(true)} type="button">
          <Icon name="add_circle" /> 发布活动
        </button>
      </section>
      <div className="category-row flex flex-wrap gap-2 my-[22px]">
        {categories.map((cat) => (
          <button className={`border border-line rounded-full bg-white text-text-2 font-semibold shadow-xs px-4 py-[10px] text-sm transition-colors duration-150 hover:border-[#b0c4de] hover:text-blue ${category === cat ? 'active text-white border-[#1d1d1f] bg-[#1d1d1f]' : ''}`} key={cat} onClick={() => setCategory(cat)} type="button">
            {cat}
          </button>
        ))}
      </div>

      {/* Current Announcements */}
      <section className="announcement-grid grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1 mb-8">
        {filteredAnnouncements.map((item) => (
          <article className="announcement-card overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm" key={item.id}>
            <img alt={item.title} src={item.image} className="w-full h-[206px] object-cover" />
            <div className="p-5">
              <span className="pill blue inline-flex items-center gap-[5px] w-fit rounded-full px-3 py-2 text-xs font-semibold text-white bg-blue">{item.type}</span>
              <h3 className="mt-[14px] mb-[14px] text-xl leading-snug tracking-tight">{item.title}</h3>
              <p className="flex items-center gap-[7px] my-2 text-text-2 text-sm"><Icon name="schedule" /> {formatTimeForDisplay(item.time, item)}</p>
              <p className="flex items-center gap-[7px] my-2 text-text-2 text-sm"><Icon name="location_on" /> {item.place}</p>
              <footer className="flex items-center justify-between gap-3 mt-[18px] pt-4 border-t border-line-soft">
                <strong>{item.status === 'approved' ? '即将开始' : item.status || '即将开始'}</strong>
                <button type="button" className="border-0 rounded-full px-[13px] py-[9px] text-blue bg-blue-soft font-bold" onClick={() => setSelectedAnnouncement(item)}>查看详情</button>
              </footer>
            </div>
          </article>
        ))}
        <article className="new-event-card grid min-h-[360px] place-items-center align-content-center p-7 border-dashed border border-line-soft text-text-2 text-center">
          <Icon name="add" />
          <h3 className="mt-[14px] mb-[14px] text-xl leading-snug tracking-tight">想发起新活动？</h3>
          <p className="mb-4">在这里发布你的创意，与全校同学一起参与。</p>
          <button type="button" className="border-0 rounded-full px-[13px] py-[9px] text-blue bg-blue-soft font-bold" onClick={() => setShowPublishForm(true)}>前往申请流程</button>
        </article>
      </section>

      {/* Archived Events Section */}
      {archivedEvents.length > 0 && (
        <section className="archived-section border-t border-line-soft pt-8">
          <button
            className="flex items-center gap-2 text-text-2 text-sm font-semibold hover:text-text transition-colors duration-150"
            onClick={() => setShowArchived((prev) => !prev)}
            type="button"
          >
            <Icon name={showArchived ? "expand_less" : "expand_more"} />
            往期活动 ({archivedEvents.length})
          </button>
          {showArchived && (
            <div className="mt-4 grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {archivedEvents.map((item) => (
                <article key={item.id} className="announcement-card overflow-hidden rounded-md border border-line-soft bg-surface opacity-70 hover:opacity-100 transition-all duration-150">
                  {item.image && <img alt={item.title} src={item.image} className="w-full h-[180px] object-cover grayscale" />}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="pill text-text-3 inline-flex items-center gap-[5px] w-fit rounded-full px-2 py-1 text-[10px] font-semibold bg-surface-soft border border-line-soft">{item.type}</span>
                      <span className="text-text-3 text-[10px] uppercase tracking-wider font-semibold">已结束</span>
                    </div>
                    <h4 className="mb-2 text-base font-bold tracking-tight">{item.title}</h4>
                    <p className="flex items-center gap-2 mb-1 text-text-3 text-xs"><Icon name="schedule" /> {formatTimeForDisplay(item.time, item)}</p>
                    <p className="flex items-center gap-2 text-text-3 text-xs"><Icon name="location_on" /> {item.place}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 animate-modal-fade-in" onClick={() => setSelectedAnnouncement(null)}>
          <div className="modal-content w-[min(560px,90vw)] max-h-[85vh] overflow-y-auto rounded-lg bg-white shadow-md animate-modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <img src={selectedAnnouncement.image} alt={selectedAnnouncement.title} className="w-full h-[240px] object-cover rounded-t-lg" />
            <div className="p-6">
              <span className="pill blue inline-flex items-center gap-[5px] w-fit rounded-full px-3 py-2 text-xs font-semibold text-white bg-blue">{selectedAnnouncement.type}</span>
              <h2 className="mt-[14px] mb-[10px] text-2xl tracking-tight">{selectedAnnouncement.title}</h2>
              <p className="flex items-center gap-2 my-2 text-text-2 text-[15px]"><Icon name="schedule" /> {formatTimeForDisplay(selectedAnnouncement.time, selectedAnnouncement)}</p>
              <p className="flex items-center gap-2 my-2 text-text-2 text-[15px]"><Icon name="location_on" /> {selectedAnnouncement.place}</p>
              {selectedAnnouncement.description ? (
                <p className="modal-desc block !mt-4 pt-4 border-t border-line-soft leading-relaxed">
                  {selectedAnnouncement.description}
                </p>
              ) : (
                <p className="modal-desc block !mt-4 pt-4 border-t border-line-soft leading-relaxed">
                  欢迎全校师生参加！详情请关注校内通知，或扫描活动现场二维码报名。名额有限，先到先得。
                </p>
              )}
              <div className="modal-actions flex justify-between items-center mt-5">
                {isApprovedEvent && (
                  <button className="text-text-3 text-xs hover:text-text transition-colors duration-150" onClick={handleArchive} type="button">
                    <Icon name="archive" className="mr-1" />
                    归档活动
                  </button>
                )}
                <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 ml-auto" type="button" onClick={() => setSelectedAnnouncement(null)}>关闭</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Event Modal */}
      {showPublishForm && (
        <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 animate-modal-fade-in" onClick={() => setShowPublishForm(false)}>
          <div className="modal-content w-[min(560px,90vw)] max-h-[85vh] overflow-y-auto rounded-lg bg-white shadow-md animate-modal-scale-in" onClick={(e) => e.stopPropagation()}>
            {posterPreview && (
              <img src={posterPreview} alt="poster preview" className="w-full h-[240px] object-cover rounded-t-lg" />
            )}
            <div className="p-6">
              <h2 className="text-2xl tracking-tight">发布新活动</h2>
              <div className="modal-form grid gap-3 mt-4">
                <input className="w-full px-[14px] py-[10px] border border-line rounded-sm bg-white text-text text-sm" placeholder="活动名称 *" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <input className="w-full px-[14px] py-[10px] border border-line rounded-sm bg-white text-text text-sm" placeholder="活动地点 *" value={newEvent.place} onChange={(e) => setNewEvent({ ...newEvent, place: e.target.value })} />
                <input className="w-full px-[14px] py-[10px] border border-line rounded-sm bg-white text-text text-sm" placeholder="活动时间 *" type="datetime-local" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                <select className="px-[14px] py-[10px] border border-line rounded-sm bg-white text-sm" value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
                  <option value="官方活动">官方活动</option>
                  <option value="学术讲座">学术讲座</option>
                  <option value="文艺展览">文艺展览</option>
                  <option value="体育赛事">体育赛事</option>
                  <option value="科技竞赛">科技竞赛</option>
                  <option value="志愿公益">志愿公益</option>
                  <option value="答辩">答辩</option>
                  <option value="校招">校招</option>
                  <option value="实习招聘">实习招聘</option>
                  <option value="校园招聘会">校园招聘会</option>
                </select>
                <textarea className="w-full px-[14px] py-[10px] border border-line rounded-sm bg-white text-text text-sm min-h-[80px] resize-y" placeholder="活动简介（选填）" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                <div className="poster-upload flex items-center gap-2.5 flex-wrap">
                  <label className="text-sm font-semibold text-text-2">活动海报</label>
                  <button type="button" className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-4 py-[7px] bg-white text-text-2 text-[13px] font-semibold transition-all duration-150" onClick={() => posterInputRef.current?.click()}>
                    <Icon name="image" /> {posterPreview ? '更换海报' : '上传海报'}
                  </button>
                  <input ref={posterInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePosterSelect} />
                  {posterPreview && <span className="poster-hint text-green text-xs font-semibold">已选择图片</span>}
                </div>
              </div>
              <div className="modal-actions flex justify-end gap-2.5 mt-5">
                <button className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-4 py-[7px] bg-white text-text-2 text-[13px] font-semibold transition-all duration-150" onClick={() => setShowPublishForm(false)} type="button">取消</button>
                <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handlePublishEvent} disabled={!newEvent.title.trim() || !newEvent.place.trim() || !newEvent.time.trim()} type="button">提交申请</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementsPage;
export { SEED_ANNOUNCEMENTS };
