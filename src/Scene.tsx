import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface TetrahedronProps {
    position: [number, number, number];
  }
  
  const Tetrahedron: React.FC<TetrahedronProps> = ({ position }) => {
    const meshRef = useRef<Mesh>(null);
  
    // Animation logic for rotation
    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
      }
    });
  
    return (
      <mesh ref={meshRef} position={position}>
        <tetrahedronGeometry args={[1, 0]} /> {/* Adjusted size for visibility */}
        <meshStandardMaterial color={'hotpink'} /> {/* Changed color to hotpink */}
      </mesh>
    );
  };
  
  const Scene: React.FC = () => {
    return (
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Tetrahedron position={[0, 0, 0]} />
      </Canvas>
    );
  };
export default Scene;
