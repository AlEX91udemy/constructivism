import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DISCIPLINES, TIMELINE_EVENTS } from '../data/constructivismData';

const DisciplineSvgDiagram: React.FC<{ disciplineId: string }> = ({ disciplineId }) => {
  switch (disciplineId) {
    case 'architecture':
      return (
        <svg viewBox="0 0 360 240" className="w-full h-full" aria-hidden="true">
          <rect x="20" y="20" width="320" height="200" fill="none" stroke="#111111" strokeWidth="2" />
          {/* Pilotis columns */}
          {[60, 110, 160, 210, 260].map((x) => (
            <line key={x} x1={x} y1="165" x2={x} y2="205" stroke="#111111" strokeWidth="6" />
          ))}
          {/* Horizontal ribbon facade */}
          <rect x="40" y="75" width="240" height="90" fill="#111111" />
          <rect x="46" y="88" width="228" height="16" fill="#F6F2E9" />
          <rect x="46" y="116" width="228" height="16" fill="#F6F2E9" />
          <rect x="46" y="144" width="228" height="12" fill="#EAB308" />
          {/* Vertical stair cylinder & cantilever */}
          <rect x="255" y="45" width="52" height="160" fill="#D62828" stroke="#111111" strokeWidth="3" />
          <line x1="20" y1="205" x2="340" y2="205" stroke="#111111" strokeWidth="4" />
        </svg>
      );
    case 'graphic-design':
      return (
        <svg viewBox="0 0 360 240" className="w-full h-full" aria-hidden="true">
          <rect x="20" y="20" width="320" height="200" fill="#111111" />
          <polygon points="35,195 230,45 275,195" fill="#D62828" />
          <circle cx="245" cy="95" r="46" fill="#F6F2E9" />
          <rect x="45" y="45" width="135" height="24" fill="#F6F2E9" transform="rotate(-14 45 45)" />
          <rect x="52" y="80" width="110" height="16" fill="#EAB308" transform="rotate(-14 52 80)" />
          <line x1="40" y1="185" x2="320" y2="185" stroke="#F6F2E9" strokeWidth="6" />
        </svg>
      );
    case 'photography':
      return (
        <svg viewBox="0 0 360 240" className="w-full h-full" aria-hidden="true">
          {/* Extreme diagonal perspective grid */}
          <line x1="30" y1="220" x2="290" y2="20" stroke="#111111" strokeWidth="3" />
          <line x1="90" y1="220" x2="310" y2="20" stroke="#111111" strokeWidth="3" />
          <line x1="150" y1="220" x2="330" y2="20" stroke="#111111" strokeWidth="3" />
          {/* Camera aperture rings */}
          <circle cx="145" cy="115" r="68" fill="none" stroke="#D62828" strokeWidth="5" />
          <circle cx="145" cy="115" r="42" fill="#111111" />
          <circle cx="145" cy="115" r="16" fill="#EAB308" />
          {/* Viewfinder marks */}
          <path d="M 40 55 L 40 35 L 65 35" fill="none" stroke="#111111" strokeWidth="4" />
          <path d="M 320 185 L 320 205 L 295 205" fill="none" stroke="#111111" strokeWidth="4" />
        </svg>
      );
    case 'theater':
      return (
        <svg viewBox="0 0 360 240" className="w-full h-full" aria-hidden="true">
          {/* Meyerhold / Popova stage machine */}
          <line x1="25" y1="205" x2="335" y2="205" stroke="#111111" strokeWidth="5" />
          {/* Three rotating wheels */}
          <circle cx="115" cy="120" r="52" fill="none" stroke="#111111" strokeWidth="5" />
          <line x1="63" y1="120" x2="167" y2="120" stroke="#111111" strokeWidth="3" />
          <line x1="115" y1="68" x2="115" y2="172" stroke="#111111" strokeWidth="3" />
          <circle cx="215" cy="95" r="38" fill="#D62828" stroke="#111111" strokeWidth="3" />
          {/* Ramps and ladders */}
          <polygon points="45,205 165,75 182,75 68,205" fill="#111111" />
          <rect x="245" y="55" width="18" height="150" fill="#EAB308" stroke="#111111" strokeWidth="3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 360 240" className="w-full h-full" aria-hidden="true">
          {/* Stepanova / Popova optical textile repeat */}
          {[0, 1, 2, 3].map((col) =>
            [0, 1].map((row) => {
              const cx = 65 + col * 76;
              const cy = 75 + row * 90;
              const isAlt = (col + row) % 2 === 0;
              return (
                <g key={`${col}-${row}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="34"
                    fill={isAlt ? '#D62828' : '#111111'}
                  />
                  <rect
                    x={cx - 34}
                    y={cy - 10}
                    width="68"
                    height="20"
                    fill={isAlt ? '#F6F2E9' : '#EAB308'}
                  />
                </g>
              );
            })
          )}
        </svg>
      );
  }
};

export const AboutSection: React.FC = () => {
  const [activeDisciplineId, setActiveDisciplineId] = useState<string>(DISCIPLINES[0].id);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number>(2);

  const currentDiscipline =
    DISCIPLINES.find((d) => d.id === activeDisciplineId) || DISCIPLINES[0];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-20 sm:py-28 border-b-4 border-[#111111] bg-[#F6F2E9] poster-grain"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b-2 border-[#111111] items-end">
          <div className="lg:col-span-7">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[#D62828] font-bold mb-3">
              01. ИСТОРИЯ И МАНИФЕСТ НАПРАВЛЕНИЯ
            </div>
            <h2
              id="about-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#111111] leading-none"
            >
              Что такое конструктивизм
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg text-[#2B2B2B] leading-relaxed">
              Авангардное направление в советском искусстве, архитектуре и дизайне 1920-х — начала
              1930-х годов, провозгласившее переход от созерцательного изображения мира к прямому
              жизнестроению и проектированию материальной среды.
            </p>
          </div>
        </div>

        {/* Core Definition & Constructivist Triad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-12 border-b-2 border-[#111111]">
          <div className="lg:col-span-5 bg-[#111111] text-[#F6F2E9] p-6 sm:p-8 border-2 border-[#111111] poster-shadow-red flex flex-col justify-between">
            <div>
              <div className="font-mono-tech text-xs uppercase tracking-widest text-[#EAB308] mb-3">
                Формула Алексея Гана · 1922 год
              </div>
              <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide leading-snug">
                От картинной рамы — к чертежу, фабрике и улице
              </h3>
              <p className="mt-4 text-sm sm:text-base text-[#EAE3D5] leading-relaxed">
                В марте 1921 года в Московском институте художественной культуры (ИНХУК)
                сформировалась Первая рабочая группа конструктивистов. Художники объявили, что
                традиционная станковая картина исчерпала себя: новый мир нуждается в
                художнике-инженере, который владеет законами материала, полиграфии и строительной
                механики.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F6F2E9]/20 grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-[#2B2B2B]">
                <div className="font-display text-sm sm:text-base uppercase text-[#EAB308]">
                  Тектоника
                </div>
                <div className="text-[11px] text-[#EAE3D5] mt-1">Органика задачи и идеологии</div>
              </div>
              <div className="p-2 bg-[#2B2B2B]">
                <div className="font-display text-sm sm:text-base uppercase text-[#D62828]">
                  Фактура
                </div>
                <div className="text-[11px] text-[#EAE3D5] mt-1">Честная обработка материала</div>
              </div>
              <div className="p-2 bg-[#2B2B2B]">
                <div className="font-display text-sm sm:text-base uppercase text-[#F6F2E9]">
                  Конструкция
                </div>
                <div className="text-[11px] text-[#EAE3D5] mt-1">Сборка формы в действие</div>
              </div>
            </div>
          </div>

          {/* 5 Disciplines Interactive Explorer */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="font-mono-tech text-xs uppercase tracking-widest text-[#2B2B2B]">
                  Пять сфер синтеза конструктивизма:
                </span>
                <span className="font-mono-tech text-xs text-[#D62828] font-bold">
                  {currentDiscipline.yearRange}
                </span>
              </div>

              {/* Discipline Tabs */}
              <div
                role="tablist"
                aria-label="Сферы применения конструктивизма"
                className="flex flex-wrap gap-2 mb-6"
              >
                {DISCIPLINES.map((disc) => {
                  const isSelected = disc.id === activeDisciplineId;
                  return (
                    <button
                      key={disc.id}
                      role="tab"
                      type="button"
                      aria-selected={isSelected}
                      onClick={() => setActiveDisciplineId(disc.id)}
                      className={`px-4 py-2 font-display text-sm sm:text-base uppercase tracking-wider border-2 border-[#111111] transition-colors whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-[#D62828] text-[#F6F2E9] poster-shadow'
                          : 'bg-[#EAE3D5] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9]'
                      }`}
                    >
                      {disc.title}
                    </button>
                  );
                })}
              </div>

              {/* Selected Discipline Panel */}
              <motion.div
                key={currentDiscipline.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#EAE3D5] border-2 border-[#111111] p-6"
              >
                <div className="md:col-span-7 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-2xl uppercase text-[#111111]">
                      {currentDiscipline.title}
                    </h4>
                    <p className="text-xs font-mono-tech uppercase text-[#D62828] mt-1">
                      {currentDiscipline.subtitle}
                    </p>
                    <p className="mt-3 text-sm sm:text-base text-[#111111] leading-relaxed">
                      {currentDiscipline.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#111111]/20">
                    <div className="text-xs font-mono-tech text-[#2B2B2B] mb-2">
                      Ключевые новации:
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#111111]">
                      {currentDiscipline.innovations.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="inline-block w-2 h-2 bg-[#D62828] mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 text-xs font-mono-tech text-[#2B2B2B]">
                      Имена: {currentDiscipline.keyFigures}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-col justify-center bg-[#F6F2E9] border-2 border-[#111111] p-3">
                  <div className="aspect-[3/2] w-full">
                    <DisciplineSvgDiagram disciplineId={currentDiscipline.id} />
                  </div>
                  <div className="mt-2 text-[11px] font-mono-tech uppercase text-center text-[#2B2B2B]">
                    Схема: {currentDiscipline.title}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Visual Interactive Timeline */}
        <div className="pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="font-mono-tech text-xs uppercase tracking-widest text-[#D62828] font-bold">
                ХРОНОЛОГИЯ ДВИЖЕНИЯ · 1914–1934
              </div>
              <h3 className="font-display text-3xl sm:text-4xl uppercase text-[#111111] mt-1">
                Визуальная временная шкала
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-mono-tech text-[#2B2B2B]">
              Выберите этап на шкале для просмотра исторического контекста
            </p>
          </div>

          {/* Interactive Timeline Rail */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-8">
            {TIMELINE_EVENTS.map((event, idx) => {
              const isActive = idx === activeTimelineIndex;
              return (
                <button
                  key={event.year}
                  type="button"
                  onClick={() => setActiveTimelineIndex(idx)}
                  className={`text-left p-3.5 border-2 border-[#111111] transition-all ${
                    isActive
                      ? 'bg-[#111111] text-[#F6F2E9] poster-shadow-red -translate-y-1'
                      : 'bg-[#EAE3D5] text-[#111111] hover:bg-[#111111]/10'
                  }`}
                >
                  <div
                    className={`font-mono-tech text-xs font-bold ${
                      isActive ? 'text-[#EAB308]' : 'text-[#D62828]'
                    }`}
                  >
                    {event.year}
                  </div>
                  <div className="font-display text-sm uppercase tracking-wide mt-1 line-clamp-2">
                    {event.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Timeline Spotlight Card */}
          <motion.div
            key={TIMELINE_EVENTS[activeTimelineIndex].year}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#111111] text-[#F6F2E9] border-2 border-[#111111] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#F6F2E9]/20 pb-4 lg:pb-0 lg:pr-6">
              <div className="font-mono-tech text-xs uppercase text-[#EAB308]">
                Этап 0{activeTimelineIndex + 1} / 0{TIMELINE_EVENTS.length} ·{' '}
                {TIMELINE_EVENTS[activeTimelineIndex].category}
              </div>
              <div className="font-display text-4xl sm:text-5xl font-bold text-[#D62828] mt-1 font-mono-tech">
                {TIMELINE_EVENTS[activeTimelineIndex].year}
              </div>
            </div>

            <div className="lg:col-span-6">
              <h4 className="font-display text-2xl sm:text-3xl uppercase tracking-wide">
                {TIMELINE_EVENTS[activeTimelineIndex].title}
              </h4>
              <p className="mt-2 text-sm sm:text-base text-[#EAE3D5] leading-relaxed">
                {TIMELINE_EVENTS[activeTimelineIndex].description}
              </p>
            </div>

            <div className="lg:col-span-3 bg-[#2B2B2B] p-4 border border-[#F6F2E9]/20">
              <div className="font-mono-tech text-[11px] uppercase text-[#EAB308]">
                Ключевой памятник / манифест
              </div>
              <div className="font-display text-base uppercase tracking-wider mt-1.5 text-[#F6F2E9]">
                {TIMELINE_EVENTS[activeTimelineIndex].artifact}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
