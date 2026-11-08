import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  Download,
  RotateCw,
  Layers,
  Box,
  Check,
  Grid,
  Columns,
  ShieldCheck,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  downloadStlFromThreeGroup,
  BAMBU_PRESETS,
  verifyThreeGroup,
  ModelVerificationReport,
} from '../utils/stlGenerator';
import { BUILDINGS } from '../data/constructivismData';
import {
  BUILDING_CAMERA_SPECS,
  CameraViewPreset,
} from './ConstructivistCameraConfig';
import { soundEngine } from '../utils/soundEngine';

interface BambuPrintViewerProps {
  buildingId: string;
  buildingTitle: string;
  photoUrl?: string;
}

export type FilamentMode = 'architectural' | 'ivory' | 'scarlet' | 'charcoal';

export interface PaletteColors {
  wall: string;
  wallSecondary: string;
  brick: string;
  glass: string;
  frame: string;
  accentRed: string;
  accentYellow: string;
  plinth: string;
}

export function getFilamentPalette(mode: FilamentMode = 'architectural'): PaletteColors {
  switch (mode) {
    case 'ivory':
      return {
        wall: '#F6F2E9',
        wallSecondary: '#EAE3D5',
        brick: '#E2DAC9',
        glass: '#C9C2B2',
        frame: '#D8D0C0',
        accentRed: '#F6F2E9',
        accentYellow: '#EAE3D5',
        plinth: '#2B2B2B',
      };
    case 'scarlet':
      return {
        wall: '#D62828',
        wallSecondary: '#B81D1D',
        brick: '#9E1919',
        glass: '#222222',
        frame: '#F6F2E9',
        accentRed: '#D62828',
        accentYellow: '#EAB308',
        plinth: '#1A1A1A',
      };
    case 'charcoal':
      return {
        wall: '#484848',
        wallSecondary: '#5A5A5A',
        brick: '#383838',
        glass: '#1E1E1E',
        frame: '#707070',
        accentRed: '#303030',
        accentYellow: '#686868',
        plinth: '#181818',
      };
    default:
      return {
        wall: '#F4EFE6',
        wallSecondary: '#DFD7C4',
        brick: '#A8382B',
        glass: '#1B222A',
        frame: '#2A2A2A',
        accentRed: '#D62828',
        accentYellow: '#EAB308',
        plinth: '#202020',
      };
  }
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; buildingTitle: string },
  WebGLErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; buildingTitle: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#161616] text-[#F6F2E9]">
          <Box className="w-10 h-10 text-[#EAB308] mb-2" />
          <div className="font-display text-lg uppercase tracking-wider">
            3D-модель готова к экспорту: {this.props.buildingTitle}
          </div>
          <p className="text-xs font-mono-tech text-[#EAE3D5]/70 mt-1">
            Используйте кнопку ниже для скачивания STL-файла для Bambu Studio
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Configures Studio PMREM Environment Map & Tone Mapping inside R3F Canvas
 */
const StudioEnvironmentSetup: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;

    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;

    return () => {
      envTarget.dispose();
      pmremGenerator.dispose();
      roomEnv.dispose();
    };
  }, [gl, scene]);

  return null;
};

/**
 * Smoothly interpolates Camera position and OrbitControls target when a preset is selected
 */
const CameraPresetController: React.FC<{
  buildingId: string;
  cameraPreset: CameraViewPreset;
  transitionActiveRef: React.MutableRefObject<boolean>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}> = ({ buildingId, cameraPreset, transitionActiveRef, controlsRef }) => {
  const { camera } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const spec =
      BUILDING_CAMERA_SPECS[buildingId] || BUILDING_CAMERA_SPECS['white-tower'];
    const chosen = spec[cameraPreset] || spec.photo;
    targetPos.set(...chosen.pos);
    targetLook.set(...chosen.target);
    transitionActiveRef.current = true;
  }, [buildingId, cameraPreset, targetPos, targetLook, transitionActiveRef]);

  useFrame((_, delta) => {
    if (!transitionActiveRef.current) return;
    const dt = Math.min(delta, 0.05);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.x, 6.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.y, 6.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, 6.5, dt);

    if (controlsRef.current) {
      const t = controlsRef.current.target;
      t.x = THREE.MathUtils.damp(t.x, targetLook.x, 6.5, dt);
      t.y = THREE.MathUtils.damp(t.y, targetLook.y, 6.5, dt);
      t.z = THREE.MathUtils.damp(t.z, targetLook.z, 6.5, dt);
      controlsRef.current.update();
    }

    if (camera.position.distanceToSquared(targetPos) < 0.0025) {
      transitionActiveRef.current = false;
    }
  });

  return null;
};

/**
 * Helper component that renders a 3D cylindrical or square strut between two 3D points
 */
interface Strut3DProps {
  start: [number, number, number];
  end: [number, number, number];
  radius?: number;
  segments?: number;
  color: string;
  wireframe: boolean;
  clipPlane: THREE.Plane;
}

const UP_VEC = new THREE.Vector3(0, 1, 0);

const Strut3D: React.FC<Strut3DProps> = ({
  start,
  end,
  radius = 0.025,
  segments = 8,
  color,
  wireframe,
  clipPlane,
}) => {
  const { position, quaternion, length } = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(vEnd, vStart);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
    const quat = new THREE.Quaternion();
    if (len > 0.0001) {
      quat.setFromUnitVectors(UP_VEC, dir.clone().normalize());
    }
    return {
      position: [mid.x, mid.y, mid.z] as [number, number, number],
      quaternion: quat,
      length: len,
    };
  }, [start, end]);

  if (length < 0.001) return null;

  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, segments]} />
      <meshStandardMaterial
        color={color}
        roughness={0.32}
        metalness={0.48}
        wireframe={wireframe}
        clippingPlanes={[clipPlane]}
      />
    </mesh>
  );
};

export interface ConstructivistR3FModelProps {
  buildingId: string;
  palette: PaletteColors;
  clipPlane: THREE.Plane;
  wireframe: boolean;
  exportGroupRef?: React.RefObject<THREE.Group | null>;
}

/**
 * High-Precision Architectural 3D Replicas for all 16 Constructivist Monuments
 */
export const ConstructivistR3FModel: React.FC<ConstructivistR3FModelProps> = ({
  buildingId,
  palette,
  clipPlane,
  wireframe,
  exportGroupRef,
}) => {
  const rotatingInternalRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (rotatingInternalRef.current && buildingId === 'tatlin-tower') {
      rotatingInternalRef.current.rotation.y += delta * 0.35;
    }
  });

  const mat = (color: string, roughness = 0.5, metalness = 0.08) => ({
    color,
    roughness,
    metalness,
    wireframe,
    clippingPlanes: [clipPlane],
    clipShadows: true,
  });

  // Precompute Shukhov Tower 6-section hyperboloid straight-rod lattice
  const shukhovStruts = useMemo(() => {
    const sections = [
      { y0: 0.16, y1: 1.05, r0: 1.38, r1: 1.06, n: 24, twist: 1.15 },
      { y0: 1.05, y1: 1.88, r0: 1.06, r1: 0.82, n: 22, twist: 1.12 },
      { y0: 1.88, y1: 2.62, r0: 0.82, r1: 0.62, n: 20, twist: 1.08 },
      { y0: 2.62, y1: 3.28, r0: 0.62, r1: 0.46, n: 18, twist: 1.05 },
      { y0: 3.28, y1: 3.84, r0: 0.46, r1: 0.33, n: 16, twist: 1.02 },
      { y0: 3.84, y1: 4.32, r0: 0.33, r1: 0.22, n: 14, twist: 0.98 },
    ];
    const rods: Array<{ s: [number, number, number]; e: [number, number, number]; r: number }> = [];
    const rings: Array<{ y: number; r: number; isJoint: boolean }> = [];

    sections.forEach((sec, sIdx) => {
      const midY = (sec.y0 + sec.y1) * 0.5;
      const midR = Math.hypot(
        (sec.r0 + sec.r1) * 0.5 * Math.cos(sec.twist * 0.5),
        (sec.r0 - sec.r1) * 0.5 * Math.sin(sec.twist * 0.5)
      );
      rings.push({ y: sec.y1, r: sec.r1, isJoint: true });
      rings.push({ y: midY, r: midR, isJoint: false });

      const rodRadius = Math.max(0.012, 0.021 - sIdx * 0.0015);
      for (let i = 0; i < sec.n; i++) {
        const a0 = (i / sec.n) * Math.PI * 2;
        const a1Plus = a0 + sec.twist;
        const a1Minus = a0 - sec.twist;

        const p0: [number, number, number] = [
          Math.cos(a0) * sec.r0,
          sec.y0,
          Math.sin(a0) * sec.r0,
        ];
        const p1Plus: [number, number, number] = [
          Math.cos(a1Plus) * sec.r1,
          sec.y1,
          Math.sin(a1Plus) * sec.r1,
        ];
        const p1Minus: [number, number, number] = [
          Math.cos(a1Minus) * sec.r1,
          sec.y1,
          Math.sin(a1Minus) * sec.r1,
        ];
        rods.push({ s: p0, e: p1Plus, r: rodRadius });
        rods.push({ s: p0, e: p1Minus, r: rodRadius });
      }
    });

    return { rods, rings };
  }, []);

  // Precompute Tatlin's Tower double opposing spiral & lattice cage (from 1920 historical photo)
  const tatlinData = useMemo(() => {
    const segments: Array<{
      s: [number, number, number];
      e: [number, number, number];
      r: number;
      isSpiral?: boolean;
    }> = [];

    const steps = 76;
    const turns = 2.85;
    const sp1: [number, number, number][] = [];
    const sp2: [number, number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * turns;
      const radius = 1.68 * (1 - t * 0.76);
      const y = 0.16 + t * 4.25;
      const shiftX = -0.35 + t * 1.15;

      const p1: [number, number, number] = [
        shiftX + Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius,
      ];
      const p2: [number, number, number] = [
        shiftX + Math.cos(-angle + Math.PI) * radius * 0.92,
        y,
        Math.sin(-angle + Math.PI) * radius * 0.92,
      ];
      sp1.push(p1);
      sp2.push(p2);

      if (i > 0) {
        segments.push({ s: sp1[i - 1], e: p1, r: 0.055, isSpiral: true });
        segments.push({ s: sp2[i - 1], e: p2, r: 0.048, isSpiral: true });
      }

      if (i >= 18 && i % 2 === 0) {
        const lowerIdx = Math.max(0, i - 18);
        segments.push({ s: sp1[lowerIdx], e: p1, r: 0.022 });
        segments.push({ s: sp2[lowerIdx], e: p2, r: 0.022 });
      }
      if (i % 3 === 0) {
        const axisPt: [number, number, number] = [shiftX, y, 0];
        segments.push({ s: axisPt, e: p1, r: 0.018 });
        segments.push({ s: axisPt, e: p2, r: 0.018 });
      }
    }

    const archPts = 16;
    for (let a = 0; a < archPts; a++) {
      const th0 = (a / archPts) * Math.PI;
      const th1 = ((a + 1) / archPts) * Math.PI;
      segments.push({
        s: [-0.45 + Math.cos(th0) * 0.85, 0.16 + Math.sin(th0) * 0.95, 1.15],
        e: [-0.45 + Math.cos(th1) * 0.85, 0.16 + Math.sin(th1) * 0.95, 1.15],
        r: 0.045,
        isSpiral: true,
      });
      segments.push({
        s: [0.15 + Math.cos(th0) * 0.65, 0.16 + Math.sin(th0) * 0.72, 1.05],
        e: [0.15 + Math.cos(th1) * 0.65, 0.16 + Math.sin(th1) * 0.72, 1.05],
        r: 0.04,
        isSpiral: true,
      });
    }

    return segments;
  }, []);

  // Precompute El Lissitzky's 1920 Lenin Tribune inclined 4-chord lattice truss
  const tribuneTrussStruts = useMemo(() => {
    const struts: Array<{ s: [number, number, number]; e: [number, number, number]; r: number }> = [];
    const bays = 12;
    const hw = 0.22;

    const getCorner = (bay: number, cx: number, cz: number): [number, number, number] => {
      const t = bay / bays;
      const baseX = 1.05 - t * 2.1;
      const baseY = 0.65 + t * 2.9;
      return [baseX + cx * hw, baseY + cx * hw * 0.75, cz * hw];
    };

    const corners: [number, number][] = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ];

    for (let b = 0; b < bays; b++) {
      corners.forEach(([cx, cz]) => {
        struts.push({
          s: getCorner(b, cx, cz),
          e: getCorner(b + 1, cx, cz),
          r: 0.028,
        });
      });

      for (let c = 0; c < 4; c++) {
        const [cx0, cz0] = corners[c];
        const [cx1, cz1] = corners[(c + 1) % 4];
        struts.push({
          s: getCorner(b + 1, cx0, cz0),
          e: getCorner(b + 1, cx1, cz1),
          r: 0.018,
        });
        struts.push({
          s: getCorner(b, cx0, cz0),
          e: getCorner(b + 1, cx1, cz1),
          r: 0.015,
        });
        struts.push({
          s: getCorner(b + 1, cx0, cz0),
          e: getCorner(b, cx1, cz1),
          r: 0.015,
        });
      }
    }

    return struts;
  }, []);

  return (
    <group ref={exportGroupRef} position={[0, 0, 0]}>
      {/* Printable Stepped Architectural Base Plinth on the Bambu Build Plate */}
      <mesh position={[0, 0.07, 0]} receiveShadow castShadow>
        <boxGeometry args={[5.6, 0.14, 4.4]} />
        <meshStandardMaterial {...mat(palette.plinth, 0.75, 0.15)} />
      </mesh>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[5.35, 0.04, 4.15]} />
        <meshStandardMaterial {...mat(palette.frame, 0.65, 0.2)} />
      </mesh>

      {/* =====================================================================
          1. БЕЛАЯ БАШНЯ УРАЛМАШЗАВОДА (СВЕРДЛОВСК, 1929–1931, М. РЕЙШЕР)
          Точная копия по реальному фото (/photos/white-tower.jpg)
         ===================================================================== */}
      {buildingId === 'white-tower' && (
        <group>
          {/* Ground vestibule foundation plinth & entry steps */}
          <mesh position={[-0.1, 0.2, 0.06]} castShadow receiveShadow>
            <boxGeometry args={[2.55, 0.08, 1.52]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.55, 0.05)} />
          </mesh>
          <mesh position={[-0.08, 0.2, 0.85]} castShadow>
            <boxGeometry args={[0.68, 0.08, 0.24]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.55, 0.05)} />
          </mesh>

          {/* 1-story ground vestibule with rectangular left wing & curved right bay */}
          <mesh position={[-0.25, 0.45, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[2.15, 0.5, 1.32]} />
            <meshStandardMaterial {...mat(palette.wall, 0.48, 0.05)} />
          </mesh>
          <mesh position={[0.82, 0.45, 0.05]} castShadow receiveShadow>
            <cylinderGeometry args={[0.66, 0.66, 0.5, 32]} />
            <meshStandardMaterial {...mat(palette.wall, 0.48, 0.05)} />
          </mesh>
          {/* Ground vestibule overhanging flat roof cornice */}
          <mesh position={[-0.25, 0.72, 0.05]} castShadow>
            <boxGeometry args={[2.28, 0.06, 1.44]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
          </mesh>
          <mesh position={[0.82, 0.72, 0.05]} castShadow>
            <cylinderGeometry args={[0.72, 0.72, 0.06, 32]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
          </mesh>
          {/* Ground floor recessed windows & entrance door */}
          {[-1.08, -0.52, 0.48, 0.96].map((x, idx) => (
            <group key={idx} position={[x, 0.46, idx === 3 ? 0.52 : 0.72]}>
              <mesh>
                <boxGeometry args={[0.36, 0.22, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.62)} />
              </mesh>
              <mesh position={[0, 0, 0.015]}>
                <boxGeometry args={[0.02, 0.22, 0.02]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
              </mesh>
            </group>
          ))}
          <mesh position={[-0.08, 0.41, 0.72]}>
            <boxGeometry args={[0.28, 0.36, 0.04]} />
            <meshStandardMaterial {...mat(palette.frame, 0.45, 0.3)} />
          </mesh>

          {/* Tall vertical rectangular staircase prism on the left */}
          <mesh position={[-0.78, 2.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.76, 4.06, 0.92]} />
            <meshStandardMaterial {...mat(palette.wall, 0.48, 0.05)} />
          </mesh>
          {/* Staircase prism projecting top cornice cap */}
          <mesh position={[-0.78, 4.25, 0]} castShadow>
            <boxGeometry args={[0.84, 0.06, 1.0]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
          </mesh>
          {/* Vertical staircase window strip on the left-front with horizontal transom bars & center mullion */}
          <mesh position={[-0.96, 2.24, 0.47]}>
            <boxGeometry args={[0.22, 3.68, 0.04]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          <mesh position={[-0.96, 2.24, 0.49]}>
            <boxGeometry args={[0.02, 3.68, 0.03]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
          </mesh>
          {Array.from({ length: 12 }).map((_, idx) => (
            <mesh key={idx} position={[-0.96, 0.56 + idx * 0.31, 0.49]}>
              <boxGeometry args={[0.24, 0.028, 0.03]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
            </mesh>
          ))}

          {/* 3 tall slender columns supporting the elevated cylindrical tank (matching real photo) */}
          {[
            [0.08, -0.34],
            [0.34, 0.38],
            [0.64, 0.04],
          ].map(([cx, cz], idx) => (
            <mesh key={idx} position={[cx, 1.38, cz]} castShadow receiveShadow>
              <boxGeometry args={[0.17, 1.42, 0.17]} />
              <meshStandardMaterial {...mat(palette.wall, 0.48, 0.05)} />
            </mesh>
          ))}
          {/* Central cylindrical vertical water standpipe (стояк водовода) inside the 3-column bay */}
          <mesh position={[0.18, 1.38, -0.02]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 1.42, 20]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.5, 0.15)} />
          </mesh>

          {/* Conical reinforced-concrete bottom bowl (днище бака) & radial ribs */}
          <mesh position={[0.18, 1.98, 0]} castShadow>
            <cylinderGeometry args={[0.92, 0.52, 0.16, 36]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.5, 0.08)} />
          </mesh>
          {/* Recessed curved under-tank glazed gallery ring with vertical mullions */}
          <mesh position={[0.18, 2.08, 0]} castShadow>
            <cylinderGeometry args={[1.0, 0.9, 0.08, 36]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.48, 0.05)} />
          </mesh>
          <mesh position={[0.18, 2.18, 0]}>
            <cylinderGeometry args={[0.93, 0.93, 0.18, 36]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {Array.from({ length: 16 }).map((_, i) => {
            const ang = (i / 16) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[0.18 + Math.cos(ang) * 0.94, 2.18, Math.sin(ang) * 0.94]}
              >
                <boxGeometry args={[0.02, 0.18, 0.02]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
              </mesh>
            );
          })}

          {/* Main Elevated Cylindrical Water Tank (700 m³) */}
          <mesh position={[0.18, 2.86, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.08, 1.08, 1.24, 44]} />
            <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
          </mesh>
          {/* Subtle horizontal structural plaster bands on the tank drum */}
          {[2.32, 2.85, 3.22].map((ry) => (
            <mesh key={ry} position={[0.18, ry, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.085, 0.012, 6, 44]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.48, 0.08)} />
            </mesh>
          ))}

          {/* 6 Circular porthole windows (иллюминаторы) around the middle of the tank */}
          {[-0.85, -0.38, 0.12, 0.62, 1.15, 1.68].map((ang, idx) => (
            <group
              key={idx}
              position={[
                0.18 + Math.sin(ang) * 1.075,
                2.58,
                Math.cos(ang) * 1.075,
              ]}
              rotation={[Math.PI / 2, 0, -ang]}
            >
              <mesh>
                <cylinderGeometry args={[0.105, 0.105, 0.06, 20]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.108, 0.022, 8, 20]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
              </mesh>
            </group>
          ))}

          {/* Upper curved clerestory ribbon window wrapping around the top of the cylinder */}
          <mesh position={[0.18, 3.36, 0]}>
            <cylinderGeometry args={[1.055, 1.055, 0.26, 44]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {/* 24 Vertical mullions along the upper curved ribbon window */}
          {Array.from({ length: 24 }).map((_, i) => {
            const ang = (i / 24) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  0.18 + Math.cos(ang) * 1.065,
                  3.36,
                  Math.sin(ang) * 1.065,
                ]}
              >
                <boxGeometry args={[0.024, 0.26, 0.024]} />
                <meshStandardMaterial {...mat(palette.wall, 0.42, 0.1)} />
              </mesh>
            );
          })}

          {/* Projecting cornice rim above the ribbon window & upper tank parapet */}
          <mesh position={[0.18, 3.51, 0]} castShadow>
            <cylinderGeometry args={[1.14, 1.14, 0.06, 44]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.08)} />
          </mesh>
          <mesh position={[0.18, 3.66, 0]} castShadow>
            <cylinderGeometry args={[1.08, 1.08, 0.24, 44]} />
            <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
          </mesh>

          {/* Double-rail curved metal balustrade around the observation deck roof of the tank */}
          {[3.86, 3.94].map((ry) => (
            <mesh key={ry} position={[0.18, ry, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.055, 0.015, 8, 40]} />
              <meshStandardMaterial {...mat(palette.frame, 0.3, 0.55)} />
            </mesh>
          ))}
          {Array.from({ length: 18 }).map((_, i) => {
            const ang = (i / 18) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  0.18 + Math.cos(ang) * 1.055,
                  3.86,
                  Math.sin(ang) * 1.055,
                ]}
              >
                <cylinderGeometry args={[0.014, 0.014, 0.18, 8]} />
                <meshStandardMaterial {...mat(palette.frame, 0.3, 0.55)} />
              </mesh>
            );
          })}

          {/* Rectangular rooftop observation superstructure (надстройка) with balcony overhang */}
          <mesh position={[-0.38, 4.02, 0]} castShadow>
            <boxGeometry args={[1.45, 0.44, 0.86]} />
            <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
          </mesh>
          <mesh position={[-0.38, 4.25, 0]} castShadow>
            <boxGeometry args={[1.54, 0.05, 0.94]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
          </mesh>
          {/* Rooftop cabin horizontal window strip with mullions */}
          <mesh position={[-0.32, 4.02, 0.44]}>
            <boxGeometry args={[1.25, 0.16, 0.04]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {[-0.72, -0.45, -0.18, 0.08].map((mx) => (
            <mesh key={mx} position={[mx, 4.02, 0.46]}>
              <boxGeometry args={[0.02, 0.16, 0.02]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
            </mesh>
          ))}
          {/* Cantilevered upper balcony slab around top cabin */}
          <mesh position={[-0.42, 3.82, 0]} castShadow>
            <boxGeometry args={[1.72, 0.05, 1.12]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
          </mesh>
          {/* Lightning rod / flagpole on the summit */}
          <mesh position={[-0.55, 4.52, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.58, 10]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.3, 0.5)} />
          </mesh>
        </group>
      )}

      {/* =====================================================================
          2. ДОМ НАРКОМФИНА (МОСКВА, 1928–1930, М. ГИНЗБУРГ, И. МИЛИНИС)
          Точная копия по реальному фото (/photos/narkomfin.jpg)
         ===================================================================== */}
      {buildingId === 'narkomfin' && (
        <group>
          {/* 18 Open ground-floor black cylindrical pilotis columns (2 rows × 9) */}
          {[-2.1, -1.65, -1.2, -0.75, -0.3, 0.15, 0.6, 1.05, 1.5].map((x) =>
            [-0.34, 0.34].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.44, z]} castShadow>
                <cylinderGeometry args={[0.065, 0.065, 0.56, 16]} />
                <meshStandardMaterial {...mat(palette.frame, 0.4, 0.3)} />
              </mesh>
            ))
          )}
          {/* Ground-floor recessed entrance vestibule lobby block */}
          <mesh position={[0.6, 0.44, 0]} castShadow>
            <boxGeometry args={[0.85, 0.54, 0.56]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.48, 0.05)} />
          </mesh>

          {/* Main 6-story horizontal white residential slab */}
          <mesh position={[-0.3, 1.56, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.95, 1.68, 0.88]} />
            <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
          </mesh>
          {/* Roof parapet coping ledge */}
          <mesh position={[-0.3, 2.41, 0]} castShadow>
            <boxGeometry args={[4.01, 0.05, 0.94]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.08)} />
          </mesh>

          {/* Lower recessed dark gallery ribbon window (2nd floor corridor) */}
          <mesh position={[-0.3, 0.86, 0]}>
            <boxGeometry args={[3.88, 0.2, 0.91]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          <mesh position={[-0.3, 0.75, 0]} castShadow>
            <boxGeometry args={[3.96, 0.035, 0.95]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
          </mesh>

          {/* 3 upper continuous ribbon windows with projecting horizontal sun-visor sills */}
          {[1.22, 1.58, 1.94].map((y) => (
            <group key={y}>
              <mesh position={[-0.3, y, 0]}>
                <boxGeometry args={[3.9, 0.18, 0.91]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
              <mesh position={[-0.3, y - 0.1, 0]} castShadow>
                <boxGeometry args={[3.98, 0.035, 0.96]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
              </mesh>
              <mesh position={[-0.3, y + 0.1, 0]} castShadow>
                <boxGeometry args={[3.96, 0.025, 0.94]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
              </mesh>
              {Array.from({ length: 20 }).map((_, mIdx) => (
                <mesh key={mIdx} position={[-2.15 + mIdx * 0.195, y, 0]}>
                  <boxGeometry args={[0.02, 0.18, 0.92]} />
                  <meshStandardMaterial {...mat(palette.frame, 0.3, 0.45)} />
                </mesh>
              ))}
            </group>
          ))}

          {/* End wall cantilevered balconies on both left and right facades */}
          {[1.22, 1.58, 1.94].map((by) => (
            <group key={by}>
              <mesh position={[1.76, by - 0.08, 0.18]} castShadow>
                <boxGeometry args={[0.24, 0.05, 0.46]} />
                <meshStandardMaterial {...mat(palette.wall, 0.42, 0.1)} />
              </mesh>
              <mesh position={[1.86, by + 0.02, 0.18]}>
                <boxGeometry args={[0.03, 0.16, 0.46]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.1)} />
              </mesh>
              <mesh position={[-2.36, by - 0.08, -0.15]} castShadow>
                <boxGeometry args={[0.22, 0.05, 0.44]} />
                <meshStandardMaterial {...mat(palette.wall, 0.42, 0.1)} />
              </mesh>
            </group>
          ))}

          {/* Rooftop rounded semi-cylindrical staircase & Milyutin penthouse tower */}
          <mesh position={[0.68, 2.64, -0.05]} castShadow>
            <boxGeometry args={[0.76, 0.46, 0.58]} />
            <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
          </mesh>
          <mesh position={[0.3, 2.64, -0.05]} castShadow>
            <cylinderGeometry args={[0.29, 0.29, 0.46, 28]} />
            <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
          </mesh>
          <mesh position={[0.3, 2.68, -0.05]}>
            <cylinderGeometry args={[0.295, 0.295, 0.16, 28]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>

          {/* Left rooftop open solarium pergola frame & sun-deck */}
          <mesh position={[-1.65, 2.58, 0]} castShadow>
            <boxGeometry args={[0.96, 0.36, 0.68]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
          </mesh>
          <mesh position={[-1.65, 2.78, 0]} castShadow>
            <boxGeometry args={[1.08, 0.05, 0.76]} />
            <meshStandardMaterial {...mat(palette.wall, 0.42, 0.08)} />
          </mesh>

          {/* 4 dark cylindrical ventilation turrets along the roof */}
          {[-1.02, -0.62, -0.22, 0.05].map((vx) => (
            <mesh key={vx} position={[vx, 2.5, 0.15]} castShadow>
              <cylinderGeometry args={[0.058, 0.058, 0.18, 14]} />
              <meshStandardMaterial {...mat(palette.frame, 0.3, 0.45)} />
            </mesh>
          ))}

          {/* Covered 2nd-floor bridge & Communal Block (коммунальный корпус) */}
          <mesh position={[1.82, 1.05, -0.42]} castShadow>
            <boxGeometry args={[0.48, 0.34, 0.34]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
          </mesh>
          <mesh position={[1.82, 1.06, -0.42]}>
            <boxGeometry args={[0.46, 0.14, 0.36]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          <mesh position={[2.16, 0.94, -0.64]} castShadow receiveShadow>
            <boxGeometry args={[0.96, 1.56, 1.08]} />
            <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
          </mesh>
          {/* Communal block giant 2-story stained glass window with 6x5 grid mullions */}
          <mesh position={[2.16, 1.12, -0.09]}>
            <boxGeometry args={[0.72, 0.86, 0.04]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {[-0.24, -0.12, 0, 0.12, 0.24].map((mx) => (
            <mesh key={mx} position={[2.16 + mx, 1.12, -0.07]}>
              <boxGeometry args={[0.018, 0.86, 0.025]} />
              <meshStandardMaterial {...mat(palette.frame, 0.3, 0.5)} />
            </mesh>
          ))}
          {[0.84, 1.02, 1.2, 1.38].map((my) => (
            <mesh key={my} position={[2.16, my, -0.07]}>
              <boxGeometry args={[0.72, 0.018, 0.025]} />
              <meshStandardMaterial {...mat(palette.frame, 0.3, 0.5)} />
            </mesh>
          ))}
        </group>
      )}

      {/* =====================================================================
          3. ДОМ КУЛЬТУРЫ ИМЕНИ РУСАКОВА (МОСКВА, 1927–1929, К. МЕЛЬНИКОВ)
          Точная копия по реальному фото (/photos/rusakov.jpg)
         ===================================================================== */}
      {buildingId === 'rusakov' && (
        <group>
          {/* 1-story projecting front entrance podium & steps */}
          <mesh position={[0, 0.2, 1.34]} castShadow>
            <boxGeometry args={[2.85, 0.08, 0.26]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.55, 0.05)} />
          </mesh>
          <mesh position={[0, 0.46, 0.72]} castShadow receiveShadow>
            <boxGeometry args={[3.35, 0.62, 1.1]} />
            <meshStandardMaterial {...mat(palette.wall, 0.48, 0.05)} />
          </mesh>
          <mesh position={[0, 0.79, 0.72]} castShadow>
            <boxGeometry args={[3.45, 0.05, 1.18]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.08)} />
          </mesh>
          {/* Podium large glazed entrance windows with mullions */}
          {[-0.95, -0.28, 0.28, 0.95].map((x, idx) => (
            <group key={idx} position={[x, 0.45, 1.28]}>
              <mesh>
                <boxGeometry args={[0.44, 0.42, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
              <mesh position={[0, 0, 0.018]}>
                <boxGeometry args={[0.02, 0.42, 0.02]} />
                <meshStandardMaterial {...mat(palette.frame, 0.3, 0.45)} />
              </mesh>
            </group>
          ))}
          {/* Side external sloped stair ramps on left & right of podium with parapets */}
          {[-1.85, 1.85].map((sx, idx) => (
            <group key={idx} position={[sx, 0.45, 0.65]} rotation={[0.45, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.36, 0.22, 1.18]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.5, 0.05)} />
              </mesh>
              <mesh position={[0, 0.16, 0]}>
                <boxGeometry args={[0.38, 0.08, 1.18]} />
                <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
              </mesh>
            </group>
          ))}

          {/* Main middle auditorium body & rear stage flytower */}
          <mesh position={[0, 1.48, -0.15]} castShadow receiveShadow>
            <boxGeometry args={[3.25, 2.25, 1.65]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.48, 0.05)} />
          </mesh>
          <mesh position={[0, 1.68, -1.15]} castShadow receiveShadow>
            <boxGeometry args={[2.15, 2.66, 0.98]} />
            <meshStandardMaterial {...mat(palette.wall, 0.48, 0.05)} />
          </mesh>
          {/* Side wall vertical pilasters & windows on auditorium */}
          {[-0.65, -0.15, 0.35].map((sz) =>
            [-1.64, 1.64].map((sx) => (
              <mesh key={`${sx}-${sz}`} position={[sx, 1.55, sz]}>
                <boxGeometry args={[0.05, 1.45, 0.26]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
            ))
          )}

          {/* Central square multi-pane foyer window under the middle cantilevered wedge */}
          <mesh position={[0, 1.18, 0.69]}>
            <boxGeometry args={[0.78, 0.64, 0.04]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {[-0.2, 0, 0.2].map((mx) => (
            <mesh key={mx} position={[mx, 1.18, 0.71]}>
              <boxGeometry args={[0.02, 0.64, 0.02]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
            </mesh>
          ))}

          {/* Two tall vertical glazed staircase shafts between the 3 cantilevered wedges */}
          {[-0.62, 0.62].map((x) => (
            <group key={x}>
              <mesh position={[x, 1.75, 0.58]} castShadow>
                <boxGeometry args={[0.44, 2.45, 0.52]} />
                <meshStandardMaterial {...mat(palette.wall, 0.45, 0.05)} />
              </mesh>
              <mesh position={[x, 1.75, 0.85]}>
                <boxGeometry args={[0.3, 2.25, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
              <mesh position={[x, 1.75, 0.87]}>
                <boxGeometry args={[0.02, 2.25, 0.025]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
              </mesh>
              {Array.from({ length: 9 }).map((_, rIdx) => (
                <mesh key={rIdx} position={[x, 0.75 + rIdx * 0.25, 0.87]}>
                  <boxGeometry args={[0.32, 0.024, 0.03]} />
                  <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
                </mesh>
              ))}
            </group>
          ))}

          {/* THREE CANTILEVERED CONCRETE AUDITORIUM BALCONY WEDGES (3 зуба-балкона) */}
          {[-1.24, 0, 1.24].map((x, idx) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh position={[0, 2.45, 0.88]} castShadow receiveShadow>
                <boxGeometry args={[0.82, 0.92, 1.25]} />
                <meshStandardMaterial
                  {...mat(idx === 1 ? palette.wall : palette.wallSecondary, 0.44, 0.05)}
                />
              </mesh>
              <mesh position={[0, 2.93, 0.88]} castShadow>
                <boxGeometry args={[0.88, 0.05, 1.32]} />
                <meshStandardMaterial {...mat(palette.wall, 0.4, 0.08)} />
              </mesh>
              {/* Sloped 40-deg cantilevered underside soffit of the balcony wedge */}
              <mesh
                position={[0, 1.86, 0.82]}
                rotation={[-0.62, 0, 0]}
                castShadow
              >
                <boxGeometry args={[0.8, 0.65, 1.15]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.48, 0.05)} />
              </mesh>
              {/* Recessed front plaque & Constructivist relief lettering bars */}
              <mesh position={[0, 2.46, 1.505]}>
                <boxGeometry args={[0.7, 0.72, 0.02]} />
                <meshStandardMaterial {...mat(palette.wall, 0.42, 0.05)} />
              </mesh>
              <mesh position={[0, 2.58, 1.52]}>
                <boxGeometry args={[0.58, 0.055, 0.025]} />
                <meshStandardMaterial {...mat(palette.accentRed, 0.35, 0.2)} />
              </mesh>
              <mesh position={[0, 2.42, 1.52]}>
                <boxGeometry args={[0.64, 0.055, 0.025]} />
                <meshStandardMaterial {...mat(palette.frame, 0.35, 0.2)} />
              </mesh>
              {/* Rooftop safety railing on each wedge */}
              <mesh position={[0, 3.0, 1.46]}>
                <boxGeometry args={[0.82, 0.08, 0.025]} />
                <meshStandardMaterial {...mat(palette.frame, 0.3, 0.45)} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* =====================================================================
          4. ДОМ МЕЛЬНИКОВА (МОСКВА, 1927–1929, К. МЕЛЬНИКОВ)
          Точная копия по реальному фото (/photos/melnikov-house.jpg)
         ===================================================================== */}
      {buildingId === 'melnikov-house' && (
        <group>
          {/* Rear (North) Taller Cylinder with 60 hexagonal honeycomb windows */}
          <mesh position={[0, 1.72, -0.52]} castShadow receiveShadow>
            <cylinderGeometry args={[1.12, 1.12, 3.12, 44]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.46, 0.05)} />
          </mesh>
          <mesh position={[0, 3.3, -0.52]} castShadow>
            <cylinderGeometry args={[1.15, 1.15, 0.06, 44]} />
            <meshStandardMaterial {...mat(palette.wall, 0.42, 0.08)} />
          </mesh>

          {/* Front (South) Lower Cylinder */}
          <mesh position={[0, 1.44, 0.52]} castShadow receiveShadow>
            <cylinderGeometry args={[1.12, 1.12, 2.56, 44]} />
            <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
          </mesh>
          <mesh position={[0, 2.74, 0.52]} castShadow>
            <cylinderGeometry args={[1.15, 1.15, 0.05, 44]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.08)} />
          </mesh>

          {/* Flat Front Facade Portal Frame with Giant Studio Window & Entrance Door */}
          <mesh position={[0, 1.44, 1.48]} castShadow receiveShadow>
            <boxGeometry args={[1.52, 2.56, 0.36]} />
            <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
          </mesh>
          {/* Two vertical flanking pilasters on the front facade */}
          {[-0.72, 0.72].map((px) => (
            <mesh key={px} position={[px, 1.48, 1.58]} castShadow>
              <boxGeometry args={[0.18, 2.64, 0.24]} />
              <meshStandardMaterial {...mat(palette.wall, 0.42, 0.05)} />
            </mesh>
          ))}

          {/* Giant 2-story studio stained-glass window screen (6 vertical × 4 horizontal panes) */}
          <mesh position={[0, 1.72, 1.66]}>
            <boxGeometry args={[1.24, 1.32, 0.04]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {[-0.42, -0.21, 0, 0.21, 0.42].map((mx) => (
            <mesh key={mx} position={[mx, 1.72, 1.68]}>
              <boxGeometry args={[0.025, 1.32, 0.03]} />
              <meshStandardMaterial {...mat(palette.wall, 0.35, 0.1)} />
            </mesh>
          ))}
          {[1.25, 1.58, 1.92].map((my) => (
            <mesh key={my} position={[0, my, 1.68]}>
              <boxGeometry args={[1.24, 0.025, 0.03]} />
              <meshStandardMaterial {...mat(palette.wall, 0.35, 0.1)} />
            </mesh>
          ))}

          {/* Inscription frieze band: "КОНСТАНТИН МЕЛЬНИКОВ АРХИТЕКТОР" */}
          <mesh position={[0, 2.52, 1.67]}>
            <boxGeometry args={[1.26, 0.22, 0.05]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
          </mesh>
          <mesh position={[0, 2.52, 1.7]}>
            <boxGeometry args={[1.05, 0.05, 0.02]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.35, 0.2)} />
          </mesh>

          {/* Ground-floor central entrance door, steps & flanking windows */}
          <mesh position={[0, 0.2, 1.78]} castShadow>
            <boxGeometry args={[0.58, 0.08, 0.22]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.5, 0.05)} />
          </mesh>
          <mesh position={[0, 0.54, 1.67]}>
            <boxGeometry args={[0.32, 0.72, 0.04]} />
            <meshStandardMaterial {...mat(palette.brick, 0.5, 0.15)} />
          </mesh>
          {[-0.42, 0.42].map((wx) => (
            <mesh key={wx} position={[wx, 0.56, 1.66]}>
              <boxGeometry args={[0.34, 0.68, 0.04]} />
              <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
            </mesh>
          ))}

          {/* Rooftop terrace railing on the front cylinder & terrace access door */}
          <mesh position={[0, 2.84, 1.65]}>
            <boxGeometry args={[1.28, 0.14, 0.03]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.35, 0.3)} />
          </mesh>
          <mesh position={[0, 2.98, 0.58]}>
            <boxGeometry args={[0.34, 0.48, 0.06]} />
            <meshStandardMaterial {...mat(palette.frame, 0.4, 0.3)} />
          </mesh>

          {/* Staggered diagonal lattice of 60 hexagonal honeycomb windows around both cylinders */}
          {[0.65, 1.18, 1.72, 2.26, 2.75].map((y, rowIdx) =>
            Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2 + (rowIdx % 2) * 0.22;
              const isRear = Math.cos(angle) < 0.45;
              if (rowIdx === 4 && !isRear) return null;
              const cz = isRear ? -0.52 : 0.52;
              const rx = Math.sin(angle) * 1.115;
              const rz = cz + Math.cos(angle) * 1.115;
              if (rz > 1.34) return null;
              return (
                <group
                  key={`${rowIdx}-${i}`}
                  position={[rx, y, rz]}
                  rotation={[0, angle, 0]}
                >
                  <mesh rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.2, 0.26, 0.05]} />
                    <meshStandardMaterial {...mat(palette.wall, 0.4, 0.1)} />
                  </mesh>
                  <mesh position={[0, 0, 0.015]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.16, 0.22, 0.04]} />
                    <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
                  </mesh>
                </group>
              );
            })
          )}
        </group>
      )}

      {/* =====================================================================
          5. КЛУБ ИМЕНИ ЗУЕВА (МОСКВА, 1927–1929, И. ГОЛОСОВ)
          Точная копия по реальному фото (/photos/zuev-club.jpg)
         ===================================================================== */}
      {buildingId === 'zuev-club' && (
        <group>
          {/* Main stepped building mass along Lesnaya Street */}
          <mesh position={[0.35, 1.25, -0.15]} castShadow receiveShadow>
            <boxGeometry args={[2.95, 2.18, 1.85]} />
            <meshStandardMaterial {...mat(palette.wall, 0.46, 0.05)} />
          </mesh>
          {/* Vertical pilaster bays & auditorium windows on the right facade */}
          {[0.25, 0.72, 1.18, 1.62].map((px) => (
            <group key={px}>
              <mesh position={[px, 1.32, 0.78]} castShadow>
                <boxGeometry args={[0.12, 1.85, 0.08]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
              </mesh>
              <mesh position={[px - 0.22, 1.42, 0.77]}>
                <boxGeometry args={[0.28, 1.18, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
            </group>
          ))}

          {/* Tall stair core & stage flytower rising behind the corner cylinder */}
          <mesh position={[-0.25, 1.72, 0.15]} castShadow>
            <boxGeometry args={[0.95, 3.12, 1.25]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.46, 0.05)} />
          </mesh>
          <mesh position={[0.85, 1.65, -0.55]} castShadow>
            <boxGeometry args={[1.65, 2.75, 1.05]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.48, 0.05)} />
          </mesh>

          {/* ICONIC 5-STORY GLAZED CORNER CYLINDER */}
          <mesh position={[-1.02, 0.48, 0.58]} castShadow receiveShadow>
            <cylinderGeometry args={[0.68, 0.68, 0.64, 40]} />
            <meshStandardMaterial {...mat(palette.wall, 0.46, 0.05)} />
          </mesh>
          {/* 1st floor square windows around the drum base */}
          {Array.from({ length: 6 }).map((_, i) => {
            const ang = -0.3 + (i / 5) * Math.PI * 1.1;
            return (
              <mesh
                key={i}
                position={[
                  -1.02 + Math.cos(ang) * 0.675,
                  0.48,
                  0.58 + Math.sin(ang) * 0.675,
                ]}
                rotation={[0, -ang + Math.PI / 2, 0]}
              >
                <boxGeometry args={[0.2, 0.22, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
            );
          })}
          {/* Glazed curtain wall cylinder (floors 2, 3, and 5) */}
          <mesh position={[-1.02, 1.82, 0.58]} castShadow>
            <cylinderGeometry args={[0.65, 0.65, 2.05, 40]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.68)} />
          </mesh>
          {/* 20 Fine vertical & horizontal mullions around the glazed cylinder */}
          {Array.from({ length: 20 }).map((_, i) => {
            const ang = (i / 20) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  -1.02 + Math.cos(ang) * 0.66,
                  1.82,
                  0.58 + Math.sin(ang) * 0.66,
                ]}
              >
                <boxGeometry args={[0.02, 2.05, 0.02]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.3, 0.35)} />
              </mesh>
            );
          })}
          {[0.96, 1.18, 1.4, 1.62, 2.34, 2.54, 2.74].map((ry) => (
            <mesh key={ry} position={[-1.02, ry, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.66, 0.015, 6, 36]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.3, 0.35)} />
            </mesh>
          ))}

          {/* Overhanging square corner roof cornice slab above the cylinder */}
          <mesh position={[-0.95, 2.92, 0.52]} castShadow>
            <boxGeometry args={[1.55, 0.08, 1.55]} />
            <meshStandardMaterial {...mat(palette.wall, 0.42, 0.05)} />
          </mesh>
          {/* Slender corner steel lattice column supporting the overhanging roof corner */}
          <mesh position={[-1.62, 2.52, 1.18]} castShadow>
            <boxGeometry args={[0.065, 0.78, 0.065]} />
            <meshStandardMaterial {...mat(palette.frame, 0.3, 0.55)} />
          </mesh>

          {/* CANTILEVERED HORIZONTAL PRISM PIERCING THE CYLINDER AT 4TH FLOOR */}
          <mesh position={[-0.65, 1.98, 0.48]} castShadow receiveShadow>
            <boxGeometry args={[2.15, 0.58, 1.52]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.44, 0.08)} />
          </mesh>
          {/* Deep-set rectangular loggia windows on the piercing horizontal volume */}
          {[-1.15, -0.45, 0.15].map((wx) => (
            <group key={wx} position={[wx, 1.98, 1.25]}>
              <mesh>
                <boxGeometry args={[0.48, 0.34, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
              <mesh position={[0, 0, 0.018]}>
                <boxGeometry args={[0.02, 0.34, 0.02]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
              </mesh>
            </group>
          ))}

          {/* Projecting ground-floor entrance canopy on the right ("ЛЕСНАЯ 18") */}
          <mesh position={[0.92, 0.62, 0.92]} castShadow>
            <boxGeometry args={[1.45, 0.1, 0.48]} />
            <meshStandardMaterial {...mat(palette.accentYellow, 0.4, 0.1)} />
          </mesh>
          <mesh position={[0.92, 0.36, 0.82]}>
            <boxGeometry args={[0.52, 0.44, 0.06]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
        </group>
      )}

      {/* =====================================================================
          6. ШУХОВСКАЯ БАШНЯ НА ШАБОЛОВКЕ (МОСКВА, 1920–1922, В. ШУХОВ)
          Точная ажурная сетчатая гиперболоидная копия из прямых стержней
         ===================================================================== */}
      {buildingId === 'shukhov-tower' && (
        <group>
          {/* Circular stepped concrete foundation ring on the ground */}
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.46, 1.54, 0.12, 40]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.5, 0.1)} />
          </mesh>
          <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.4, 0.03, 8, 40]} />
            <meshStandardMaterial {...mat(palette.frame, 0.35, 0.55)} />
          </mesh>

          {/* 288 straight inclined steel rods forming the 6 telescopic hyperboloid sections */}
          {shukhovStruts.rods.map((rod, idx) => (
            <Strut3D
              key={idx}
              start={rod.s}
              end={rod.e}
              radius={rod.r}
              color={idx % 4 === 0 ? palette.accentRed : palette.frame}
              wireframe={wireframe}
              clipPlane={clipPlane}
            />
          ))}

          {/* Horizontal stiffening steel rings & section inspection platforms */}
          {shukhovStruts.rings.map((ring, idx) => (
            <group key={idx} position={[0, ring.y, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry
                  args={[ring.r, ring.isJoint ? 0.028 : 0.018, 8, 36]}
                />
                <meshStandardMaterial
                  {...mat(ring.isJoint ? palette.accentRed : palette.frame, 0.3, 0.55)}
                />
              </mesh>
              {ring.isJoint && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[Math.max(0.08, ring.r - 0.09), ring.r, 32]} />
                  <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.3)} />
                </mesh>
              )}
            </group>
          ))}

          {/* Central vertical lattice ladder / service shaft inside the tower with landings */}
          <mesh position={[0, 2.35, 0]}>
            <cylinderGeometry args={[0.055, 0.068, 4.35, 12]} />
            <meshStandardMaterial {...mat(palette.frame, 0.32, 0.55)} />
          </mesh>
          {Array.from({ length: 12 }).map((_, lIdx) => (
            <mesh key={lIdx} position={[0, 0.45 + lIdx * 0.33, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.02, 12]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.4)} />
            </mesh>
          ))}

          {/* Top radio transmission mast & horizontal cross-arms (реи антенн) */}
          <mesh position={[0, 4.56, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.18, 0.48, 18]} />
            <meshStandardMaterial {...mat(palette.accentYellow, 0.32, 0.45)} />
          </mesh>
          {[4.4, 4.56, 4.72].map((cy, cIdx) => (
            <group key={cy} position={[0, cy, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.22 - cIdx * 0.02, 0.018, 6, 20]} />
                <meshStandardMaterial {...mat(palette.accentRed, 0.3, 0.55)} />
              </mesh>
              <mesh>
                <boxGeometry args={[0.68 - cIdx * 0.12, 0.018, 0.018]} />
                <meshStandardMaterial {...mat(palette.frame, 0.3, 0.55)} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* =====================================================================
          7. БАХМЕТЬЕВСКИЙ ГАРАЖ (МОСКВА, 1926–1927, К. МЕЛЬНИКОВ, В. ШУХОВ)
          Точная копия уступчатого фасада по реальному фото (/photos/bakhmetevsky.jpg)
         ===================================================================== */}
      {buildingId === 'bakhmetevsky' && (
        <group>
          {/* 5 stepped diagonal parallelogram bays with white portals (I-V) and red-brick panels */}
          {[-1.5, -0.75, 0, 0.75, 1.5].map((bx, idx) => {
            const zShift = (idx - 2) * 0.18;
            return (
              <group key={bx} position={[bx, 0, zShift]}>
                {/* Red-brick main bay volume */}
                <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.76, 1.24, 2.35]} />
                  <meshStandardMaterial {...mat(palette.brick, 0.58, 0.05)} />
                </mesh>
                {/* White cornice trim on each bay */}
                <mesh position={[0, 1.41, 0]} castShadow>
                  <boxGeometry args={[0.78, 0.04, 2.39]} />
                  <meshStandardMaterial {...mat(palette.wall, 0.42, 0.05)} />
                </mesh>
                {/* White plastered vertical entrance portal buttress with tall multi-pane gate */}
                <mesh position={[-0.18, 0.76, 1.18]} castShadow>
                  <boxGeometry args={[0.42, 1.18, 0.14]} />
                  <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
                </mesh>
                {/* White multi-pane garage gate inside portal */}
                <mesh position={[-0.18, 0.58, 1.26]}>
                  <boxGeometry args={[0.28, 0.78, 0.03]} />
                  <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
                </mesh>
                <mesh position={[-0.18, 0.58, 1.28]}>
                  <boxGeometry args={[0.02, 0.78, 0.02]} />
                  <meshStandardMaterial {...mat(palette.frame, 0.35, 0.4)} />
                </mesh>
                {/* Red Roman numeral marker above gate (I, II, III, IV, V) */}
                <mesh position={[-0.18, 1.12, 1.26]}>
                  <boxGeometry args={[0.09, 0.16, 0.03]} />
                  <meshStandardMaterial {...mat(palette.accentRed, 0.35, 0.2)} />
                </mesh>
                {/* Industrial grid window in the red-brick wall next to the portal */}
                <mesh position={[0.18, 0.56, 1.18]}>
                  <boxGeometry args={[0.26, 0.54, 0.04]} />
                  <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
                </mesh>
                {/* Upper clerestory strip window */}
                <mesh position={[0.08, 1.16, 1.18]}>
                  <boxGeometry args={[0.46, 0.24, 0.04]} />
                  <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
                </mesh>
              </group>
            );
          })}

          {/* Gently arched central gable fascia ("БАХМЕТЬЕВСКИЙ АВТОБУСНЫЙ ПАРК") & round porthole */}
          <mesh position={[0, 1.54, 0]} castShadow>
            <boxGeometry args={[3.78, 0.28, 2.38]} />
            <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
          </mesh>
          <group position={[0, 1.54, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.185, 0.025, 8, 24]} />
              <meshStandardMaterial {...mat(palette.accentRed, 0.35, 0.2)} />
            </mesh>
          </group>

          {/* Shukhov skylight monitors running along the roof ridge with steel ribs */}
          {[-0.55, 0.55].map((sx) => (
            <group key={sx} position={[sx, 1.78, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.35, 0.24, 1.85]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
              {[-0.65, -0.22, 0.22, 0.65].map((rz) => (
                <mesh key={rz} position={[0, 0.125, rz]}>
                  <boxGeometry args={[1.38, 0.025, 0.03]} />
                  <meshStandardMaterial {...mat(palette.frame, 0.3, 0.5)} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Tall cylindrical industrial smokestack at rear-left (seen in photo) */}
          <mesh position={[-1.65, 1.75, -0.85]} castShadow>
            <cylinderGeometry args={[0.12, 0.17, 3.18, 24]} />
            <meshStandardMaterial {...mat(palette.wall, 0.46, 0.05)} />
          </mesh>
          <mesh position={[-1.65, 3.15, -0.85]}>
            <cylinderGeometry args={[0.13, 0.13, 0.28, 24]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.4, 0.1)} />
          </mesh>
        </group>
      )}

      {/* =====================================================================
          8. ДВОРЕЦ КУЛЬТУРЫ ЗИЛ (МОСКВА, 1931–1937, БРАТЬЯ ВЕСНИНЫ)
          Точная копия ансамбля по реальному фото (/photos/zil-palace.jpg)
         ===================================================================== */}
      {buildingId === 'zil-palace' && (
        <group>
          {/* Left Semicircular 3-story Glazed Winter-Garden Rotunda */}
          <mesh position={[-1.85, 0.24, 0.15]} castShadow>
            <cylinderGeometry args={[0.72, 0.74, 0.16, 36]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.48, 0.05)} />
          </mesh>
          <mesh position={[-1.85, 0.82, 0.15]} castShadow>
            <cylinderGeometry args={[0.68, 0.68, 1.16, 36]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.68)} />
          </mesh>
          {Array.from({ length: 16 }).map((_, i) => {
            const ang = (i / 16) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  -1.85 + Math.cos(ang) * 0.69,
                  0.82,
                  0.15 + Math.sin(ang) * 0.69,
                ]}
              >
                <boxGeometry args={[0.02, 1.16, 0.02]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.35, 0.3)} />
              </mesh>
            );
          })}
          {[0.58, 0.96, 1.42].map((ry) => (
            <mesh key={ry} position={[-1.85, ry, 0.15]} castShadow>
              <cylinderGeometry args={[0.71, 0.71, 0.05, 36]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
            </mesh>
          ))}

          {/* Central Horizontal Foyer & 1100-seat Auditorium Wing + Rear Stage Flytower */}
          <mesh position={[-0.45, 0.82, -0.15]} castShadow receiveShadow>
            <boxGeometry args={[2.65, 1.32, 1.35]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.46, 0.05)} />
          </mesh>
          <mesh position={[-0.55, 1.22, -0.85]} castShadow receiveShadow>
            <boxGeometry args={[1.65, 2.1, 0.85]} />
            <meshStandardMaterial {...mat(palette.wall, 0.46, 0.05)} />
          </mesh>
          {/* Ribbon windows & upper hall windows on central wing */}
          <mesh position={[-0.45, 0.68, 0.54]}>
            <boxGeometry args={[2.35, 0.22, 0.04]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {[-1.15, -0.7, -0.25, 0.2].map((wx) => (
            <mesh key={wx} position={[wx, 1.15, 0.54]}>
              <boxGeometry args={[0.32, 0.34, 0.04]} />
              <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
            </mesh>
          ))}

          {/* Right Perpendicular Club Wing projecting forward */}
          <mesh position={[1.25, 0.95, 0.35]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 1.58, 2.25]} />
            <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
          </mesh>
          {/* Ribbon windows along the front and side of the club wing */}
          {[0.62, 1.04].map((wy) => (
            <mesh key={wy} position={[1.25, wy, 1.48]}>
              <boxGeometry args={[1.18, 0.2, 0.04]} />
              <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
            </mesh>
          ))}
          {/* Vertical stair glazing on club wing */}
          <mesh position={[0.56, 0.98, 0.65]}>
            <boxGeometry args={[0.04, 1.42, 0.38]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {/* Open top-floor corner loggia supported on slender columns */}
          <mesh position={[1.28, 1.82, 1.12]} castShadow>
            <boxGeometry args={[1.38, 0.1, 0.85]} />
            <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
          </mesh>
          {[0.72, 1.08, 1.46, 1.82].map((cx) => (
            <mesh key={cx} position={[cx, 1.52, 1.45]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.48, 14]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
            </mesh>
          ))}

          {/* Rooftop Astronomical Observatory Drum & Rotating Dome */}
          <mesh position={[1.05, 1.98, -0.15]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.44, 28]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
          </mesh>
          <mesh position={[1.05, 2.2, -0.15]} castShadow>
            <sphereGeometry args={[0.38, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial {...mat(palette.accentYellow, 0.28, 0.38)} />
          </mesh>
          <mesh position={[1.05, 2.4, 0.05]} rotation={[-0.4, 0, 0]}>
            <boxGeometry args={[0.08, 0.32, 0.28]} />
            <meshStandardMaterial {...mat(palette.frame, 0.3, 0.5)} />
          </mesh>
        </group>
      )}

      {/* =====================================================================
          9. ДОМ ГОСПРОМА (ХАРЬКОВ, 1925–1928, С. СЕРАФИМОВ, С. КРАВЕЦ, М. ФЕЛЬГЕР)
          Точная копия 9 башен, воздушных мостов и телевышки (/photos/derzhprom.jpg)
         ===================================================================== */}
      {buildingId === 'derzhprom' && (
        <group>
          {/* 9 Monolithic Step-Back Concrete Towers across Left, Center, and Right Clusters */}
          {[
            { x: -2.18, z: 0.28, w: 0.54, d: 1.12, h: 1.32 },
            { x: -1.62, z: 0.14, w: 0.56, d: 1.32, h: 1.92 },
            { x: -1.16, z: -0.28, w: 0.48, d: 0.95, h: 1.58 },
            { x: -0.68, z: -0.05, w: 0.56, d: 1.45, h: 2.55 },
            { x: -0.22, z: -0.12, w: 0.48, d: 1.55, h: 3.15 },
            { x: 0.22, z: -0.12, w: 0.48, d: 1.55, h: 3.15 },
            { x: 0.68, z: -0.05, w: 0.56, d: 1.45, h: 2.55 },
            { x: 1.62, z: 0.14, w: 0.56, d: 1.32, h: 1.92 },
            { x: 2.18, z: 0.28, w: 0.54, d: 1.12, h: 1.32 },
          ].map((t, idx) => (
            <group key={idx} position={[t.x, t.h / 2 + 0.16, t.z]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[t.w, t.h, t.d]} />
                <meshStandardMaterial
                  {...mat(idx % 2 === 0 ? palette.wall : palette.wallSecondary, 0.46, 0.05)}
                />
              </mesh>
              {/* Rooftop parapet cap */}
              <mesh position={[0, t.h / 2 + 0.03, 0]} castShadow>
                <boxGeometry args={[t.w + 0.04, 0.05, t.d + 0.04]} />
                <meshStandardMaterial {...mat(palette.wall, 0.42, 0.08)} />
              </mesh>
              {/* Vertical concrete pilasters on front & back of each tower */}
              {[-t.w * 0.28, t.w * 0.28].map((px) => (
                <mesh key={px} position={[px, 0, t.d / 2 + 0.015]}>
                  <boxGeometry args={[0.04, t.h - 0.08, 0.03]} />
                  <meshStandardMaterial {...mat(palette.wall, 0.42, 0.05)} />
                </mesh>
              ))}
              {/* Horizontal window grid bands on each tower */}
              {Array.from({ length: Math.floor(t.h / 0.28) }).map((_, rIdx) => (
                <mesh
                  key={rIdx}
                  position={[0, -t.h / 2 + 0.22 + rIdx * 0.28, 0]}
                >
                  <boxGeometry args={[t.w + 0.02, 0.12, t.d + 0.02]} />
                  <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Two Levels of Enclosed Glazed Skybridges (воздушные переходы) spanning the streets */}
          {[-1.15, 1.15].map((bx) => (
            <group key={bx}>
              {/* Lower 3rd-floor skybridge */}
              <mesh position={[bx, 1.05, 0.05]} castShadow>
                <boxGeometry args={[0.58, 0.24, 0.4]} />
                <meshStandardMaterial {...mat(palette.accentRed, 0.38, 0.2)} />
              </mesh>
              <mesh position={[bx, 1.05, 0.05]}>
                <boxGeometry args={[0.54, 0.11, 0.42]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
              {/* Upper 6th-floor skybridge */}
              <mesh position={[bx, 1.72, 0.05]} castShadow>
                <boxGeometry args={[0.58, 0.24, 0.4]} />
                <meshStandardMaterial {...mat(palette.accentYellow, 0.38, 0.2)} />
              </mesh>
              <mesh position={[bx, 1.72, 0.05]}>
                <boxGeometry args={[0.54, 0.11, 0.42]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
            </group>
          ))}

          {/* Iconic Rooftop Open-Lattice Radio/TV Mast on the central tower */}
          <mesh position={[0.22, 3.88, -0.12]} castShadow>
            <cylinderGeometry args={[0.035, 0.14, 1.22, 4]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.3, 0.55)} />
          </mesh>
          {[3.55, 3.85, 4.18].map((ty, tIdx) => (
            <mesh key={ty} position={[0.22, ty, -0.12]}>
              <boxGeometry args={[0.32 - tIdx * 0.06, 0.035, 0.32 - tIdx * 0.06]} />
              <meshStandardMaterial {...mat(palette.frame, 0.3, 0.55)} />
            </mesh>
          ))}
        </group>
      )}

      {/* =====================================================================
          10. СИЛОВАЯ СТАНЦИЯ ФАБРИКИ «КРАСНОЕ ЗНАМЯ» (ПЕТРОГРАД, 1925–1928, Э. МЕНДЕЛЬСОН)
          Точная копия по реальному фото (/photos/red-banner.jpg)
         ===================================================================== */}
      {buildingId === 'red-banner' && (
        <group>
          {/* Low semi-circular red-brick corner podium at the front intersection */}
          <mesh position={[-1.05, 0.52, 0.38]} castShadow receiveShadow>
            <cylinderGeometry args={[0.98, 0.98, 0.72, 40]} />
            <meshStandardMaterial {...mat(palette.brick, 0.58, 0.05)} />
          </mesh>
          {/* Podium continuous horizontal window band & white concrete coping */}
          <mesh position={[-1.05, 0.72, 0.38]}>
            <cylinderGeometry args={[1.0, 1.0, 0.14, 40]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          <mesh position={[-1.05, 0.88, 0.38]} castShadow>
            <cylinderGeometry args={[1.03, 1.03, 0.06, 40]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
          </mesh>

          {/* Iconic White Concrete Ship-Prow Rounded Corner Tower rising above podium */}
          <mesh position={[-1.08, 1.72, 0.12]} castShadow receiveShadow>
            <cylinderGeometry args={[0.68, 0.68, 1.65, 40]} />
            <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
          </mesh>
          <mesh position={[-0.65, 1.72, 0.12]} castShadow receiveShadow>
            <boxGeometry args={[0.88, 1.65, 1.36]} />
            <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
          </mesh>
          {/* 5 deep horizontal recessed window bands around the ship-prow tower */}
          {[1.18, 1.44, 1.7, 1.96, 2.22].map((by) => (
            <group key={by}>
              <mesh position={[-1.08, by, 0.12]}>
                <cylinderGeometry args={[0.7, 0.7, 0.075, 40]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
              <mesh position={[-0.65, by, 0.12]}>
                <boxGeometry args={[0.9, 0.075, 1.39]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
            </group>
          ))}

          {/* Zigzag crenellated parapet crown on top of the white tower (seen in photo) */}
          {Array.from({ length: 14 }).map((_, i) => {
            const ang = (i / 14) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  -1.08 + Math.cos(ang) * 0.64,
                  2.64,
                  0.12 + Math.sin(ang) * 0.64,
                ]}
                rotation={[0, -ang, Math.PI / 4]}
              >
                <boxGeometry args={[0.14, 0.14, 0.08]} />
                <meshStandardMaterial {...mat(palette.accentRed, 0.4, 0.1)} />
              </mesh>
            );
          })}

          {/* Tall Red-and-White Banded Smokestack rising behind the rounded tower */}
          {[2.2, 2.6, 3.0, 3.4, 3.8].map((sy, idx) => (
            <mesh key={sy} position={[-1.12, sy, -0.25]} castShadow>
              <cylinderGeometry args={[0.24 - idx * 0.01, 0.25 - idx * 0.01, 0.4, 28]} />
              <meshStandardMaterial
                {...mat(idx % 2 === 0 ? palette.wall : palette.accentRed, 0.45, 0.1)}
              />
            </mesh>
          ))}
          {[3.15, 3.92].map((ry) => (
            <mesh key={ry} position={[-1.12, ry, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.25, 0.02, 8, 24]} />
              <meshStandardMaterial {...mat(palette.frame, 0.3, 0.55)} />
            </mesh>
          ))}

          {/* Long Industrial Boiler & Turbine Hall extending to the right */}
          <mesh position={[0.78, 1.05, -0.05]} castShadow receiveShadow>
            <boxGeometry args={[2.65, 1.78, 1.55]} />
            <meshStandardMaterial {...mat(palette.brick, 0.58, 0.05)} />
          </mesh>
          {/* Exposed vertical concrete frame piers & industrial glazed bays along the machine hall */}
          {[-0.1, 0.35, 0.8, 1.25, 1.7].map((px) => (
            <group key={px}>
              <mesh position={[px, 1.05, 0.74]} castShadow>
                <boxGeometry args={[0.12, 1.78, 0.08]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
              </mesh>
              <mesh position={[px + 0.22, 1.08, 0.73]}>
                <boxGeometry args={[0.26, 1.28, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
            </group>
          ))}
          {/* 4 Saw-tooth industrial skylight monitors on machine hall roof */}
          {[0.05, 0.55, 1.05, 1.55].map((sx) => (
            <mesh
              key={sx}
              position={[sx, 2.02, -0.05]}
              rotation={[0, 0, -0.35]}
              castShadow
            >
              <boxGeometry args={[0.38, 0.22, 1.25]} />
              <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
            </mesh>
          ))}
        </group>
      )}

      {/* =====================================================================
          11. БАШНЯ ТАТЛИНА — ПАМЯТНИК III ИНТЕРНАЦИОНАЛУ (ПЕТРОГРАД, 1919–1920)
          Точная копия исторического макета 1920 г. (/photos/tatlin-tower.jpg)
         ===================================================================== */}
      {buildingId === 'tatlin-tower' && (
        <group>
          {/* Double opposing spirals, base entrance arches, and dense lattice struts */}
          {tatlinData.map((seg, idx) => (
            <Strut3D
              key={idx}
              start={seg.s}
              end={seg.e}
              radius={seg.r}
              color={seg.isSpiral ? palette.accentRed : palette.frame}
              wireframe={wireframe}
              clipPlane={clipPlane}
            />
          ))}

          {/* Central inclined diagonal spine truss at 23.5 deg */}
          <Strut3D
            start={[-0.35, 0.16, 0]}
            end={[0.88, 4.55, 0]}
            radius={0.07}
            color={palette.accentRed}
            wireframe={wireframe}
            clipPlane={clipPlane}
          />
          <Strut3D
            start={[-0.18, 0.16, 0]}
            end={[0.98, 4.55, 0]}
            radius={0.045}
            color={palette.frame}
            wireframe={wireframe}
            clipPlane={clipPlane}
          />

          {/* 4 Suspended Rotating Internal Architectural Volumes */}
          <group ref={rotatingInternalRef}>
            {/* 1. Lower Legislative Cylinder/Cube (1 rotation per year) */}
            <mesh position={[-0.12, 0.78, 0]} castShadow>
              <cylinderGeometry args={[0.98, 1.08, 0.92, 28]} />
              <meshStandardMaterial {...mat(palette.wall, 0.28, 0.25)} />
            </mesh>
            {[0.48, 0.78, 1.08].map((fy) => (
              <mesh key={fy} position={[-0.12, fy, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.04, 0.018, 6, 28]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
            ))}
            {/* 2. Executive Pyramid (1 rotation per month) */}
            <mesh position={[0.18, 1.85, 0]} castShadow>
              <coneGeometry args={[0.78, 0.88, 4]} />
              <meshStandardMaterial {...mat(palette.accentRed, 0.32, 0.25)} />
            </mesh>
            {/* 3. Information Bureau Cylinder (1 rotation per day) */}
            <mesh position={[0.45, 2.82, 0]} castShadow>
              <cylinderGeometry args={[0.48, 0.48, 0.68, 28]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.28, 0.25)} />
            </mesh>
            {/* 4. Upper Radio Station Hemisphere (1 rotation per hour) */}
            <mesh position={[0.68, 3.52, 0]} castShadow>
              <sphereGeometry args={[0.35, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial {...mat(palette.accentYellow, 0.24, 0.4)} />
            </mesh>
          </group>
        </group>
      )}

      {/* =====================================================================
          12. ЛЕНИНСКАЯ ТРИБУНА УНОВИСА (ВИТЕБСК, 1920, ЭЛЬ ЛИСИЦКИЙ)
          Точная копия листа из Третьяковской галереи (/photos/unovis-tribune.jpg)
         ===================================================================== */}
      {buildingId === 'unovis-tribune' && (
        <group>
          {/* Stepped Suprematist Red & White Base Plinth */}
          <mesh position={[1.05, 0.22, 0]} castShadow>
            <boxGeometry args={[1.45, 0.1, 1.35]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.4, 0.15)} />
          </mesh>
          {/* Massive Black Cubist Counterweight Base on the bottom right */}
          <mesh position={[1.05, 0.62, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.05, 0.82, 1.05]} />
            <meshStandardMaterial {...mat(palette.frame, 0.48, 0.25)} />
          </mesh>

          {/* Inclined 4-chord open steel lattice truss with X-bracing */}
          {tribuneTrussStruts.map((st, idx) => (
            <Strut3D
              key={idx}
              start={st.s}
              end={st.e}
              radius={st.r}
              color={idx % 5 === 0 ? palette.accentRed : palette.wallSecondary}
              wireframe={wireframe}
              clipPlane={clipPlane}
            />
          ))}

          {/* Lower-right cantilevered horizontal platform with stepped parapet */}
          <mesh position={[0.78, 1.52, 0]} castShadow>
            <boxGeometry args={[0.92, 0.08, 0.68]} />
            <meshStandardMaterial {...mat(palette.wall, 0.4, 0.15)} />
          </mesh>
          <mesh position={[1.12, 1.66, 0]} castShadow>
            <boxGeometry args={[0.28, 0.24, 0.68]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.15)} />
          </mesh>

          {/* Intermediate glazed elevator / engineer cab on the truss */}
          <mesh position={[0.05, 2.38, 0]} castShadow>
            <boxGeometry args={[0.48, 0.48, 0.48]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.68)} />
          </mesh>

          {/* Upper-left cantilevered horizontal platform & Speaker's Rostrum Balcony */}
          <mesh position={[-1.08, 2.82, 0]} castShadow>
            <boxGeometry args={[1.28, 0.09, 0.84]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.15)} />
          </mesh>
          <mesh position={[-1.54, 3.02, 0]} castShadow>
            <boxGeometry args={[0.44, 0.38, 0.58]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.35, 0.2)} />
          </mesh>
          <mesh position={[-1.54, 3.24, 0]}>
            <boxGeometry args={[0.46, 0.04, 0.6]} />
            <meshStandardMaterial {...mat(palette.frame, 0.3, 0.5)} />
          </mesh>

          {/* Large Tilted Rectangular Propaganda Screen ("ПРОЛЕТАРИИ") at the top */}
          <group position={[-0.95, 3.92, -0.18]} rotation={[0, 0, 0.22]}>
            <mesh castShadow>
              <boxGeometry args={[1.38, 1.18, 0.08]} />
              <meshStandardMaterial {...mat(palette.wall, 0.35, 0.1)} />
            </mesh>
            <mesh position={[0, 0.36, 0.05]}>
              <boxGeometry args={[1.18, 0.18, 0.03]} />
              <meshStandardMaterial {...mat(palette.frame, 0.3, 0.3)} />
            </mesh>
            <mesh position={[-0.22, -0.18, 0.05]}>
              <boxGeometry args={[0.58, 0.12, 0.03]} />
              <meshStandardMaterial {...mat(palette.accentRed, 0.35, 0.2)} />
            </mesh>
          </group>
        </group>
      )}

      {/* =====================================================================
          13. МОСКОВСКИЙ ПЛАНЕТАРИЙ (МОСКВА, 1927–1929, М. БАРЩ, М. СИНЯВСКИЙ)
          Построение из базовых примитивов R3F по фото (/photos/moscow-planetarium.jpg)
         ===================================================================== */}
      {buildingId === 'moscow-planetarium' && (
        <group>
          {/* Horizontal 2-story Exhibition & Foyer Base */}
          <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.75, 0.98, 2.25]} />
            <meshStandardMaterial {...mat(palette.wall, 0.46, 0.05)} />
          </mesh>
          {/* Continuous ground & 2nd floor window bands on foyer */}
          <mesh position={[0.45, 0.88, 1.13]}>
            <boxGeometry args={[2.15, 0.18, 0.04]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {/* Open Ground Colonnade Portal on the Right */}
          {[-0.45, 0.45].map((cz) =>
            [1.15, 1.5, 1.82].map((cx) => (
              <mesh key={`${cx}-${cz}`} position={[cx, 0.42, cz]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 0.52, 16]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
              </mesh>
            ))
          )}
          {/* Sloped Dark Canopy Roof on the Left Wing with Trapezoidal Cutout */}
          <mesh position={[-0.95, 1.02, 1.18]} rotation={[0.42, 0, 0]} castShadow>
            <boxGeometry args={[1.82, 0.48, 0.28]} />
            <meshStandardMaterial {...mat(palette.frame, 0.35, 0.35)} />
          </mesh>
          {/* Inclined ramp window strip under canopy */}
          <mesh position={[-0.95, 0.45, 1.14]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[1.65, 0.12, 0.04]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {/* Semicircular Porthole Window in the center of the facade */}
          <mesh position={[0.12, 0.62, 1.13]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.05, 28, 1, false, 0, Math.PI]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
          </mesh>
          {/* Cylindrical Drum Base for the Star Hall */}
          <mesh position={[0.15, 1.38, -0.1]} castShadow receiveShadow>
            <cylinderGeometry args={[1.28, 1.28, 0.56, 44]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.46, 0.05)} />
          </mesh>
          {/* Ring collar with "ПЛАНЕТАРИЙ" signage band */}
          <mesh position={[0.15, 1.62, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.31, 0.045, 8, 44]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.35, 0.2)} />
          </mesh>
          {/* Iconic 27-meter Parabolic Star Dome (elongated hemisphere) */}
          <mesh position={[0.15, 1.62, -0.1]} scale={[1, 1.28, 1]} castShadow receiveShadow>
            <sphereGeometry args={[1.24, 44, 28, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial {...mat(palette.frame, 0.32, 0.42)} />
          </mesh>
          {/* Top flagpole & crown ring on dome summit */}
          <mesh position={[0.15, 3.22, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.02, 8, 24]} />
            <meshStandardMaterial {...mat(palette.accentYellow, 0.3, 0.45)} />
          </mesh>
          <mesh position={[0.15, 3.45, -0.1]}>
            <cylinderGeometry args={[0.015, 0.018, 0.45, 10]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.3, 0.45)} />
          </mesh>
          {/* Cylindrical External Spiral Staircase Tower on the left rear with helical rings */}
          <mesh position={[-1.45, 1.22, -0.45]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 2.1, 32]} />
            <meshStandardMaterial {...mat(palette.glass, 0.14, 0.68)} />
          </mesh>
          {[0.55, 0.95, 1.35, 1.75, 2.26].map((sy) => (
            <mesh key={sy} position={[-1.45, sy, -0.45]} castShadow>
              <cylinderGeometry args={[0.44, 0.44, 0.04, 32]} />
              <meshStandardMaterial {...mat(palette.wallSecondary, 0.45, 0.05)} />
            </mesh>
          ))}
        </group>
      )}

      {/* =====================================================================
          14. ГОРОДОК ЧЕКИСТОВ — КОРПУС «ИСЕТЬ» (СВЕРДЛОВСК, 1929–1933, И. АНТОНОВ)
          Построение из базовых примитивов R3F по фото (/photos/iset-gorodok.jpg)
         ===================================================================== */}
      {buildingId === 'iset-gorodok' && (
        <group>
          {/* Courtyard semicircular stepped podium */}
          <mesh position={[0, 0.22, -0.15]} castShadow>
            <cylinderGeometry args={[1.62, 1.74, 0.12, 36]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.5, 0.05)} />
          </mesh>

          {/* Semicircular 11-story Horseshoe Residential Arc (13 segmented curved bays) */}
          {Array.from({ length: 13 }).map((_, i) => {
            const ang = -Math.PI * 0.44 + (i / 12) * Math.PI * 0.88;
            const radius = 1.65;
            const bx = Math.sin(ang) * radius;
            const bz = -Math.cos(ang) * radius + 0.65;
            return (
              <group key={i} position={[bx, 1.55, bz]} rotation={[0, -ang, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.44, 2.75, 0.68]} />
                  <meshStandardMaterial {...mat(palette.wall, 0.46, 0.05)} />
                </mesh>
                <mesh position={[0, 1.39, 0]} castShadow>
                  <boxGeometry args={[0.48, 0.05, 0.74]} />
                  <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.08)} />
                </mesh>
                {/* 8 tiers of square windows on the curved facade */}
                {[0.38, 0.68, 0.98, 1.28, 1.58, 1.88, 2.18, 2.48].map((wy) => (
                  <mesh key={wy} position={[0, wy - 1.55, 0.35]}>
                    <boxGeometry args={[0.24, 0.16, 0.03]} />
                    <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
                  </mesh>
                ))}
              </group>
            );
          })}

          {/* Two Symmetrical Flanking Rectangular Corner Towers with Wrap-Around Balconies */}
          {[-1.62, 1.62].map((tx, idx) => (
            <group key={tx} position={[tx, 1.72, 0.45]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.78, 3.12, 0.88]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.46, 0.05)} />
              </mesh>
              <mesh position={[0, 1.58, 0]} castShadow>
                <boxGeometry args={[0.84, 0.06, 0.94]} />
                <meshStandardMaterial {...mat(palette.wall, 0.42, 0.08)} />
              </mesh>
              {/* Vertical brick & glazing stripes on the lower tower shaft */}
              {[-0.14, 0.14].map((sx) => (
                <mesh key={sx} position={[sx, -0.35, 0.45]}>
                  <boxGeometry args={[0.09, 2.1, 0.03]} />
                  <meshStandardMaterial {...mat(palette.brick, 0.55, 0.08)} />
                </mesh>
              ))}
              {/* 4 Tiers of Cantilevered Wrap-Around Corner Balconies on upper floors */}
              {[0.32, 0.62, 0.92, 1.22].map((by) => (
                <mesh key={by} position={[0, by, 0.08]} castShadow>
                  <boxGeometry args={[0.92, 0.08, 0.96]} />
                  <meshStandardMaterial
                    {...mat(idx === 0 ? palette.accentRed : palette.accentYellow, 0.38, 0.15)}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* =====================================================================
          15. ДВОРЕЦ КУЛЬТУРЫ ИМ. А. М. ГОРЬКОГО (ПЕТРОГРАД, 1925–1927, А. ГЕГЕЛЛО)
          Построение из базовых примитивов R3F по фото (/photos/gorky-palace.jpg)
         ===================================================================== */}
      {buildingId === 'gorky-palace' && (
        <group>
          {/* Central Trapezoidal Auditorium Volume & Stepped Attic Parapet */}
          <mesh position={[0, 1.25, -0.15]} castShadow receiveShadow>
            <boxGeometry args={[2.65, 2.18, 1.95]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.46, 0.05)} />
          </mesh>
          <mesh position={[0, 2.44, 0.15]} castShadow>
            <boxGeometry args={[2.25, 0.24, 1.15]} />
            <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
          </mesh>
          {/* Rear Stage Flytower */}
          <mesh position={[0, 1.58, -1.15]} castShadow>
            <boxGeometry args={[1.95, 2.65, 0.85]} />
            <meshStandardMaterial {...mat(palette.wall, 0.46, 0.05)} />
          </mesh>

          {/* 5 Giant Vertical Stained-Glass Bays separated by 6 Faceted Concrete Pylons */}
          {[-0.9, -0.45, 0, 0.45, 0.9].map((vx) => (
            <group key={vx} position={[vx, 1.38, 0.84]}>
              <mesh>
                <boxGeometry args={[0.32, 1.55, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.68)} />
              </mesh>
              {[-0.45, -0.15, 0.15, 0.45].map((ty) => (
                <mesh key={ty} position={[0, ty, 0.018]}>
                  <boxGeometry args={[0.32, 0.02, 0.02]} />
                  <meshStandardMaterial {...mat(palette.frame, 0.3, 0.45)} />
                </mesh>
              ))}
            </group>
          ))}
          {[-1.12, -0.68, -0.22, 0.22, 0.68, 1.12].map((px) => (
            <mesh key={px} position={[px, 1.38, 0.88]} castShadow>
              <boxGeometry args={[0.12, 1.76, 0.16]} />
              <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
            </mesh>
          ))}

          {/* Ground-Floor Projecting Entrance Portico Canopy, Columns & Granite Stairs */}
          <mesh position={[0, 0.2, 1.24]} castShadow>
            <boxGeometry args={[2.45, 0.08, 0.34]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.5, 0.08)} />
          </mesh>
          <mesh position={[0, 0.56, 1.02]} castShadow>
            <boxGeometry args={[2.55, 0.1, 0.42]} />
            <meshStandardMaterial {...mat(palette.accentRed, 0.4, 0.1)} />
          </mesh>
          {[-1.05, -0.63, -0.21, 0.21, 0.63, 1.05].map((cx) => (
            <mesh key={cx} position={[cx, 0.36, 1.14]} castShadow>
              <boxGeometry args={[0.08, 0.36, 0.08]} />
              <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
            </mesh>
          ))}

          {/* Two Monumental Symmetrical Flanking Stair Towers */}
          {[-1.65, 1.65].map((tx) => (
            <group key={tx} position={[tx, 1.42, 0.12]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.82, 2.52, 1.65]} />
                <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
              </mesh>
              <mesh position={[0, 1.28, 0]} castShadow>
                <boxGeometry args={[0.88, 0.06, 1.72]} />
                <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.08)} />
              </mesh>
              {/* Tall vertical staircase window on each tower */}
              <mesh position={[0, 0.12, 0.84]}>
                <boxGeometry args={[0.24, 1.75, 0.04]} />
                <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* =====================================================================
          16. ГОРИЗОНТАЛЬНЫЙ НЕБОСКРЕБ «ВОЛКЕНБЮГЕЛЬ» (ЭЛЬ ЛИСИЦКИЙ, 1923–1925)
          Построение из базовых примитивов R3F по фото (/photos/wolkenbugel.jpg)
         ===================================================================== */}
      {buildingId === 'wolkenbugel' && (
        <group>
          {/* Three Massive Vertical Concrete & Glass Elevator/Stair Pylons */}
          {[
            { x: -1.15, z: -0.45, w: 0.68, d: 0.68, h: 2.85 },
            { x: 0.45, z: 0.35, w: 0.82, d: 0.82, h: 3.35 },
            { x: 1.35, z: -0.55, w: 0.68, d: 0.68, h: 2.85 },
          ].map((p, idx) => (
            <group key={idx} position={[p.x, p.h / 2 + 0.16, p.z]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[p.w, p.h, p.d]} />
                <meshStandardMaterial {...mat(palette.wall, 0.44, 0.05)} />
              </mesh>
              {/* Twin vertical black elevator shaft glazing strips on front & back with floor bars */}
              {[-0.14, 0.14].map((sx) => (
                <mesh key={sx} position={[sx, 0, p.d / 2 + 0.01]}>
                  <boxGeometry args={[0.095, p.h - 0.12, 0.03]} />
                  <meshStandardMaterial {...mat(palette.glass, 0.14, 0.68)} />
                </mesh>
              ))}
              {Array.from({ length: 12 }).map((_, fIdx) => (
                <mesh
                  key={fIdx}
                  position={[0, -p.h / 2 + 0.25 + fIdx * 0.22, p.d / 2 + 0.02]}
                >
                  <boxGeometry args={[0.42, 0.018, 0.02]} />
                  <meshStandardMaterial {...mat(palette.wallSecondary, 0.4, 0.1)} />
                </mesh>
              ))}
              {/* Ground-level cantilevered tramway/metro canopy around pylon base */}
              <mesh position={[0, -p.h / 2 + 0.22, 0]} castShadow>
                <boxGeometry args={[p.w + 0.44, 0.06, p.d + 0.44]} />
                <meshStandardMaterial {...mat(palette.accentRed, 0.4, 0.15)} />
              </mesh>
            </group>
          ))}

          {/* Lower Horizontal Cantilevered Glass Wing spanning the rear pylons */}
          <mesh position={[0.1, 2.88, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[3.65, 0.58, 0.82]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.44, 0.05)} />
          </mesh>
          {[2.78, 2.98].map((gy) => (
            <mesh key={gy} position={[0.1, gy, -0.5]}>
              <boxGeometry args={[3.68, 0.12, 0.85]} />
              <meshStandardMaterial {...mat(palette.glass, 0.14, 0.65)} />
            </mesh>
          ))}

          {/* Upper Primary Cantilevered "Cloud Iron" Horizontal Office Slab */}
          <mesh position={[0.45, 3.62, 0.15]} castShadow receiveShadow>
            <boxGeometry args={[1.15, 0.68, 3.45]} />
            <meshStandardMaterial {...mat(palette.wall, 0.42, 0.05)} />
          </mesh>
          <mesh position={[0.45, 3.98, 0.15]} castShadow>
            <boxGeometry args={[1.22, 0.05, 3.52]} />
            <meshStandardMaterial {...mat(palette.wallSecondary, 0.42, 0.08)} />
          </mesh>
          {/* 3-tier continuous wrap-around ribbon glazing on the upper slab */}
          {[3.48, 3.64, 3.8].map((gy, idx) => (
            <mesh key={gy} position={[0.45, gy, 0.15]}>
              <boxGeometry args={[1.18, 0.1, 3.48]} />
              <meshStandardMaterial
                {...mat(idx === 1 ? palette.accentRed : palette.glass, 0.16, 0.62)}
              />
            </mesh>
          ))}
          {/* Vertical Vierendeel truss mullions along the floating horizontal slab */}
          {Array.from({ length: 10 }).map((_, vIdx) => (
            <mesh key={vIdx} position={[0.45, 3.62, -1.35 + vIdx * 0.34]}>
              <boxGeometry args={[1.19, 0.64, 0.025]} />
              <meshStandardMaterial {...mat(palette.frame, 0.3, 0.5)} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

/**
 * Offscreen Batch Verifier inside R3F Canvas that mounts all 16 Constructivist models
 * when requested and runs verifyThreeGroup on every single building.
 */
const AllModelsBatchVerifier: React.FC<{
  palette: PaletteColors;
  clipPlane: THREE.Plane;
  onComplete: (reports: ModelVerificationReport[]) => void;
}> = ({ palette, clipPlane, onComplete }) => {
  const groupRefs = useRef<Record<string, THREE.Group | null>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const results: ModelVerificationReport[] = BUILDINGS.map((b) => {
        const grp = groupRefs.current[b.id] || null;
        return verifyThreeGroup(grp, b.id);
      });
      onComplete(results);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <group visible={false}>
      {BUILDINGS.map((b) => {
        const refObj = {
          get current() {
            return groupRefs.current[b.id] || null;
          },
          set current(val: THREE.Group | null) {
            groupRefs.current[b.id] = val;
          },
        } as React.RefObject<THREE.Group | null>;

        return (
          <ConstructivistR3FModel
            key={b.id}
            buildingId={b.id}
            palette={palette}
            clipPlane={clipPlane}
            wireframe={false}
            exportGroupRef={refObj}
          />
        );
      })}
    </group>
  );
};

export const BambuPrintViewer: React.FC<BambuPrintViewerProps> = ({
  buildingId,
  buildingTitle,
  photoUrl,
}) => {
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [slicePercent, setSlicePercent] = useState<number>(100);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [compare5050, setCompare5050] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('photo');
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const [currentReport, setCurrentReport] = useState<ModelVerificationReport | null>(null);
  const [runAllAudit, setRunAllAudit] = useState<boolean>(false);
  const [allReports, setAllReports] = useState<ModelVerificationReport[] | null>(null);
  const [showAuditTable, setShowAuditTable] = useState<boolean>(false);

  const exportGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const transitionActiveRef = useRef<boolean>(true);

  const preset = BAMBU_PRESETS[buildingId] || BAMBU_PRESETS['white-tower'];
  const cameraSpec =
    BUILDING_CAMERA_SPECS[buildingId] || BUILDING_CAMERA_SPECS['white-tower'];
  const palette = useMemo(() => getFilamentPalette('architectural'), []);

  // Dynamic horizontal clipping plane for 3D Slicer layer preview
  const clipPlane = useMemo(() => {
    const maxHeight = 5.0;
    const cutY = 0.15 + (slicePercent / 100) * maxHeight;
    return new THREE.Plane(new THREE.Vector3(0, -1, 0), cutY);
  }, [slicePercent]);

  // Automatically verify current 3D model geometry & STL readiness on mount/change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (exportGroupRef.current) {
        setCurrentReport(verifyThreeGroup(exportGroupRef.current, buildingId));
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [buildingId]);

  const handleSelectCameraPreset = (nextPreset: CameraViewPreset) => {
    soundEngine.playSfx('click');
    setAutoRotate(false);
    setCameraPreset(nextPreset);
    transitionActiveRef.current = true;
  };

  const handleToggleCompare5050 = () => {
    soundEngine.playSfx('click');
    const next = !compare5050;
    setCompare5050(next);
    if (next) {
      setAutoRotate(false);
      setCameraPreset('photo');
      transitionActiveRef.current = true;
    }
  };

  const handleRunFullAudit = () => {
    soundEngine.playSfx('signal');
    setShowAuditTable(true);
    if (!allReports) {
      setRunAllAudit(true);
    }
  };

  const handleDownloadStl = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playSfx('signal');
    downloadStlFromThreeGroup(exportGroupRef.current, buildingId);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-[#111111] text-[#F6F2E9] border-2 border-[#111111] p-3 sm:p-4 space-y-3"
    >
      {/* Top 3D Printer & Camera Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tech border-b border-[#F6F2E9]/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Box className="w-3.5 h-3.5 text-[#EAB308] shrink-0" />
          <span className="uppercase font-bold text-[#EAB308]">
            ТОЧНАЯ 3D-КОПИЯ · BAMBU LAB 256×256 ММ
          </span>
        </div>

        {/* Camera Angle Presets */}
        <div
          role="group"
          aria-label="Предустановленные ракурсы 3D-камеры"
          className="flex flex-wrap items-center gap-1"
        >
          <Compass className="w-3.5 h-3.5 text-[#EAE3D5]/70 mr-0.5 hidden sm:inline" />
          {(
            [
              { id: 'photo', label: 'Ракурс с фото' },
              { id: 'front', label: 'Фасад' },
              { id: 'iso', label: '3/4 Аэро' },
              { id: 'top', label: 'План сверху' },
            ] as const
          ).map((cam) => {
            const isActive = cameraPreset === cam.id;
            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => handleSelectCameraPreset(cam.id)}
                className={`px-2 py-0.5 text-[10px] font-mono-tech uppercase border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#EAB308] text-[#111111] border-[#EAB308] font-bold'
                    : 'bg-[#1D1D1D] text-[#F6F2E9] border-[#F6F2E9]/30 hover:border-[#EAB308]'
                }`}
              >
                {cam.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Viewport Area: Full 3D or Side-by-Side 50/50 Photo Comparison */}
      <div
        className={`grid grid-cols-1 ${
          compare5050 && photoUrl ? 'md:grid-cols-2 gap-3' : ''
        }`}
      >
        {/* Interactive @react-three/fiber 3D Viewport */}
        <div className="relative aspect-[16/10] w-full border border-[#F6F2E9]/25 overflow-hidden bg-[#161616]">
          <WebGLErrorBoundary buildingTitle={buildingTitle}>
            <Canvas
              shadows
              camera={{ position: cameraSpec.photo.pos, fov: 38 }}
              gl={{ localClippingEnabled: true, antialias: true }}
            >
              <color attach="background" args={['#161616']} />
              <StudioEnvironmentSetup />
              <ambientLight intensity={0.5} />
              <hemisphereLight args={['#F6F2E9', '#252525', 0.65]} />
              <directionalLight
                position={[6, 9, 6]}
                intensity={1.35}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0005}
              />
              <directionalLight position={[-5, 4, -4]} intensity={0.45} color="#EAB308" />

              {/* Bambu Lab 256x256 Build Plate Grid */}
              <gridHelper args={[7, 14, '#D62828', '#2E2E2E']} position={[0, 0.01, 0]} />

              {/* Smooth Camera Preset Interpolation */}
              <CameraPresetController
                buildingId={buildingId}
                cameraPreset={cameraPreset}
                transitionActiveRef={transitionActiveRef}
                controlsRef={controlsRef}
              />

              {/* High-Detail Constructivist Monument Replica */}
              <ConstructivistR3FModel
                buildingId={buildingId}
                palette={palette}
                clipPlane={clipPlane}
                wireframe={wireframe}
                exportGroupRef={exportGroupRef}
              />

              {/* Optional Offscreen Batch Audit of all 16 Monuments */}
              {runAllAudit && (
                <AllModelsBatchVerifier
                  palette={palette}
                  clipPlane={clipPlane}
                  onComplete={(results) => {
                    setAllReports(results);
                    setRunAllAudit(false);
                  }}
                />
              )}

              <OrbitControls
                ref={controlsRef}
                makeDefault
                autoRotate={autoRotate}
                autoRotateSpeed={1.2}
                enableDamping
                dampingFactor={0.08}
                minDistance={2.2}
                maxDistance={11}
                maxPolarAngle={Math.PI / 2 - 0.02}
                onStart={() => {
                  transitionActiveRef.current = false;
                }}
              />
            </Canvas>
          </WebGLErrorBoundary>

          {/* Top-left scale & layer readout */}
          <div className="absolute top-2.5 left-2.5 bg-[#111111]/90 border border-[#F6F2E9]/30 px-2.5 py-1 text-[10px] font-mono-tech pointer-events-none tabular-nums">
            <span>МАСШТАБ {preset.scaleLabel}</span>
            <span aria-hidden="true"> · </span>
            <span className="text-[#EAB308]">СЛОИ: {slicePercent}%</span>
          </div>

          {/* Top-right 50/50 Photo Compare, Wireframe & Auto-Rotate Toggles */}
          <div className="absolute top-2.5 right-2.5 flex flex-wrap items-center gap-1.5">
            {photoUrl && (
              <button
                type="button"
                onClick={handleToggleCompare5050}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono-tech uppercase border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  compare5050
                    ? 'bg-[#EAB308] text-[#111111] border-[#EAB308] font-bold'
                    : 'bg-[#111111]/90 text-[#F6F2E9] border-[#F6F2E9]/40 hover:border-[#EAB308]'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>{compare5050 ? '3D / Фото 50×50 ✓' : 'Сравнить 50/50'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setWireframe((prev) => !prev)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono-tech uppercase border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                wireframe
                  ? 'bg-[#EAB308] text-[#111111] border-[#EAB308] font-bold'
                  : 'bg-[#111111]/90 text-[#F6F2E9] border-[#F6F2E9]/40 hover:border-[#EAB308]'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Сетка</span>
            </button>

            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono-tech uppercase border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                autoRotate
                  ? 'bg-[#D62828] text-[#F6F2E9] border-[#F6F2E9]'
                  : 'bg-[#111111]/90 text-[#F6F2E9] border-[#F6F2E9]/40 hover:border-[#EAB308]'
              }`}
            >
              <RotateCw className="w-3 h-3" />
              <span>{autoRotate ? 'Авто 360°' : 'Вращать'}</span>
            </button>
          </div>
        </div>

        {/* Right Side of 50/50 Photo Comparison Mode */}
        {compare5050 && photoUrl && (
          <div className="flex flex-col justify-between border border-[#EAB308]/60 bg-[#1A1A1A] p-2.5">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#F6F2E9]/20 bg-[#111111]">
              <img
                src={photoUrl}
                alt={`Архивный эталон: ${buildingTitle}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-[#111111]/90 border border-[#EAB308] px-2 py-0.5 text-[10px] font-mono-tech uppercase text-[#EAB308] font-bold">
                Архивное фото-эталон (50/50)
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <div className="text-[10px] font-mono-tech uppercase text-[#EAB308] font-bold">
                Выверенные по фото узлы 3D-модели:
              </div>
              <ul className="space-y-1 text-[11px] text-[#F6F2E9]/90 font-mono-tech">
                {cameraSpec.photoMatchHighlights.map((pt) => (
                  <li key={pt} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#D62828] font-bold shrink-0">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Slicer Layer Inspection Bar */}
      <div className="flex items-center gap-3 bg-[#2B2B2B] p-2.5 border border-[#F6F2E9]/20 text-xs font-mono-tech">
        <Layers className="w-4 h-4 text-[#EAB308] shrink-0" />
        <span className="shrink-0">Срез слоев по высоте:</span>
        <input
          type="range"
          min={10}
          max={100}
          value={slicePercent}
          aria-label="Предпросмотр слоев печати по высоте"
          onChange={(e) => setSlicePercent(Number(e.target.value))}
          className="w-full accent-[#EAB308] cursor-pointer"
        />
        <span className="text-[#EAB308] font-bold w-10 text-right tabular-nums">
          {slicePercent}%
        </span>
      </div>

      {/* Live Technical Verification Bar + Full 16-Model Diagnostic Trigger */}
      <div className="bg-[#1C1C1C] border border-[#F6F2E9]/20 p-2.5 font-mono-tech text-[11px] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EAB308] shrink-0" />
            {currentReport ? (
              <span className="text-[#F6F2E9] tabular-nums">
                Верификация 3D:{' '}
                <strong className="text-[#EAB308]">
                  {currentReport.meshCount} узлов
                </strong>{' '}
                ·{' '}
                <strong className="text-[#EAB308]">
                  {currentReport.triangleCount.toLocaleString('ru-RU')} треугольников
                </strong>{' '}
                · {currentReport.widthMm}×{currentReport.depthMm}×{currentReport.heightMm} мм ·
                STL {(currentReport.stlBytes / 1024).toFixed(1)} КБ (
                <span className="text-[#EAB308] font-bold">ПРОЙДЕНО ✓</span>)
              </span>
            ) : (
              <span>Проверка полигональной сетки...</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (showAuditTable) {
                setShowAuditTable(false);
              } else {
                handleRunFullAudit();
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#2B2B2B] hover:bg-[#EAB308] hover:text-[#111111] text-[#EAB308] border border-[#EAB308]/60 text-[10px] uppercase font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>
              {showAuditTable
                ? 'Скрыть отчет (16/16)'
                : 'Проверить все 16 моделей и STL'}
            </span>
            {showAuditTable ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Expandable 16-Model Technical Verification Report Table */}
        {showAuditTable && (
          <div className="pt-2 border-t border-[#F6F2E9]/15 overflow-x-auto">
            {!allReports ? (
              <div className="py-3 text-center text-[#EAB308]">
                Выполняется геометрическая проверка всех 16 моделей и валидация бинарного STL...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#EAE3D5]/80">
                  <span>
                    ИТОГ ТЕХНИЧЕСКОЙ ПРОВЕРКИ КАТАЛОГА:{' '}
                    <strong className="text-[#EAB308]">
                      {allReports.filter((r) => r.passed).length} ИЗ {allReports.length} МОДЕЛЕЙ
                      ПРОШЛИ ПРОВЕРКУ ГЕОМЕТРИИ И STL
                    </strong>
                  </span>
                  <span>Стол печати: Bambu Lab X1C / P1S (256×256×256 мм)</span>
                </div>

                <table className="w-full text-left border-collapse text-[10px] tabular-nums">
                  <thead>
                    <tr className="border-b border-[#F6F2E9]/25 text-[#EAE3D5]/70 uppercase">
                      <th className="py-1 pr-2">Памятник</th>
                      <th className="py-1 px-2">Узлов</th>
                      <th className="py-1 px-2">Треугольников</th>
                      <th className="py-1 px-2">Габариты (Ш×Г×В мм)</th>
                      <th className="py-1 px-2">STL (КБ)</th>
                      <th className="py-1 pl-2 text-right">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F6F2E9]/10">
                    {allReports.map((rep) => {
                      const bItem = BUILDINGS.find((b) => b.id === rep.buildingId);
                      const isCurrent = rep.buildingId === buildingId;
                      return (
                        <tr
                          key={rep.buildingId}
                          className={
                            isCurrent ? 'bg-[#D62828]/25 font-bold text-[#F6F2E9]' : ''
                          }
                        >
                          <td className="py-1 pr-2 truncate max-w-[170px]">
                            {bItem ? bItem.title : rep.buildingId}
                          </td>
                          <td className="py-1 px-2">{rep.meshCount}</td>
                          <td className="py-1 px-2">
                            {rep.triangleCount.toLocaleString('ru-RU')}
                          </td>
                          <td className="py-1 px-2">
                            {rep.widthMm}×{rep.depthMm}×{rep.heightMm}
                          </td>
                          <td className="py-1 px-2">
                            {(rep.stlBytes / 1024).toFixed(1)}
                          </td>
                          <td className="py-1 pl-2 text-right text-[#EAB308] font-bold">
                            {rep.passed ? 'ПРОЙДЕНО ✓' : 'ОШИБКА'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bambu Studio Print Profile Specs & STL Download CTA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-tech tabular-nums">
        <div className="bg-[#2B2B2B] p-2 border border-[#F6F2E9]/15">
          <span className="text-[#EAE3D5]/70 block">Профиль Bambu Studio:</span>
          <span className="text-[#F6F2E9] font-bold">{preset.layerHeight}</span>
        </div>
        <div className="bg-[#2B2B2B] p-2 border border-[#F6F2E9]/15">
          <span className="text-[#EAE3D5]/70 block">Габариты на столе:</span>
          <span className="text-[#EAB308] font-bold">
            {preset.footprintMm} × В {preset.heightMm} мм
          </span>
        </div>
        <div className="bg-[#2B2B2B] p-2 border border-[#F6F2E9]/15">
          <span className="text-[#EAE3D5]/70 block">Заполнение / Поддержки:</span>
          <span className="text-[#F6F2E9] font-bold">{preset.infill}</span>
        </div>
        <div className="bg-[#2B2B2B] p-2 border border-[#F6F2E9]/15">
          <span className="text-[#EAE3D5]/70 block">Расход PLA и время:</span>
          <span className="text-[#D62828] font-bold">
            ~{preset.estimatedGrams} г · {preset.estimatedTime}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownloadStl}
        className="w-full py-3 px-4 bg-[#D62828] hover:bg-[#EAB308] hover:text-[#111111] text-[#F6F2E9] font-display text-sm sm:text-base uppercase tracking-wider border-2 border-[#F6F2E9] transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        {downloaded ? (
          <>
            <Check className="w-4 h-4 shrink-0" />
            <span>Файл .STL скачан (Bambu Studio)</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 shrink-0" />
            <span>Скачать 3D-модель Bambu Lab (.STL)</span>
          </>
        )}
      </button>
    </div>
  );
};
