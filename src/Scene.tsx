import React from 'react';
import { Canvas} from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'
import TetrahedronDice from './Tetrahedron-dice';
import { Vector3 } from 'three';


const Scene: React.FC = () => {
  return (
    <Canvas>
      <ambientLight intensity={1} />
      <directionalLight position={new Vector3(2, 2, 0)} intensity={Math.PI} />
      <directionalLight position={new Vector3(2, 1, 2)} intensity={Math.PI/2} />
      <TetrahedronDice
        position={new Vector3(0, 0, 0)}
        color="lightblue"
      />
    </Canvas>
  );
};

export default Scene;
