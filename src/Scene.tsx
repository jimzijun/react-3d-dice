import React from 'react';
import { Canvas} from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'
import TetrahedronDice from './Tetrahedron-dice';


const Scene: React.FC = () => {
  return (
    <Canvas>
      <ambientLight intensity={1} />
      <directionalLight position={[2, 2, 0]} intensity={Math.PI} />
      <directionalLight position={[2, 0, 2]} intensity={Math.PI/2} />
      <TetrahedronDice position={[0, 0, 0]} />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
