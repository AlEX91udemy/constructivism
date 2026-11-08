import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar } from 'lucide-react';
import { TODAY_DOMAINS, TodayDomain } from '../data/constructivismData';
import { soundEngine } from '../utils/soundEngine';

interface EraStage {
  year: number;
  progress: number;
  shortLabel: string;
  title: string;
  headerBadge: string;
  headerMeta: string;
  circleValue: string;
  circleCaption: string;
  headlineTag: string;
  headlineText: string;
  ctaLeft: string;
  ctaRight: string;
  cards: Array<{
    tag: string;
    tagColor: string;
    text: string;
  }>;
}

const ERA_STAGES: EraStage[] = [
  {
    year: 1925,
    progress: 0,
    shortLabel: '1925 · Плакат',
    title: '1925: Агитационный типографский плакат (ВХУТЕМАС / Госиздат)',
    headerBadge: 'ГОСИЗДАТ · МОСКВА 1925',
    headerMeta: 'ТИРАЖ 25 000 ЭКЗ.',
    circleValue: '№ 1',
    circleCaption: 'Ударный фокус круга',
    headlineTag: 'Лозунг-плашка',
    headlineText: 'КНИГИ ПО ВСЕМ ОТРАСЛЯМ!',
    ctaLeft: 'Клин-указатель !',
    ctaRight: 'Наборная линейка',
    cards: [
      {
        tag: '1925 · Металлическая наборная касса',
        tagColor: 'text-[#EAB308]',
        text: 'Родченко и Ган выстраивают композицию с помощью типографских линеек, диагональных плашек и контраста красного с черным.',
      },
      {
        tag: '1925 · Агитационный клин и фотомонтаж',
        tagColor: 'text-[#D62828]',
        text: 'Геометрический клин и крупный рубленый шрифт работают как оптический громкоговоритель на городской улице.',
      },
      {
        tag: '1925 · Производственное искусство ИНХУК',
        tagColor: 'text-[#F6F2E9]',
        text: 'Отказ от станкового декора в пользу стандартизации тиражной печати, упаковки и архитектурных модулей.',
      },
    ],
  },
  {
    year: 1965,
    progress: 35,
    shortLabel: '1965 · Модульная сетка',
    title: '1965: Интернациональный типографический стиль и ВНИИТЭ',
    headerBadge: 'SWISS GRID · ВНИИТЭ 1965',
    headerMeta: 'МОДУЛЬ 8×8 · ГРОТЕСК',
    circleValue: 'A4',
    circleCaption: 'Стандарт ISO и пропорция',
    headlineTag: 'Математическая сетка',
    headlineText: 'СИСТЕМА ВИЗУАЛЬНОЙ НАВИГАЦИИ',
    ctaLeft: 'Индекс-стрелка →',
    ctaRight: 'Колонка 60мм',
    cards: [
      {
        tag: '1965 · Рождение модульных сеток',
        tagColor: 'text-[#EAB308]',
        text: 'Открытия Лисицкого и ВХУТЕМАСа переосмыслены швейцарской школой (Мюллер-Брокман) и советской технической эстетикой ВНИИТЭ.',
      },
      {
        tag: '1965 · Инфографика и пиктограммы',
        tagColor: 'text-[#D62828]',
        text: 'Ударные плакатные формы превращаются в универсальные транспортные схемы, указатели и приборные панели.',
      },
      {
        tag: '1965 · Корпоративные стандарты',
        tagColor: 'text-[#F6F2E9]',
        text: 'Появляются первые дизайн-руководства (гайдлайны), жестко фиксирующие шаг сетки, интерлиньяж и акцентные цвета.',
      },
    ],
  },
  {
    year: 1998,
    progress: 70,
    shortLabel: '1998 · Ранний Веб',
    title: '1998: Цифровая верстка, пиксельные сетки и гипертекст',
    headerBadge: 'HTTP/1.1 · WEB PORTAL 1998',
    headerMeta: '800×600 PX · TABLE GRID',
    circleValue: '<H1>',
    circleCaption: 'Блочный DOM-контейнер',
    headlineTag: 'Гипертекстовый узел',
    headlineText: 'ИНТЕРАКТИВНЫЙ КАТАЛОГ ДАННЫХ',
    ctaLeft: 'Гиперссылка [CLICK]',
    ctaRight: 'Рамка 2px solid',
    cards: [
      {
        tag: '1998 · От бумажной полосы к экрану',
        tagColor: 'text-[#EAB308]',
        text: 'Конструктивистское членение плоскости переходит в HTML-каркасы, фреймы и контрастные навигационные панели.',
      },
      {
        tag: '1998 · Интерактивный отклик',
        tagColor: 'text-[#D62828]',
        text: 'Зритель впервые становится пользователем: плакатная плашка обретает состояние наведения (hover) и мгновенный переход.',
      },
      {
        tag: '1998 · Информационная архитектура',
        tagColor: 'text-[#F6F2E9]',
        text: 'Четкая иерархия заголовков H1–H3 и табличных колонок позволяет ориентироваться в массивах цифровых архивов.',
      },
    ],
  },
  {
    year: 2026,
    progress: 100,
    shortLabel: '2026 · Интерфейс',
    title: '2026: Модульная веб-система, CSS Grid и дизайн-токены',
    headerBadge: 'GRID_SYSTEM · UI 2026',
    headerMeta: '12 КОЛОНОК · GAP 24PX',
    circleValue: '100%',
    circleCaption: 'Модульный UI-компонент',
    headlineTag: 'Типографическая иерархия H1',
    headlineText: 'ФУНКЦИЯ УПРАВЛЯЕТ ВЕРСТКОЙ',
    ctaLeft: 'Кнопка CTA →',
    ctaRight: 'Контраст WCAG AAA',
    cards: [
      {
        tag: '2026 · Наборная касса → CSS Grid & Flexbox',
        tagColor: 'text-[#EAB308]',
        text: 'Металлические линейки и марзаны, которыми Родченко и Ган делили полосу журнала, превратились в адаптивные колонки, gap и border.',
      },
      {
        tag: '2026 · Агитационная плашка → Кнопка CTA',
        tagColor: 'text-[#D62828]',
        text: 'Красный геометрический блок со словом-командой сегодня работает как главная контрастная кнопка целевого действия в интерфейсе.',
      },
      {
        tag: '2026 · Производственное искусство → Дизайн-системы',
        tagColor: 'text-[#F6F2E9]',
        text: 'Стандартизация повторяемых узлов во ВХУТЕМАСе — прямой предшественник компонентного подхода в React, Figma и атомарном дизайне.',
      },
    ],
  },
];

export const TodaySection: React.FC = () => {
  // 0 = 1925 Poster, 35 = 1965 Grid, 70 = 1998 Web, 100 = 2026 Digital Interface
  const [morphProgress, setMorphProgress] = useState<number>(0);
  const [activeDomainId, setActiveDomainId] = useState<string>(TODAY_DOMAINS[0].id);

  const currentYear = Math.round(1925 + (morphProgress / 100) * (2026 - 1925));

  // Find closest stage for current morphProgress
  const activeStage = React.useMemo(() => {
    return ERA_STAGES.reduce((prev, curr) =>
      Math.abs(curr.progress - morphProgress) < Math.abs(prev.progress - morphProgress)
        ? curr
        : prev
    );
  }, [morphProgress]);

  const advanceToNextStage = React.useCallback(() => {
    soundEngine.playSfx('click');
    setMorphProgress((prev) => {
      const currentIndex = ERA_STAGES.findIndex(
        (s) => Math.abs(s.progress - prev) < 12
      );
      const nextIndex = currentIndex === -1 ? 1 : (currentIndex + 1) % ERA_STAGES.length;
      return ERA_STAGES[nextIndex].progress;
    });
  }, []);

  const selectEraStage = (stage: EraStage) => {
    soundEngine.playSfx('click');
    setMorphProgress(stage.progress);
  };

  const isDigital = morphProgress >= 50;
  const tiltFactor = (100 - morphProgress) / 100; // 1 at 1925 -> 0 at 2026
  const activeDomain = TODAY_DOMAINS.find((d) => d.id === activeDomainId) || TODAY_DOMAINS[0];

  return (
    <section
      id="today"
      aria-labelledby="today-heading"
      className="py-20 sm:py-28 border-b-4 border-[#111111] bg-[#F6F2E9] poster-grain"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b-2 border-[#111111] items-end">
          <div className="lg:col-span-7">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[#D62828] font-bold mb-3">
              06. ЭВОЛЮЦИЯ ЯЗЫКА · 1925 → 2026
            </div>
            <h2
              id="today-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#111111] leading-none"
            >
              Конструктивизм сегодня
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg text-[#2B2B2B] leading-relaxed">
              Открытия советского авангарда не остались в музеях. Модульные сетки, контрастная
              типографика, функциональное зонирование и алгоритмическая геометрия стали основой
              современных цифровых продуктов и визуальной культуры XXI века.
            </p>
          </div>
        </div>

        {/* Interactive Transformation Showcase: 1925 Poster <-> 2026 Digital UI */}
        <div className="my-12 bg-[#111111] text-[#F6F2E9] border-4 border-[#111111] poster-shadow-red p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#F6F2E9]/20">
            <div>
              <div className="flex items-center gap-2 font-mono-tech text-xs uppercase text-[#EAB308]">
                <Calendar className="w-3.5 h-3.5 text-[#D62828]" />
                <span>
                  Интерактивная машина времени · Активный год:{' '}
                  <strong className="text-[#F6F2E9] bg-[#D62828] px-2 py-0.5 ml-1">
                    {currentYear} г.
                  </strong>
                </span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide mt-2">
                {activeStage.title}
              </h3>
            </div>

            {/* Mode Controls: 4 Era Date Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                role="tablist"
                aria-label="Переключение исторической даты"
                className="flex flex-wrap border-2 border-[#F6F2E9] bg-[#2B2B2B]"
              >
                {ERA_STAGES.map((stage) => {
                  const isStageSelected = activeStage.year === stage.year;
                  return (
                    <button
                      key={stage.year}
                      role="tab"
                      aria-selected={isStageSelected}
                      type="button"
                      onClick={() => selectEraStage(stage)}
                      className={`px-3 sm:px-4 py-2 text-xs font-mono-tech uppercase whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isStageSelected
                          ? stage.year >= 1998
                            ? 'bg-[#EAB308] text-[#111111] font-bold'
                            : 'bg-[#D62828] text-[#F6F2E9] font-bold'
                          : 'text-[#F6F2E9] hover:bg-[#F6F2E9]/15'
                      }`}
                    >
                      {stage.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Morphing Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Morph Canvas */}
            <div className="lg:col-span-7">
              <div className="relative bg-[#F6F2E9] text-[#111111] border-4 border-[#F6F2E9] p-5 sm:p-7 min-h-[340px] overflow-hidden constructivist-grid">
                {/* Top Header Bar Morphing */}
                <motion.div
                  layout
                  animate={{ rotate: -2 * tiltFactor }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#111111] pb-3 mb-5"
                >
                  <span className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider bg-[#111111] text-[#F6F2E9] px-3 py-0.5">
                    {activeStage.headerBadge}
                  </span>
                  <span className="font-mono-tech text-xs font-bold text-[#D62828]">
                    {currentYear} Г. · {activeStage.headerMeta}
                  </span>
                </motion.div>

                {/* Central Morphing Elements */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Left Graphic / Metric Widget */}
                  <motion.div
                    layout
                    animate={{ rotate: -6 * tiltFactor }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`col-span-12 sm:col-span-5 flex flex-col items-center justify-center p-4 border-2 border-[#111111] transition-colors ${
                      isDigital ? 'bg-[#EAE3D5] text-[#111111]' : 'bg-[#D62828] text-[#F6F2E9]'
                    }`}
                  >
                    <motion.div
                      animate={{
                        rotate: 45 * tiltFactor,
                        borderRadius: `${Math.round(50 * tiltFactor)}%`,
                      }}
                      transition={{ duration: 0.4 }}
                      className={`w-24 h-24 border-4 border-[#111111] flex items-center justify-center ${
                        isDigital ? 'bg-[#111111] text-[#EAB308]' : 'bg-[#F6F2E9] text-[#111111]'
                      }`}
                    >
                      <span className="font-mono-tech text-xl font-bold">
                        {activeStage.circleValue}
                      </span>
                    </motion.div>
                    <div className="mt-3 font-mono-tech text-xs uppercase font-bold text-center">
                      {activeStage.circleCaption}
                    </div>
                  </motion.div>

                  {/* Right Headline Block -> Interactive Card */}
                  <motion.div
                    layout
                    animate={{ rotate: 2 * tiltFactor }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="col-span-12 sm:col-span-7 space-y-3"
                  >
                    <div className="bg-[#111111] text-[#F6F2E9] p-3.5 border-2 border-[#111111]">
                      <div className="font-mono-tech text-[11px] text-[#EAB308] uppercase">
                        {activeStage.headlineTag} ({currentYear})
                      </div>
                      <div className="font-display text-2xl sm:text-3xl uppercase tracking-wide mt-0.5">
                        {activeStage.headlineText}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={advanceToNextStage}
                        className="bg-[#EAB308] hover:bg-[#D62828] text-[#111111] hover:text-[#F6F2E9] p-3 border-2 border-[#111111] font-mono-tech text-xs font-bold uppercase text-left transition-colors cursor-pointer"
                        title="Нажмите для перехода к следующей эпохе"
                      >
                        {activeStage.ctaLeft}
                      </button>
                      <div className="bg-[#F6F2E9] text-[#111111] p-3 border-2 border-[#111111] font-mono-tech text-xs uppercase">
                        {activeStage.ctaRight}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Interactive Date Slider & Quick Year Buttons */}
                <div className="mt-6 pt-4 border-t-2 border-[#111111] space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => selectEraStage(ERA_STAGES[0])}
                      className={`font-mono-tech text-xs font-bold px-2 py-0.5 border border-[#111111] shrink-0 cursor-pointer transition-colors ${
                        activeStage.year === 1925
                          ? 'bg-[#D62828] text-[#F6F2E9]'
                          : 'bg-[#EAE3D5] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9]'
                      }`}
                    >
                      1925
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={morphProgress}
                      aria-label="Степень перехода от плаката 1925 года к веб-интерфейсу 2026 года"
                      onChange={(e) => {
                        setMorphProgress(Number(e.target.value));
                      }}
                      className="w-full accent-[#D62828] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => selectEraStage(ERA_STAGES[ERA_STAGES.length - 1])}
                      className={`font-mono-tech text-xs font-bold px-2 py-0.5 border border-[#111111] shrink-0 cursor-pointer transition-colors ${
                        activeStage.year === 2026
                          ? 'bg-[#111111] text-[#EAB308]'
                          : 'bg-[#EAE3D5] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9]'
                      }`}
                    >
                      2026
                    </button>
                  </div>

                  {/* Quick intermediate year ticks */}
                  <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase text-[#2B2B2B]">
                    {ERA_STAGES.map((stage) => (
                      <button
                        key={stage.year}
                        type="button"
                        onClick={() => selectEraStage(stage)}
                        className={`cursor-pointer hover:text-[#D62828] transition-colors ${
                          activeStage.year === stage.year ? 'text-[#D62828] font-bold underline' : ''
                        }`}
                      >
                        {stage.year} г.
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Explanation of the Transformation (Dynamically updates with selected date) */}
            <motion.div
              key={activeStage.year}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:col-span-5 space-y-4"
            >
              {activeStage.cards.map((card, index) => (
                <div
                  key={card.tag}
                  className="p-4 bg-[#2B2B2B] border border-[#F6F2E9]/25 hover:border-[#EAB308]/60 transition-colors"
                >
                  <div className={`font-mono-tech text-xs uppercase font-bold ${card.tagColor}`}>
                    {index + 1}. {card.tag}
                  </div>
                  <p className="mt-1.5 text-sm text-[#EAE3D5] leading-relaxed">{card.text}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* 5 Contemporary Domains Selector & Breakdown */}
        <div>
          <div className="font-mono-tech text-xs uppercase tracking-widest text-[#2B2B2B] mb-4">
            Пять индустрий, использующих код конструктивизма сегодня:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {TODAY_DOMAINS.map((domain: TodayDomain) => {
              const isSelected = domain.id === activeDomainId;
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => setActiveDomainId(domain.id)}
                  className={`text-left p-4 border-2 border-[#111111] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#D62828] text-[#F6F2E9] poster-shadow -translate-y-1'
                      : 'bg-[#EAE3D5] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9]'
                  }`}
                >
                  <div className="font-display text-lg uppercase tracking-wide">
                    {domain.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Domain Detailed Card */}
          <motion.div
            key={activeDomain.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#EAE3D5] border-2 border-[#111111] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-7">
              <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#111111]">
                {activeDomain.title}
              </h3>
              <p className="font-mono-tech text-xs uppercase text-[#D62828] font-bold mt-1">
                {activeDomain.subtitle}
              </p>

              <p className="mt-4 text-base text-[#111111] leading-relaxed">
                {activeDomain.description}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F6F2E9] p-4 border-2 border-[#111111]">
                <div>
                  <div className="font-mono-tech text-[11px] uppercase text-[#2B2B2B]">
                    Исток 1920-х годов:
                  </div>
                  <div className="font-display text-base uppercase text-[#111111] mt-0.5">
                    {activeDomain.from1920s}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-[#D62828] shrink-0 hidden sm:block" />
                  <div>
                    <div className="font-mono-tech text-[11px] uppercase text-[#D62828] font-bold">
                      Практика 2020-х годов:
                    </div>
                    <div className="font-display text-base uppercase text-[#111111] mt-0.5">
                      {activeDomain.in2020s}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#111111] text-[#F6F2E9] p-6 border-2 border-[#111111]">
              <div className="font-mono-tech text-xs uppercase text-[#EAB308] mb-3">
                Примеры в современной практике:
              </div>
              <ul className="space-y-3">
                {activeDomain.examples.map((ex) => (
                  <li key={ex} className="flex items-start gap-2.5 text-sm text-[#EAE3D5]">
                    <span className="inline-block w-2.5 h-2.5 bg-[#D62828] mt-1 shrink-0" />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
