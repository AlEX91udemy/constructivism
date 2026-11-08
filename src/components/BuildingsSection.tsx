import React, { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { BUILDINGS, BuildingItem, BuildingType } from '../data/constructivismData';
import { BuildingSvgIllustration, BuildingVisualTab } from './BuildingSvgIllustration';
import { BambuPrintViewer } from './BambuPrintViewer';
import { BuildingPhotoViewer } from './BuildingPhotoViewer';
import { soundEngine } from '../utils/soundEngine';

const BUILDING_TYPES: Array<{ value: 'all' | BuildingType; label: string }> = [
  { value: 'all', label: 'Все типы' },
  { value: 'жилое', label: 'Жилое' },
  { value: 'клуб', label: 'Клуб' },
  { value: 'гараж', label: 'Гараж' },
  { value: 'башня', label: 'Башня' },
  { value: 'общественное сооружение', label: 'Общественное сооружение' },
];

interface BuildingsSectionProps {
  externalCityRequest?: { city: string; buildingId?: string; timestamp: number } | null;
}

const getGridColumns = () => {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
};

export const BuildingsSection: React.FC<BuildingsSectionProps> = ({ externalCityRequest }) => {
  const [selectedType, setSelectedType] = useState<'all' | BuildingType>('all');
  const [selectedArchitect, setSelectedArchitect] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewModeById, setViewModeById] = useState<Record<string, BuildingVisualTab>>({});
  const [autoResetNotice, setAutoResetNotice] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState<number>(getGridColumns);

  // Track the clicked card's viewport Y position before expanding/collapsing
  // so we can compensate scroll in useLayoutEffect before browser paint.
  const scrollAnchorRef = useRef<{
    id: string;
    prevTop: number;
    action: 'expand' | 'collapse';
  } | null>(null);

  useEffect(() => {
    const handleResize = () => setGridCols(getGridColumns());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smart city selection: when choosing a city (Москва, Петроград, Витебск, Харьков, Свердловск),
  // check whether the active building type and architect filters have matching objects in that city,
  // and automatically reset them if no matching objects exist.
  const applyCitySelection = (
    city: string,
    currentType: 'all' | BuildingType,
    currentArchitect: string
  ) => {
    setSelectedCity(city);
    if (city === 'all') {
      setAutoResetNotice(null);
      return;
    }

    const buildingsInCity = BUILDINGS.filter((b) => b.city === city);
    const hasTypeInCity =
      currentType === 'all' || buildingsInCity.some((b) => b.type === currentType);
    const hasArchitectInCity =
      currentArchitect === 'all' ||
      buildingsInCity.some((b) => b.architectFilterKey === currentArchitect);

    let nextType: 'all' | BuildingType = hasTypeInCity ? currentType : 'all';
    let nextArch: string = hasArchitectInCity ? currentArchitect : 'all';

    // If both filters exist individually in the city, verify their combined intersection exists
    const hasCombinedMatch = buildingsInCity.some(
      (b) =>
        (nextType === 'all' || b.type === nextType) &&
        (nextArch === 'all' || b.architectFilterKey === nextArch)
    );

    if (!hasCombinedMatch) {
      nextType = 'all';
      nextArch = 'all';
    }

    const resetParts: string[] = [];
    if (nextType !== currentType) {
      setSelectedType(nextType);
      resetParts.push(`тип «${currentType}»`);
    }
    if (nextArch !== currentArchitect) {
      setSelectedArchitect(nextArch);
      resetParts.push(`архитектор «${currentArchitect}»`);
    }

    if (resetParts.length > 0) {
      setAutoResetNotice(
        `В городе «${city}» нет объектов для фильтра (${resetParts.join(', ')}) — несовместимые фильтры автоматически сброшены.`
      );
    } else {
      setAutoResetNotice(null);
    }
  };

  // Respond when user clicks a city in the Hero top archival strip
  useEffect(() => {
    if (!externalCityRequest) return;
    applyCitySelection(externalCityRequest.city, selectedType, selectedArchitect);
    if (externalCityRequest.buildingId) {
      setExpandedId(externalCityRequest.buildingId);
    }
  }, [externalCityRequest]);

  const architects = useMemo(() => {
    const unique = Array.from(new Set(BUILDINGS.map((b) => b.architectFilterKey)));
    return ['all', ...unique];
  }, []);

  const cities = useMemo(() => {
    const preferredOrder = ['Москва', 'Петроград', 'Витебск', 'Харьков', 'Свердловск'];
    const available = new Set(BUILDINGS.map((b) => b.city));
    const ordered = preferredOrder.filter((c) => available.has(c));
    BUILDINGS.forEach((b) => {
      if (!ordered.includes(b.city)) ordered.push(b.city);
    });
    return ['all', ...ordered];
  }, []);

  const filteredBuildings = useMemo(() => {
    return BUILDINGS.filter((b) => {
      const matchType = selectedType === 'all' || b.type === selectedType;
      const matchArch = selectedArchitect === 'all' || b.architectFilterKey === selectedArchitect;
      const matchCity = selectedCity === 'all' || b.city === selectedCity;
      return matchType && matchArch && matchCity;
    });
  }, [selectedType, selectedArchitect, selectedCity]);

  // Place the selected (expanded) building at the start of its row so it spans all columns
  // in the center without being pushed down a row or leaving empty holes in the grid,
  // while all other buildings flow cleanly below it.
  const displayedBuildings = useMemo(() => {
    if (!expandedId) return filteredBuildings;
    const idx = filteredBuildings.findIndex((b) => b.id === expandedId);
    if (idx === -1) return filteredBuildings;
    const rowStart = Math.floor(idx / gridCols) * gridCols;
    if (idx === rowStart) return filteredBuildings;
    const next = [...filteredBuildings];
    const [selectedBuilding] = next.splice(idx, 1);
    next.splice(rowStart, 0, selectedBuilding);
    return next;
  }, [filteredBuildings, expandedId, gridCols]);

  // Compensate scroll synchronously before paint so closing a previous building or
  // expanding a building in column 2/3 never jumps the clicked card up or down.
  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current;
    if (!anchor) return;
    scrollAnchorRef.current = null;

    const el = document.getElementById(`building-card-${anchor.id}`);
    if (!el) return;

    const newRect = el.getBoundingClientRect();
    const deltaY = newRect.top - anchor.prevTop;
    if (Math.abs(deltaY) > 1) {
      window.scrollBy({ top: deltaY, behavior: 'instant' as ScrollBehavior });
    }

    if (anchor.action === 'expand') {
      requestAnimationFrame(() => {
        const currentEl = document.getElementById(`building-card-${anchor.id}`);
        if (!currentEl) return;
        const rect = currentEl.getBoundingClientRect();
        const headerOffset = 92;
        if (rect.top < headerOffset || rect.top > window.innerHeight * 0.42) {
          const targetTop = Math.max(0, window.scrollY + rect.top - headerOffset);
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      });
    }
  }, [expandedId]);

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedArchitect('all');
    setSelectedCity('all');
    setAutoResetNotice(null);
  };

  const handleSelectCity = (city: string) => {
    soundEngine.playSfx('click');
    applyCitySelection(city, selectedType, selectedArchitect);
  };

  const toggleExpand = (id: string) => {
    const el = document.getElementById(`building-card-${id}`);
    const isClosing = expandedId === id;
    if (el) {
      scrollAnchorRef.current = {
        id,
        prevTop: el.getBoundingClientRect().top,
        action: isClosing ? 'collapse' : 'expand',
      };
    }
    setExpandedId(isClosing ? null : id);
  };

  const selectTab = (id: string, tab: BuildingVisualTab) => {
    if (tab === '3d-print' && expandedId !== id) {
      const el = document.getElementById(`building-card-${id}`);
      if (el) {
        scrollAnchorRef.current = {
          id,
          prevTop: el.getBoundingClientRect().top,
          action: 'expand',
        };
      }
      setExpandedId(id);
    }
    setViewModeById((prev) => ({ ...prev, [id]: tab }));
  };

  const hasActiveFilters =
    selectedType !== 'all' || selectedArchitect !== 'all' || selectedCity !== 'all';

  return (
    <section
      id="buildings"
      aria-labelledby="buildings-heading"
      className="py-20 sm:py-28 border-b-4 border-[#111111] bg-[#F6F2E9] poster-grain"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b-2 border-[#111111] items-end">
          <div className="lg:col-span-7">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[#D62828] font-bold mb-3">
              04. АРХИТЕКТУРНЫЙ КАТАЛОГ · 16 ПАМЯТНИКОВ · РЕАЛЬНЫЕ ФОТО, ЧЕРТЕЖИ И 3D-МОДЕЛИ BAMBU LAB
            </div>
            <h2
              id="buildings-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#111111] leading-none"
            >
              Здания и объекты
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg text-[#2B2B2B] leading-relaxed">
              Полная коллекция из 16 памятников советского конструктивизма в Москве, Петрограде,
              Витебске, Харькове и Свердловске. В каждой карточке доступны 3 режима:{' '}
              <strong>Графика</strong>,{' '}
              <strong>Реальное фото (Wikimedia / Музейные архивы)</strong> и{' '}
              <strong>3D-модель (.STL)</strong>.
            </p>
          </div>
        </div>

        {/* Multi-Dimensional Filter Control Panel */}
        <div className="my-10 bg-[#EAE3D5] border-2 border-[#111111] p-5 sm:p-6 poster-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-[#111111]/20">
            <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-[#111111] font-bold">
              <SlidersHorizontal className="w-4 h-4 text-[#D62828]" />
              <span>
                Фильтрация каталога ({filteredBuildings.length} из {BUILDINGS.length})
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono-tech uppercase bg-[#111111] text-[#F6F2E9] hover:bg-[#D62828] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить фильтры</span>
              </button>
            )}
          </div>

          {autoResetNotice && (
            <div
              role="status"
              className="mb-5 bg-[#111111] text-[#F6F2E9] border-l-4 border-[#D62828] px-3.5 py-2 font-mono-tech text-xs flex items-center justify-between gap-3"
            >
              <span>{autoResetNotice}</span>
              <button
                type="button"
                onClick={() => setAutoResetNotice(null)}
                className="text-[#EAB308] hover:underline uppercase text-[10px] shrink-0 cursor-pointer"
              >
                Скрыть
              </button>
            </div>
          )}

          <div className="space-y-5">
            {/* Filter 1: Building Type */}
            <div>
              <div className="text-xs font-mono-tech uppercase text-[#2B2B2B] mb-2">
                Тип сооружения:
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по типу здания">
                {BUILDING_TYPES.map((t) => {
                  const isActive = selectedType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        soundEngine.playSfx('click');
                        setAutoResetNotice(null);
                        setSelectedType(t.value);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-mono-tech uppercase border-2 border-[#111111] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#D62828] text-[#F6F2E9] font-bold'
                          : 'bg-[#F6F2E9] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9]'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 2 & 3: Architect and City */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              <div className="lg:col-span-7">
                <div className="text-xs font-mono-tech uppercase text-[#2B2B2B] mb-2">
                  Архитектор / инженер:
                </div>
                <div
                  className="flex flex-wrap gap-1.5"
                  role="group"
                  aria-label="Фильтр по архитектору"
                >
                  {architects.map((arch) => {
                    const isActive = selectedArchitect === arch;
                    return (
                      <button
                        key={arch}
                        type="button"
                        onClick={() => {
                          soundEngine.playSfx('click');
                          setAutoResetNotice(null);
                          setSelectedArchitect(arch);
                        }}
                        className={`px-3 py-1.5 text-xs font-mono-tech border border-[#111111] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#111111] text-[#EAB308] font-bold'
                            : 'bg-[#F6F2E9] text-[#111111] hover:bg-[#111111]/10'
                        }`}
                      >
                        {arch === 'all' ? 'Все авторы' : arch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="text-xs font-mono-tech uppercase text-[#2B2B2B] mb-2">
                  Город авангарда:
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Фильтр по городу">
                  {cities.map((city) => {
                    const isActive = selectedCity === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        className={`px-3 py-1.5 text-xs font-mono-tech border border-[#111111] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#D62828] text-[#F6F2E9] font-bold'
                            : 'bg-[#F6F2E9] text-[#111111] hover:bg-[#111111]/10'
                        }`}
                      >
                        {city === 'all' ? 'Все города' : city}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty Filter State */}
        {filteredBuildings.length === 0 ? (
          <div className="bg-[#EAE3D5] border-2 border-[#111111] p-12 text-center">
            <p className="font-display text-2xl uppercase text-[#111111]">
              По выбранному сочетанию фильтров объекты не найдены
            </p>
            <p className="mt-2 text-sm text-[#2B2B2B]">
              Попробуйте выбрать «Все типы» или «Все города», чтобы увидеть полный каталог.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 px-5 py-2.5 bg-[#D62828] text-[#F6F2E9] font-display uppercase tracking-wider border-2 border-[#111111] cursor-pointer"
            >
              Показать все памятники
            </button>
          </div>
        ) : (
          /* Buildings Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-start">
            {displayedBuildings.map((building: BuildingItem) => {
              const isExpanded = expandedId === building.id;
              const rawTab: BuildingVisualTab = viewModeById[building.id] || 'facade';
              const activeTabForDisplay: BuildingVisualTab =
                !isExpanded && rawTab === '3d-print' ? 'facade' : rawTab;

              return (
                <article
                  id={`building-card-${building.id}`}
                  key={building.id}
                  className={`bg-[#F6F2E9] border-2 border-[#111111] transition-shadow ${
                    isExpanded
                      ? 'md:col-span-2 lg:col-span-3 poster-shadow-red border-4'
                      : 'poster-shadow hover:poster-shadow-red'
                  }`}
                >
                  <div className="p-5 sm:p-6">
                    {/* Header Metadata Strip with Expand/Collapse Toggle Button */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-[#2B2B2B] pb-3 mb-4 border-b border-[#111111]/20">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-[#D62828]">{building.year}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#111111]">{building.city}</span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase">{building.type}</span>
                      </div>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpand(building.id)}
                        className="text-[#111111] hover:text-[#D62828] font-bold transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Свернуть ↑' : 'Открыть досье и 3D ↓'}
                      </button>
                    </div>

                    <div
                      className={`grid grid-cols-1 ${
                        isExpanded ? 'lg:grid-cols-12 gap-8 items-start' : 'gap-4'
                      }`}
                    >
                      {/* Visual Column: 3 Tabs (Графика, Фото, 3D-модель) */}
                      <div className={isExpanded ? 'lg:col-span-6' : ''}>
                        {/* 3-Mode Switcher Bar */}
                        <div
                          role="tablist"
                          aria-label={`Режим просмотра: ${building.title}`}
                          className="mb-3 flex flex-wrap items-center justify-between gap-1 bg-[#EAE3D5] p-1.5 border-2 border-[#111111]"
                        >
                          {(
                            [
                              { id: 'facade', label: 'Графика' },
                              { id: 'photo', label: 'Фото' },
                              { id: '3d-print', label: '3D-модель' },
                            ] as const
                          ).map((tab) => {
                            const isTabActive = activeTabForDisplay === tab.id;
                            return (
                              <button
                                key={tab.id}
                                role="tab"
                                aria-selected={isTabActive}
                                type="button"
                                onClick={() => selectTab(building.id, tab.id)}
                                className={`flex-1 px-2.5 py-1.5 text-[11px] font-mono-tech uppercase transition-colors whitespace-nowrap shrink-0 text-center cursor-pointer ${
                                  isTabActive
                                    ? tab.id === '3d-print'
                                      ? 'bg-[#D62828] text-[#F6F2E9] font-bold'
                                      : 'bg-[#111111] text-[#F6F2E9] font-bold'
                                    : 'text-[#111111] hover:bg-[#111111]/10'
                                }`}
                              >
                                {tab.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Viewport Area */}
                        {activeTabForDisplay === '3d-print' && isExpanded ? (
                          <BambuPrintViewer
                            buildingId={building.id}
                            buildingTitle={building.title}
                            photoUrl={building.photoUrl}
                          />
                        ) : activeTabForDisplay === 'photo' ? (
                          <div className="relative">
                            <BuildingPhotoViewer
                              building={building}
                              isExpanded={isExpanded}
                              onExpandRequest={() => toggleExpand(building.id)}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="relative aspect-[16/10] w-full border-2 border-[#111111] overflow-hidden">
                              <div
                                onClick={() => {
                                  if (!isExpanded) toggleExpand(building.id);
                                }}
                                className={
                                  !isExpanded ? 'w-full h-full cursor-pointer' : 'w-full h-full'
                                }
                              >
                                <BuildingSvgIllustration
                                  buildingId={building.id}
                                  viewMode="facade"
                                  isExpanded={isExpanded}
                                />
                              </div>
                            </div>

                            <div className="mt-2 bg-[#111111] text-[#F6F2E9] px-3 py-2 border border-[#111111] font-mono-tech text-[11px] flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[#EAB308] uppercase font-bold">
                                Конструктивная формула:
                              </span>
                              <span className="text-[#F6F2E9]/85">
                                {building.structuralFormula} · {building.dimensions}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Title, Architect & Description */}
                      <div className={isExpanded ? 'lg:col-span-6' : ''}>
                        <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#111111]">
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => toggleExpand(building.id)}
                            className="text-left hover:text-[#D62828] transition-colors cursor-pointer"
                          >
                            {building.title}
                          </button>
                        </h3>

                        <div className="mt-1.5 text-xs sm:text-sm font-mono-tech text-[#2B2B2B]">
                          Архитектор:{' '}
                          <span className="text-[#111111] font-semibold">{building.architect}</span>
                        </div>

                        <p className="mt-3 text-sm sm:text-base text-[#2B2B2B] leading-relaxed">
                          {building.shortDescription}
                        </p>

                        {!isExpanded && (
                          <button
                            type="button"
                            aria-expanded={false}
                            onClick={() => toggleExpand(building.id)}
                            className="w-full mt-4 pt-3 border-t border-[#111111]/15 flex items-center justify-between text-xs font-mono-tech text-[#111111] hover:text-[#D62828] transition-colors cursor-pointer"
                          >
                            <span className="truncate">{building.structuralFormula}</span>
                            <ChevronDown className="w-4 h-4 text-[#D62828] shrink-0 ml-2" />
                          </button>
                        )}

                        {/* Expanded Dossier Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-5 pt-5 border-t-2 border-[#111111] space-y-4"
                            >
                              <p className="text-sm sm:text-base text-[#111111] leading-relaxed">
                                {building.fullDescription}
                              </p>

                              <div>
                                <div className="font-mono-tech text-xs uppercase text-[#D62828] font-bold mb-2">
                                  Главные архитектурные особенности:
                                </div>
                                <ul className="space-y-2">
                                  {building.features.map((feat) => (
                                    <li
                                      key={feat}
                                      className="flex items-start gap-2.5 text-sm text-[#111111] bg-[#EAE3D5] p-2.5 border border-[#111111]"
                                    >
                                      <span className="inline-block w-2 h-2 bg-[#D62828] mt-1.5 shrink-0" />
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono-tech">
                                <div className="bg-[#111111] text-[#F6F2E9] p-3">
                                  <span className="text-[#EAB308] block uppercase">Параметры:</span>
                                  <span className="mt-1 block">{building.dimensions}</span>
                                </div>
                                <div className="bg-[#111111] text-[#F6F2E9] p-3">
                                  <span className="text-[#D62828] block uppercase">
                                    Адрес памятника:
                                  </span>
                                  <span className="mt-1 block">
                                    {building.city}, {building.address}
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-end pt-2">
                                <button
                                  type="button"
                                  aria-expanded={true}
                                  onClick={() => toggleExpand(building.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-mono-tech uppercase text-[#D62828] hover:text-[#111111] font-bold transition-colors cursor-pointer"
                                >
                                  <span>Свернуть карточку</span>
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
