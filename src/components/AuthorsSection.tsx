import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AUTHORS, AuthorItem } from '../data/constructivismData';

const AuthorEmblemSvg: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'rodchenko':
      return (
        <svg viewBox="0 0 220 220" className="w-full h-full" aria-hidden="true">
          <rect width="220" height="220" fill="#111111" />
          {/* Megaphone / Lengiz diagonal cone */}
          <polygon points="45,120 195,35 195,185" fill="#D62828" />
          <circle cx="70" cy="118" r="38" fill="#F6F2E9" stroke="#111111" strokeWidth="4" />
          <circle cx="70" cy="118" r="14" fill="#111111" />
          {/* Compass arms */}
          <line x1="70" y1="30" x2="150" y2="195" stroke="#EAB308" strokeWidth="5" />
          <line x1="70" y1="30" x2="30" y2="195" stroke="#F6F2E9" strokeWidth="4" />
        </svg>
      );
    case 'popova':
      return (
        <svg viewBox="0 0 220 220" className="w-full h-full" aria-hidden="true">
          <rect width="220" height="220" fill="#EAE3D5" />
          {/* Architectonic intersecting force planes */}
          <polygon points="20,180 135,20 185,65 70,200" fill="#111111" />
          <polygon points="65,30 200,145 160,195 35,75" fill="#D62828" opacity="0.92" />
          <circle cx="115" cy="110" r="46" fill="none" stroke="#EAB308" strokeWidth="7" />
          <line x1="15" y1="110" x2="205" y2="110" stroke="#111111" strokeWidth="4" />
        </svg>
      );
    case 'lissitzky':
      return (
        <svg viewBox="0 0 220 220" className="w-full h-full" aria-hidden="true">
          <rect width="220" height="220" fill="#F6F2E9" />
          {/* White circle in dark block & Red Wedge + Proun bar */}
          <rect x="110" y="0" width="110" height="220" fill="#111111" />
          <circle cx="140" cy="115" r="54" fill="#F6F2E9" />
          <polygon points="15,45 155,118 45,155" fill="#D62828" stroke="#111111" strokeWidth="3" />
          <rect
            x="40"
            y="155"
            width="125"
            height="18"
            fill="#EAB308"
            stroke="#111111"
            strokeWidth="3"
            transform="rotate(-22 102 164)"
          />
        </svg>
      );
    case 'stepanova':
      return (
        <svg viewBox="0 0 220 220" className="w-full h-full" aria-hidden="true">
          <rect width="220" height="220" fill="#111111" />
          {/* Optical geometric textile rings */}
          <circle cx="85" cy="85" r="52" fill="#D62828" />
          <circle cx="135" cy="135" r="52" fill="#F6F2E9" />
          <circle cx="85" cy="85" r="24" fill="#111111" />
          <circle cx="135" cy="135" r="24" fill="#EAB308" />
          <polygon points="35,185 185,35 198,48 48,198" fill="#D62828" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 220 220" className="w-full h-full" aria-hidden="true">
          <rect width="220" height="220" fill="#EAE3D5" />
          {/* Tatlin's inclined spiral monument */}
          <line x1="35" y1="200" x2="155" y2="20" stroke="#D62828" strokeWidth="7" />
          <line x1="185" y1="200" x2="120" y2="25" stroke="#111111" strokeWidth="4" />
          <ellipse
            cx="112"
            cy="155"
            rx="68"
            ry="20"
            fill="none"
            stroke="#111111"
            strokeWidth="5"
            transform="rotate(-18 112 155)"
          />
          <ellipse
            cx="122"
            cy="108"
            rx="50"
            ry="15"
            fill="none"
            stroke="#D62828"
            strokeWidth="5"
            transform="rotate(-18 122 108)"
          />
          <ellipse
            cx="132"
            cy="64"
            rx="32"
            ry="11"
            fill="none"
            stroke="#111111"
            strokeWidth="4"
            transform="rotate(-18 132 64)"
          />
          <circle cx="138" cy="40" r="10" fill="#EAB308" stroke="#111111" strokeWidth="2.5" />
        </svg>
      );
  }
};

export const AuthorsSection: React.FC = () => {
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(AUTHORS[0].id);

  const selectedAuthor = AUTHORS.find((a) => a.id === selectedAuthorId) || AUTHORS[0];

  return (
    <section
      id="authors"
      aria-labelledby="authors-heading"
      className="py-20 sm:py-28 border-b-4 border-[#111111] bg-[#111111] text-[#F6F2E9] poster-grain-dark constructivist-grid-dark"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Section Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b-2 border-[#F6F2E9]/25 items-end">
          <div className="lg:col-span-7">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[#EAB308] font-bold mb-3">
              03. ПИОНЕРЫ И ТЕОРЕТИКИ АВАНГАРДА
            </div>
            <h2
              id="authors-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#F6F2E9] leading-none"
            >
              Ключевые авторы
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg text-[#EAE3D5] leading-relaxed tracking-wide">
              Пять мастеров, превративших художественный эксперимент в универсальный язык
              архитектуры, полиграфии, фотографии, театра и промышленного дизайна.
            </p>
          </div>
        </div>

        {/* 5 Authors Cards Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {AUTHORS.map((author: AuthorItem) => {
            const isSelected = author.id === selectedAuthorId;
            return (
              <button
                key={author.id}
                type="button"
                onClick={() => setSelectedAuthorId(author.id)}
                className={`text-left border-2 transition-all duration-150 flex flex-col justify-between p-4 focus-visible:outline-2 focus-visible:outline-[#EAB308] ${
                  isSelected
                    ? 'bg-[#F6F2E9] text-[#111111] border-[#D62828] poster-shadow-red -translate-y-1.5'
                    : 'bg-[#2B2B2B] text-[#F6F2E9] border-[#F6F2E9]/30 hover:border-[#F6F2E9]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-end text-xs font-mono-tech mb-3">
                    <span>{author.years}</span>
                  </div>

                  {/* Geometric Portrait Emblem */}
                  <div className="w-full aspect-square border-2 border-[#111111] mb-4 overflow-hidden">
                    <AuthorEmblemSvg id={author.id} />
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide leading-tight">
                    {author.name}
                  </h3>
                  <p
                    className={`mt-1.5 text-xs leading-snug ${
                      isSelected ? 'text-[#2B2B2B]' : 'text-[#EAE3D5]/80'
                    }`}
                  >
                    {author.role}
                  </p>
                </div>

                <div
                  className={`mt-4 pt-3 border-t text-[11px] font-mono-tech uppercase ${
                    isSelected
                      ? 'border-[#111111]/20 text-[#D62828] font-bold'
                      : 'border-[#F6F2E9]/15 text-[#EAB308]'
                  }`}
                >
                  {isSelected ? 'Открыто досье ↓' : 'Открыть досье →'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Selected Author Dossier */}
        <motion.div
          key={selectedAuthor.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-10 bg-[#F6F2E9] text-[#111111] border-4 border-[#D62828] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-6 items-center lg:items-start">
            <div className="w-44 h-44 sm:w-52 sm:h-52 border-4 border-[#111111] poster-shadow shrink-0">
              <AuthorEmblemSvg id={selectedAuthor.id} />
            </div>
            <div>
              <div className="font-mono-tech text-xs uppercase text-[#D62828] font-bold">
                Годы жизни: {selectedAuthor.years}
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase mt-1">
                {selectedAuthor.name}
              </h3>
              <div className="mt-2 text-xs font-mono-tech text-[#2B2B2B]">
                Мотив: {selectedAuthor.signatureMotif}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <blockquote className="p-5 bg-[#EAE3D5] border-2 border-[#111111] font-display text-xl sm:text-2xl uppercase tracking-wide text-[#111111] leading-snug">
              {selectedAuthor.quote}
            </blockquote>

            <p className="text-base sm:text-lg text-[#2B2B2B] leading-relaxed">
              {selectedAuthor.bio}
            </p>

            <div className="pt-4 border-t-2 border-[#111111]">
              <div className="font-mono-tech text-xs uppercase tracking-widest text-[#D62828] font-bold mb-3">
                Главные проекты и произведения:
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAuthor.keyWorks.map((work) => (
                  <li
                    key={work}
                    className="flex items-start gap-2.5 text-sm font-medium text-[#111111] bg-[#EAE3D5] p-3 border border-[#111111]"
                  >
                    <span className="inline-block w-2.5 h-2.5 bg-[#D62828] mt-1 shrink-0" />
                    <span>{work}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
