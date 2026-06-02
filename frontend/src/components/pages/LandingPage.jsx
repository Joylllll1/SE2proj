import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Icon from '../common/Icon';
import Modal from '../common/Modal';

gsap.registerPlugin(ScrollTrigger);

const sceneFragments = [
  {
    icon: 'masks',
    label: '不想被熟人看见的心情',
    desc: '有些话不需要被全世界理解，只需要一个不会立刻贴标签的地方。',
  },
  {
    icon: 'history_edu',
    label: '课程、宿舍、关系的迟疑',
    desc: '校园里的很多压力都很细小，但它们真的会压在人身上。',
  },
  {
    icon: 'forum',
    label: '想求共鸣，不想被迫表态',
    desc: '不是每次开口都为了得到答案，有时候只是想确认自己不是一个人。',
  },
];

const featureMoments = [
  {
    tone: '主叙事',
    title: '同一条帖子里，你可以被记住。',
    body: '同一帖内身份一致，讨论可以延续；离开这条帖子后，一切重新归零。表达被看见，但不会被追着看。',
    note: '匿名保留连续性，但不制造长期暴露。',
    icon: 'fingerprint',
  },
  {
    tone: '互动节奏',
    title: '想被回应时有人在，不想被打扰时也可以安静。',
    body: '这里允许“求互动型”和“记录型”同时存在。不是每条内容都必须热闹，也不是每次发言都要承担社交后果。',
    note: '低压力表达，本身就是一种产品能力。',
    icon: 'chat_bubble',
  },
  {
    tone: '治理边界',
    title: '自由不是失控，匿名也不是免责。',
    body: '举报、审核、敏感词拦截、后台追溯层层兜底，安全感不是靠口号，而是靠机制落地。',
    note: '真正可信赖的匿名空间，一定有边界。',
    icon: 'shield_person',
  },
];

const voiceFragments = [
  {
    quote: '有时候就是不想让熟人看到，但又想说。',
    footer: '来自调研访谈的真实声音',
  },
  {
    quote: '朋友圈和 QQ 动态熟人太多，发什么都有人看，就希望有一个地方能说说。',
    footer: '问卷调研中多次出现的痛点',
  },
  {
    quote: '有些时候就是想求个共鸣，不是想要谁给我解决问题。',
    footer: '访谈中用户对「低压力表达」的期待',
  },
];

const trustPoints = [
  { icon: 'verified_user', label: '帖子级匿名保护' },
  { icon: 'report_problem', label: '一键举报违规内容' },
  { icon: 'shield_person', label: '管理员审核机制' },
  { icon: 'fingerprint', label: '必要时后台可追溯' },
];

export default function LandingPage({ onGetStarted, onLogin, onRegister }) {
  const [activeModal, setActiveModal] = useState(null);
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const heroRef = useRef(null);
  const heroEyebrowRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroTaglineRef = useRef(null);
  const heroCtaRef = useRef(null);
  const heroFrameRef = useRef(null);
  const heroGlowRef = useRef(null);
  const heroShotRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const blobRefs = useRef([]);
  const revealRefs = useRef([]);
  const cardRefs = useRef([]);
  const quoteRefs = useRef([]);
  const trustRefs = useRef([]);

  const setBlobRef = (index) => (element) => {
    blobRefs.current[index] = element;
  };

  const pushRevealRef = (element) => {
    if (element && !revealRefs.current.includes(element)) revealRefs.current.push(element);
  };

  const pushCardRef = (element) => {
    if (element && !cardRefs.current.includes(element)) cardRefs.current.push(element);
  };

  const pushQuoteRef = (element) => {
    if (element && !quoteRefs.current.includes(element)) quoteRefs.current.push(element);
  };

  const pushTrustRef = (element) => {
    if (element && !trustRefs.current.includes(element)) trustRefs.current.push(element);
  };

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      media.add(
        {
          reduce: '(prefers-reduced-motion: reduce)',
          desktop: '(min-width: 961px)',
          mobile: '(max-width: 960px)',
        },
        (context) => {
          const { reduce, desktop } = context.conditions;

          const blobs = blobRefs.current.filter(Boolean);
          const reveals = revealRefs.current.filter(Boolean);
          const cards = cardRefs.current.filter(Boolean);
          const quotes = quoteRefs.current.filter(Boolean);
          const trustItems = trustRefs.current.filter(Boolean);

          if (reduce) {
            gsap.set(
              [
                heroEyebrowRef.current,
                heroTitleRef.current,
                heroSubtitleRef.current,
                heroTaglineRef.current,
                heroCtaRef.current,
                heroFrameRef.current,
                heroShotRef.current,
                heroGlowRef.current,
                scrollIndicatorRef.current,
                ...reveals,
                ...cards,
                ...quotes,
                ...trustItems,
              ],
              { clearProps: 'all', opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' },
            );
            return undefined;
          }

          /* ── Hero entrance: frame → characters cascade → text ── */
          const heroChars = heroTitleRef.current?.querySelectorAll('.lp-hero-char');
          const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          heroTl
            .fromTo(
              heroFrameRef.current,
              { scale: 1.06, opacity: 0, filter: 'blur(24px)' },
              { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.4 },
            )
            .fromTo(
              heroGlowRef.current,
              { opacity: 0, scale: 0.82 },
              { opacity: 1, scale: 1, duration: 1.2 },
              '-=1.1',
            )
            .fromTo(
              heroShotRef.current,
              { yPercent: 8, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1 },
              '-=0.9',
            )
            .fromTo(
              heroChars || heroTitleRef.current,
              {
                y: 100,
                opacity: 0,
                scale: 1.4,
                rotation: 18,
                filter: 'blur(28px)',
              },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                rotation: 0,
                filter: 'blur(0px)',
                duration: 0.75,
                stagger: heroChars ? 0.09 : 0,
                ease: 'back.out(1.5)',
              },
              '-=0.45',
            )
            .fromTo(
              heroEyebrowRef.current,
              { y: 14, opacity: 0, filter: 'blur(4px)' },
              { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55 },
              '-=0.25',
            )
            .fromTo(
              heroSubtitleRef.current,
              { y: 20, opacity: 0, filter: 'blur(6px)' },
              { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6 },
              '-=0.3',
            )
            .fromTo(
              heroTaglineRef.current,
              { y: 14, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5 },
              '-=0.35',
            )
            .fromTo(
              heroCtaRef.current,
              { y: 12, opacity: 0, scale: 0.96 },
              { y: 0, opacity: 1, scale: 1, duration: 0.5 },
              '-=0.25',
            )
            .fromTo(
              scrollIndicatorRef.current,
              { opacity: 0 },
              { opacity: 1, duration: 0.35 },
              '-=0.05',
            );

          blobs.forEach((blob, index) => {
            gsap.to(blob, {
              xPercent: index === 0 ? 8 : index === 1 ? -7 : 6,
              yPercent: index === 0 ? -6 : index === 1 ? 8 : -9,
              scale: index === 0 ? 1.08 : index === 1 ? 0.94 : 1.05,
              duration: 10 + index * 2.4,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            });
          });

          gsap.to(scrollIndicatorRef.current, {
            y: 8,
            opacity: 0.38,
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });

          gsap.to(heroGlowRef.current, {
            scale: 1.05,
            opacity: 0.88,
            duration: 6.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });

          gsap.to(['.lp-ambient-shu', '.lp-ambient-dong'], {
            y: -18,
            opacity: 0.06,
            duration: 8.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            stagger: 0.4,
          });

          gsap.to('.lp-hero-vignette', {
            opacity: 0.82,
            duration: 7.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });

          if (desktop) {
            const handlePointerMove = (event) => {
              const { innerWidth, innerHeight } = window;
              const moveX = (event.clientX / innerWidth - 0.5) * 28;
              const moveY = (event.clientY / innerHeight - 0.5) * 24;
              gsap.to(heroShotRef.current, {
                x: moveX * -0.3,
                y: moveY * -0.32,
                duration: 1.3,
                ease: 'power3.out',
                overwrite: 'auto',
              });
              gsap.to(heroFrameRef.current, {
                x: moveX * 0.22,
                y: moveY * 0.18,
                duration: 1.4,
                ease: 'power3.out',
                overwrite: 'auto',
              });
              gsap.to(blobs, {
                x: (index) => moveX * (index === 1 ? -0.5 : 0.45),
                y: (index) => moveY * (index === 2 ? -0.55 : 0.35),
                duration: 1.6,
                ease: 'power3.out',
                overwrite: 'auto',
              });
            };

            const handlePointerLeave = () => {
              gsap.to([heroShotRef.current, heroFrameRef.current, ...blobs], {
                x: 0,
                y: 0,
                duration: 1.5,
                ease: 'power3.out',
                overwrite: 'auto',
              });
            };

            heroRef.current?.addEventListener('pointermove', handlePointerMove);
            heroRef.current?.addEventListener('pointerleave', handlePointerLeave);

            context.add('cleanupHeroPointer', () => {
              heroRef.current?.removeEventListener('pointermove', handlePointerMove);
              heroRef.current?.removeEventListener('pointerleave', handlePointerLeave);
            });
          }

          ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.to(navRef.current, {
                backgroundColor: `rgba(255,255,255,${0.08 + progress * 0.74})`,
                backdropFilter: `blur(${4 + progress * 14}px)`,
                WebkitBackdropFilter: `blur(${4 + progress * 14}px)`,
                boxShadow: `0 14px 36px rgba(34, 22, 28, ${progress * 0.08})`,
                duration: 0.18,
                overwrite: 'auto',
              });
              gsap.to(navRef.current?.querySelector('.lp-nav-brand-text'), {
                color: progress > 0.55 ? '#35272d' : '#f4dfe2',
                duration: 0.18,
                overwrite: 'auto',
              });
              gsap.to(navRef.current?.querySelector('.lp-nav-actions'), {
                color: progress > 0.55 ? '#65515b' : '#f0cfd4',
                duration: 0.18,
                overwrite: 'auto',
              });
            },
          });

          reveals.forEach((element, index) => {
            const offset = element.dataset.reveal === 'quote' ? 28 : 40;
            const axis = element.dataset.axis === 'x' ? 30 : 0;
            const start = element.dataset.start || 'top 84%';
            gsap.fromTo(
              element,
              {
                y: offset,
                x: axis,
                opacity: 0,
                filter: 'blur(10px)',
              },
              {
                y: 0,
                x: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.85,
                ease: 'power3.out',
                delay: index % 3 === 0 ? 0 : 0.02,
                scrollTrigger: {
                  trigger: element,
                  start,
                  once: true,
                },
              },
            );
          });

          if (cards.length) {
            gsap.fromTo(
              cards,
              { y: 48, opacity: 0, scale: 0.96, filter: 'blur(12px)', rotationX: 4 },
              {
                y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', rotationX: 0,
                duration: 0.8, ease: 'power3.out', stagger: 0.12,
                scrollTrigger: {
                  trigger: cards[0].parentElement,
                  start: 'top 82%',
                  once: true,
                },
              },
            );
          }

          if (quotes.length) {
            gsap.fromTo(
              quotes,
              { x: (index) => (index % 2 === 0 ? -40 : 40), opacity: 0, filter: 'blur(12px)', scale: 0.97 },
              {
                x: 0, opacity: 1, filter: 'blur(0px)', scale: 1,
                duration: 0.82, ease: 'power3.out', stagger: 0.16,
                scrollTrigger: {
                  trigger: quotes[0].parentElement,
                  start: 'top 82%',
                  once: true,
                },
              },
            );
          }

          if (trustItems.length) {
            gsap.fromTo(
              trustItems,
              { y: 22, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.62,
                ease: 'power2.out',
                stagger: 0.08,
                scrollTrigger: {
                  trigger: trustItems[0].parentElement,
                  start: 'top 88%',
                  once: true,
                },
              },
            );
          }

          /* Intro lead heading — phrase-by-phrase cinematic reveal */
          gsap.fromTo('.lp-lead-phrase',
            { y: 48, opacity: 0, filter: 'blur(12px)', rotationX: 8 },
            {
              y: 0, opacity: 1, filter: 'blur(0px)', rotationX: 0,
              duration: 0.72, stagger: 0.18, ease: 'power3.out',
              scrollTrigger: { trigger: '.lp-story-lead', start: 'top 76%', once: true },
            },
          );

          /* Intro paragraph — line-by-line stagger */
          gsap.fromTo('.lp-lead-line',
            { y: 24, opacity: 0, filter: 'blur(4px)' },
            {
              y: 0, opacity: 1, filter: 'blur(0px)',
              duration: 0.65, stagger: 0.2, ease: 'power2.out',
              scrollTrigger: { trigger: '.lp-story-lead', start: 'top 72%', once: true },
            },
          );

          /* CTA button — subtle living glow */
          gsap.to('.lp-cta-primary', {
            boxShadow: '0 20px 40px rgba(144, 58, 65, 0.36), inset 0 1px 0 rgba(255, 239, 239, 0.38)',
            duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
          });

          /* Section index numbers — gentle pulse */
          gsap.to('.lp-section-index', {
            opacity: 0.55, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut',
            stagger: 0.3,
            scrollTrigger: {
              trigger: '.lp-story-shell',
              start: 'top 70%',
              once: false,
              toggleActions: 'play none none reverse',
            },
          });

          gsap.to('.lp-parallax-soft', {
            yPercent: -6,
            ease: 'none',
            scrollTrigger: {
              trigger: '.lp-story-shell',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          });

          gsap.to('.lp-hero-copy-parallax', {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.7,
            },
          });

          cardRefs.current.forEach((card, index) => {
            gsap.to(card, {
              y: index % 2 === 0 ? -18 : -10,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            });
          });

          quoteRefs.current.forEach((quote, index) => {
            gsap.to(quote, {
              y: index === 1 ? -22 : -12,
              rotation: index === 1 ? -0.6 : index === 0 ? 0.5 : -0.4,
              ease: 'none',
              scrollTrigger: {
                trigger: quote,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            });
          });

          return () => {
            if (context.cleanupHeroPointer) context.cleanupHeroPointer();
          };
        },
      );
    }, root);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div ref={rootRef} className="lp-shell">
        <div className="lp-grain" />

        <nav ref={navRef} className="lp-nav">
          <div className="lp-nav-brand">
            <span className="lp-brand-mark">N</span>
            <span className="lp-nav-brand-text">NJU 树洞</span>
          </div>
          <div className="lp-nav-actions">
            <button type="button" className="lp-nav-link" onClick={onLogin || onGetStarted}>登录</button>
            <span className="lp-nav-divider" aria-hidden="true">/</span>
            <button type="button" className="lp-nav-link" onClick={onRegister || onGetStarted}>注册</button>
          </div>
        </nav>

        <section ref={heroRef} className="lp-hero">
          <div className="lp-hero-bokeh">
            <div
              ref={setBlobRef(0)}
              className="lp-blob lp-blob-a"
            />
            <div
              ref={setBlobRef(1)}
              className="lp-blob lp-blob-b"
            />
            <div
              ref={setBlobRef(2)}
              className="lp-blob lp-blob-c"
            />
          </div>
          <div ref={heroGlowRef} className="lp-hero-glow" />
          <div className="lp-hero-vignette" />

          <div className="lp-hero-stage">
            <div ref={heroFrameRef} className="lp-hero-frame">
              <div className="lp-film-edge" />
              <div className="lp-hero-ambient" aria-hidden="true">
                <span className="lp-ambient-shu">树</span>
                <span className="lp-ambient-dong">洞</span>
              </div>
              <div ref={heroShotRef} className="lp-hero-shot">
                <div className="lp-shot-copy lp-hero-copy-parallax">
                  <h1 ref={heroTitleRef} className="lp-hero-title">
                    <span className="lp-hero-char">N</span>
                    <span className="lp-hero-char">J</span>
                    <span className="lp-hero-char">U</span>
                    <span className="lp-hero-char lp-hero-char-gap">树</span>
                    <span className="lp-hero-char">洞</span>
                  </h1>
                  <p ref={heroEyebrowRef} className="lp-hero-eyebrow">
                    Anonymous, but never adrift.
                  </p>
                  <p ref={heroSubtitleRef} className="lp-hero-subtitle">
                    校园里最安全的匿名说话角落。
                  </p>
                  <p ref={heroTaglineRef} className="lp-hero-tagline">
                    半匿名表达 · 低压交流 · 有边界的自由
                  </p>
                  <div ref={heroCtaRef} className="lp-hero-cta">
                    <button type="button" className="lp-cta-primary" onClick={onGetStarted}>
                      开始使用
                    </button>
                    <p className="lp-hero-cta-note">不必解释太多，也不必被看太久。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div ref={scrollIndicatorRef} className="lp-scroll-indicator" aria-hidden="true">
            <span>向下看</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M7 10l5 5 5-5" />
            </svg>
          </div>
        </section>

        <main className="lp-story-shell">
          <section className="lp-story-intro">
            <div ref={pushRevealRef} className="lp-kicker" data-reveal="copy">
              不是每一个人都想在熟人面前表达自己。
            </div>
            <div className="lp-story-intro-grid">
              <div ref={pushRevealRef} className="lp-story-block lp-story-lead" data-reveal="copy">
                <h2 className="lp-story-lead-heading">
                  <span className="lp-lead-phrase">在校园里，</span>
                  <span className="lp-lead-phrase">最难说出口的，</span>
                  <span className="lp-lead-phrase">往往不是大事。</span>
                </h2>
                <p>
                  <span className="lp-lead-line">可能只是某段关系、某门课、某个夜晚、某种突然涌上来的情绪。</span>
                  <span className="lp-lead-line">它们并不总适合发在朋友圈，也不总适合被班级群和宿舍群看到。</span>
                </p>
                <div ref={pushRevealRef} className="lp-story-side lp-parallax-soft" data-reveal="copy">
                  <p>
                    NJU 树洞不是为了让表达更热闹，而是为了让表达先发生。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="lp-scene-section">
            <div ref={pushRevealRef} className="lp-section-heading" data-reveal="copy">
              <span className="lp-section-index">01</span>
              <div>
                <h2>那些被压低音量的校园时刻</h2>
                <p>我们把树洞理解成一种情绪容器，而不是一组功能按钮。</p>
              </div>
            </div>
            <div className="lp-scene-layout">
              {sceneFragments.map((scene) => (
                <article
                  key={scene.label}
                  ref={pushCardRef}
                  className="lp-scene-fragment"
                >
                  <div className="lp-scene-icon">
                    <Icon name={scene.icon} />
                  </div>
                  <h3>{scene.label}</h3>
                  <p>{scene.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="lp-feature-section">
            <div ref={pushRevealRef} className="lp-section-heading lp-section-heading-wide" data-reveal="copy">
              <span className="lp-section-index">02</span>
              <div>
                <h2>它不是完全自由的匿名，而是被精心设计过的安全感。</h2>
                <p>高级感不来自装饰，而来自表达自由和治理边界之间的平衡。</p>
              </div>
            </div>
            <div className="lp-feature-grid">
              {featureMoments.map((feature) => (
                <article key={feature.title} ref={pushCardRef} className="lp-feature-card">
                  <span className="lp-feature-tone">{feature.tone}</span>
                  <div className="lp-feature-card-head">
                    <h3>{feature.title}</h3>
                    <span className="lp-feature-card-icon">
                      <Icon name={feature.icon} />
                    </span>
                  </div>
                  <p>{feature.body}</p>
                  <small>{feature.note}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="lp-voices-section">
            <div ref={pushRevealRef} className="lp-section-heading" data-reveal="copy">
              <span className="lp-section-index">03</span>
              <div>
                <h2>真实的声音，不总是 loud，也不总是完整。</h2>
                <p>它们更像纪录片里的片段，短、真、带一点迟疑。</p>
              </div>
            </div>
            <div className="lp-voices-track">
              {voiceFragments.map((item) => (
                <blockquote
                  key={item.quote}
                  ref={(element) => {
                    pushRevealRef(element);
                    pushQuoteRef(element);
                  }}
                  className="lp-voice-fragment"
                  data-reveal="quote"
                  data-axis="x"
                  data-start="top 90%"
                >
                  <p>&ldquo;{item.quote}&rdquo;</p>
                  <footer>&mdash; {item.footer}</footer>
                </blockquote>
              ))}
            </div>
          </section>

          <section className="lp-trust-section">
            <div ref={pushRevealRef} className="lp-trust-copy" data-reveal="copy">
              <span className="lp-section-index">04</span>
              <h2>真正让人放心的，不是“完全匿名”，而是“匿名但可治理”。</h2>
              <p>
                当表达空间变得可信，用户才会愿意把更真实的自己放进来。
              </p>
            </div>
            <div className="lp-trust-band">
              {trustPoints.map((point) => (
                <div key={point.label} ref={pushTrustRef} className="lp-trust-pill">
                  <span className="lp-trust-pill-icon">
                    <Icon name={point.icon} />
                  </span>
                  <span>{point.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="lp-cta-section">
            <div ref={pushRevealRef} className="lp-cta-stage" data-reveal="copy" data-start="top 96%">
              <span className="lp-cta-eyebrow">05 / Ready to enter</span>
              <h2>如果你也有一些不想被熟人立刻看见的话。</h2>
              <p>
                这里也许正好合适。安静一点，真实一点，但仍然有边界。
              </p>
              <div className="lp-cta-actions">
                <button type="button" className="lp-cta-primary lp-cta-large" onClick={onGetStarted}>
                  进入树洞
                </button>
                <button type="button" className="lp-cta-secondary" onClick={onRegister || onGetStarted}>
                  创建账号
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="lp-footer">
          <div ref={pushRevealRef} className="lp-footer-inner" data-reveal="copy">
            <div className="lp-nav-brand">
              <span className="lp-brand-mark">N</span>
              <span className="lp-footer-brand-text">NJU 树洞</span>
            </div>
            <p className="lp-footer-tagline">在这里说说心里话。</p>
            <div className="lp-footer-links">
              <span>&copy; 2026 NJU树洞</span>
              <button type="button" onClick={() => setActiveModal('about')}>关于我们</button>
              <button type="button" onClick={() => setActiveModal('privacy')}>隐私政策</button>
            </div>
          </div>
        </footer>
      </div>

      <Modal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)}>
        <div className="p-6 max-sm:p-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">关于 NJU 树洞</h2>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full text-text-2 transition-colors hover:bg-surface-soft"
              onClick={() => setActiveModal(null)}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-text-2">
            <p>
              NJU树洞是面向南京大学师生的半匿名表达与互助交流平台。我们致力于为南大学子提供一个温暖、安全、低压力的表达空间。
            </p>
            <p>
              在这里，你可以分享心情、寻求帮助、交流想法，也可以只是安静地记录自己的一天。
              每位用户在同一帖子内身份一致，但不同帖子之间完全隔离，无法被跨帖关联。
            </p>
            <p>
              平台由南京大学在校学生团队开发与运营，核心设计理念围绕「帖子级匿名」「低压力表达」「有边界的自由」展开，
              旨在平衡匿名表达的自由与社区治理的责任。
            </p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)}>
        <div className="p-6 max-sm:p-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">隐私政策</h2>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full text-text-2 transition-colors hover:bg-surface-soft"
              onClick={() => setActiveModal(null)}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="space-y-5 text-sm leading-relaxed text-text-2">
            <section>
              <h3 className="mb-1 font-semibold text-text">1. 信息的收集与使用</h3>
              <p>我们仅收集提供服务所必需的信息，包括注册时提供的校园邮箱或学号，以及你主动发布的帖子、评论等内容。这些信息仅用于平台正常运营与内容治理。</p>
            </section>
            <section>
              <h3 className="mb-1 font-semibold text-text">2. 匿名机制</h3>
              <p>你的真实身份不会与帖子内容公开关联。系统通过不可逆的哈希算法为每个帖子生成临时匿名身份，同一帖子内身份一致便于连续讨论，不同帖子之间完全隔离。平台管理员在必要时可追溯发帖人身份以履行治理义务。</p>
            </section>
            <section>
              <h3 className="mb-1 font-semibold text-text">3. 数据存储与安全</h3>
              <p>你的数据存储在国内合规服务器上，传输采用加密协议。我们采取合理的安全措施保护你的个人信息，但无法保证绝对安全。如发生数据泄露，我们将依法及时告知。</p>
            </section>
            <section>
              <h3 className="mb-1 font-semibold text-text">4. 信息共享</h3>
              <p>我们不会将你的个人信息出售给第三方。在法律法规要求、保护平台权益或维护校园安全等必要情况下，我们可能依法披露必要信息。</p>
            </section>
            <section>
              <h3 className="mb-1 font-semibold text-text">5. 你的权利</h3>
              <p>你可以随时查看、修改或删除你的个人信息与发布内容。注销账号后，与你关联的个人信息将被删除或匿名化处理。</p>
            </section>
            <section>
              <h3 className="mb-1 font-semibold text-text">6. 政策更新</h3>
              <p>本隐私政策可能不时更新。重大变更将通过平台通知告知你。继续使用本平台即表示你同意更新后的政策。</p>
            </section>
            <p className="border-t border-line-soft pt-2 text-xs text-text-3">最近更新：2026 年 5 月</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
