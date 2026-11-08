import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
}

const NAV_LINKS = [
  { href: '#about', label: 'Идеи', id: 'about' },
  { href: '#principles', label: 'Принципы', id: 'principles' },
  { href: '#authors', label: 'Авторы', id: 'authors' },
  { href: '#buildings', label: 'Здания', id: 'buildings' },
  { href: '#gallery', label: 'Галерея', id: 'gallery' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F6F2E9]/95 backdrop-blur-sm border-b-2 border-[#111111]">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-8 h-14 sm:h-16">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#hero"
          className="font-display text-xl sm:text-2xl font-bold tracking-wider text-[#111111] hover:text-[#D62828] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#D62828]"
        >
          КОНСТРУКТИВИЗМ
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Основная навигация"
          className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#2B2B2B]"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#D62828] ${
                  isActive
                    ? 'text-[#D62828] underline decoration-2 underline-offset-8 decoration-[#D62828]'
                    : 'hover:text-[#111111] hover:underline decoration-2 underline-offset-8 decoration-[#111111]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#today"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-bold tracking-wider uppercase text-[#F6F2E9] bg-[#111111] hover:bg-[#D62828] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62828]"
          >
            Стиль сегодня
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Scroll depth hairline bar */}
      <div className="w-full h-[3px] bg-[#111111]/10 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-[#D62828] transition-transform duration-150 origin-left"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Мобильная навигация"
          className="md:hidden bg-[#F6F2E9] border-b-2 border-[#111111] px-4 py-4 space-y-2"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={handleLinkClick}
              className="block py-2.5 px-3 font-display text-lg uppercase tracking-wider text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#today"
            onClick={handleLinkClick}
            className="block py-2.5 px-3 font-display text-lg uppercase tracking-wider bg-[#D62828] text-[#F6F2E9] text-center mt-2"
          >
            Конструктивизм сегодня
          </a>
        </nav>
      )}
    </header>
  );
};
