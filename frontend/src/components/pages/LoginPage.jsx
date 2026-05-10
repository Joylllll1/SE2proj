import React from 'react';
import useAuthStore from '../../store/authStore';
import Icon from '../common/Icon';

const DOMAINS = [
  { label: '@nju.edu.cn', value: '@nju.edu.cn' },
  { label: '@smail.nju.edu.cn', value: '@smail.nju.edu.cn' },
];

export default function LoginPage({ onNavigate }) {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [prefix, setPrefix] = React.useState('');
  const [domain, setDomain] = React.useState(DOMAINS[0].value);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prefix || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    setError('');
    try {
      await login(prefix + domain, password);
      onNavigate('home');
    } catch (err) {
      setError(err.message || '邮箱或密码错误');
    }
  };

  return (
    <div className="auth-page">
      {/* Brand */}
      <div className="auth-brand">
        <span className="auth-brand-mark">Ｎ</span>
        <span className="auth-brand-text">NJU 树洞</span>
      </div>

      <div className="auth-card">
        <h1 className="auth-title">登录</h1>
        <p className="auth-subtitle">欢迎回到 NJU 树洞</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* General error */}
          {error && (
            <div className="auth-general-error">
              <Icon name="error_outline" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">学校邮箱</label>
            <div className={`auth-email-group ${error ? 'auth-input-error' : ''}`}>
              <input
                id="login-email"
                type="text"
                className="auth-email-input"
                placeholder="学号"
                value={prefix}
                onChange={(e) => { setPrefix(e.target.value); setError(''); }}
                autoComplete="off"
                disabled={loading}
              />
              <select className="auth-email-select" value={domain} onChange={(e) => setDomain(e.target.value)} disabled={loading}>
                {DOMAINS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">密码</label>
            <input
              id="login-password"
              type="password"
              className={`auth-input ${error ? 'auth-input-error' : ''}`}
              placeholder="输入密码"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner">
                <Icon name="loop" />
                登录中…
              </span>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <p className="auth-switch">
          没有账号？
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => onNavigate('register')}
          >
            注册
          </button>
        </p>
      </div>
    </div>
  );
}
