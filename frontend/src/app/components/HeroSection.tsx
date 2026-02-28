import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import imgImage3 from "../../assets/3071b1fc729091cd0452fb9d0b89106ceec16368.png";
import imgImage5 from "../../assets/17aa3a2f29a85f64d93c41afa6b64d31b3a88038.png";
import imgImage7 from "../../assets/837e11f00233936f837e7b69d6a545511b1ba132.png";
import imgImage10 from "../../assets/5e143183ca0df25c3d226a223269e70541e09760.png";
import imgImage12 from "../../assets/b0b782c02a24c60e5479cec788203caf906828d8.png";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const { banners } = useApp();
  const heroRef = useRef<HTMLDivElement>(null);
  const mainHeroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const sideCardsRef = useRef<HTMLDivElement>(null);
  const inspirationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main hero animation
      gsap.from(mainHeroRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.5
      });

      // Title animation with stagger
      if (titleRef.current) {
        const lines = titleRef.current.querySelectorAll('h2');
        gsap.from(lines, {
          x: -50,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          delay: 0.8
        });
      }

      // Side cards stagger animation
      if (sideCardsRef.current) {
        const cards = sideCardsRef.current.querySelectorAll('.hero-card');
        gsap.from(cards, {
          y: 80,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          delay: 0.7
        });
      }

      // Casual Inspirations section with scroll trigger
      if (inspirationRef.current) {
        gsap.from(inspirationRef.current.children, {
          scrollTrigger: {
            trigger: inspirationRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          },
          y: 100,
          opacity: 0,
          duration: 1,
          stagger: 0.3,
          ease: 'power3.out'
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Get banners by type
  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);
  const heroMainBanner = activeBanners.find(b => b.type === 'hero-main');
  const heroSideBanners = activeBanners.filter(b => b.type === 'hero-side').slice(0, 2);
  const casualBanners = activeBanners.filter(b => b.type === 'casual-inspiration').slice(0, 2);

  // Default fallback data
  const defaultHeroMain = {
    title: 'Color of\nSummer\nOutfit',
    subtitle: '100+ Collections for your outfit inspirations in this summer',
    image: imgImage3,
    link: '/shop',
    buttonText: 'VIEW COLLECTIONS'
  };

  const defaultHeroSide = [
    { title: 'Outdoor\nActive', image: imgImage5, link: '/shop' },
    { title: 'Casual\nComfort', image: imgImage7, link: '/shop' }
  ];

  const defaultCasual = [
    { title: 'Say it\nwith Shirt', image: imgImage10, link: '/shop' },
    { title: 'Funky never\nget old', image: imgImage12, link: '/shop' }
  ];

  return (
    <div ref={heroRef} className="w-full px-4 md:px-8 lg:px-[60px] py-8 md:py-12">
      {/* Main Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 mb-4">
        <div ref={mainHeroRef} className="relative h-[500px] md:h-[600px] lg:h-[770px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#8ba888] to-[#b8c4b5]">
          <img 
            src={heroMainBanner?.image || defaultHeroMain.image} 
            alt="Summer Outfit" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div ref={titleRef} className="absolute top-8 left-8 md:top-12 md:left-12 lg:top-[60px] lg:left-[60px] max-w-[280px] md:max-w-[350px]">
            <h2 className="text-white text-4xl md:text-6xl lg:text-[90px] leading-tight lg:leading-[75px] tracking-[-3px] lg:tracking-[-5px] mb-4 md:mb-6">
              {(heroMainBanner?.title || defaultHeroMain.title).split('\\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < (heroMainBanner?.title || defaultHeroMain.title).split('\\n').length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-white text-sm md:text-base lg:text-lg opacity-80 mb-6 md:mb-8">
              {heroMainBanner?.subtitle || defaultHeroMain.subtitle}
            </p>
            <Link to={heroMainBanner?.link || defaultHeroMain.link}>
              <button className="bg-[#121212] text-white px-8 py-3 md:px-10 md:py-4 rounded-full text-xs md:text-sm font-medium tracking-wider hover:bg-black/80 transition-colors hover:scale-105 active:scale-95">
                {heroMainBanner?.buttonText || defaultHeroMain.buttonText}
              </button>
            </Link>
          </div>
        </div>

        <div ref={sideCardsRef} className="grid grid-rows-2 gap-4">
          {(heroSideBanners.length > 0 ? heroSideBanners : defaultHeroSide).slice(0, 2).map((banner, index) => {
            const isDefault = heroSideBanners.length === 0;
            const data = isDefault ? banner : heroSideBanners[index];
            return (
              <Link key={index} to={data.link} className="hero-card relative h-[240px] md:h-[300px] lg:h-[380px] rounded-3xl overflow-hidden">
                <img src={data.image} alt={data.title.replace(/\\n/g, ' ')} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <h3 className="absolute bottom-6 left-6 text-white text-3xl md:text-4xl leading-tight tracking-[-2px]">
                  {data.title.split('\\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < data.title.split('\\n').length - 1 && <br />}
                    </span>
                  ))}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Casual Inspirations */}
      <div ref={inspirationRef} className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-4 md:gap-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 lg:p-[60px] flex flex-col justify-center max-w-full lg:max-w-[411px]">
          <h2 className="text-4xl md:text-5xl lg:text-[65px] leading-tight lg:leading-[65px] tracking-[-2px] lg:tracking-[-4px] mb-4 md:mb-6">
            Casual<br />Inspirations
          </h2>
          <p className="text-base md:text-lg opacity-80 mb-6 md:mb-8 lg:mb-12">
            Our favorite combinations for casual outfit that can inspire you to apply on your daily activity.
          </p>
          <button className="border-2 border-black px-8 py-3 md:px-10 md:py-4 rounded-full text-xs md:text-sm font-medium tracking-wider hover:bg-black hover:text-white transition-all self-start hover:scale-105 active:scale-95">
            BROWSE INSPIRATIONS
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(casualBanners.length > 0 ? casualBanners : defaultCasual).slice(0, 2).map((banner, index) => {
            const isDefault = casualBanners.length === 0;
            const data = isDefault ? banner : casualBanners[index];
            return (
              <Link key={index} to={data.link} className="relative h-[300px] md:h-[380px] rounded-3xl overflow-hidden group">
                <img src={data.image} alt={data.title.replace(/\\n/g, ' ')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <h3 className="text-white text-3xl md:text-4xl leading-tight tracking-[-2px]">
                    {data.title.split('\\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < data.title.split('\\n').length - 1 && <br />}
                      </span>
                    ))}
                  </h3>
                  <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}