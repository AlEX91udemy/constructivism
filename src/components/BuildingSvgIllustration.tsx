import React from 'react';
import { motion } from 'motion/react';

export type BuildingVisualTab = 'facade' | 'blueprint' | 'photo' | '3d-print';

interface BuildingSvgIllustrationProps {
  buildingId: string;
  viewMode?: 'facade' | 'blueprint' | 'photo';
  isExpanded?: boolean;
}

export const BuildingSvgIllustration: React.FC<BuildingSvgIllustrationProps> = ({
  buildingId,
  viewMode = 'facade',
  isExpanded = false,
}) => {
  const isBlueprint = viewMode === 'blueprint';
  const isPhoto = viewMode === 'photo';

  const bg = isPhoto ? '#1D1C1A' : isBlueprint ? '#111111' : '#EAE3D5';
  const line = isPhoto ? '#E6E1D6' : isBlueprint ? '#F6F2E9' : '#111111';
  const paper = isPhoto ? '#353330' : isBlueprint ? '#2B2B2B' : '#F6F2E9';
  const red = isPhoto ? '#A8A298' : '#D62828';
  const yellow = isPhoto ? '#D4CFC4' : '#EAB308';

  return (
    <svg
      viewBox="0 0 420 260"
      className="w-full h-full select-none"
      role="img"
      aria-label={`Геометрическая архитектурная иллюстрация: ${buildingId}`}
    >
      <defs>
        <pattern
          id={`grid-${buildingId}-${viewMode}`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke={
              isPhoto
                ? 'rgba(230,225,214,0.05)'
                : isBlueprint
                ? 'rgba(246,242,233,0.12)'
                : 'rgba(17,17,17,0.08)'
            }
            strokeWidth="1"
          />
        </pattern>
        <pattern
          id={`halftone-${buildingId}`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="rgba(230,225,214,0.12)" />
        </pattern>
      </defs>

      {/* Background & Grid */}
      <rect width="420" height="260" fill={bg} />
      <rect width="420" height="260" fill={`url(#grid-${buildingId}-${viewMode})`} />

      {/* Archival Photography perspective rays & halftone grain when in Photo mode */}
      {isPhoto && (
        <g>
          <polygon points="0,0 420,0 420,228 0,145" fill="rgba(230,225,214,0.06)" />
          <line x1="0" y1="260" x2="360" y2="0" stroke="rgba(230,225,214,0.14)" strokeWidth="1" />
          <line x1="0" y1="200" x2="290" y2="0" stroke="rgba(230,225,214,0.14)" strokeWidth="1" />
          <rect width="420" height="260" fill={`url(#halftone-${buildingId})`} />
        </g>
      )}

      {/* Ground Line */}
      <line x1="15" y1="228" x2="405" y2="228" stroke={line} strokeWidth="4" />

      {/* 1. ДОМ НАРКОМФИНА */}
      {buildingId === 'narkomfin' && (
        <g>
          <motion.circle
            cx="105"
            cy="95"
            r="52"
            fill={red}
            initial={{ scale: 0.9 }}
            animate={{ scale: isExpanded ? 1.06 : 1 }}
            transition={{ duration: 0.4 }}
          />
          {[48, 86, 124, 162, 200, 238, 276].map((x) => (
            <rect key={x} x={x} y="188" width="8" height="40" fill={line} />
          ))}
          <motion.rect
            x="35"
            y="84"
            width="262"
            height="104"
            fill={paper}
            stroke={line}
            strokeWidth="3.5"
            initial={{ x: -10 }}
            animate={{ x: 0 }}
          />
          <rect x="42" y="98" width="248" height="16" fill={line} />
          <rect x="42" y="128" width="248" height="16" fill={line} />
          <rect x="42" y="158" width="248" height="14" fill={red} />
          <rect x="75" y="56" width="130" height="28" fill={paper} stroke={line} strokeWidth="3" />
          <rect x="85" y="64" width="110" height="10" fill={yellow} />
          <rect x="297" y="132" width="24" height="18" fill={red} stroke={line} strokeWidth="2.5" />
          <rect x="321" y="102" width="68" height="126" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="331" y="114" width="48" height="68" fill={line} />
          <line x1="355" y1="114" x2="355" y2="182" stroke={paper} strokeWidth="2" />
          <line x1="331" y1="148" x2="379" y2="148" stroke={paper} strokeWidth="2" />
        </g>
      )}

      {/* 2. ДОМ КУЛЬТУРЫ ИМЕНИ РУСАКОВА */}
      {buildingId === 'rusakov' && (
        <g>
          <rect x="55" y="155" width="310" height="73" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="132" y="72" width="32" height="156" fill={yellow} stroke={line} strokeWidth="3" />
          <rect x="242" y="72" width="32" height="156" fill={yellow} stroke={line} strokeWidth="3" />
          {[50, 160, 270].map((x, idx) => (
            <motion.g
              key={x}
              initial={{ y: 8 }}
              animate={{ y: isExpanded ? -4 : 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
            >
              <polygon
                points={`${x},56 ${x + 86},44 ${x + 86},158 ${x},142`}
                fill={idx === 1 ? red : paper}
                stroke={line}
                strokeWidth="3.5"
              />
              <line
                x1={x + 14}
                y1="145"
                x2={x + 74}
                y2="154"
                stroke={line}
                strokeWidth="4"
              />
            </motion.g>
          ))}
        </g>
      )}

      {/* 3. ДОМ МЕЛЬНИКОВА */}
      {buildingId === 'melnikov-house' && (
        <g>
          <circle cx="315" cy="75" r="42" fill={red} />
          <rect x="155" y="38" width="138" height="190" fill={paper} stroke={line} strokeWidth="3.5" />
          <ellipse cx="224" cy="38" rx="69" ry="14" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="115" y="64" width="134" height="164" fill={paper} stroke={line} strokeWidth="3.5" />
          {[
            { x: 145, y: 88 },
            { x: 182, y: 88 },
            { x: 219, y: 88 },
            { x: 163, y: 122 },
            { x: 200, y: 122 },
            { x: 237, y: 122 },
            { x: 145, y: 156 },
            { x: 182, y: 156 },
            { x: 219, y: 156 },
            { x: 256, y: 68 },
            { x: 256, y: 104 },
            { x: 256, y: 140 },
          ].map((hex, i) => (
            <motion.polygon
              key={i}
              points={`${hex.x},${hex.y - 12} ${hex.x + 10},${hex.y - 6} ${hex.x + 10},${hex.y + 6} ${hex.x},${hex.y + 12} ${hex.x - 10},${hex.y + 6} ${hex.x - 10},${hex.y - 6}`}
              fill={i % 3 === 0 ? red : i % 4 === 0 ? yellow : line}
              animate={{ scale: isExpanded ? [1, 1.12, 1] : 1 }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
            />
          ))}
        </g>
      )}

      {/* 4. БАХМЕТЬЕВСКИЙ ГАРАЖ */}
      {buildingId === 'bakhmetevsky' && (
        <g>
          <polygon points="35,110 210,48 385,110" fill={paper} stroke={line} strokeWidth="3.5" />
          {[75, 120, 165, 210, 255, 300, 345].map((x) => (
            <line key={x} x1={x} y1="110" x2="210" y2="48" stroke={red} strokeWidth="2" />
          ))}
          <rect x="45" y="110" width="330" height="118" fill={paper} stroke={line} strokeWidth="3.5" />
          {[68, 148, 228, 308].map((x, idx) => (
            <g key={x}>
              <rect x={x} y="152" width="46" height="76" fill={idx === 1 ? red : line} />
              <circle
                cx={x + 23}
                cy="132"
                r="11"
                fill={idx === 2 ? yellow : paper}
                stroke={line}
                strokeWidth="3"
              />
            </g>
          ))}
          <motion.line
            x1="25"
            y1="210"
            x2="395"
            y2="75"
            stroke={red}
            strokeWidth="3"
            strokeDasharray="8 6"
            animate={{ strokeDashoffset: isExpanded ? -28 : 0 }}
          />
        </g>
      )}

      {/* 5. КЛУБ ИМЕНИ ЗУЕВА */}
      {buildingId === 'zuev-club' && (
        <g>
          <rect x="45" y="95" width="295" height="133" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="85" y="36" width="76" height="192" fill={line} stroke={line} strokeWidth="3.5" />
          <ellipse cx="123" cy="36" rx="38" ry="9" fill={red} stroke={line} strokeWidth="3" />
          {[100, 115, 130, 145].map((x) => (
            <line key={x} x1={x} y1="45" x2={x} y2="228" stroke={paper} strokeWidth="2" />
          ))}
          {[75, 105, 135, 165, 195].map((y) => (
            <line key={y} x1="85" y1={y} x2="161" y2={y} stroke={paper} strokeWidth="2" />
          ))}
          <motion.rect
            x="65"
            y="88"
            width="285"
            height="64"
            fill={red}
            stroke={line}
            strokeWidth="3.5"
            animate={{ x: isExpanded ? 6 : 0 }}
            transition={{ duration: 0.35 }}
          />
          <rect x="180" y="104" width="145" height="32" fill={paper} stroke={line} strokeWidth="2.5" />
          <rect x="185" y="172" width="135" height="32" fill={yellow} stroke={line} strokeWidth="2.5" />
        </g>
      )}

      {/* 6. ШУХОВСКАЯ БАШНЯ */}
      {buildingId === 'shukhov-tower' && (
        <g>
          <circle cx="210" cy="78" r="56" fill={yellow} opacity="0.85" />
          <motion.circle
            cx="210"
            cy="24"
            r="18"
            fill="none"
            stroke={red}
            strokeWidth="2.5"
            animate={{ scale: isExpanded ? [1, 1.6, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <circle cx="210" cy="24" r="6" fill={red} />
          {[
            { topW: 16, botW: 28, y1: 28, y2: 66 },
            { topW: 28, botW: 44, y1: 66, y2: 106 },
            { topW: 44, botW: 64, y1: 106, y2: 146 },
            { topW: 64, botW: 88, y1: 146, y2: 186 },
            { topW: 88, botW: 118, y1: 186, y2: 228 },
          ].map((sec, idx) => {
            const xTopLeft = 210 - sec.topW / 2;
            const xTopRight = 210 + sec.topW / 2;
            const xBotLeft = 210 - sec.botW / 2;
            const xBotRight = 210 + sec.botW / 2;
            return (
              <g key={idx}>
                <line
                  x1={xTopLeft}
                  y1={sec.y1}
                  x2={xTopRight}
                  y2={sec.y1}
                  stroke={idx % 2 === 0 ? red : line}
                  strokeWidth="3.5"
                />
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <g key={i}>
                    <line
                      x1={xTopLeft + t * sec.topW}
                      y1={sec.y1}
                      x2={xBotRight - t * sec.botW}
                      y2={sec.y2}
                      stroke={line}
                      strokeWidth="1.8"
                    />
                    <line
                      x1={xTopRight - t * sec.topW}
                      y1={sec.y1}
                      x2={xBotLeft + t * sec.botW}
                      y2={sec.y2}
                      stroke={line}
                      strokeWidth="1.8"
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </g>
      )}

      {/* 7. ДВОРЕЦ КУЛЬТУРЫ ЗИЛ */}
      {buildingId === 'zil-palace' && (
        <g>
          <rect x="45" y="102" width="235" height="126" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="55" y="118" width="210" height="20" fill={line} />
          <rect x="55" y="152" width="210" height="20" fill={line} />
          <rect x="55" y="186" width="210" height="16" fill={red} />
          <path
            d="M 95 102 A 28 28 0 0 1 151 102 Z"
            fill={yellow}
            stroke={line}
            strokeWidth="3.5"
          />
          <rect x="265" y="120" width="95" height="108" fill={line} stroke={line} strokeWidth="3.5" />
          {[282, 300, 318, 336, 350].map((x) => (
            <line key={x} x1={x} y1="120" x2={x} y2="228" stroke={paper} strokeWidth="2.5" />
          ))}
          <rect x="255" y="106" width="115" height="14" fill={red} stroke={line} strokeWidth="3" />
        </g>
      )}

      {/* 8. БЕЛАЯ БАШНЯ УРАЛМАШЗАВОДА (СВЕРДЛОВСК) — 3 колонны и лестничная призма по реальному фото */}
      {buildingId === 'white-tower' && (
        <g>
          {/* Red Constructivist sun disc behind the tower */}
          <circle cx="248" cy="106" r="54" fill={red} />

          {/* Tall vertical rectangular staircase prism on the left */}
          <rect x="118" y="34" width="46" height="194" fill={paper} stroke={line} strokeWidth="3.5" />
          {/* Vertical glazed staircase window strip */}
          <rect x="128" y="44" width="11" height="176" fill={line} />

          {/* 3 slender vertical columns supporting the cylindrical water tank */}
          <rect x="192" y="140" width="11" height="62" fill={paper} stroke={line} strokeWidth="3" />
          <rect x="216" y="140" width="11" height="62" fill={paper} stroke={line} strokeWidth="3" />
          <rect x="240" y="140" width="11" height="62" fill={paper} stroke={line} strokeWidth="3" />

          {/* Ground floor 1-story vestibule at the base */}
          <rect x="104" y="200" width="174" height="28" fill={paper} stroke={line} strokeWidth="3.5" />
          <line x1="100" y1="200" x2="282" y2="200" stroke={line} strokeWidth="4" />
          <rect x="112" y="207" width="16" height="12" fill={line} />
          <rect x="150" y="207" width="22" height="12" fill={line} />
          <rect x="236" y="207" width="24" height="12" fill={line} />

          {/* Top rectangular cabin superstructure with cantilevered balcony */}
          <rect x="116" y="20" width="96" height="18" fill={paper} stroke={line} strokeWidth="3" />
          <rect x="148" y="25" width="58" height="7" fill={line} />
          <line x1="110" y1="36" x2="218" y2="36" stroke={line} strokeWidth="3.5" />

          {/* Elevated cylindrical water tank (700 m³) */}
          <motion.g animate={{ y: isExpanded ? -3 : 0 }}>
            {/* Under-tank recessed glazed ring */}
            <rect x="166" y="128" width="94" height="12" fill={line} stroke={line} strokeWidth="2.5" />
            {/* Main white cylinder body */}
            <rect x="160" y="52" width="106" height="76" rx="8" fill={paper} stroke={line} strokeWidth="3.5" />
            {/* Upper curved clerestory ribbon window */}
            <rect x="160" y="64" width="106" height="16" fill={yellow} stroke={line} strokeWidth="3" />
            {[176, 192, 208, 224, 240, 252].map((mx) => (
              <line key={mx} x1={mx} y1="64" x2={mx} y2="80" stroke={line} strokeWidth="2" />
            ))}
            {/* 3 circular porthole windows (иллюминаторы) */}
            <circle cx="182" cy="106" r="6" fill={line} />
            <circle cx="216" cy="106" r="6" fill={line} />
            <circle cx="248" cy="106" r="6" fill={line} />
          </motion.g>
        </g>
      )}

      {/* 9. ДОМ ГОСПРОМА (ХАРЬКОВ) */}
      {buildingId === 'derzhprom' && (
        <g>
          <rect x="95" y="96" width="230" height="14" fill={red} stroke={line} strokeWidth="2.5" />
          <rect x="75" y="138" width="270" height="14" fill={yellow} stroke={line} strokeWidth="2.5" />
          {[
            { x: 38, y: 122, w: 46, h: 106 },
            { x: 96, y: 78, w: 52, h: 150 },
            { x: 162, y: 38, w: 62, h: 190 },
            { x: 238, y: 68, w: 52, h: 160 },
            { x: 304, y: 112, w: 48, h: 116 },
          ].map((t, idx) => (
            <g key={idx}>
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                fill={paper}
                stroke={line}
                strokeWidth="3.5"
              />
              {Array.from({ length: Math.floor((t.h - 20) / 22) }).map((_, row) => (
                <rect
                  key={row}
                  x={t.x + 8}
                  y={t.y + 12 + row * 22}
                  width={t.w - 16}
                  height="10"
                  fill={idx === 2 && row === 0 ? red : line}
                />
              ))}
            </g>
          ))}
        </g>
      )}

      {/* 10. СИЛОВАЯ СТАНЦИЯ «КРАСНОЕ ЗНАМЯ» (ПЕТРОГРАД) */}
      {buildingId === 'red-banner' && (
        <g>
          {/* Ship-like rounded corner tower & horizontal machine hall */}
          <rect x="135" y="98" width="235" height="130" fill={paper} stroke={line} strokeWidth="3.5" />
          {[116, 148, 180].map((y) => (
            <rect key={y} x="145" y={y} width="215" height="16" fill={line} />
          ))}
          <rect x="55" y="54" width="96" height="174" rx="44" fill={red} stroke={line} strokeWidth="3.5" />
          {[75, 98, 121].map((x) => (
            <rect key={x} x={x} y="76" width="10" height="128" fill={line} />
          ))}
          <rect x="180" y="68" width="120" height="30" fill={yellow} stroke={line} strokeWidth="3" />
        </g>
      )}

      {/* 11. БАШНЯ ТАТЛИНА (ПАМЯТНИК III ИНТЕРНАЦИОНАЛУ) */}
      {buildingId === 'tatlin-tower' && (
        <g>
          {/* Central inclined spine at 23.5 deg */}
          <line x1="115" y1="228" x2="265" y2="22" stroke={red} strokeWidth="7" />
          <line x1="295" y1="228" x2="235" y2="32" stroke={line} strokeWidth="4.5" />
          {/* Internal suspended rotating volumes: Cube, Pyramid, Cylinder, Hemisphere */}
          <rect
            x="155"
            y="162"
            width="92"
            height="52"
            fill={paper}
            stroke={line}
            strokeWidth="3.5"
            transform="rotate(-12 201 188)"
          />
          <polygon
            points="178,148 220,96 252,148"
            fill={red}
            stroke={line}
            strokeWidth="3"
          />
          <rect
            x="208"
            y="62"
            width="42"
            height="32"
            fill={yellow}
            stroke={line}
            strokeWidth="3"
            transform="rotate(-12 229 78)"
          />
          {/* Double spiral girders */}
          {[
            { cx: 195, cy: 190, rx: 88, ry: 24 },
            { cx: 210, cy: 142, rx: 66, ry: 18 },
            { cx: 226, cy: 96, rx: 46, ry: 13 },
            { cx: 242, cy: 54, rx: 28, ry: 9 },
          ].map((sp, i) => (
            <ellipse
              key={i}
              cx={sp.cx}
              cy={sp.cy}
              rx={sp.rx}
              ry={sp.ry}
              fill="none"
              stroke={i % 2 === 0 ? line : red}
              strokeWidth="4.5"
              transform={`rotate(-18 ${sp.cx} ${sp.cy})`}
            />
          ))}
        </g>
      )}

      {/* 12. ЛЕНИНСКАЯ ТРИБУНА УНОВИСА (ВИТЕБСК) */}
      {buildingId === 'unovis-tribune' && (
        <g>
          <circle cx="245" cy="95" r="48" fill={yellow} />
          {/* Cubist counterweight base */}
          <rect x="75" y="172" width="76" height="56" fill={line} />
          <rect x="92" y="156" width="52" height="22" fill={red} stroke={line} strokeWidth="3" />
          {/* Inclined diagonal steel truss */}
          <polygon
            points="95,180 285,48 310,64 125,196"
            fill={paper}
            stroke={line}
            strokeWidth="3.5"
          />
          <line x1="105" y1="185" x2="295" y2="55" stroke={red} strokeWidth="4" />
          {/* Top propaganda screen & speaker platform */}
          <rect x="265" y="26" width="84" height="52" fill={red} stroke={line} strokeWidth="3.5" />
          <rect x="275" y="36" width="64" height="14" fill={paper} />
        </g>
      )}

      {/* 13. МОСКОВСКИЙ ПЛАНЕТАРИЙ */}
      {buildingId === 'moscow-planetarium' && (
        <g>
          <circle cx="220" cy="84" r="54" fill={yellow} opacity="0.85" />
          {/* Parabolic Star Dome */}
          <path
            d="M 140 142 Q 220 22 300 142 Z"
            fill={line}
            stroke={line}
            strokeWidth="3.5"
          />
          <rect x="135" y="138" width="170" height="14" fill={red} stroke={line} strokeWidth="3" />
          {/* Horizontal Podium & Sloped Canopy */}
          <rect x="40" y="152" width="340" height="76" fill={paper} stroke={line} strokeWidth="3.5" />
          <polygon
            points="35,148 165,148 188,186 35,186"
            fill={line}
            stroke={line}
            strokeWidth="3"
          />
          {/* Semicircular Window & Inclined Ramp Slot */}
          <path d="M 210 165 A 26 26 0 0 1 210 217 Z" fill={red} stroke={line} strokeWidth="3" />
          <line x1="48" y1="216" x2="178" y2="196" stroke={red} strokeWidth="6" />
        </g>
      )}

      {/* 14. ГОРОДОК ЧЕКИСТОВ — КОРПУС «ИСЕТЬ» (СВЕРДЛОВСК) */}
      {buildingId === 'iset-gorodok' && (
        <g>
          <circle cx="210" cy="78" r="46" fill={red} />
          {/* Concave central 11-story arc */}
          <rect x="108" y="64" width="204" height="164" fill={paper} stroke={line} strokeWidth="3.5" />
          {[82, 106, 130, 154, 178, 202].map((wy) => (
            <g key={wy}>
              {[124, 152, 180, 208, 236, 264, 288].map((wx) => (
                <rect key={wx} x={wx} y={wy} width="14" height="14" fill={line} />
              ))}
            </g>
          ))}
          {/* Two flanking towers with triple wrap-around balconies */}
          <rect x="52" y="44" width="62" height="184" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="306" y="44" width="62" height="184" fill={paper} stroke={line} strokeWidth="3.5" />
          {[74, 96, 118].map((by) => (
            <g key={by}>
              <rect x="46" y={by} width="74" height="9" fill={red} stroke={line} strokeWidth="2.5" />
              <rect x="294" y={by} width="74" height="9" fill={yellow} stroke={line} strokeWidth="2.5" />
            </g>
          ))}
        </g>
      )}

      {/* 15. ДВОРЕЦ КУЛЬТУРЫ ИМЕНИ А. М. ГОРЬКОГО (ПЕТРОГРАД) */}
      {buildingId === 'gorky-palace' && (
        <g>
          {/* Concave central foyer screen with 5 vertical stained-glass bays */}
          <rect x="102" y="66" width="216" height="162" fill={paper} stroke={line} strokeWidth="3.5" />
          {[116, 156, 196, 236, 276].map((vx, i) => (
            <rect
              key={vx}
              x={vx}
              y="80"
              width="26"
              height="108"
              fill={i === 2 ? red : line}
            />
          ))}
          {/* Two symmetrical flanking stair towers */}
          <rect x="44" y="48" width="62" height="180" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="314" y="48" width="62" height="180" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="66" y="68" width="18" height="124" fill={line} />
          <rect x="336" y="68" width="18" height="124" fill={line} />
          {/* Entrance portico */}
          <rect x="96" y="192" width="228" height="12" fill={yellow} stroke={line} strokeWidth="3" />
        </g>
      )}

      {/* 16. ГОРИЗОНТАЛЬНЫЙ НЕБОСКРЕБ «ВОЛКЕНБЮГЕЛЬ» (ЭЛЬ ЛИСИЦКИЙ) */}
      {buildingId === 'wolkenbugel' && (
        <g>
          <circle cx="290" cy="115" r="48" fill={red} />
          {/* Two massive vertical elevator/stair pylons */}
          <rect x="92" y="92" width="48" height="136" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="108" y="96" width="8" height="132" fill={line} />
          <rect x="122" y="96" width="8" height="132" fill={line} />

          <rect x="212" y="64" width="64" height="164" fill={paper} stroke={line} strokeWidth="3.5" />
          <rect x="234" y="68" width="10" height="160" fill={line} />
          <rect x="252" y="68" width="10" height="160" fill={line} />

          {/* Elevated cantilevered horizontal 3-story glass slabs ("Cloud Iron") */}
          <rect x="52" y="68" width="160" height="32" fill={yellow} stroke={line} strokeWidth="3" />
          <polygon
            points="126,34 366,56 366,96 126,74"
            fill={paper}
            stroke={line}
            strokeWidth="3.5"
          />
          <line x1="132" y1="48" x2="360" y2="70" stroke={red} strokeWidth="4" />
          <line x1="132" y1="60" x2="360" y2="82" stroke={line} strokeWidth="3" />
        </g>
      )}

      {/* Blueprint Dimension Overlay */}
      {isBlueprint && (
        <g>
          <line x1="20" y1="20" x2="400" y2="20" stroke={yellow} strokeWidth="1" strokeDasharray="4 4" />
          <text x="24" y="15" fill={yellow} fontSize="10" fontFamily="JetBrains Mono, monospace">
            МАКЕТ И ЧЕРТЕЖ КАРКАСА · АКСОНОМЕТРИЧЕСКАЯ СХЕМА
          </text>
        </g>
      )}

      {/* Archival Photo Negative Stamp Overlay */}
      {isPhoto && (
        <g>
          <rect
            x="10"
            y="10"
            width="400"
            height="240"
            fill="none"
            stroke="#E6E1D6"
            strokeWidth="2"
          />
          <rect x="18" y="18" width="215" height="22" fill="#111111" stroke="#E6E1D6" strokeWidth="1" />
          <text x="26" y="33" fill="#E6E1D6" fontSize="10" fontFamily="JetBrains Mono, monospace">
            ФОТОАРХИВ · НЕГАТИВ 1930 Г.
          </text>
        </g>
      )}
    </svg>
  );
};
