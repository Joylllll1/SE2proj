import React, { useState, useEffect } from 'react';
import Icon from '../common/Icon';

const WELCOME_SLIDES = [
  {
    tag: 'NJU 树洞',
    title: '欢迎来到南大树洞',
    desc: '一个属于南大人的匿名交流空间。在这里，你可以畅所欲言，分享校园生活的点点滴滴。',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?auto=format&fit=crop&w=1200&q=80',
    action: 'compose',
  },
  {
    tag: '匿名表达',
    title: '同帖稳定匿名身份',
    desc: '同一帖子内身份保持一致，不同帖子间不可追溯。减少熟人压力，同时保留讨论的连续性。',
    image: 'https://images.unsplash.com/photo-1579547945413-497e1b99dac0?auto=format&fit=crop&w=1200&q=80',
    action: 'compose',
  },
];

function HeroCarousel({ onNavigate, carouselItems = [], onCarouselItemClick }) {
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Convert carousel items to slide format
  const carouselSlides = carouselItems.map((item) => ({
    tag: item.type,
    title: item.title,
    desc: item.description ? `${item.time} · ${item.place}。${item.description}` : `${item.time} · ${item.place}。`,
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
      setIsTransitioning(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    if (index === active) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActive(index);
      setIsTransitioning(false);
    }, 300);
  };

  const slide = slides[active];

  return (
    <section className="hero-card relative grid min-h-[300px] grid-cols-[1fr_0.88fr] gap-6 overflow-hidden p-7 border border-black/10 rounded-lg bg-[#0a2a3a] shadow-md max-md:grid-cols-1 max-md:p-[22px]">
      <div className="hero-copy-before absolute bg-[radial-gradient(circle,rgba(72,151,255,0.28),transparent_58%)]" style={{ inset: '-30% 30% 30% -20%' }} />
      <div className={`hero-copy relative z-[1] self-end text-white transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : ''}`}>
        <span className="pill blue inline-flex items-center gap-[5px] w-fit rounded-full px-3 py-2 text-xs font-semibold text-white bg-blue">{slide.tag}</span>
        <h2 className="max-w-[700px] mt-[14px] mb-[10px] text-[clamp(30px,4.5vw,52px)] leading-[1.05] tracking-tight">{slide.title}</h2>
        <p className="max-w-[560px] m-0 text-white/72 text-[15px] leading-relaxed">{slide.desc}</p>
        <div className="hero-actions flex flex-wrap gap-2.5 mt-6">
          <button className="primary-button inline-flex items-center justify-center gap-[7px] border-0 rounded-full px-[18px] py-[10px] text-white bg-blue font-bold shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2" onClick={handleSlideClick} type="button">
            开始分享
          </button>
        </div>
      </div>
      <div className="hero-visual relative z-[1] overflow-hidden min-h-[240px] border border-white/10 rounded-md bg-[#20344e] shadow-md max-md:min-h-[210px]">
        <img alt="" src={slide.image} className={`w-full h-full object-cover [filter:saturate(0.92)_contrast(0.98)] transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-[1.02]' : ''}`} />
      </div>
      <div className="hero-dots absolute right-[34px] bottom-6 z-[2] flex gap-[7px]">
        {slides.map((_, i) => (
          <span className={`h-[7px] rounded-full cursor-pointer transition-all ${i === active ? 'w-7 bg-white' : 'w-[7px] bg-white/34'}`} key={i} onClick={() => goToSlide(i)} />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
