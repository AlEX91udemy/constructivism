import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDownRight, Compass, Layers, Volume2, VolumeX, Radio, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { ARCHIVE_CITIES, ArchiveCityInfo } from '../data/constructivismData';

type PosterMode = 'poster' | 'diagonal' | 'blueprint';

interface HeroSectionProps {
  onSelectArchiveCity?: (city: string, defaultBuildingId?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectArchiveCity }) => {
  const shouldReduceMotion = useReducedMotion();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [posterMode, setPosterMode] = useState<PosterMode>('poster');
  const [audioSettings, setAudioSettings] = useState(soundEngine.getSettings());
  const [selectedCityInfo, setSelectedCityInfo] = useState<ArchiveCityInfo | null>(null);

  useEffect(() => {
    return soundEngine.subscribe(setAudioSettings);
  }, []);

  const handleCityClick = (info: ArchiveCityInfo) => {
    setSelectedCityInfo((prev) => (prev?.city === info.city ? null : info));
    if (onSelectArchiveCity) {
      onSelectArchiveCity(info.city, info.defaultBuildingId);
    }
  };

  const handleJumpToCityBuildings = (info: ArchiveCityInfo) => {
    if (onSelectArchiveCity) {
      onSelectArchiveCity(info.city, info.defaultBuildingId);
    }
    const el = document.getElementById('buildings');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouseOffset({ x: normX, y: normY });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const titleBlocks = [
    { text: 'КОН', bg: 'bg-[#111111]', fg: 'text-[#F6F2E9]', offset: 'translate-x-0', delay: 0.05 },
    { text: 'СТРУК', bg: 'bg-[#D62828]', fg: 'text-[#F6F2E9]', offset: 'sm:translate-x-6', delay: 0.18 },
    { text: 'ТИВИЗМ', bg: 'bg-[#111111]', fg: 'text-[#F6F2E9]', offset: 'sm:translate-x-2', delay: 0.31 },
  ];

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[calc(100vh-4rem)] border-b-4 border-[#111111] poster-grain constructivist-grid overflow-hidden flex flex-col justify-between"
    >
      {/* Top archival strip with interactive city buttons */}
      <div className="border-b border-[#111111]/20 bg-[#F6F2E9]/95 px-4 sm:px-8 py-2.5">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tech text-[#2B2B2B]">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-[#D62828]">АРХИВ АВАНГАРДА</span>
            <span aria-hidden="true">·</span>
            <div className="inline-flex flex-wrap items-center gap-1" role="group" aria-label="Города конструктивизма">
              {ARCHIVE_CITIES.map((item, idx) => {
                const isSelected = selectedCityInfo?.city === item.city;
                return (
                  <React.Fragment key={item.city}>
                    <button
                      type="button"
                      onClick={() => handleCityClick(item)}
                      className={`px-2 py-0.5 font-mono-tech text-xs uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-[#D62828] text-[#F6F2E9] font-bold'
                          : 'hover:bg-[#111111] hover:text-[#F6F2E9] underline decoration-dotted underline-offset-4'
                      }`}
                    >
                      {item.label}
                    </button>
                    {idx < ARCHIVE_CITIES.length - 1 && (
                      <span aria-hidden="true" className="text-[#2B2B2B]/50">
                        /
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>1914–1934</span>
            <span aria-hidden="true">·</span>
            <span>ВХУТЕМАС / ИНХУК / ОСА</span>
          </div>
        </div>

        {/* Interactive City Dossier Drawer when a city is clicked */}
        {selectedCityInfo && (
          <div className="max-w-[1400px] mx-auto mt-2.5 pt-2.5 border-t border-[#111111]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111111] text-[#F6F2E9] p-3.5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech">
                <span className="text-[#EAB308] font-bold uppercase">
                  {selectedCityInfo.periodName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#D62828] font-bold">{selectedCityInfo.schools}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#EAE3D5] max-w-3xl">
                {selectedCityInfo.summary}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleJumpToCityBuildings(selectedCityInfo)}
                className="px-3.5 py-2 bg-[#D62828] hover:bg-[#EAB308] hover:text-[#111111] text-[#F6F2E9] font-mono-tech text-xs uppercase font-bold transition-colors whitespace-nowrap shrink-0"
              >
                К объектам и 3D: {selectedCityInfo.city} ↓
              </button>
              <button
                type="button"
                onClick={() => setSelectedCityInfo(null)}
                aria-label="Закрыть справку о городе"
                className="p-2 text-[#F6F2E9] hover:bg-[#2B2B2B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Asymmetric 2-Column Hero Grid */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-10 sm:py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center flex-1">
        {/* Left Column: Poster Block Typography & Manifesto CTA */}
        <div className="lg:col-span-7 z-10 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#2B2B2B] mb-5">
            <span className="inline-block w-3 h-3 bg-[#D62828]" aria-hidden="true" />
            <span>Советский авангард 1920-х годов</span>
            <span aria-hidden="true">/</span>
            <span>Производственное искусство</span>
          </div>

          {/* Accessible full H1 with visual poster block slices */}
          <h1
            aria-label="КОНСТРУКТИВИЗМ"
            className="font-display uppercase leading-none select-none mb-6 w-full"
          >
            <span className="sr-only">КОНСТРУКТИВИЗМ</span>
            <div aria-hidden="true" className="flex flex-col items-start gap-1.5 sm:gap-2">
              {titleBlocks.map((block, index) => (
                <motion.div
                  key={block.text}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -40, skewX: -6 }}
                  animate={{ opacity: 1, x: 0, skewX: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: block.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-2 ${block.bg} ${block.fg} ${block.offset} poster-shadow`}
                >
                  <span className="text-5xl sm:text-7xl xl:text-[5.5rem] font-bold tracking-tight">
                    {block.text}
                  </span>
                  {index === 1 && (
                    <span className="ml-3 sm:ml-4 px-2 py-0.5 text-xs sm:text-sm font-mono-tech bg-[#EAB308] text-[#111111] font-bold">
                      1920
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </h1>

          {/* Subtitle with diagonal cut bar */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="max-w-xl mt-2"
          >
            <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#111111] leading-tight uppercase tracking-wide">
              Искусство, которое превратило форму в действие
            </p>
            <p className="mt-4 text-base sm:text-lg text-[#2B2B2B] leading-relaxed max-w-[62ch]">
              Отказ от украшательства ради чистой конструкции. Геометрия круга и клина,
              железобетонные дома-коммуны, ударная типографика плаката и инженерная смелость,
              изменившая визуальный язык всего XX века.
            </p>
          </motion.div>

          {/* Primary & Secondary Action Buttons */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <a
              href="#about"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-[#D62828] text-[#F6F2E9] font-display text-lg uppercase tracking-wider border-2 border-[#111111] poster-shadow hover:bg-[#111111] hover:text-[#F6F2E9] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D62828]"
            >
              <span>Исследовать стиль</span>
              <ArrowDownRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1 group-hover:translate-y-1" />
            </a>

            <a
              href="#buildings"
              className="inline-flex items-center gap-2.5 px-6 py-4 bg-[#F6F2E9] text-[#111111] font-display text-lg uppercase tracking-wider border-2 border-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9] transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <Compass className="w-5 h-5 text-[#D62828]" />
              <span>Здания и объекты</span>
            </a>
          </motion.div>

          {/* Interactive Composition Mode & Acoustic Switcher */}
          <div className="mt-8 pt-6 border-t border-[#111111]/20 w-full max-w-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono-tech uppercase tracking-wider text-[#2B2B2B] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D62828]" />
                Режим плакатной конструкции:
              </span>
              <div
                role="group"
                aria-label="Выбор режима геометрической композиции"
                className="inline-flex border-2 border-[#111111] bg-[#EAE3D5] p-0.5"
              >
                {(
                  [
                    { id: 'poster', label: 'Плакат' },
                    { id: 'diagonal', label: 'Динамика 45°' },
                    { id: 'blueprint', label: 'Чертеж' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setPosterMode(mode.id);
                      soundEngine.playSfx('expand');
                    }}
                    className={`px-3 py-1 text-xs font-mono-tech uppercase transition-colors whitespace-nowrap shrink-0 ${
                      posterMode === mode.id
                        ? 'bg-[#111111] text-[#F6F2E9] font-bold'
                        : 'text-[#111111] hover:bg-[#111111]/10'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Acoustic Controls (Industrial Background + UI Signals) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#111111]/10">
              <span className="text-xs font-mono-tech uppercase tracking-wider text-[#2B2B2B] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#D62828]" />
                Акустика цеха (HTML5 Audio):
              </span>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => soundEngine.setAmbientEnabled(!audioSettings.ambientEnabled)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono-tech uppercase border-2 border-[#111111] transition-colors whitespace-nowrap shrink-0 ${
                    audioSettings.masterEnabled && audioSettings.ambientEnabled
                      ? 'bg-[#D62828] text-[#F6F2E9] font-bold'
                      : 'bg-[#EAE3D5] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9]'
                  }`}
                >
                  <span>
                    {audioSettings.masterEnabled && audioSettings.ambientEnabled
                      ? 'Индустриальный гул: ВКЛ'
                      : 'Включить гул цеха'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => soundEngine.setMasterEnabled(!audioSettings.masterEnabled)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono-tech uppercase border-2 border-[#111111] transition-colors whitespace-nowrap shrink-0 ${
                    audioSettings.masterEnabled
                      ? 'bg-[#111111] text-[#EAB308]'
                      : 'bg-[#F6F2E9] text-[#2B2B2B]'
                  }`}
                >
                  {audioSettings.masterEnabled ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span>{audioSettings.masterEnabled ? 'Сигналы ВКЛ' : 'Звук ВЫКЛ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Constructivist Poster Machine (Pure SVG + CSS) */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div
            className={`relative w-full max-w-[520px] aspect-square border-4 border-[#111111] poster-shadow transition-colors duration-300 overflow-hidden ${
              posterMode === 'blueprint' ? 'bg-[#111111] text-[#F6F2E9]' : 'bg-[#EAE3D5] text-[#111111]'
            }`}
          >
            {/* Corner technical marks */}
            <div className="absolute top-3 left-3 font-mono-tech text-[11px] uppercase tracking-widest opacity-80 z-20">
              ПРОУН-МАШИНА · № 1924
            </div>
            <div className="absolute top-3 right-3 font-mono-tech text-[11px] uppercase tracking-widest text-[#D62828] font-bold z-20">
              ОСЬ {posterMode === 'diagonal' ? '45°' : '32°'}
            </div>
            <div className="absolute bottom-3 left-3 font-mono-tech text-[11px] uppercase tracking-widest opacity-80 z-20">
              ФОРМА = ДЕЙСТВИЕ
            </div>
            <div className="absolute bottom-3 right-3 font-mono-tech text-[11px] uppercase tracking-widest opacity-80 z-20">
              МАСШТАБ 1:1
            </div>

            {/* Interactive SVG Composition */}
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full"
              role="img"
              aria-label="Анимированная супрематическо-конструктивистская композиция из кругов, красного клина, балок и сетки"
            >
              <defs>
                <pattern
                  id="heroGridPattern"
                  width="25"
                  height="25"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 25 0 L 0 0 0 25"
                    fill="none"
                    stroke={posterMode === 'blueprint' ? 'rgba(246,242,233,0.12)' : 'rgba(17,17,17,0.1)'}
                    strokeWidth="1"
                  />
                </pattern>
                <pattern
                  id="heroStripePattern"
                  width="10"
                  height="10"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="10"
                    stroke={posterMode === 'blueprint' ? '#F6F2E9' : '#111111'}
                    strokeWidth="4"
                  />
                </pattern>
              </defs>

              {/* Background Grid */}
              <rect width="500" height="500" fill="url(#heroGridPattern)" />

              {/* Crosshair Axes */}
              <line
                x1="0"
                y1="250"
                x2="500"
                y2="250"
                stroke={posterMode === 'blueprint' ? 'rgba(246,242,233,0.28)' : 'rgba(17,17,17,0.25)'}
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
              <line
                x1="250"
                y1="0"
                x2="250"
                y2="500"
                stroke={posterMode === 'blueprint' ? 'rgba(246,242,233,0.28)' : 'rgba(17,17,17,0.25)'}
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />

              {/* Outer Compass Ring */}
              <motion.g
                animate={{
                  rotate: shouldReduceMotion ? 0 : posterMode === 'diagonal' ? 45 : 360,
                  x: mouseOffset.x * -10,
                  y: mouseOffset.y * -10,
                }}
                transition={
                  posterMode === 'diagonal'
                    ? { duration: 0.6 }
                    : { rotate: { duration: 48, repeat: Infinity, ease: 'linear' }, x: { duration: 0.2 }, y: { duration: 0.2 } }
                }
                style={{ originX: '260px', originY: '240px' }}
              >
                <circle
                  cx="260"
                  cy="240"
                  r="165"
                  fill="none"
                  stroke={posterMode === 'blueprint' ? '#F6F2E9' : '#111111'}
                  strokeWidth="3"
                />
                <circle
                  cx="260"
                  cy="240"
                  r="142"
                  fill="none"
                  stroke="#D62828"
                  strokeWidth="6"
                  strokeDasharray="45 20 12 20"
                />
              </motion.g>

              {/* Solid Ink Black Circle */}
              <motion.circle
                cx="285"
                cy="235"
                r="98"
                fill={posterMode === 'blueprint' ? 'none' : '#111111'}
                stroke={posterMode === 'blueprint' ? '#F6F2E9' : '#111111'}
                strokeWidth="4"
                animate={{
                  x: mouseOffset.x * 14,
                  y: mouseOffset.y * 14,
                  scale: posterMode === 'diagonal' ? 1.08 : 1,
                }}
                transition={{ duration: 0.25 }}
              />

              {/* Yellow Signal Sector / Accent */}
              <motion.rect
                x="92"
                y="96"
                width="84"
                height="84"
                fill="#EAB308"
                stroke="#111111"
                strokeWidth="3"
                animate={{
                  rotate: posterMode === 'diagonal' ? 45 : -12,
                  x: mouseOffset.x * -16,
                  y: mouseOffset.y * 12,
                }}
                transition={{ duration: 0.3 }}
                style={{ originX: '134px', originY: '138px' }}
              />

              {/* Diagonal Constructivist Beams */}
              <motion.g
                animate={{
                  rotate: posterMode === 'diagonal' ? -15 : 0,
                  x: mouseOffset.x * 20,
                  y: mouseOffset.y * -14,
                }}
                transition={{ duration: 0.3 }}
                style={{ originX: '250px', originY: '250px' }}
              >
                {/* Heavy Black Girder */}
                <rect
                  x="55"
                  y="290"
                  width="370"
                  height="28"
                  transform="rotate(-32 240 304)"
                  fill={posterMode === 'blueprint' ? '#2B2B2B' : '#111111'}
                  stroke="#F6F2E9"
                  strokeWidth="2"
                />
                {/* Striped Parallel Bar */}
                <rect
                  x="85"
                  y="332"
                  width="290"
                  height="18"
                  transform="rotate(-32 230 341)"
                  fill="url(#heroStripePattern)"
                  stroke={posterMode === 'blueprint' ? '#F6F2E9' : '#111111'}
                  strokeWidth="2"
                />
              </motion.g>

              {/* Iconic Red Wedge (Клином красным) piercing the circle */}
              <motion.polygon
                points="60,390 345,195 215,395"
                fill="#D62828"
                stroke={posterMode === 'blueprint' ? '#F6F2E9' : '#111111'}
                strokeWidth="3.5"
                animate={{
                  x: mouseOffset.x * 24 + (posterMode === 'diagonal' ? 18 : 0),
                  y: mouseOffset.y * -20 + (posterMode === 'diagonal' ? -18 : 0),
                }}
                transition={{ duration: 0.25 }}
              />

              {/* Inner Milk White Ring & Pivot Node */}
              <motion.g
                animate={{
                  x: mouseOffset.x * -8,
                  y: mouseOffset.y * -8,
                }}
                transition={{ duration: 0.2 }}
              >
                <circle
                  cx="285"
                  cy="235"
                  r="36"
                  fill="#F6F2E9"
                  stroke="#111111"
                  strokeWidth="4"
                />
                <circle cx="285" cy="235" r="11" fill="#D62828" />
              </motion.g>

              {/* Vertical Tower Lattice Element */}
              <g transform="translate(385, 70)">
                <line x1="0" y1="0" x2="45" y2="330" stroke="#D62828" strokeWidth="2.5" />
                <line x1="45" y1="0" x2="0" y2="330" stroke="#D62828" strokeWidth="2.5" />
                <line x1="8" y1="60" x2="37" y2="60" stroke="#111111" strokeWidth="3" />
                <line x1="14" y1="130" x2="31" y2="130" stroke="#111111" strokeWidth="3" />
                <line x1="14" y1="200" x2="31" y2="200" stroke="#111111" strokeWidth="3" />
                <line x1="8" y1="270" x2="37" y2="270" stroke="#111111" strokeWidth="3" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Poster Statement Strip */}
      <div className="border-t-2 border-[#111111] bg-[#111111] text-[#F6F2E9] px-4 sm:px-8 py-4">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          <div>
            <div className="font-mono-tech text-xs text-[#EAB308] uppercase">01. Тектоника</div>
            <div className="font-display text-sm sm:text-base uppercase tracking-wider mt-0.5">
              Честная работа материала
            </div>
          </div>
          <div>
            <div className="font-mono-tech text-xs text-[#D62828] uppercase">02. Фактура</div>
            <div className="font-display text-sm sm:text-base uppercase tracking-wider mt-0.5">
              Бетон, сталь, стекло, печать
            </div>
          </div>
          <div>
            <div className="font-mono-tech text-xs text-[#EAB308] uppercase">03. Конструкция</div>
            <div className="font-display text-sm sm:text-base uppercase tracking-wider mt-0.5">
              Организация пространства
            </div>
          </div>
          <div>
            <div className="font-mono-tech text-xs text-[#D62828] uppercase">04. Назначение</div>
            <div className="font-display text-sm sm:text-base uppercase tracking-wider mt-0.5">
              Искусство в производство
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
