"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

/** Water plane with impact ripple + subtle continuous motion */
function WaterPlane({ hitAt }: { hitAt: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHitT: { value: 0 },
      uHitActive: { value: 0 },
      uColorDeep: { value: new THREE.Color("#05070c") },
      uColorShallow: { value: new THREE.Color("#0b2a3f") },
    }),
    [],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    if (hitAt > 0) {
      const s = (performance.now() - hitAt) / 1000;
      uniforms.uHitT.value = Math.max(0, s);
      uniforms.uHitActive.value = 1;
    } else {
      uniforms.uHitActive.value = 0;
    }
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.9, 0]} receiveShadow>
      <planeGeometry args={[8, 8, 256, 256]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          varying float vWave;
          uniform float uTime;
          uniform float uHitT;
          uniform float uHitActive;

          float ripple(vec2 uv, float t) {
            vec2 p = uv - 0.5;
            float r = length(p);
            float w = sin(42.0 * r - 6.5 * t) * exp(-2.8 * r) * exp(-0.75 * t);
            return w;
          }

          void main() {
            vUv = uv;
            vec3 pos = position;

            float base = sin((pos.x * 1.8 + uTime * 0.85)) * 0.006
                       + cos((pos.y * 1.6 + uTime * 0.75)) * 0.006;

            float hit = 0.0;
            if (uHitActive > 0.5) {
              hit = ripple(vUv, uHitT) * 0.095;
            }

            pos.z += base + hit;
            vWave = base + hit;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec2 vUv;
          varying float vWave;
          uniform vec3 uColorDeep;
          uniform vec3 uColorShallow;

          void main() {
            float d = distance(vUv, vec2(0.5));
            float vignette = smoothstep(0.98, 0.28, d);

            float band = smoothstep(0.02, 0.0, abs(vUv.y - 0.52)) * 0.35;

            vec3 col = mix(uColorDeep, uColorShallow, vignette);
            col += band;

            col += vec3(0.18, 0.25, 0.35) * (abs(vWave) * 5.2);

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/** Refractive reflective droplet */
function Droplet({
  hitAt,
  onHit,
}: {
  hitAt: number;
  onHit: (t: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
  }, []);

  useFrame(() => {
    const t = (performance.now() - startRef.current) / 1000;

    const appear = Math.min(1, t / 0.5);
    const settleY = THREE.MathUtils.lerp(0.28, 0.06, easeOutCubic(appear));

    const dropT = Math.max(0, t - 1.2);
    const dropping = dropT > 0;

    let y = settleY;
    if (dropping) y = 0.06 - 1.65 * (dropT * dropT);

    meshRef.current.position.y = y;

    if (hitAt === 0 && y <= -0.75) onHit(performance.now());

    meshRef.current.rotation.y = t * 0.65;
    meshRef.current.rotation.x = Math.sin(t * 1.1) * 0.05;

    if (hitAt > 0) {
      const since = (performance.now() - hitAt) / 1000;
      meshRef.current.scale.setScalar(Math.max(0, 1 - since * 1.25));
    } else {
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(0.88, 1.0, appear));
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.55, 128, 128]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={1.05}
        ior={1.33}
        roughness={0.02}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.02}
        envMapIntensity={1.9}
        color={"#dff4ff"}
      />
    </mesh>
  );
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function Scene({ onDone }: { onDone: () => void }) {
  const [hitAt, setHitAt] = useState<number>(0);

  useEffect(() => {
    if (!hitAt) return;
    const t = window.setTimeout(onDone, 900);
    return () => window.clearTimeout(t);
  }, [hitAt, onDone]);

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[2.5, 3.5, 2.0]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-2, 1.2, 1.6]} intensity={0.9} />

      <Environment preset="studio" />

      <Droplet hitAt={hitAt} onHit={setHitAt} />
      <WaterPlane hitAt={hitAt} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.85} intensity={0.85} />
      </EffectComposer>

      <OrbitControls enabled={false} />
    </>
  );
}

export function IntroSplash3D() {
  const [show, setShow] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="splash3d"
          className="fixed inset-0 z-[9999] bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-label="Loading ETHUB"
        >
          <Canvas
            shadows
            camera={{ position: [0, 0.65, 2.4], fov: 40 }}
            dpr={[1, 2]}
          >
            <color attach="background" args={["#05070c"]} />
            <fog attach="fog" args={["#05070c", 2.0, 6.0]} />
            <Scene onDone={() => setShow(false)} />
          </Canvas>

          {/* ETHUB overlay */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="select-none text-center">
              <div className="text-3xl sm:text-4xl font-semibold tracking-[0.45em] text-white drop-shadow-[0_0_22px_rgba(99,102,241,0.75)] animate-[hueSpin_5s_linear_infinite]">
                ETHUB
              </div>
              <div className="mt-2 text-[10px] sm:text-xs tracking-[0.25em] text-white/75">
                Loading your workspace
              </div>
            </div>
          </div>

          <style jsx global>{`
            @keyframes hueSpin {
              0% { filter: hue-rotate(0deg) saturate(1.25); }
              100% { filter: hue-rotate(360deg) saturate(1.25); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
