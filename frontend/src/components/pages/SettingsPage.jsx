import React, { useState, useCallback } from 'react';
import Icon from '../common/Icon';
import useAuthStore from '../../store/authStore';
import * as authService from '../../services/authService';
import useUiStore from '../../store/uiStore';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useUiStore((s) => s.navigate);

  const [prefs, setPrefs] = useState(() => ({
    reply: user?.notificationPreferences?.reply ?? true,
    like: user?.notificationPreferences?.like ?? true,
    announcement: user?.notificationPreferences?.announcement ?? true,
    reportResult: user?.notificationPreferences?.reportResult ?? true,
  }));

  const toggle = useCallback(async (key) => {
    const prev = prefs;
    const next = { ...prev, [key]: !prev[key] };
    setPrefs(next);
    try {
      const data = await authService.updateProfile({ notificationPreferences: next });
      useAuthStore.setState({ user: data.user });
    } catch {
      setPrefs(prev);
      showToast('更新失败，请重试');
    }
  }, [prefs, showToast]);

  return (
    <div className="settings-page max-w-[960px] mx-auto">
      <section className="section-head large flex items-center justify-between gap-[18px]">
        <div>
          <p className="eyebrow mb-6 text-blue text-xs font-bold tracking-widest uppercase">Settings</p>
          <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">个人设置</h1>
          <p className="mt-[9px] mb-0 text-text-2 leading-relaxed">管理你的账号和通知偏好。</p>
        </div>
      </section>
      <div className="settings-grid grid gap-[18px]">
        {/* 账号信息 */}
        <section className="settings-card overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm">
          <div className="settings-card-head flex items-center gap-[14px] px-5 py-[18px] border-b border-line-soft bg-[#fafbfc]">
            <Icon name="person" />
            <div><strong className="block text-base tracking-tight">账号信息</strong><p className="mt-[3px] mb-0 text-text-3 text-[13px]">你的校园邮箱与身份验证状态。</p></div>
          </div>
          <div className="settings-rows grid">
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] border-b border-line-soft text-sm last:border-0"><span className="text-text-2">校园邮箱</span><strong className="text-sm font-semibold">{user?.email || '—'}</strong></div>
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] border-b border-line-soft text-sm last:border-0"><span className="text-text-2">验证状态</span><span className="pill green inline-flex items-center gap-[5px] w-fit rounded-full px-3 py-2 text-xs font-semibold text-white bg-green">已验证</span></div>
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] text-sm"><span className="text-text-2">注册时间</span><strong className="text-sm font-semibold">{formatDate(user?.createdAt)}</strong></div>
          </div>
        </section>

        {/* 通知偏好 */}
        <section className="settings-card overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm">
          <div className="settings-card-head flex items-center gap-[14px] px-5 py-[18px] border-b border-line-soft bg-[#fafbfc]">
            <Icon name="notifications" />
            <div><strong className="block text-base tracking-tight">通知偏好</strong><p className="mt-[3px] mb-0 text-text-3 text-[13px]">选择你希望接收的通知类型。</p></div>
          </div>
          <div className="settings-rows grid">
            {[
              ['评论回复', 'reply'],
              ['点赞通知', 'like'],
              ['系统公告', 'announcement'],
              ['投诉处理结果', 'reportResult'],
            ].map(([label, key]) => (
              <div className="settings-row toggle-row flex items-center justify-between gap-4 px-5 py-3 border-b border-line-soft text-sm last:border-0" key={key}>
                <span className="text-text-2">{label}</span>
                <label className="toggle relative inline-block w-[44px] h-[26px] flex-shrink-0">
                  <input className="opacity-0 w-0 h-0" type="checkbox" checked={prefs[key]} onChange={() => toggle(key)} />
                  <span className={`toggle-slider absolute inset-0 rounded-full cursor-pointer transition-colors duration-200 ${prefs[key] ? 'bg-blue' : 'bg-[#d1d5db]'}`}>
                    <span className={`absolute bottom-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${prefs[key] ? 'translate-x-[18px]' : ''}`} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* 隐私与安全 */}
        <section className="settings-card overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm">
          <div className="settings-card-head flex items-center gap-[14px] px-5 py-[18px] border-b border-line-soft bg-[#fafbfc]">
            <Icon name="shield_person" />
            <div><strong className="block text-base tracking-tight">隐私与安全</strong><p className="mt-[3px] mb-0 text-text-3 text-[13px]">管理密码与安全设置。</p></div>
          </div>
          <div className="settings-rows grid">
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] text-sm">
              <span className="text-text-2">修改密码</span>
              <button className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-[14px] py-[7px] bg-white text-text-2 text-[13px] font-semibold transition-all duration-150" type="button" onClick={() => navigate('settings-password')}>修改</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
