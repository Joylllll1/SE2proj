import React from 'react';
import useAuthStore from '../../store/authStore';
import Icon from '../common/Icon';

const DOMAINS = [
  { label: '@nju.edu.cn', value: '@nju.edu.cn' },
  { label: '@smail.nju.edu.cn', value: '@smail.nju.edu.cn' },
];

export default function RegisterPage({ onNavigate }) {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);

  const [prefix, setPrefix] = React.useState('');
  const [domain, setDomain] = React.useState(DOMAINS[0].value);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const e = {};
    if (!prefix || !/^[a-zA-Z0-9._%+-]+$/.test(prefix)) {
      e.email = '请输入有效的邮箱前缀';
    }
    if (!password || password.length < 8) {
      e.password = '密码至少 8 位';
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      e.password = '密码需包含字母和数字';
    }
    if (password !== confirmPassword) {
      e.confirmPassword = '两次密码输入不一致';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(prefix + domain, password);
      onNavigate('home');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('邮箱')) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else if (msg.includes('密码')) {
        setErrors((prev) => ({ ...prev, password: msg }));
      }
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
        <h1 className="auth-title">创建账号</h1>
        <p className="auth-subtitle">使用 NJU 邮箱注册，加入树洞</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">学校邮箱</label>
            <div className={`auth-email-group ${errors.email ? 'auth-input-error' : ''}`}>
              <input
                id="reg-email"
                type="text"
                className="auth-email-input"
                placeholder="学号"
                value={prefix}
                onChange={(e) => { setPrefix(e.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
                autoComplete="off"
                disabled={loading}
              />
              <select className="auth-email-select" value={domain} onChange={(e) => setDomain(e.target.value)} disabled={loading}>
                {DOMAINS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            {errors.email && <p className="auth-error-text">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">密码</label>
            <input
              id="reg-password"
              type="password"
              className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
              placeholder="至少 8 位，包含字母和数字"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
              autoComplete="new-password"
              disabled={loading}
            />
            {errors.password && <p className="auth-error-text">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">确认密码</label>
            <input
              id="reg-confirm"
              type="password"
              className={`auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: '' })); }}
              autoComplete="new-password"
              disabled={loading}
            />
            {errors.confirmPassword && <p className="auth-error-text">{errors.confirmPassword}</p>}
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
                创建中…
              </span>
            ) : (
              '创建账号'
            )}
          </button>
        </form>

        <p className="auth-switch">
          已有账号？
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => onNavigate('login')}
          >
            登录
          </button>
        </p>
      </div>
    </div>
  );
}
