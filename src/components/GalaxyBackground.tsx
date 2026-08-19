import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// ─── Paramètres ───────────────────────────────────────────────────────────────
const COUNT      = 6000;
const BRANCHES   = 3;
const RADIUS     = 5;
const SPIN       = 1.2;
const RANDOMNESS = 0.4;
const RAND_POWER = 2.5;

// ─── Scène ────────────────────────────────────────────────────────────────────
function Galaxy({
  insideColor,
  outsideColor,
  mouse,
  scroll,
}: {
  insideColor:  string;
  outsideColor: string;
  mouse:  { current: { x: number; y: number } };
  scroll: { current: number };
}) {
  const pointsRef = useRef<THREE.Points>(null!);

  // Cible de rotation lissée (évite les saccades)
  const targetRotation = useRef({ x: 0, y: 0 });

  const { positions, colors } = useMemo(() => {
    const colorIn  = new THREE.Color(insideColor);
    const colorOut = new THREE.Color(outsideColor);
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const r           = Math.pow(Math.random(), RAND_POWER) * RADIUS;
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spinAngle   = r * SPIN;

      const rx = Math.pow(Math.random(), RAND_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * r;
      const ry = Math.pow(Math.random(), RAND_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * r * 0.3;
      const rz = Math.pow(Math.random(), RAND_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * r;

      pos[i3]     = Math.cos(branchAngle + spinAngle) * r + rx;
      pos[i3 + 1] = ry;
      pos[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;

      const mixed = colorIn.clone().lerp(colorOut, r / RADIUS);
      col[i3]     = mixed.r;
      col[i3 + 1] = mixed.g;
      col[i3 + 2] = mixed.b;
    }
    return { positions: pos, colors: col };
  }, [insideColor, outsideColor]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // ── Souris : incline la galaxie ──────────────────────────────────────────
    targetRotation.current.x = mouse.current.y * 0.4;   // haut/bas  → tilt X
    const zTilt = -mouse.current.x * 0.2;               // gauche/dr → tilt Z

    // ── Scroll : fait pivoter la galaxie sur Y + zoom caméra via scale ───────
    // scroll [0,1] → rotation Y supplémentaire de 0 à 2π (un tour complet)
    const scrollRotY = scroll.current * Math.PI * 2;
    // scroll → léger scale down (la galaxie "s'éloigne" en scrollant)
    const scaleFactor = 1 - scroll.current * 0.35;
    pointsRef.current.scale.setScalar(scaleFactor);

    // ── Auto-spin continu ────────────────────────────────────────────────────
    targetRotation.current.y += delta * 0.04;

    // Rotation Y totale = auto-spin + contribution scroll
    const targetY = targetRotation.current.y + scrollRotY;

    // ── Lerp doux vers les cibles ────────────────────────────────────────────
    pointsRef.current.rotation.x += (targetRotation.current.x - pointsRef.current.rotation.x) * delta * 3;
    pointsRef.current.rotation.y += (targetY - pointsRef.current.rotation.y) * delta * 3;
    pointsRef.current.rotation.z += (zTilt   - pointsRef.current.rotation.z) * delta * 3;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]}    />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Composant exporté ────────────────────────────────────────────────────────
export default function GalaxyBackground({
  insideColor  = '#22c55e',
  outsideColor = '#3b82f6',
}: {
  insideColor?:  string;
  outsideColor?: string;
}) {
  // Stocke la position normalisée de la souris dans une ref (pas de re-render)
  const mouse  = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth)  * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current  = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll',    handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll',    handleScroll);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset:    0,
        zIndex:   0,
        width:    '100%',
        height:   '100%',
      }}
    >
      <Canvas
        camera={{ position: [0, 3.5, 0], fov: 80, near: 0.1, far: 100 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: false, alpha: true }}
      >
        <Galaxy insideColor={insideColor} outsideColor={outsideColor} mouse={mouse} scroll={scroll} />
      </Canvas>
    </div>
  );
}
