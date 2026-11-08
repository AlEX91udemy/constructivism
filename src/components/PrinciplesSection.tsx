import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PRINCIPLES, PrincipleItem } from '../data/constructivismData';

const PrincipleIllustration: React.FC<{ id: string; isHovered: boolean }> = ({ id, isHovered }) => {
  switch (id) {
    case 'geometry':
      return (
        <svg viewBox="0 0 260 150" className="w-full h-full" aria-hidden="true">
          <motion.circle
            cx="75"
            cy="75"
            r="44"
            fill="#D62828"
            animate={{ scale: isHovered ? 1.12 : 1, x: isHovered ? 8 : 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.rect
            x="105"
            y="32"
            width="68"
            height="68"
            fill="#111111"
            animate={{ rotate: isHovered ? 45 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ originX: '139px', originY: '66px' }}
          />
          <motion.polygon
            points="160,122 205,32 238,122"
            fill="#EAB308"
            stroke="#111111"
            strokeWidth="3"
            animate={{ y: isHovered ? -8 : 0 }}
            transition={{ duration: 0.25 }}
          />
        </svg>
      );
    case 'functionality':
      return (
        <svg viewBox="0 0 260 150" className="w-full h-full" aria-hidden="true">
          {/* Interlocking functional gear & structural truss */}
          <line x1="25" y1="115" x2="235" y2="115" stroke="#111111" strokeWidth="5" />
          <motion.g
            animate={{ rotate: isHovered ? 90 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ originX: '90px', originY: '72px' }}
          >
            <circle cx="90" cy="72" r="34" fill="none" stroke="#111111" strokeWidth="8" strokeDasharray="14 8" />
            <circle cx="90" cy="72" r="14" fill="#D62828" />
          </motion.g>
          <motion.rect
            x="138"
            y="46"
            width="85"
            height="22"
            fill="#111111"
            animate={{ x: isHovered ? 10 : 0 }}
            transition={{ duration: 0.25 }}
          />
          <rect x="150" y="68" width="14" height="47" fill="#D62828" />
          <rect x="195" y="68" width="14" height="47" fill="#111111" />
        </svg>
      );
    case 'dynamics':
      return (
        <svg viewBox="0 0 260 150" className="w-full h-full" aria-hidden="true">
          {/* Diagonal thrust wedge */}
          <motion.g
            animate={{ x: isHovered ? 14 : 0, y: isHovered ? -8 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <polygon points="25,130 215,25 175,95" fill="#D62828" />
            <line x1="20" y1="105" x2="185" y2="15" stroke="#111111" strokeWidth="6" />
            <line x1="55" y1="138" x2="235" y2="40" stroke="#111111" strokeWidth="3" strokeDasharray="10 6" />
          </motion.g>
          <circle cx="205" cy="40" r="14" fill="#EAB308" stroke="#111111" strokeWidth="3" />
        </svg>
      );
    case 'contrast':
      return (
        <svg viewBox="0 0 260 150" className="w-full h-full" aria-hidden="true">
          <rect x="25" y="20" width="105" height="110" fill="#111111" />
          <rect x="130" y="20" width="105" height="110" fill="#F6F2E9" stroke="#111111" strokeWidth="3" />
          <motion.circle
            cx="130"
            cy="75"
            r="38"
            fill="#D62828"
            animate={{ scale: isHovered ? 1.18 : 1 }}
            transition={{ duration: 0.25 }}
          />
          <motion.rect
            x="65"
            y="63"
            width="130"
            height="24"
            fill="#EAB308"
            stroke="#111111"
            strokeWidth="3"
            animate={{ rotate: isHovered ? -12 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ originX: '130px', originY: '75px' }}
          />
        </svg>
      );
    case 'typography':
      return (
        <svg viewBox="0 0 260 150" className="w-full h-full" aria-hidden="true">
          <motion.g
            animate={{ x: isHovered ? 6 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <rect x="24" y="24" width="145" height="36" fill="#111111" />
            <text
              x="34"
              y="50"
              fill="#F6F2E9"
              fontSize="24"
              fontWeight="bold"
              fontFamily="Oswald, sans-serif"
            >
              СЛОВО!
            </text>
          </motion.g>
          <motion.g
            animate={{ x: isHovered ? -6 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <rect x="75" y="72" width="160" height="32" fill="#D62828" />
            <text
              x="86"
              y="95"
              fill="#F6F2E9"
              fontSize="20"
              fontWeight="bold"
              fontFamily="Oswald, sans-serif"
            >
              СИГНАЛ 1925
            </text>
          </motion.g>
          <line x1="24" y1="120" x2="235" y2="120" stroke="#111111" strokeWidth="6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 260 150" className="w-full h-full" aria-hidden="true">
          {/* Mass production / serial grid */}
          {[0, 1, 2, 3].map((idx) => (
            <motion.g
              key={idx}
              animate={{ y: isHovered ? (idx % 2 === 0 ? -6 : 6) : 0 }}
              transition={{ duration: 0.25 }}
            >
              <rect
                x={28 + idx * 54}
                y="32"
                width="42"
                height="86"
                fill={idx === 1 ? '#D62828' : idx === 3 ? '#EAB308' : '#111111'}
                stroke="#111111"
                strokeWidth="2.5"
              />
              <circle
                cx={49 + idx * 54}
                cy="75"
                r="11"
                fill="#F6F2E9"
              />
            </motion.g>
          ))}
        </svg>
      );
  }
};

export const PrinciplesSection: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      id="principles"
      aria-labelledby="principles-heading"
      className="py-20 sm:py-28 border-b-4 border-[#111111] bg-[#EAE3D5] constructivist-grid"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Section Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b-2 border-[#111111] items-end">
          <div className="lg:col-span-7">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[#D62828] font-bold mb-3">
              02. МЕТОДОЛОГИЯ И ВИЗУАЛЬНЫЙ КОД
            </div>
            <h2
              id="principles-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#111111] leading-none"
            >
              Главные принципы
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg text-[#2B2B2B] leading-relaxed">
              Шесть конструктивных законов, превращающих плакат, здание и предмет быта в
              слаженный визуальный механизм. Наведите курсор на карточку, чтобы увидеть работу
              геометрической схемы.
            </p>
          </div>
        </div>

        {/* 6 Principles Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {PRINCIPLES.map((item: PrincipleItem) => {
            const isHovered = hoveredId === item.id;
            return (
              <article
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(item.id)}
                onBlur={() => setHoveredId(null)}
                tabIndex={0}
                className="group bg-[#F6F2E9] border-2 border-[#111111] poster-shadow hover:poster-shadow-red transition-all duration-150 flex flex-col justify-between p-6 focus-visible:outline-2 focus-visible:outline-[#D62828]"
              >
                <div>
                  {/* Top Index Row */}
                  <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3 mb-4">
                    <span className="font-mono-tech text-2xl font-bold text-[#D62828]">
                      {item.number}.
                    </span>
                    <span className="font-mono-tech text-xs uppercase tracking-wider text-[#2B2B2B]">
                      ПРИНЦИП КОНСТРУКЦИИ
                    </span>
                  </div>

                  {/* Interactive SVG Canvas */}
                  <div className="h-36 bg-[#EAE3D5] border-2 border-[#111111] mb-5 overflow-hidden">
                    <PrincipleIllustration id={item.id} isHovered={isHovered} />
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#111111] group-hover:text-[#D62828] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 font-display text-sm sm:text-base uppercase tracking-wide text-[#2B2B2B]">
                    {item.tagline}
                  </p>
                  <p className="mt-3 text-sm text-[#2B2B2B] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Unboxed metadata footer */}
                <div className="mt-6 pt-3 border-t border-[#111111]/20 text-xs font-mono-tech text-[#111111]">
                  {item.visualRule}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
