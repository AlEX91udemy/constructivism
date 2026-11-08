import React, { useState } from 'react';
import { Maximize2, Minimize2, Camera, Contrast, X } from 'lucide-react';
import { BuildingItem } from '../data/constructivismData';

interface BuildingPhotoViewerProps {
  building: BuildingItem;
  isExpanded: boolean;
  onExpandRequest?: () => void;
}

export const BuildingPhotoViewer: React.FC<BuildingPhotoViewerProps> = ({
  building,
  isExpanded,
  onExpandRequest,
}) => {
  const [archivalBw, setArchivalBw] = useState<boolean>(false);
  const [containMode, setContainMode] = useState<boolean>(
    building.type === 'башня' || building.id === 'melnikov-house'
  );
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  return (
    <div className="bg-[#111111] text-[#F6F2E9] border-2 border-[#111111]">
      {/* Top Archival Photo Header Bar (shown when expanded) */}
      {isExpanded && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#F6F2E9]/20 text-[11px] font-mono-tech">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-[#EAB308]" />
            <span className="uppercase font-bold text-[#EAB308]">
              ДОКУМЕНТАЛЬНАЯ ФОТОСЪЕМКА ПАМЯТНИКА · РЕАЛЬНЫЙ ИСТОЧНИК
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setContainMode((prev) => !prev)}
              className={`px-2 py-0.5 text-[10px] font-mono-tech uppercase border transition-colors cursor-pointer ${
                containMode
                  ? 'bg-[#EAB308] text-[#111111] border-[#EAB308] font-bold'
                  : 'bg-[#1D1C1A] text-[#F6F2E9] border-[#F6F2E9]/30 hover:border-[#F6F2E9]'
              }`}
            >
              {containMode ? 'Весь кадр целиком' : 'Заполнить рамку'}
            </button>

            <button
              type="button"
              onClick={() => setArchivalBw((prev) => !prev)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono-tech uppercase border transition-colors cursor-pointer ${
                archivalBw
                  ? 'bg-[#D62828] text-[#F6F2E9] border-[#F6F2E9] font-bold'
                  : 'bg-[#1D1C1A] text-[#F6F2E9] border-[#F6F2E9]/30 hover:border-[#F6F2E9]'
              }`}
            >
              <Contrast className="w-3 h-3" />
              <span>{archivalBw ? 'Ч/Б Хроника' : 'Оригинал'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono-tech uppercase bg-[#2B2B2B] text-[#F6F2E9] border border-[#F6F2E9]/40 hover:bg-[#D62828] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Крупно</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Photo Viewport */}
      <div
        onClick={() => {
          if (!isExpanded && onExpandRequest) {
            onExpandRequest();
          } else if (isExpanded) {
            setLightboxOpen(true);
          }
        }}
        className={`relative ${
          isExpanded ? 'aspect-[16/11]' : 'aspect-[16/10]'
        } w-full bg-[#161514] overflow-hidden flex items-center justify-center cursor-pointer group`}
      >
        {/* Subtle blurred backdrop when displaying vertical monuments in contain mode */}
        {containMode && (
          <img
            src={building.photoUrl}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30 pointer-events-none ${
              archivalBw ? 'grayscale contrast-125' : ''
            }`}
          />
        )}

        <img
          src={building.photoUrl}
          alt={`${building.title} — реальная фотография памятника конструктивизма (${building.city})`}
          loading="lazy"
          className={`relative z-10 w-full h-full transition-transform duration-300 group-hover:scale-[1.02] ${
            containMode ? 'object-contain' : 'object-cover'
          } ${archivalBw ? 'grayscale contrast-125 sepia-[0.12]' : ''}`}
        />

        {/* City & Year Stamp in top-left */}
        <div className="absolute top-2.5 left-2.5 z-20 bg-[#111111]/90 border border-[#F6F2E9]/40 px-2.5 py-1 text-[10px] font-mono-tech uppercase text-[#F6F2E9] pointer-events-none">
          <span>{building.city}</span>
          <span aria-hidden="true"> · </span>
          <span className="text-[#EAB308]">{building.year}</span>
        </div>

        {/* Zoom prompt badge in bottom-right */}
        <div className="absolute bottom-2.5 right-2.5 z-20 bg-[#111111]/90 border border-[#F6F2E9]/40 px-2.5 py-1 text-[10px] font-mono-tech uppercase text-[#F6F2E9] flex items-center gap-1.5 pointer-events-none">
          <Maximize2 className="w-3 h-3 text-[#EAB308]" />
          <span>{isExpanded ? 'Открыть во весь экран' : 'Раскрыть фотоархив'}</span>
        </div>
      </div>

      {/* Archival Attribution Caption & Real Source Link */}
      {isExpanded && (
        <div className="p-3 bg-[#1A1918] border-t border-[#F6F2E9]/20 space-y-1.5 text-xs">
          <p className="text-[#F6F2E9] leading-relaxed">{building.photoCaption}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono-tech text-[#EAE3D5]/75">
            <span>Источник: {building.photoArchiveSource}</span>
            <span className="text-[#EAB308]">Локация: {building.city}, {building.address}</span>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Полноэкранное фото: ${building.title}`}
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-[#111111]/95 flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-[#161514] border-2 border-[#F6F2E9] p-3 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#F6F2E9]/20 pb-2.5">
              <div>
                <div className="font-display text-lg sm:text-2xl uppercase text-[#F6F2E9] tracking-wide">
                  {building.title} ({building.city}, {building.year})
                </div>
                <div className="text-xs font-mono-tech text-[#EAB308]">
                  Архитектор: {building.architect} · {building.photoArchiveSource}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D62828] text-[#F6F2E9] text-xs font-mono-tech uppercase border border-[#F6F2E9] cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Закрыть</span>
              </button>
            </div>

            <div className="relative max-h-[72vh] w-full flex items-center justify-center bg-[#0D0D0D] overflow-hidden">
              <img
                src={building.photoUrl}
                alt={building.title}
                className={`max-h-[72vh] w-auto object-contain ${
                  archivalBw ? 'grayscale contrast-125 sepia-[0.12]' : ''
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#EAE3D5]">
              <p className="max-w-3xl">{building.photoCaption}</p>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#2B2B2B] text-[#F6F2E9] font-mono-tech uppercase border border-[#F6F2E9]/40 cursor-pointer shrink-0"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Свернуть окно</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
