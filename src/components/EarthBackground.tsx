import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

// ─── Globe + atmosphère ───────────────────────────────────────────────────────
function EarthScene({ mouse }: { mouse: { current: { x: number; y: number } } }) {
  const globeRef = useRef<THREE.Mesh>(null!);
  const atmRef   = useRef<THREE.Mesh>(null!);

  // Chargement des textures (depuis public/earth/)
  const [dayMap, nightMap, bumpMap] = useLoader(THREE.TextureLoader, [
    '/earth/day.jpg',
    '/earth/night.jpg',
    '/earth/bumpRoughnessClouds.png',
  ]);

  // sRGB pour les textures couleur
  dayMap.colorSpace   = THREE.SRGBColorSpace;
  nightMap.colorSpace = THREE.SRGBColorSpace;
  dayMap.anisotropy   = 8;
  nightMap.anisotropy = 8;

  useFrame((_, delta) => {
    if (!globeRef.current) return;

    // Auto-rotation
    globeRef.current.rotation.y += delta * 0.06;

    // Réaction souris — amplitude augmentée
    globeRef.current.rotation.x += (mouse.current.y * 0.7 - globeRef.current.rotation.x) * delta * 3;
    globeRef.current.rotation.z += (-mouse.current.x * 0.35 - globeRef.current.rotation.z) * delta * 3;

    // Atmosphère suit le globe
    if (atmRef.current) {
      atmRef.current.rotation.copy(globeRef.current.rotation);
    }
  });

  return (
    <>
      {/* Lumière solaire */}
      <directionalLight color="#ffffff" intensity={2.5} position={[3, 1, 4]} />
      <ambientLight intensity={0.05} />

      {/* Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.03}
          roughnessMap={bumpMap}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Couche nuages (légèrement plus grande, semi-transparente) */}
      <mesh ref={atmRef} scale={1.003}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial
          alphaMap={bumpMap}
          transparent
          opacity={0.25}
          color="#ffffff"
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphère (halo bleu) — discret */}
      <mesh scale={1.14}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshBasicMaterial
          color="#4db2ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Deuxième couche atmosphère plus large — effet de halo doux */}
      <mesh scale={1.22}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshBasicMaterial
          color="#88ccff"
          transparent
          opacity={0.025}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ─── Composant exporté ────────────────────────────────────────────────────────
export default function EarthBackground() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth)  * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 35, near: 0.1, far: 100 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <EarthScene mouse={mouse} />
      </Canvas>
    </div>
  );
}
