import React from 'react';
import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const FooterSection: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#111111] text-[#F6F2E9] poster-grain-dark constructivist-grid-dark overflow-hidden">
      {/* Final Manifesto Poster Screen */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-24 sm:py-32 border-b border-[#F6F2E9]/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[#EAB308] mb-4">
              07. ИТОГОВЫЙ МАНИФЕСТ · ФОРМУЛА КОНСТРУКТИВИЗМА
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-none"
            >
              <span className="inline-block bg-[#D62828] text-[#F6F2E9] px-4 py-1.5 mr-3 mb-2">
                Форма
              </span>
              <span className="inline-block">становится</span>{' '}
              <span className="inline-block underline decoration-4 decoration-[#EAB308] underline-offset-8">
                действием
              </span>
            </motion.h2>

            <p className="mt-6 text-base sm:text-lg text-[#EAE3D5] max-w-2xl leading-relaxed">
              Конструктивизм доказал, что геометрия, честная работа материала и ясная структура
              способны менять восприятие пространства, города и книги. Начните исследование заново
              или перейдите к любому разделу архива.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={scrollToTop}
                className="group inline-flex items-center gap-3 px-7 py-4 bg-[#F6F2E9] text-[#111111] font-display text-lg uppercase tracking-wider border-2 border-[#F6F2E9] poster-shadow-red hover:bg-[#D62828] hover:text-[#F6F2E9] hover:border-[#D62828] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#EAB308]"
              >
                <span>Вернуться в начало</span>
                <ArrowUp className="w-5 h-5 transition-transform duration-150 group-hover:-translate-y-1" />
              </button>
            </div>
          </div>

          {/* Geometric Finale Emblem */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-[#F6F2E9]/40 p-4 relative flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
                <circle cx="100" cy="100" r="78" fill="none" stroke="#F6F2E9" strokeWidth="3" />
                <circle
                  cx="100"
                  cy="100"
                  r="58"
                  fill="none"
                  stroke="#EAB308"
                  strokeWidth="4"
                  strokeDasharray="18 10"
                />
                <polygon points="30,155 165,45 125,165" fill="#D62828" />
                <circle cx="100" cy="100" r="18" fill="#F6F2E9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Institutional Footer */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs font-mono-tech text-[#EAE3D5]/80">
        <div>
          <span className="font-bold text-[#F6F2E9]">КОНСТРУКТИВИЗМ</span>
          <span aria-hidden="true"> · </span>
          <span>Интерактивный образовательный проект об эстетике авангарда 1920-х годов</span>
        </div>

        <nav aria-label="Нижняя навигация" className="flex flex-wrap items-center gap-5">
          <a href="#about" className="hover:text-[#EAB308] transition-colors whitespace-nowrap">
            Идеи
          </a>
          <a href="#principles" className="hover:text-[#EAB308] transition-colors whitespace-nowrap">
            Принципы
          </a>
          <a href="#authors" className="hover:text-[#EAB308] transition-colors whitespace-nowrap">
            Авторы
          </a>
          <a href="#buildings" className="hover:text-[#EAB308] transition-colors whitespace-nowrap">
            Здания
          </a>
          <a href="#gallery" className="hover:text-[#EAB308] transition-colors whitespace-nowrap">
            Галерея
          </a>
          <a href="#today" className="hover:text-[#EAB308] transition-colors whitespace-nowrap">
            Сегодня
          </a>
        </nav>
      </div>
    </footer>
  );
};
