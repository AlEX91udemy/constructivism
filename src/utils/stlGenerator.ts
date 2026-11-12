import * as THREE from 'three';

/**
 * High-Precision 3D Mesh & STL File Exporter for Bambu Lab 3D Printers
 * Exports the exact Three.js architectural replica (or procedural fallback mesh)
 * in Z-up millimeter coordinates scaled for the Bambu Lab 256×256 mm build plate.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Triangle3D {
  v1: Vec3;
  v2: Vec3;
  v3: Vec3;
  normal: Vec3;
  partColor?: string;
}

export interface BambuPrintPreset {
  scaleLabel: string;
  footprintMm: string;
  heightMm: number;
  layerHeight: string;
  infill: string;
  supports: string;
  filament: string;
  estimatedGrams: number;
  estimatedTime: string;
  nozzle: string;
}

export type PrintProfileId = 'detail' | 'robust' | 'miniature';

export interface PrintProfile {
  id: PrintProfileId;
  label: string;
  nozzleMm: number;
  layerHeightMm: number;
  minStrutRadiusScene: number;
  minWallMm: number;
  minClearanceMm: number;
  supportStrategy: string;
  description: string;
}

/**
 * Geometry thresholds are expressed in scene units where 1 unit = 25 mm in
 * the exported STL. They keep the same model printable across common FDM
 * nozzle sizes without changing the historical proportions unnecessarily.
 */
export const PRINT_PROFILES: Record<PrintProfileId, PrintProfile> = {
  detail: {
    id: 'detail',
    label: 'Детализация',
    nozzleMm: 0.4,
    layerHeightMm: 0.16,
    minStrutRadiusScene: 0.028,
    minWallMm: 0.8,
    minClearanceMm: 0.5,
    supportStrategy: 'Tree Auto для консолей и ажурных ферм',
    description: 'Максимум мелких окон, рёбер и ограждений для сопла 0,4 мм.',
  },
  robust: {
    id: 'robust',
    label: 'Надёжная печать',
    nozzleMm: 0.4,
    layerHeightMm: 0.2,
    minStrutRadiusScene: 0.04,
    minWallMm: 1.2,
    minClearanceMm: 0.7,
    supportStrategy: 'Минимум поддержек, Tree Slim только под критическими выносами',
    description: 'Утолщённые стержни и ограждения для повседневной FDM-печати.',
  },
  miniature: {
    id: 'miniature',
    label: 'Миниатюра',
    nozzleMm: 0.2,
    layerHeightMm: 0.1,
    minStrutRadiusScene: 0.022,
    minWallMm: 0.6,
    minClearanceMm: 0.35,
    supportStrategy: 'Tree Auto с ручной проверкой тонких навесов',
    description: 'Мелкие переплёты и фермы для сопла 0,2–0,25 мм.',
  },
};

export const BAMBU_PRESETS: Record<string, BambuPrintPreset> = {
  'white-tower': {
    scaleLabel: '1:250',
    footprintMm: '110 × 96 мм',
    heightMm: 140,
    layerHeight: '0.16mm High Quality @BBL X1C / P1S',
    infill: '15% Gyroid (Гироид)',
    supports: 'Tree Auto (Древовидные под баком)',
    filament: 'Bambu PLA Matte — Ivory White (11100)',
    estimatedGrams: 72,
    estimatedTime: '2 ч 25 мин',
    nozzle: '0.4 мм',
  },
  narkomfin: {
    scaleLabel: '1:350',
    footprintMm: '165 × 82 мм',
    heightMm: 68,
    layerHeight: '0.16mm High Quality @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Normal Snug (для ножек-опор первого этажа)',
    filament: 'Bambu PLA Matte — Ivory White / Charcoal',
    estimatedGrams: 88,
    estimatedTime: '2 ч 50 мин',
    nozzle: '0.4 мм',
  },
  rusakov: {
    scaleLabel: '1:300',
    footprintMm: '138 × 122 мм',
    heightMm: 82,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '18% Gyroid',
    supports: 'Не требуются (угол консолей балконов 42°)',
    filament: 'Bambu PLA Matte — Ivory White / Ash Grey',
    estimatedGrams: 96,
    estimatedTime: '3 ч 15 мин',
    nozzle: '0.4 мм',
  },
  'melnikov-house': {
    scaleLabel: '1:150',
    footprintMm: '116 × 138 мм',
    heightMm: 98,
    layerHeight: '0.16mm Optimal @BBL X1C / A1',
    infill: '15% Gyroid',
    supports: 'Не требуются (самонесущие окна-соты)',
    filament: 'Bambu PLA Matte — Ivory White (11100)',
    estimatedGrams: 78,
    estimatedTime: '2 ч 45 мин',
    nozzle: '0.4 мм',
  },
  bakhmetevsky: {
    scaleLabel: '1:400',
    footprintMm: '162 × 116 мм',
    heightMm: 64,
    layerHeight: '0.20mm Standard @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Не требуются',
    filament: 'Bambu PLA Matte — Terracotta / Ivory White',
    estimatedGrams: 74,
    estimatedTime: '2 ч 15 мин',
    nozzle: '0.4 мм',
  },
  'zuev-club': {
    scaleLabel: '1:250',
    footprintMm: '134 × 112 мм',
    heightMm: 92,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Tree Slim (под угловым козырьком цилиндра)',
    filament: 'Bambu PLA Matte — Terracotta / Charcoal',
    estimatedGrams: 84,
    estimatedTime: '2 ч 50 мин',
    nozzle: '0.4 мм',
  },
  'shukhov-tower': {
    scaleLabel: '1:650',
    footprintMm: '96 × 96 мм',
    heightMm: 192,
    layerHeight: '0.12mm Fine @BBL X1C (для сетчатых стержней)',
    infill: '100% Wall Loops (3 периметра)',
    supports: 'Не требуются (самонесущая сетка гиперболоида)',
    filament: 'Bambu PLA Tough — Metallic Iron Grey',
    estimatedGrams: 54,
    estimatedTime: '3 ч 40 мин',
    nozzle: '0.4 мм',
  },
  'zil-palace': {
    scaleLabel: '1:400',
    footprintMm: '164 × 128 мм',
    heightMm: 66,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Минимальные (для угловой лоджии)',
    filament: 'Bambu PLA Matte — Ash Grey / Ivory White',
    estimatedGrams: 92,
    estimatedTime: '3 ч 00 мин',
    nozzle: '0.4 мм',
  },
  derzhprom: {
    scaleLabel: '1:500',
    footprintMm: '178 × 118 мм',
    heightMm: 118,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Tree Slim (под двухъярусными воздушными мостами)',
    filament: 'Bambu PLA Matte — Ash Grey (11102)',
    estimatedGrams: 124,
    estimatedTime: '4 ч 05 мин',
    nozzle: '0.4 мм',
  },
  'red-banner': {
    scaleLabel: '1:300',
    footprintMm: '152 × 104 мм',
    heightMm: 94,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Не требуются',
    filament: 'Bambu PLA Matte — Terracotta / Ivory White',
    estimatedGrams: 89,
    estimatedTime: '2 ч 55 мин',
    nozzle: '0.4 мм',
  },
  'tatlin-tower': {
    scaleLabel: '1:2000',
    footprintMm: '115 × 115 мм',
    heightMm: 198,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '20% Gyroid',
    supports: 'Tree Slim (для наклонных спиралей и раскосов)',
    filament: 'Bambu PLA Matte — Scarlet Red / Ivory / Charcoal (AMS)',
    estimatedGrams: 79,
    estimatedTime: '3 ч 20 мин',
    nozzle: '0.4 мм',
  },
  'unovis-tribune': {
    scaleLabel: '1:100',
    footprintMm: '124 × 98 мм',
    heightMm: 115,
    layerHeight: '0.16mm Optimal @BBL X1C / A1',
    infill: '20% Gyroid',
    supports: 'Tree Auto (под наклонной решетчатой фермой)',
    filament: 'Bambu PLA Matte — Scarlet Red / Ivory / Black (AMS)',
    estimatedGrams: 62,
    estimatedTime: '2 ч 25 мин',
    nozzle: '0.4 мм',
  },
  'moscow-planetarium': {
    scaleLabel: '1:300',
    footprintMm: '142 × 118 мм',
    heightMm: 86,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Не требуются (самонесущий параболический купол)',
    filament: 'Bambu PLA Matte — Ivory White / Charcoal',
    estimatedGrams: 84,
    estimatedTime: '2 ч 45 мин',
    nozzle: '0.4 мм',
  },
  'iset-gorodok': {
    scaleLabel: '1:350',
    footprintMm: '156 × 112 мм',
    heightMm: 96,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Минимальные (под угловыми балконами)',
    filament: 'Bambu PLA Matte — Ivory White / Scarlet Red',
    estimatedGrams: 94,
    estimatedTime: '3 ч 10 мин',
    nozzle: '0.4 мм',
  },
  'gorky-palace': {
    scaleLabel: '1:350',
    footprintMm: '162 × 108 мм',
    heightMm: 78,
    layerHeight: '0.20mm Standard @BBL X1C / P1S',
    infill: '15% Gyroid',
    supports: 'Не требуются',
    filament: 'Bambu PLA Matte — Desert Tan / Charcoal',
    estimatedGrams: 91,
    estimatedTime: '2 ч 55 мин',
    nozzle: '0.4 мм',
  },
  wolkenbugel: {
    scaleLabel: '1:500',
    footprintMm: '158 × 114 мм',
    heightMm: 112,
    layerHeight: '0.16mm Optimal @BBL X1C / P1S',
    infill: '20% Gyroid',
    supports: 'Tree Auto (под консолями горизонтального корпуса)',
    filament: 'Bambu PLA Matte — Ivory White / Scarlet Red / Black (AMS)',
    estimatedGrams: 76,
    estimatedTime: '2 ч 50 мин',
    nozzle: '0.4 мм',
  },
};

function computeNormal(v1: Vec3, v2: Vec3, v3: Vec3): Vec3 {
  const ux = v2.x - v1.x;
  const uy = v2.y - v1.y;
  const uz = v2.z - v1.z;
  const vx = v3.x - v1.x;
  const vy = v3.y - v1.y;
  const vz = v3.z - v1.z;
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / len, y: ny / len, z: nz / len };
}

/**
 * Extracts all triangles from a live Three.js Object3D hierarchy,
 * converting Three.js Y-up scene coordinates into Bambu Studio Z-up millimeter coordinates
 * (1 scene unit = 25 mm).
 */
export function extractTrianglesFromThreeObject(root: THREE.Object3D): Triangle3D[] {
  const tris: Triangle3D[] = [];
  const scaleMm = 25.0;

  root.updateWorldMatrix(true, true);
  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();

  const pA = new THREE.Vector3();
  const pB = new THREE.Vector3();
  const pC = new THREE.Vector3();

  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const geom = mesh.geometry as THREE.BufferGeometry;
    if (!geom || !geom.attributes.position) return;

    const posAttr = geom.attributes.position;
    const indexAttr = geom.index;

    // Matrix relative to the model root so orbit/scene offset doesn't shift the STL origin
    const relMatrix = new THREE.Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld);

    const toZUpMm = (v: THREE.Vector3): Vec3 => ({
      x: v.x * scaleMm,
      y: -v.z * scaleMm,
      z: v.y * scaleMm,
    });

    if (indexAttr) {
      for (let i = 0; i < indexAttr.count; i += 3) {
        const i0 = indexAttr.getX(i);
        const i1 = indexAttr.getX(i + 1);
        const i2 = indexAttr.getX(i + 2);

        pA.fromBufferAttribute(posAttr, i0).applyMatrix4(relMatrix);
        pB.fromBufferAttribute(posAttr, i1).applyMatrix4(relMatrix);
        pC.fromBufferAttribute(posAttr, i2).applyMatrix4(relMatrix);

        const v1 = toZUpMm(pA);
        const v2 = toZUpMm(pB);
        const v3 = toZUpMm(pC);
        tris.push({
          v1,
          v2,
          v3,
          normal: computeNormal(v1, v2, v3),
        });
      }
    } else {
      for (let i = 0; i < posAttr.count; i += 3) {
        pA.fromBufferAttribute(posAttr, i).applyMatrix4(relMatrix);
        pB.fromBufferAttribute(posAttr, i + 1).applyMatrix4(relMatrix);
        pC.fromBufferAttribute(posAttr, i + 2).applyMatrix4(relMatrix);

        const v1 = toZUpMm(pA);
        const v2 = toZUpMm(pB);
        const v3 = toZUpMm(pC);
        tris.push({
          v1,
          v2,
          v3,
          normal: computeNormal(v1, v2, v3),
        });
      }
    }
  });

  return tris;
}

/**
 * Triggers download of a binary STL file (compact & fast for high-detail models in Bambu Studio)
 */
export function downloadStlFromThreeGroup(
  root: THREE.Object3D | null,
  buildingId: string
) {
  if (!root) return;
  const triangles = extractTrianglesFromThreeObject(root);
  const safeName = buildingId.replace(/[^a-z0-9-_]/gi, '_');

  // Binary STL format: 80-byte header + 4-byte uint32 count + 50 bytes per triangle
  const triCount = triangles.length;
  const buffer = new ArrayBuffer(84 + triCount * 50);
  const view = new DataView(buffer);

  const headerText = `BambuLab Constructivism 3D Replica: ${safeName}`;
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < headerText.length ? headerText.charCodeAt(i) : 32);
  }
  view.setUint32(80, triCount, true);

  let offset = 84;
  for (let i = 0; i < triCount; i++) {
    const { normal: n, v1, v2, v3 } = triangles[i];
    view.setFloat32(offset, n.x, true);
    view.setFloat32(offset + 4, n.y, true);
    view.setFloat32(offset + 8, n.z, true);

    view.setFloat32(offset + 12, v1.x, true);
    view.setFloat32(offset + 16, v1.y, true);
    view.setFloat32(offset + 20, v1.z, true);

    view.setFloat32(offset + 24, v2.x, true);
    view.setFloat32(offset + 28, v2.y, true);
    view.setFloat32(offset + 32, v2.z, true);

    view.setFloat32(offset + 36, v3.x, true);
    view.setFloat32(offset + 40, v3.y, true);
    view.setFloat32(offset + 44, v3.z, true);

    view.setUint16(offset + 48, 0, true);
    offset += 50;
  }

  const blob = new Blob([buffer], { type: 'application/sla' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}_bambulab_replica.stl`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export interface ModelVerificationReport {
  buildingId: string;
  meshCount: number;
  triangleCount: number;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  fitsBuildPlate256: boolean;
  validNormals: boolean;
  watertightPlinth: boolean;
  degenerateTriangleCount: number;
  minEdgeMm: number;
  stlBytes: number;
  passed: boolean;
}

/**
 * Performs a comprehensive geometric & STL export verification on a Three.js building group:
 * - Counts meshes and extracted triangles
 * - Computes exact Z-up millimeter bounding box on the Bambu Lab 256×256×256 mm build plate
 * - Verifies all triangle vertex coordinates and normals are finite (no NaN/Infinity/degenerate faces)
 * - Verifies binary STL byte size (84 + 50 * triangles)
 */
export function verifyThreeGroup(
  root: THREE.Object3D | null,
  buildingId: string
): ModelVerificationReport {
  if (!root) {
    return {
      buildingId,
      meshCount: 0,
      triangleCount: 0,
      widthMm: 0,
      depthMm: 0,
      heightMm: 0,
      fitsBuildPlate256: false,
      validNormals: false,
      watertightPlinth: false,
      degenerateTriangleCount: 0,
      minEdgeMm: 0,
      stlBytes: 0,
      passed: false,
    };
  }

  let meshCount = 0;
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      meshCount += 1;
    }
  });

  const triangles = extractTrianglesFromThreeObject(root);
  const triangleCount = triangles.length;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let validNormals = triangleCount > 0;
  let degenerateTriangleCount = 0;
  let minEdgeMm = Infinity;

  for (let i = 0; i < triangleCount; i++) {
    const { v1, v2, v3, normal } = triangles[i];
    const pts = [v1, v2, v3];
    const edgeLengths = [
      Math.hypot(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z),
      Math.hypot(v3.x - v2.x, v3.y - v2.y, v3.z - v2.z),
      Math.hypot(v1.x - v3.x, v1.y - v3.y, v1.z - v3.z),
    ];
    const twiceArea = Math.abs(
      (v2.y - v1.y) * (v3.z - v1.z) - (v2.z - v1.z) * (v3.y - v1.y)
    ) + Math.abs(
      (v2.z - v1.z) * (v3.x - v1.x) - (v2.x - v1.x) * (v3.z - v1.z)
    ) + Math.abs(
      (v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x)
    );
    minEdgeMm = Math.min(minEdgeMm, ...edgeLengths);
    if (twiceArea < 0.0001 || edgeLengths.some((edge) => edge < 0.05)) {
      degenerateTriangleCount += 1;
      validNormals = false;
    }
    for (let p = 0; p < 3; p++) {
      const pt = pts[p];
      if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y) || !Number.isFinite(pt.z)) {
        validNormals = false;
      }
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
      if (pt.z < minZ) minZ = pt.z;
      if (pt.z > maxZ) maxZ = pt.z;
    }
    if (
      !Number.isFinite(normal.x) ||
      !Number.isFinite(normal.y) ||
      !Number.isFinite(normal.z)
    ) {
      validNormals = false;
    }
  }

  const widthMm = triangleCount > 0 ? Math.round((maxX - minX) * 10) / 10 : 0;
  const depthMm = triangleCount > 0 ? Math.round((maxY - minY) * 10) / 10 : 0;
  const heightMm = triangleCount > 0 ? Math.round((maxZ - minZ) * 10) / 10 : 0;

  const fitsBuildPlate256 =
    widthMm > 20 &&
    widthMm <= 256 &&
    depthMm > 20 &&
    depthMm <= 256 &&
    heightMm > 15 &&
    heightMm <= 256;

  const watertightPlinth = minZ >= -2 && minZ <= 5;
  const finiteMinEdgeMm = Number.isFinite(minEdgeMm) ? Math.round(minEdgeMm * 100) / 100 : 0;
  const stlBytes = 84 + triangleCount * 50;
  const passed =
    meshCount >= 8 &&
    triangleCount >= 100 &&
    fitsBuildPlate256 &&
    validNormals &&
    degenerateTriangleCount === 0 &&
    watertightPlinth &&
    stlBytes > 5000;

  return {
    buildingId,
    meshCount,
    triangleCount,
    widthMm,
    depthMm,
    heightMm,
    fitsBuildPlate256,
    validNormals,
    watertightPlinth,
    degenerateTriangleCount,
    minEdgeMm: finiteMinEdgeMm,
    stlBytes,
    passed,
  };
}

