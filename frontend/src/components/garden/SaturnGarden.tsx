"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// =============================================================================
// SaturnGarden — Fondo 3D vivo (PoC del Jardín de Saturno)
// Orquídea translúcida iridiscente (sólida + malla wireframe) con bloom,
// Saturno al fondo y campo de estrellas. Reacciona al cursor.
// NO es idéntica al render de IA de referencia; es 3D real en tiempo real.
// =============================================================================

/** Geometría de un pétalo (perfil 2D con curvas Bézier). Reutilizable. */
function usePetalGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.45, 0.25, 0.5, 1.0, 0, 1.35);
    shape.bezierCurveTo(-0.5, 1.0, -0.45, 0.25, 0, 0);
    const geom = new THREE.ShapeGeometry(shape, 24);
    geom.computeVertexNormals();
    return geom;
  }, []);
}

interface PetalProps {
  geometry: THREE.ShapeGeometry;
  color: string;
  rotationY: number;
  tilt: number;
  scale: number;
  opacity: number;
}

/** Un pétalo = capa sólida translúcida + malla wireframe iridiscente encima. */
function Petal({ geometry, color, rotationY, tilt, scale, opacity }: PetalProps) {
  return (
    <group rotation={[0, rotationY, 0]}>
      <group rotation={[tilt, 0, 0]} scale={scale}>
        {/* Capa sólida translúcida que brilla con el bloom */}
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.9}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
            roughness={0.25}
            metalness={0.1}
            depthWrite={false}
          />
        </mesh>
        {/* Malla wireframe (look "blueprint") un pelín más grande */}
        <mesh geometry={geometry} scale={1.02}>
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

/** La orquídea completa: dos coronas de pétalos + núcleo brillante. */
function Orchid() {
  const group = useRef<THREE.Group>(null);
  const geometry = usePetalGeometry();

  // Paleta iridiscente: cian → violeta → magenta.
  // Lapislázuli → celadón → cristal.
  const outer = ["#1e4a82", "#2f6fb0", "#3b82c4", "#5aa0d6", "#86c8a8", "#a7d9c4"];
  const inner = ["#86c8a8", "#a7d9c4", "#cfeae0", "#6fb0d0", "#9ed8c2", "#3b82c4"];

  useFrame((state, delta) => {
    if (!group.current) return;
    // Rotación lenta continua.
    group.current.rotation.y += delta * 0.15;
    // Parallax suave hacia el cursor.
    const { x, y } = state.pointer;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -0.35 + y * 0.25,
      0.05,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      x * 0.2,
      0.05,
    );
    // "Respiración".
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} rotation={[-0.35, 0, 0]}>
      {/* Corona externa (pétalos grandes, abiertos) */}
      {outer.map((c, i) => (
        <Petal
          key={`o-${i}`}
          geometry={geometry}
          color={c}
          rotationY={(i / outer.length) * Math.PI * 2}
          tilt={-1.05}
          scale={1.55}
          opacity={0.38}
        />
      ))}
      {/* Corona interna (pétalos más erguidos, brillantes) */}
      {inner.map((c, i) => (
        <Petal
          key={`i-${i}`}
          geometry={geometry}
          color={c}
          rotationY={(i / inner.length) * Math.PI * 2 + Math.PI / inner.length}
          tilt={-0.55}
          scale={1.0}
          opacity={0.5}
        />
      ))}
      {/* Núcleo luminoso */}
      <mesh>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#fbbf24"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Saturno al fondo, inclinado, con su anillo. */
function Saturn() {
  return (
    <group position={[6, 3.2, -10]} rotation={[0.5, 0, 0.35]}>
      <mesh>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial
          color="#3b6ea5"
          emissive="#102a4a"
          emissiveIntensity={0.5}
          roughness={0.85}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 3.2, 80]} />
        <meshBasicMaterial
          color="#e3c06a"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0a1426"]} />
      <fog attach="fog" args={["#0a1426", 8, 22]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={60} color="#7fb6d8" />
      <pointLight position={[-6, -3, 2]} intensity={40} color="#86c8a8" />

      <Stars radius={60} depth={40} count={3000} factor={4} saturation={0} fade speed={1} />
      <Saturn />
      <Orchid />

      <EffectComposer>
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function SaturnGarden() {
  // Al cargarse de forma dinámica, R3F a veces mide el contenedor antes de que
  // tenga tamaño y deja el canvas en 300x150. Forzamos una remedición tras el
  // primer frame para que ocupe toda la pantalla en la carga inicial.
  useEffect(() => {
    const fire = () => window.dispatchEvent(new Event("resize"));
    // Doble disparo: tras el primer frame y tras un pequeño retardo, para cubrir
    // el orden en que R3F engancha su listener de medición.
    const raf = requestAnimationFrame(fire);
    const timer = setTimeout(fire, 200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-[#0a1426]">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
      >
        <Scene />
      </Canvas>
      {/* Velo sutil para que el texto del chat siga legible. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a1426]/85 via-[#0a1426]/30 to-[#0a1426]/55" />
    </div>
  );
}
