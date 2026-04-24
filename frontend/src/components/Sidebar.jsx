import React from 'react';
import Icon from './Icon';

const navItems = [
  { id: 'home', label: '动态首页', icon: 'dynamic_feed' },
  { id: 'trending', label: '热门话题', icon: 'local_fire_department' },
  { id: 'announcements', label: '校园公告', icon: 'campaign' },
  { id: 'bookmarks', label: '我的收藏', icon: 'bookmark' },
  { id: 'admin', label: '管理后台', icon: 'admin_panel_settings' },
  { id: 'settings', label: '个人设置', icon: 'person' },
];

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar sticky top-0 flex w-[240px] h-screen flex-col flex-shrink-0 border-r border-line bg-[#f5f5f7] z-30 max-md:hidden">
      <div className="pt-5 px-[14px]">
        <button className="flex items-center gap-2.5 w-full mb-[22px] px-2 py-1.5 border-0 rounded-md bg-transparent text-inherit text-left hover:bg-surface" onClick={() => onNavigate('home')} type="button">
          <span className="grid w-9 h-9 place-items-center rounded-[10px] text-white bg-gradient-to-br from-[#134ba0] to-blue shadow-sm">
            <Icon name="park" filled />
          </span>
          <span>
            <strong className="block text-[17px] font-bold tracking-tight">南大树洞</strong>
            <small className="block mt-px text-text-3 text-[10px] font-semibold tracking-widest uppercase">NJU Community</small>
          </span>
        </button>
        <nav className="grid gap-[5px]">
          {navItems.map((item) => (
            <button
              className={`nav-item relative flex items-center gap-2.5 w-full min-h-10 px-3 border border-transparent rounded-lg text-text-2 bg-transparent text-sm font-semibold text-left transition-colors duration-150 hover:text-text hover:bg-black/[0.04] ${activePage === item.id ? 'active text-blue bg-blue-soft font-bold' : ''}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon name={item.icon} filled={activePage === item.id} />
              <span>{item.label}</span>
              {activePage === item.id && (
                <span className="absolute -left-[14px] w-[3px] h-5 rounded-r-full bg-blue" />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-[14px]">
        <button className="sidebar-compose-btn flex items-center justify-center gap-2 w-full h-[42px] mt-3 border-0 rounded-full text-white bg-blue text-sm font-bold shadow-sm transition-all duration-150 hover:bg-blue-2 hover:-translate-y-px" onClick={() => onNavigate('compose')} type="button">
          <Icon name="edit_square" />
          <span>发布新动态</span>
        </button>
        <section className="identity-card grid grid-cols-[30px_1fr] gap-2.5 p-[14px] border border-line rounded-md bg-surface shadow-xs mt-3">
          <div className="avatar grid w-[30px] h-[30px] place-items-center rounded-lg text-blue bg-blue-soft text-[13px] font-bold">鲸</div>
          <div>
            <strong className="block text-xs mt-0">匿名身份</strong>
            <p className="m-0 mt-[3px] text-text-3 text-[11px] leading-normal">同帖稳定 · 跨帖不可关联</p>
          </div>
        </section>
      </div>
    </aside>
  );
}

export default Sidebar;
export { navItems };