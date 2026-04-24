import React from 'react';
import Icon from './Icon';
import { navItems } from './Sidebar';

function MobileNav({ activePage, onNavigate }) {
  const items = navItems.filter((item) => ['home', 'trending', 'bookmarks', 'announcements', 'settings'].includes(item.id));
  return (
    <nav className="mobile-nav fixed right-3 bottom-3 left-3 z-50 grid grid-cols-5 gap-1 p-2 border border-line rounded-[20px] bg-white/92 backdrop-blur-xs shadow-md max-lg:hidden">
      {items.map((item) => (
        <button className={`grid place-items-center gap-1 min-w-0 py-2 px-1 border-0 rounded-2xl bg-transparent text-text-3 text-[10px] font-bold transition-colors duration-150 ${activePage === item.id ? 'active text-blue bg-blue-soft' : ''}`} key={item.id} onClick={() => onNavigate(item.id)} type="button">
          <Icon name={item.icon} filled={activePage === item.id} />
          <span>{item.label.replace('动态首页', '首页').replace('个人设置', '设置')}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileNav;