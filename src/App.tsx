import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { PrinciplesSection } from './components/PrinciplesSection';
import { AuthorsSection } from './components/AuthorsSection';
import { BuildingsSection } from './components/BuildingsSection';
import { GallerySection } from './components/GallerySection';
import { TodaySection } from './components/TodaySection';
import { FooterSection } from './components/FooterSection';
import { AudioControlPanel } from './components/AudioControlPanel';
import { soundEngine } from './utils/soundEngine';

const SECTION_IDS = ['hero', 'about', 'principles', 'authors', 'buildings', 'gallery', 'today'];

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [externalCityRequest, setExternalCityRequest] = useState<{
    city: string;
    buildingId?: string;
    timestamp: number;
  } | null>(null);

  const handleSelectArchiveCity = (city: string, defaultBuildingId?: string) => {
    setExternalCityRequest({
      city,
      buildingId: defaultBuildingId,
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const id = SECTION_IDS[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global HTML5 Audio interaction feedback for buttons, links, cards, and tabs
  useEffect(() => {
    let lastHoveredEl: Element | null = null;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], [role="tab"]');
      if (!interactive) return;

      if (interactive.getAttribute('aria-expanded') !== null) {
        soundEngine.playSfx('expand');
      } else {
        soundEngine.playSfx('click');
      }
    };

    const handleDocumentMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], [role="tab"]');
      if (interactive && interactive !== lastHoveredEl) {
        lastHoveredEl = interactive;
        soundEngine.playSfx('hover');
      } else if (!interactive) {
        lastHoveredEl = null;
      }
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('mouseover', handleDocumentMouseOver, { passive: true });

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('mouseover', handleDocumentMouseOver);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2E9] text-[#111111]">
      <Navbar activeSection={activeSection} />
      <main className="flex-1">
        <HeroSection onSelectArchiveCity={handleSelectArchiveCity} />
        <AboutSection />
        <PrinciplesSection />
        <AuthorsSection />
        <BuildingsSection externalCityRequest={externalCityRequest} />
        <GallerySection />
        <TodaySection />
      </main>
      <FooterSection />
      <AudioControlPanel />
    </div>
  );
}
