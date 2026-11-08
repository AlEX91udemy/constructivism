import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GALLERY_COMPOSITIONS, GalleryComposition } from '../data/constructivismData';

interface AbstractPosterCanvasProps {
  id: string;
  isActive: boolean;
  globalAngle: number;
  inverted: boolean;
}

const AbstractPosterCanvas: React.FC<AbstractPosterCanvasProps> = ({
  id,
  isActive,
  globalAngle,
  inverted,
}) => {
  const bg = inverted ? '#111111' : '#F6F2E9';
  const fg = inverted ? '#F6F2E9' : '#111111';
  const red = '#D62828';
  const yellow = '#EAB308';

  return (
    <svg
      viewBox="0 0 320 320"
      className="w-full h-full select-none"
      role="img"
      aria-label={`Абстрактная конструктивистская композиция ${id}`}
    >
      <rect width="320" height="320" fill={bg} />

      {/* Subtle Constructivist Crosshair */}
      <line x1="0" y1="160" x2="320" y2="160" stroke={fg} strokeOpacity="0.12" strokeWidth="1" />
      <line x1="160" y1="0" x2="160" y2="320" stroke={fg} strokeOpacity="0.12" strokeWidth="1" />

      {id === 'comp-wedge' && (
        <motion.g
          animate={{ rotate: globalAngle }}
          style={{ originX: '160px', originY: '160px' }}
        >
          <motion.circle
            cx="200"
            cy="155"
            r="82"
            fill="none"
            stroke={fg}
            strokeWidth="12"
            animate={{ scale: isActive ? 1.08 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.circle
            cx="200"
            cy="155"
            r="42"
            fill={fg}
            animate={{ scale: isActive ? 0.85 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.polygon
            points="25,245 225,115 135,275"
            fill={red}
            animate={{
              x: isActive ? 18 : 0,
              y: isActive ? -14 : 0,
              rotate: isActive ? -6 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.rect
            x="48"
            y="54"
            width="95"
            height="16"
            fill={yellow}
            stroke={fg}
            strokeWidth="2.5"
            animate={{ rotate: isActive ? 25 : -15 }}
            style={{ originX: '95px', originY: '62px' }}
          />
        </motion.g>
      )}

      {id === 'comp-rotor' && (
        <motion.g
          animate={{ rotate: globalAngle }}
          style={{ originX: '160px', originY: '160px' }}
        >
          <motion.g
            animate={{ rotate: isActive ? 120 : 0 }}
            transition={{ duration: 0.55 }}
            style={{ originX: '160px', originY: '160px' }}
          >
            <circle
              cx="160"
              cy="160"
              r="102"
              fill="none"
              stroke={fg}
              strokeWidth="14"
              strokeDasharray="32 16"
            />
            <line x1="40" y1="160" x2="280" y2="160" stroke={red} strokeWidth="6" />
            <line x1="160" y1="40" x2="160" y2="280" stroke={fg} strokeWidth="4" />
          </motion.g>
          <motion.g
            animate={{ rotate: isActive ? -90 : 0, scale: isActive ? 1.14 : 1 }}
            transition={{ duration: 0.45 }}
            style={{ originX: '160px', originY: '160px' }}
          >
            <circle cx="160" cy="160" r="56" fill={red} />
            <rect x="132" y="132" width="56" height="56" fill={yellow} stroke={fg} strokeWidth="3" />
            <circle cx="160" cy="160" r="14" fill={fg} />
          </motion.g>
        </motion.g>
      )}

      {id === 'comp-tower' && (
        <motion.g
          animate={{ rotate: globalAngle }}
          style={{ originX: '160px', originY: '160px' }}
        >
          <motion.circle
            cx="110"
            cy="95"
            r="48"
            fill={yellow}
            animate={{ scale: isActive ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.g
            animate={{ y: isActive ? -10 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <polygon points="85,285 155,35 185,35 245,285" fill="none" stroke={fg} strokeWidth="4" />
            {[75, 120, 165, 210, 255].map((y, idx) => (
              <line
                key={y}
                x1={140 - idx * 11}
                y1={y}
                x2={195 + idx * 11}
                y2={y}
                stroke={idx % 2 === 0 ? red : fg}
                strokeWidth="5"
              />
            ))}
            <line x1="60" y1="265" x2="265" y2="55" stroke={red} strokeWidth="7" />
          </motion.g>
        </motion.g>
      )}

      {id === 'comp-press' && (
        <motion.g
          animate={{ rotate: globalAngle }}
          style={{ originX: '160px', originY: '160px' }}
        >
          <circle cx="72" cy="160" r="36" fill={fg} />
          <motion.polygon
            points="85,160 285,55 285,265"
            fill={red}
            animate={{ scaleX: isActive ? 1.08 : 1, x: isActive ? 8 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ originX: '85px', originY: '160px' }}
          />
          {[0, 1, 2].map((i) => (
            <motion.rect
              key={i}
              x="145"
              y={108 + i * 38}
              width="115"
              height="18"
              fill={i === 1 ? yellow : bg}
              stroke={fg}
              strokeWidth="3"
              animate={{ x: isActive ? 14 - i * 6 : 0 }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </motion.g>
      )}

      {id === 'comp-proun' && (
        <motion.g
          animate={{ rotate: globalAngle }}
          style={{ originX: '160px', originY: '160px' }}
        >
          <motion.rect
            x="55"
            y="140"
            width="210"
            height="36"
            fill={fg}
            transform="rotate(-28 160 158)"
            animate={{ y: isActive ? -12 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.rect
            x="85"
            y="85"
            width="150"
            height="32"
            fill={red}
            stroke={fg}
            strokeWidth="3"
            transform="rotate(32 160 101)"
            animate={{ y: isActive ? 12 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.circle
            cx="160"
            cy="160"
            r="34"
            fill={yellow}
            stroke={fg}
            strokeWidth="4"
            animate={{ scale: isActive ? 1.22 : 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.g>
      )}

      {id === 'comp-textile' && (
        <motion.g
          animate={{ rotate: globalAngle }}
          style={{ originX: '160px', originY: '160px' }}
        >
          {[0, 1].map((row) =>
            [0, 1].map((col) => {
              const cx = 105 + col * 110;
              const cy = 105 + row * 110;
              const isDiag = (row + col) % 2 === 0;
              return (
                <motion.g
                  key={`${row}-${col}`}
                  animate={{
                    rotate: isActive ? (isDiag ? 90 : -90) : 0,
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  style={{ originX: `${cx}px`, originY: `${cy}px` }}
                >
                  <circle cx={cx} cy={cy} r="48" fill={isDiag ? red : fg} />
                  <rect
                    x={cx - 48}
                    y={cy - 14}
                    width="96"
                    height="28"
                    fill={isDiag ? yellow : bg}
                  />
                </motion.g>
              );
            })
          )}
        </motion.g>
      )}
    </svg>
  );
};

export const GallerySection: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lockedIds, setLockedIds] = useState<Record<string, boolean>>({});
  const [globalAngle, setGlobalAngle] = useState<number>(0);
  const [inverted, setInverted] = useState<boolean>(false);

  const toggleLock = (id: string) => {
    setLockedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="py-20 sm:py-28 border-b-4 border-[#111111] bg-[#EAE3D5] constructivist-grid"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b-2 border-[#111111] items-end">
          <div className="lg:col-span-7">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[#D62828] font-bold mb-3">
              05. ЛАБОРАТОРИЯ ФОРМЫ · ПРОУНЫ И ПЛАКАТНЫЕ СТРУКТУРЫ
            </div>
            <h2
              id="gallery-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#111111] leading-none"
            >
              Интерактивная галерея
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg text-[#2B2B2B] leading-relaxed">
              Шесть авторских геометрических композиций, построенных исключительно средствами SVG и
              CSS. Наведите курсор или нажмите на лист, чтобы привести конструкцию в движение.
            </p>
          </div>
        </div>

        {/* Interactive Studio Toolbar */}
        <div className="my-8 bg-[#111111] text-[#F6F2E9] p-4 sm:p-5 border-2 border-[#111111] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono-tech text-xs uppercase text-[#EAB308]">
              Угол наклона осей:
            </span>
            <div className="inline-flex border border-[#F6F2E9]/30">
              {[-30, 0, 30, 45].map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setGlobalAngle(angle)}
                  className={`px-3 py-1 text-xs font-mono-tech whitespace-nowrap shrink-0 transition-colors ${
                    globalAngle === angle
                      ? 'bg-[#D62828] text-[#F6F2E9] font-bold'
                      : 'text-[#F6F2E9] hover:bg-[#F6F2E9]/10'
                  }`}
                >
                  {angle > 0 ? `+${angle}°` : `${angle}°`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setInverted((prev) => !prev)}
              className="px-4 py-1.5 text-xs font-mono-tech uppercase border border-[#F6F2E9] bg-[#2B2B2B] hover:bg-[#D62828] transition-colors whitespace-nowrap shrink-0"
            >
              {inverted ? 'Фон: Графитовый (Ночь)' : 'Фон: Молочный (Бумага)'}
            </button>
          </div>
        </div>

        {/* 6 Abstract Compositions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {GALLERY_COMPOSITIONS.map((comp: GalleryComposition) => {
            const isActive = hoveredId === comp.id || Boolean(lockedIds[comp.id]);
            return (
              <article
                key={comp.id}
                onMouseEnter={() => setHoveredId(comp.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => toggleLock(comp.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleLock(comp.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={Boolean(lockedIds[comp.id])}
                className="group cursor-pointer bg-[#F6F2E9] border-2 border-[#111111] poster-shadow hover:poster-shadow-red transition-all p-5 flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-[#D62828]"
              >
                <div>
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between text-xs font-mono-tech text-[#2B2B2B] pb-3 mb-4 border-b border-[#111111]/20">
                    <span>
                      <strong className="text-[#D62828]">{comp.code}</strong> · {comp.yearStyle}
                    </span>
                    <span>{lockedIds[comp.id] ? 'АКТИВНО' : 'НАВЕДИТЕ / КЛИК'}</span>
                  </div>

                  {/* Interactive SVG Composition Frame */}
                  <div className="aspect-square w-full border-2 border-[#111111] overflow-hidden mb-4">
                    <AbstractPosterCanvas
                      id={comp.id}
                      isActive={isActive}
                      globalAngle={globalAngle}
                      inverted={inverted}
                    />
                  </div>

                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-[#111111] group-hover:text-[#D62828] transition-colors">
                    {comp.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-semibold text-[#111111]">{comp.caption}</p>
                  <p className="mt-2 text-xs sm:text-sm text-[#2B2B2B] leading-relaxed">
                    {comp.explanation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#111111]/20 text-xs font-mono-tech text-[#2B2B2B]">
                  {comp.dominantAxis}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
