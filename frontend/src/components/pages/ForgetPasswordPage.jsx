import React from 'react';
import Icon from '../common/Icon';
import { sendVerifyCode, checkVerifyCode } from '../../services/verifyService';

const API_BASE = '';

export default function ForgetPasswordPage({ onNavigate }) {
  const [step, setStep] = React.useState('email'); // email → code → done
  const [email, setEmail] = React.useState('');
  const [verifyCode, setVerifyCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [countdown, setCountdown] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSendCode = async () => {
    if (!email) { setError('请输入邮箱地址'); return; }
    setLoading(true);
    setError('');
    try {
      await sendVerifyCode(email, 'reset_password');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!verifyCode) { setError('请输入验证码'); return; }
    if (!newPassword || newPassword.length < 8) { setError('密码至少 8 位'); return; }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('密码需包含字母和数字');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Verify code first
      await checkVerifyCode(email, verifyCode, 'reset_password');
      // Then reset password
      const res = await fetch(`${API_BASE}/api/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verifyCode, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '重置失败');
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="auth-page">
        <div className="auth-brand">
          <span className="auth-brand-mark">Ｎ</span>
          <span className="auth-brand-text">NJU 树洞</span>
        </div>
        <div className="auth-card">
          <div className="grid place-items-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 grid place-items-center mb-4">
              <Icon name="check" />
            </div>
            <h1 className="auth-title">密码已重置</h1>
            <p className="auth-subtitle mb-6">请使用新密码登录</p>
            <button type="button" className="auth-submit" onClick={() => onNavigate('login')}>
              去登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-brand-mark">Ｎ</span>
        <span className="auth-brand-text">NJU 树洞</span>
      </div>

      <div className="auth-card">
        <button
          type="button"
          className="flex items-center gap-1 text-sm text-text-2 hover:text-text mb-4 transition-colors"
          onClick={() => onNavigate('login')}
        >
          <Icon name="arrow_back" />
          返回登录
        </button>

        <h1 className="auth-title">忘记密码</h1>
        <p className="auth-subtitle">通过邮箱验证码重置密码</p>

        {error && (
          <div className="auth-general-error">
            <Icon name="error_outline" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleReset} noValidate>
          {/* Email + Send code */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="fp-email">学校邮箱</label>
            <div className="flex gap-2">
              <input
                id="fp-email"
                type="text"
                className="auth-input flex-1"
                placeholder="学号@nju.edu.cn"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="button"
                className={`auth-code-btn ${countdown > 0 ? 'auth-code-btn-disabled' : ''}`}
                onClick={handleSendCode}
                disabled={loading || countdown > 0}
              >
                {loading ? (
                  <Icon name="loop" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  '发送验证码'
                )}
              </button>
            </div>
          </div>

          {/* Code */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="fp-code">验证码</label>
            <input
              id="fp-code"
              type="text"
              className="auth-input"
              placeholder="6 位验证码"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {/* New Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="fp-password">新密码</label>
            <input
              id="fp-password"
              type="password"
              className="auth-input"
              placeholder="至少 8 位，包含字母和数字"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner">
                <Icon name="loop" />
                重置中…
              </span>
            ) : (
              '重置密码'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
