import React from 'react';
import Icon from '../common/Icon';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';

const adminNavItems = [
  { id: 'events', label: '公告审核', icon: 'campaign' },
  { id: 'reports', label: '举报管理', icon: 'report_problem' },
  { id: 'bans', label: '封禁记录', icon: 'gavel' },
  { id: 'audit', label: '审计日志', icon: 'receipt_long' },
];

const selectLogout = (s) => s.logout;

function AdminSidebar({ activeTab, onTabChange }) {
  const logout = useAuthStore(selectLogout);
  const navigate = useUiStore((s) => s.navigate);

  const handleLogout = () => {
    logout().finally(() => navigate('login', undefined, { force: true }));
  };

  return (
    <aside className="sidebar sticky top-0 flex w-[240px] h-screen flex-col flex-shrink-0 border-r border-line bg-[#1a1a2e] z-30 max-md:hidden">
      <div className="pt-5 px-[14px]">
        <button className="brand text-white" type="button">
          <span className="brand-mark bg-blue-500">A</span>
          <span>
            <strong className="block text-[17px] font-bold tracking-tight text-white">管理后台</strong>
            <small className="block mt-px text-gray-400 text-[10px] font-semibold tracking-widest uppercase">Admin Console</small>
          </span>
        </button>
        <nav className="grid gap-[5px] mt-4">
          {adminNavItems.map((item) => (
            <button
              className={`nav-item relative flex items-center gap-2.5 w-full min-h-10 px-3 border border-transparent rounded-lg text-sm font-semibold text-left transition-colors duration-150 ${
                activeTab === item.id
                  ? 'active bg-blue-600 text-white font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              type="button"
            >
              <Icon name={item.icon} filled={activeTab === item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-[14px]">
        <button
          className="flex items-center gap-2 w-full px-3 py-2 border-0 rounded-lg text-gray-400 bg-transparent text-xs font-semibold transition-colors duration-150 hover:text-red-400 hover:bg-red-900/30"
          onClick={handleLogout}
          type="button"
        >
          <Icon name="logout" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
