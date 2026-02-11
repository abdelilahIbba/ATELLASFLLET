import React, { useLayoutEffect, Suspense, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera, ContactShadows, SpotLight, useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/ferrari.glb';

interface SceneProps {
  isDark: boolean;
}

const RealisticCar = ({ isDark, ...props }: any) => {
  const { scene } = useGLTF(MODEL_URL);
  
  // Refs for animating materials
  const paintRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  useLayoutEffect(() => {
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        
        const name = obj.name.toLowerCase();
        
        // --- ADAPTIVE PAINT MATERIAL ---
        if (name === 'body' || name.includes('paint') || name.includes('chassis')) {
          obj.material = new THREE.MeshPhysicalMaterial({
            // Dark Mode: Frozen Silver
            // Light Mode: Deep Navy Blue
            color: isDark ? '#e2e8f0' : '#0F172A', 
            metalness: isDark ? 0.8 : 0.8,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: isDark ? 1.0 : 2.0, 
          });
          paintRef.current = obj.material;
        }
        // --- GLASS ---
        else if (name.includes('glass') || name.includes('window')) {
          obj.material = new THREE.MeshPhysicalMaterial({
            color: '#000000',
            metalness: 1,
            roughness: 0,
            transmission: 0.2,
            opacity: 0.9,
          });
        }
        // --- CALIPERS ---
        else if (name.includes('caliper')) {
           obj.material = new THREE.MeshStandardMaterial({
               // Brand RED calipers
               color: '#DC2626',
               metalness: 0.5,
               roughness: 0.4,
               emissive: '#991B1B',
               emissiveIntensity: 0.5,
           });
        }
        // --- RIMS/CHROME ---
        else if (name.includes('chrome') || name.includes('rim') || name.includes('wheel')) {
          obj.material = new THREE.MeshStandardMaterial({
            color: isDark ? '#ffffff' : '#cbd5e1',
            metalness: 1.0,
            roughness: 0.1,
            envMapIntensity: 2.0
          });
        }
      }
    });
  }, [scene, isDark]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Idle Rotation Animation
    // Smooth, slow yaw rotation to show off angles
    scene.rotation.y = (3 * Math.PI / 4) + Math.sin(t * 0.2) * 0.15; 
    
    // Subtle Pitch/Roll for "floating" feel (in addition to <Float>)
    scene.rotation.z = Math.sin(t * 0.5) * 0.01;

    // Material Shimmering Effect
    if (paintRef.current) {
       // Oscillate environment map intensity to simulate light playing across the surface
       const baseEnvMap = isDark ? 1.0 : 2.0;
       paintRef.current.envMapIntensity = baseEnvMap + Math.sin(t * 1.5) * 0.3;
       
       // Subtle breathing of clearcoat roughness
       paintRef.current.clearcoatRoughness = 0.1 + Math.sin(t * 0.5) * 0.05;
    }
  });

  return <primitive object={scene} {...props} />;
};

useGLTF.preload(MODEL_URL);

const SceneContent = ({ isDark }: SceneProps) => {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const isTablet = size.width >= 768 && size.width < 1024;
  
  const scale = isMobile ? 0.85 : (isTablet ? 1.0 : 1.4);
  const position: [number, number, number] = isMobile 
    ? [0, -1.2, 0] 
    : [2.6, -1.0, 0];

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={isMobile ? [0, 2, 6] : [0, 1.5, 7]} 
        fov={isMobile ? 45 : 35} 
      />
      
      <OrbitControls 
        enablePan={false}
        enableZoom={false} 
        minPolarAngle={Math.PI / 2.8} 
        maxPolarAngle={Math.PI / 2.1}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        dampingFactor={0.05}
        enableDamping={true}
      />

      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
        <group position={position} rotation={[0, 0, 0]}>
          <RealisticCar scale={scale} isDark={isDark} />
        </group>
      </Float>
      
      <Environment preset={isDark ? "night" : "city"} blur={0.8} />

      {/* Dynamic Lighting */}
      {/* Main Key Light */}
      <SpotLight 
        position={[10, 10, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={isDark ? 3 : 5} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
        color="#ffffff"
      />

      {/* Rim Light - Brand Teal */}
      <SpotLight 
        position={[-5, 5, -5]} 
        angle={0.5} 
        penumbra={1} 
        intensity={isDark ? 15 : 12} 
        color="#0D9488" 
        distance={20}
      />
      
      {/* Fill Light - Brand Blue */}
      <SpotLight 
        position={[-5, 2, 5]} 
        angle={1} 
        penumbra={1} 
        intensity={3} 
        color="#2563EB" 
      />

      <ContactShadows 
        position={[0, isMobile ? -1.2 : -1.0, 0]} 
        opacity={isDark ? 0.6 : 0.7} 
        scale={20} 
        blur={2.5} 
        far={4} 
        resolution={512} 
        color={isDark ? "#000000" : "#0F172A"} 
      />
    </>
  );
};

const HeroScene: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: isDark ? 1.0 : 1.5,
          powerPreference: "high-performance"
        }}
      >
        <fog attach="fog" args={[isDark ? '#020617' : '#FFFFFF', 5, 30]} />
        <Suspense fallback={null}>
           <SceneContent isDark={isDark} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroScene;