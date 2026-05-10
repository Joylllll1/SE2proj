import React from 'react';
import Icon from '../common/Icon';

function useScrollReveal() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      el.classList.add('in');
    }
  }, []);

  return ref;
}

function Reveal({ children, className = '', as: Tag = 'div', delay = 0 }) {
  const ref = useScrollReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

export default function LandingPage({ onGetStarted, onLogin, onRegister }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ─── Bokeh animation ─── */
  React.useEffect(() => {
    const b1 = document.getElementById('lp-blob-1');
    const b2 = document.getElementById('lp-blob-2');
    const b3 = document.getElementById('lp-blob-3');
    if (!b1 || !b2 || !b3) return;

    /* Observe hero visibility — pause animation off-screen */
    let raf;
    let running = true;
    const hero = document.getElementById('lp-hero');
    if (hero && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        ([entry]) => { running = entry.isIntersecting; },
        { threshold: 0 }
      );
      io.observe(hero);
      raf = io; // store for cleanup
    }

    const configs = [
      { speed: 0.2,  phase: 0,   xAmp: 70, yAmp: 50, sAmp: 0.08 },
      { speed: 0.13, phase: 2.1, xAmp: 50, yAmp: 80, sAmp: 0.06 },
      { speed: 0.1,  phase: 4.2, xAmp: 80, yAmp: 40, sAmp: 0.1 },
    ];
    const blobs = [b1, b2, b3];
    let start = performance.now();
    let tickId;

    const tick = () => {
      if (!running) { tickId = requestAnimationFrame(tick); return; }
      const t = (performance.now() - start) / 1000;
      for (let i = 0; i < 3; i++) {
        const c = configs[i];
        const x = Math.sin(t * c.speed + c.phase) * c.xAmp;
        const y = Math.cos(t * c.speed * 0.7 + c.phase) * c.yAmp;
        const s = 1 + Math.sin(t * c.speed * 0.5 + c.phase) * c.sAmp;
        blobs[i].style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      }
      tickId = requestAnimationFrame(tick);
    };

    tickId = requestAnimationFrame(tick);
    return () => {
      if (raf && raf.disconnect) raf.disconnect();
      cancelAnimationFrame(tickId);
    };
  }, []);

  const scenarios = [
    { icon: 'masks', label: '情绪倾诉', desc: '不想让熟人看到，但又想说出来', color: '#d4787c' },
    { icon: 'history_edu', label: '课程讨论', desc: '对课程、校园生活的匿名讨论', color: '#7ab892' },
    { icon: 'forum', label: '宿舍关系', desc: '那些不好意思当面说的话', color: '#b08a9a' },
    { icon: 'local_fire_department', label: '寻求建议', desc: '匿名求建议，更真实的回答', color: '#e8a87c' },
    { icon: 'sentiment_satisfied', label: '记录心情', desc: '只想记录此刻，不被打扰', color: '#a8c4d8' },
  ];

  return (
    <div className="min-h-screen">
      {/* Film grain — scoped to landing */}
      <div className="lp-grain" />

      {/* ─── Nav ─── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="flex items-center gap-2.5">
          <span className="lp-brand-mark">N</span>
          <span className={`font-bold text-[17px] tracking-tight transition-colors ${
            scrolled ? 'text-text' : 'text-[#e8b4b8]'
          }`}>
            NJU 树洞
          </span>
        </div>
        <div className={`flex items-center gap-4 text-sm font-semibold transition-colors ${
          scrolled ? 'text-text-2' : 'text-[#e8b4b8]'
        }`}>
          <button type="button" className="lp-nav-link" onClick={onLogin || onGetStarted}>登录</button>
          <span className="opacity-30">|</span>
          <button type="button" className="lp-nav-link" onClick={onRegister || onGetStarted}>注册</button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section id="lp-hero" className="lp-hero">
        <div className="lp-hero-bokeh">
          <div id="lp-blob-1" className="lp-blob" style={{
            width: '65vw', height: '65vw',
            background: 'radial-gradient(circle, rgba(212,120,124,0.45), transparent 70%)',
            top: '-20%', left: '-15%',
          }} />
          <div id="lp-blob-2" className="lp-blob" style={{
            width: '55vw', height: '55vw',
            background: 'radial-gradient(circle, rgba(196,168,184,0.35), transparent 70%)',
            bottom: '-20%', right: '-10%',
          }} />
          <div id="lp-blob-3" className="lp-blob" style={{
            width: '40vw', height: '40vw',
            background: 'radial-gradient(circle, rgba(240,212,208,0.3), transparent 70%)',
            bottom: '25%', left: '20%',
          }} />
        </div>
        <div className="lp-hero-glow" />

        <div className="lp-hero-content">
          <h1 className="lp-hero-title">NJU 树洞</h1>
          <p className="lp-hero-subtitle">校园里最安全的匿名说话角落</p>
          <p className="lp-hero-tagline">
            半匿名表达 · 低压交流 · 有边界的自由
          </p>
          <div className="lp-hero-cta">
            <button type="button" className="lp-cta-primary" onClick={onGetStarted}>
              开始使用
            </button>
          </div>
        </div>

        <div className="lp-scroll-indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* ─── 场景区：在树洞里，NJUer 们在… ─── */}
      <section className="lp-section" style={{ background: 'var(--color-bg)' }}>
        <div className="lp-section-inner">
          <Reveal>
            <h2 className="lp-section-title">在树洞里，NJUer 们在&hellip;</h2>
            <p className="lp-section-desc">来自真实调研，校园匿名表达的常见场景</p>
          </Reveal>
          <div className="lp-scenarios-grid">
            {scenarios.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} as="article">
                <div className="lp-scenario-card" style={{ '--accent': s.color }}>
                  <div className="lp-scenario-icon" style={{ background: `${s.color}18`, color: s.color }}>
                    <Icon name={s.icon} />
                  </div>
                  <h3 className="lp-scenario-title">{s.label}</h3>
                  <p className="lp-scenario-desc">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 特色 ─── */}
      <section className="lp-section" style={{ background: 'var(--color-surface-tint)' }}>
        <div className="lp-section-inner">
          <Reveal>
            <h2 className="lp-section-title">为什么选择 NJU 树洞</h2>
            <p className="lp-section-desc">基于校园场景设计的匿名表达空间</p>
          </Reveal>
          <div className="lp-features-grid">
            {/* Card 1 */}
            <Reveal as="article" delay={0}>
              <div className="lp-feature-card" style={{ '--accent': '#d4787c' }}>
                <div className="lp-feature-icon" style={{ background: '#d4787c18', color: '#d4787c' }}>
                  <Icon name="masks" />
                </div>
                <h3 className="lp-feature-title">帖子级匿名</h3>
                <p className="lp-feature-desc">
                  同一帖子内身份一致，便于连续讨论；不同帖子之间完全隔离，无法跨帖关联。
                </p>
                <p className="lp-feature-note">
                  对外匿名，对内可治理
                </p>
              </div>
            </Reveal>
            {/* Card 2 */}
            <Reveal as="article" delay={100}>
              <div className="lp-feature-card" style={{ '--accent': '#7ab892' }}>
                <div className="lp-feature-icon" style={{ background: '#7ab89218', color: '#7ab892' }}>
                  <Icon name="chat_bubble" />
                </div>
                <h3 className="lp-feature-title">低压力表达</h3>
                <p className="lp-feature-desc">
                  想求共鸣可以互动，只想记录可以不被打扰。两种需求都能满足，互动的节奏由你决定。
                </p>
                <p className="lp-feature-note">
                  来自访谈发现：用户群体天然分为&ldquo;求互动型&rdquo;和&ldquo;记录型&rdquo;
                </p>
              </div>
            </Reveal>
            {/* Card 3 */}
            <Reveal as="article" delay={200}>
              <div className="lp-feature-card" style={{ '--accent': '#b08a9a' }}>
                <div className="lp-feature-icon" style={{ background: '#b08a9a18', color: '#b08a9a' }}>
                  <Icon name="shield_person" />
                </div>
                <h3 className="lp-feature-title">有边界的自由</h3>
                <p className="lp-feature-desc">
                  举报、审核、敏感词拦截、身份追溯层层保护。调研中 90%+ 的用户认为治理能力是刚需。
                </p>
                <p className="lp-feature-note">
                  匿名不是失控的理由
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 用户心声 ─── */}
      <section className="lp-section" style={{ background: 'var(--color-bg)' }}>
        <div className="lp-section-inner">
          <Reveal>
            <h2 className="lp-section-title">真实的校园声音</h2>
            <p className="lp-section-desc">来自 NJU 在校生的问卷与访谈</p>
          </Reveal>

          <div className="lp-quotes-grid">
            <Reveal delay={0}>
              <blockquote className="lp-quote-card">
                <p>&ldquo;有时候就是不想让熟人看到，但又想说。&rdquo;</p>
                <footer>&mdash; 来自调研访谈的真实声音</footer>
              </blockquote>
            </Reveal>
            <Reveal delay={150}>
              <blockquote className="lp-quote-card">
                <p>&ldquo;朋友圈和 QQ 动态熟人太多，发什么都有人看，就希望有一个地方能说说。&rdquo;</p>
                <footer>&mdash; 问卷调研中多次出现的痛点</footer>
              </blockquote>
            </Reveal>
            <Reveal delay={300}>
              <blockquote className="lp-quote-card">
                <p>&ldquo;有些时候就是想求个共鸣，不是想要谁给我解决问题。&rdquo;</p>
                <footer>&mdash; 访谈中用户对&ldquo;低压力表达&rdquo;的期待</footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 信任 ─── */}
      <section className="lp-section" style={{ background: 'var(--color-surface-tint)' }}>
        <div className="lp-section-inner">
          <Reveal>
            <h2 className="lp-section-title">不是完全自由的匿名</h2>
            <p className="lp-section-desc">而是一个可信赖、可治理的表达空间</p>
          </Reveal>
          <div className="lp-trust-grid">
            <div className="lp-trust-item">
              <div className="lp-trust-icon-wrap">
                <Icon name="verified_user" />
              </div>
              <span>帖子级匿名保护</span>
            </div>
            <div className="lp-trust-item">
              <div className="lp-trust-icon-wrap">
                <Icon name="report_problem" />
              </div>
              <span>一键举报违规内容</span>
            </div>
            <div className="lp-trust-item">
              <div className="lp-trust-icon-wrap">
                <Icon name="shield_person" />
              </div>
              <span>管理员审核机制</span>
            </div>
            <div className="lp-trust-item">
              <div className="lp-trust-icon-wrap">
                <Icon name="fingerprint" />
              </div>
              <span>后台可追溯身份映射</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 最终 CTA ─── */}
      <section className="lp-cta-section">
        <Reveal>
          <div className="lp-cta-inner">
            <h2 className="lp-cta-title">准备好了吗？</h2>
            <p className="lp-cta-desc">在这里说说心里话，不用担心被熟人看到</p>
            <button type="button" className="lp-cta-primary lp-cta-large" onClick={onGetStarted}>
              开始使用
            </button>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ─── */}
      <footer className="lp-footer">
        <Reveal>
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <span className="lp-brand-mark">N</span>
            <span className="text-white/80 font-bold text-base tracking-tight">NJU 树洞</span>
          </div>
          <p className="text-white/50 text-xs mb-6">在这里说说心里话</p>
          <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
            <span>&copy; 2025 NJU树洞</span>
            <span className="opacity-30">|</span>
            <button type="button" className="hover:text-white/60 transition-colors">关于我们</button>
            <span className="opacity-30">|</span>
            <button type="button" className="hover:text-white/60 transition-colors">隐私政策</button>
          </div>
        </Reveal>
      </footer>
    </div>
  );
}
