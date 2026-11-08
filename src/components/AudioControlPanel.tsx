import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Sliders, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const AudioControlPanel: React.FC = () => {
  const [settings, setSettings] = useState(soundEngine.getSettings());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return soundEngine.subscribe(setSettings);
  }, []);

  const handleToggleMaster = () => {
    soundEngine.setMasterEnabled(!settings.masterEnabled);
  };

  const handleToggleAmbient = () => {
    soundEngine.setAmbientEnabled(!settings.ambientEnabled);
  };

  const handleToggleSfx = () => {
    soundEngine.setSfxEnabled(!settings.sfxEnabled);
  };

  return (
    <aside
      aria-label="Управление звуковым сопровождением"
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end"
    >
      {/* Expanded Acoustic Studio Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-[#F6F2E9] text-[#111111] border-4 border-[#111111] poster-shadow-red p-4 sm:p-5">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2.5 mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#D62828]" />
              <span className="font-display text-base uppercase tracking-wider font-bold">
                Акустический узел · HTML5 Audio
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Свернуть панель звука"
              className="p-1 text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs font-mono-tech">
            {/* Master Mute / Enable Toggle */}
            <div className="flex items-center justify-between bg-[#EAE3D5] p-2.5 border border-[#111111]">
              <div>
                <div className="font-bold uppercase text-[#111111]">Общий звук</div>
                <div className="text-[11px] text-[#2B2B2B]">
                  {settings.masterEnabled ? 'Звуковой тракт активен' : 'Все звуки отключены'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleMaster}
                className={`px-3 py-1.5 uppercase font-bold border border-[#111111] transition-colors whitespace-nowrap shrink-0 ${
                  settings.masterEnabled
                    ? 'bg-[#111111] text-[#EAB308]'
                    : 'bg-[#D62828] text-[#F6F2E9]'
                }`}
              >
                {settings.masterEnabled ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            {/* Industrial Background Soundscape Toggle */}
            <div className="flex items-center justify-between bg-[#EAE3D5] p-2.5 border border-[#111111]">
              <div>
                <div className="font-bold uppercase text-[#111111]">Индустриальный фон</div>
                <div className="text-[11px] text-[#2B2B2B]">Ритм печатного цеха и гул мачты</div>
              </div>
              <button
                type="button"
                onClick={handleToggleAmbient}
                className={`px-3 py-1.5 uppercase font-bold border border-[#111111] transition-colors whitespace-nowrap shrink-0 ${
                  settings.masterEnabled && settings.ambientEnabled
                    ? 'bg-[#D62828] text-[#F6F2E9]'
                    : 'bg-[#F6F2E9] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9]'
                }`}
              >
                {settings.masterEnabled && settings.ambientEnabled ? 'ИГРАЕТ' : 'ВКЛЮЧИТЬ'}
              </button>
            </div>

            {/* UI Interaction Signals Toggle */}
            <div className="flex items-center justify-between bg-[#EAE3D5] p-2.5 border border-[#111111]">
              <div>
                <div className="font-bold uppercase text-[#111111]">Сигналы интерфейса</div>
                <div className="text-[11px] text-[#2B2B2B]">Отклик кнопок, карточек и сетки</div>
              </div>
              <button
                type="button"
                onClick={handleToggleSfx}
                className={`px-3 py-1.5 uppercase font-bold border border-[#111111] transition-colors whitespace-nowrap shrink-0 ${
                  settings.masterEnabled && settings.sfxEnabled
                    ? 'bg-[#111111] text-[#F6F2E9]'
                    : 'bg-[#F6F2E9] text-[#111111] hover:bg-[#111111] hover:text-[#F6F2E9]'
                }`}
              >
                {settings.masterEnabled && settings.sfxEnabled ? 'АКТИВНЫ' : 'ОТКЛЮЧЕНЫ'}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="audio-volume-range" className="uppercase text-[#2B2B2B]">
                  Уровень громкости:
                </label>
                <span className="font-bold text-[#D62828]">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <input
                id="audio-volume-range"
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.volume * 100)}
                onChange={(e) => soundEngine.setVolume(Number(e.target.value) / 100)}
                className="w-full accent-[#D62828] cursor-pointer"
              />
            </div>

            {/* Test Signal Buttons */}
            <div className="pt-2 border-t border-[#111111]/20">
              <div className="text-[11px] uppercase text-[#2B2B2B] mb-2">
                Проба акустических сигналов:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!settings.masterEnabled) soundEngine.setMasterEnabled(true);
                    soundEngine.playSfx('click');
                  }}
                  className="px-2 py-1.5 bg-[#111111] text-[#F6F2E9] hover:bg-[#D62828] transition-colors text-[11px] uppercase text-center whitespace-nowrap"
                >
                  Литера
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!settings.masterEnabled) soundEngine.setMasterEnabled(true);
                    soundEngine.playSfx('expand');
                  }}
                  className="px-2 py-1.5 bg-[#111111] text-[#F6F2E9] hover:bg-[#D62828] transition-colors text-[11px] uppercase text-center whitespace-nowrap"
                >
                  Затвор
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!settings.masterEnabled) soundEngine.setMasterEnabled(true);
                    soundEngine.playSfx('signal');
                  }}
                  className="px-2 py-1.5 bg-[#111111] text-[#F6F2E9] hover:bg-[#D62828] transition-colors text-[11px] uppercase text-center whitespace-nowrap"
                >
                  Сигнал
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Control Strip */}
      <div className="inline-flex items-center border-2 border-[#111111] bg-[#111111] text-[#F6F2E9] poster-shadow">
        <button
          type="button"
          onClick={handleToggleMaster}
          aria-label={settings.masterEnabled ? 'Отключить звук' : 'Включить звук'}
          className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono-tech uppercase transition-colors whitespace-nowrap shrink-0 ${
            settings.masterEnabled
              ? 'bg-[#111111] text-[#F6F2E9] hover:bg-[#2B2B2B]'
              : 'bg-[#D62828] text-[#F6F2E9]'
          }`}
        >
          {settings.masterEnabled ? (
            <Volume2 className="w-4 h-4 text-[#EAB308]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#F6F2E9]" />
          )}
          <span className="font-bold">
            {settings.masterEnabled
              ? settings.ambientEnabled
                ? 'Звук + Цех'
                : 'Звук ВКЛ'
              : 'Без звука'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Настройки индустриального фона и звуковых сигналов"
          className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono-tech uppercase bg-[#EAE3D5] text-[#111111] hover:bg-[#EAB308] border border-[#111111] transition-colors whitespace-nowrap shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-bold">Радиоузел</span>
        </button>
      </div>
    </aside>
  );
};
