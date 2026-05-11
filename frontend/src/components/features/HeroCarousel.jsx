import React, { useState, useEffect } from 'react';

const WELCOME_SLIDES = [
  {
    tag: 'NJU 树洞',
    title: '欢迎来到南大树洞',
    subtitle: '一个属于南大人的匿名交流空间',
    desc: '在这里，你可以畅所欲言，分享校园生活的点点滴滴，同帖身份稳定，跨帖无痕。',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80',
    action: 'compose',
  },
  {
    tag: '匿名表达',
    title: '自由表达，无虑身份',
    subtitle: '不用在乎「我是谁」，只需要在意「我想说什么」',
    desc: '同一帖子内身份保持一致，不同帖子间不可追溯。减少熟人压力，保留讨论连续性。',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    action: 'compose',
  },
];

// ── 注入一次动画样式 ──
const STYLE_ID = 'carousel-anim';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes carousel-text-in {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes carousel-img-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(el);
}

function HeroCarousel({ onNavigate, carouselItems = [], onCarouselItemClick }) {
  const [active, setActive] = useState(0);

  const carouselSlides = carouselItems.map((item) => ({
    tag: item.type,
    title: item.title,
    subtitle: '',
    desc: item.description
      ? `${item.time} · ${item.place}。${item.description}`
      : `${item.time} · ${item.place}。`,
    image: item.image || item.poster,
    action: 'announcements',
    eventId: item.id,
  }));

  const slides = carouselSlides.length > 0 ? carouselSlides : WELCOME_SLIDES;

  const handleSlideClick = () => {
    const currentSlide = slides[active];
    if (currentSlide.eventId && onCarouselItemClick) {
      onCarouselItemClick(currentSlide.eventId);
    } else {
      onNavigate(currentSlide.action);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <section className="relative grid min-h-[280px] grid-cols-[1fr_0.88fr] gap-6 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[#fffcfb] p-7 shadow-[0_2px_16px_rgba(180,160,150,0.1),0_0_0_1px_rgba(230,210,200,0.3)] max-md:grid-cols-1 max-md:p-5">
      {/* 装饰渐变 */}
      <div
        className="pointer-events-none absolute -left-[8%] -top-[30%] h-[360px] w-[360px] rounded-full opacity-[0.18]"
        style={{
          background: 'radial-gradient(circle, var(--color-rose) 0%, var(--color-lavender) 50%, transparent 70%)',
        }}
      />

      {/* 文字内容：key 变化触重新挂载 + 入场动画 */}
      <div
        key={active}
        className="relative z-[1] self-center"
        style={{ animation: 'carousel-text-in 0.35s ease-out both' }}
      >
        <span className="inline-flex w-fit items-center gap-[5px] rounded-full border border-[var(--color-rose)] bg-[var(--color-rose)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-blue)]">
          {slide.tag}
        </span>
        <h2 className="mt-3 max-w-[600px] text-[clamp(26px,4vw,44px)] font-black leading-[1.1] tracking-tight text-[var(--color-text)]">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mb-2 mt-2 text-sm font-medium text-[var(--color-text-2)]">{slide.subtitle}</p>
        )}
        <p className="m-0 max-w-[520px] text-[14px] leading-relaxed text-[var(--color-text-2)]">
          {slide.desc}
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            className="inline-flex items-center justify-center gap-[6px] rounded-full border-0 bg-[var(--color-blue)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-[var(--color-blue-2)]"
            onClick={handleSlideClick}
            type="button"
          >
            开始分享
          </button>
        </div>
      </div>

      {/* 图片：略有延迟的缩放入场 */}
      <div
        key={`img-${active}`}
        className="relative z-[1] min-h-[220px] overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-white/60 shadow-[inset_0_1px_3px_rgba(180,160,150,0.06)]"
        style={{ animation: 'carousel-img-in 0.4s ease-out both' }}
      >
        <img
          alt=""
          src={slide.image}
          className="h-full w-full object-cover [filter:saturate(0.9)_contrast(0.95)]"
        />
      </div>

      {/* 指示点 */}
      <div className="absolute bottom-5 right-7 z-[2] flex gap-[7px]">
        {slides.map((_, i) => (
          <span
            className={`cursor-pointer rounded-full transition-all ${
              i === active ? 'w-7 bg-[var(--color-blue)]' : 'h-[7px] w-[7px] bg-[var(--color-line)]'
            }`}
            key={i}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
