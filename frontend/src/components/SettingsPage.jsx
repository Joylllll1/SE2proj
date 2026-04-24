import React, { useState } from 'react';
import Icon from './Icon';
import { loadJSON, saveJSON } from '../utils';

function SettingsPage() {
  const [settings, setSettings] = useState(() =>
    loadJSON('nju_settings', {
      commentNotif: true,
      likeNotif: true,
      topicNotif: false,
      campusNotif: true,
      allowMention: true,
      publicBookmarks: false,
    }),
  );

  const toggle = (key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveJSON('nju_settings', next);
      return next;
    });
  };

  return (
    <div className="settings-page max-w-[960px] mx-auto">
      <section className="section-head large flex items-center justify-between gap-[18px]">
        <div>
          <p className="eyebrow mb-6 text-blue text-xs font-bold tracking-widest uppercase">Settings</p>
          <h1 className="m-0 text-[clamp(30px,4.2vw,44px)] leading-[1.1] tracking-tight">个人设置</h1>
          <p className="mt-[9px] mb-0 text-text-2 leading-relaxed">管理你的账号、隐私和通知偏好。</p>
        </div>
      </section>
      <div className="settings-grid grid gap-[18px]">
        <section className="settings-card overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm">
          <div className="settings-card-head flex items-center gap-[14px] px-5 py-[18px] border-b border-line-soft bg-[#fafbfc]">
            <Icon name="person" />
            <div><strong className="block text-base tracking-tight">账号信息</strong><p className="mt-[3px] mb-0 text-text-3 text-[13px]">你的校园邮箱与身份验证状态。</p></div>
          </div>
          <div className="settings-rows grid">
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] border-b border-line-soft text-sm last:border-0"><span className="text-text-2">校园邮箱</span><strong className="text-sm font-semibold">wjl@smail.nju.edu.cn</strong></div>
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] border-b border-line-soft text-sm last:border-0"><span className="text-text-2">验证状态</span><span className="pill green inline-flex items-center gap-[5px] w-fit rounded-full px-3 py-2 text-xs font-semibold text-white bg-green">已验证</span></div>
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] text-sm"><span className="text-text-2">注册时间</span><strong className="text-sm font-semibold">2026年2月</strong></div>
          </div>
        </section>
        <section className="settings-card overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm">
          <div className="settings-card-head flex items-center gap-[14px] px-5 py-[18px] border-b border-line-soft bg-[#fafbfc]">
            <Icon name="masks" />
            <div><strong className="block text-base tracking-tight">匿名设置</strong><p className="mt-[3px] mb-0 text-text-3 text-[13px]">控制你的匿名展示方式。</p></div>
          </div>
          <div className="settings-rows grid">
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] border-b border-line-soft text-sm"><span className="text-text-2">匿名机制</span><strong className="text-sm font-semibold">同帖稳定身份</strong></div>
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] border-b border-line-soft text-sm"><span className="text-text-2">头像风格</span><strong className="text-sm font-semibold">随机生成</strong></div>
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] text-sm"><span className="text-text-2">ID 前缀</span><strong className="text-sm font-semibold">匿名小蓝鲸</strong></div>
          </div>
        </section>
        <section className="settings-card overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm">
          <div className="settings-card-head flex items-center gap-[14px] px-5 py-[18px] border-b border-line-soft bg-[#fafbfc]">
            <Icon name="notifications" />
            <div><strong className="block text-base tracking-tight">通知偏好</strong><p className="mt-[3px] mb-0 text-text-3 text-[13px]">选择你希望接收的通知类型。</p></div>
          </div>
          <div className="settings-rows grid">
            {[
              ['评论通知', 'commentNotif'],
              ['点赞通知', 'likeNotif'],
              ['话题更新', 'topicNotif'],
              ['校园公告', 'campusNotif'],
            ].map(([label, key]) => (
              <div className="settings-row toggle-row flex items-center justify-between gap-4 px-5 py-3 border-b border-line-soft text-sm last:border-0" key={key}>
                <span className="text-text-2">{label}</span>
                <label className="toggle relative inline-block w-[44px] h-[26px] flex-shrink-0">
                  <input className="opacity-0 w-0 h-0" type="checkbox" checked={settings[key]} onChange={() => toggle(key)} />
                  <span className={`toggle-slider absolute inset-0 rounded-full cursor-pointer transition-colors duration-200 ${settings[key] ? 'bg-blue' : 'bg-[#d1d5db]'}`}>
                    <span className={`absolute bottom-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${settings[key] ? 'translate-x-[18px]' : ''}`} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </section>
        <section className="settings-card overflow-hidden rounded-md border border-line-soft bg-surface shadow-sm">
          <div className="settings-card-head flex items-center gap-[14px] px-5 py-[18px] border-b border-line-soft bg-[#fafbfc]">
            <Icon name="shield_person" />
            <div><strong className="block text-base tracking-tight">隐私与安全</strong><p className="mt-[3px] mb-0 text-text-3 text-[13px]">管理你的数据与隐私设置。</p></div>
          </div>
          <div className="settings-rows grid">
            {[
              ['允许被 @ 提及', 'allowMention'],
              ['公开收藏列表', 'publicBookmarks'],
            ].map(([label, key]) => (
              <div className="settings-row toggle-row flex items-center justify-between gap-4 px-5 py-3 border-b border-line-soft text-sm last:border-0" key={key}>
                <span className="text-text-2">{label}</span>
                <label className="toggle relative inline-block w-[44px] h-[26px] flex-shrink-0">
                  <input className="opacity-0 w-0 h-0" type="checkbox" checked={settings[key]} onChange={() => toggle(key)} />
                  <span className={`toggle-slider absolute inset-0 rounded-full cursor-pointer transition-colors duration-200 ${settings[key] ? 'bg-blue' : 'bg-[#d1d5db]'}`}>
                    <span className={`absolute bottom-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${settings[key] ? 'translate-x-[18px]' : ''}`} />
                  </span>
                </label>
              </div>
            ))}
            <div className="settings-row flex items-center justify-between gap-4 px-5 py-[14px] text-sm">
              <span className="text-text-2">数据导出</span>
              <button className="secondary-button inline-flex items-center justify-center gap-[7px] border border-line rounded-full px-[14px] py-[7px] bg-white text-text-2 text-[13px] font-semibold transition-all duration-150" type="button">申请导出</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;