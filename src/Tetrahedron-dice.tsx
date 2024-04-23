import React, { useRef, useEffect, useState } from 'react';
import { Mesh, Vector3, Euler, Quaternion } from 'three';
import { Text } from '@react-three/drei';

interface TextProps {
    position: [number, number, number];
    rotation: Euler;
    text: string;
}

const TetrahedronText: React.FC<TextProps> = ({ position, rotation, text }) => {
    return (
        <Text
            position={position}
            rotation={rotation}
            fontSize={0.3}
            color="black"
            anchorX="center"
            anchorY="middle"
        >
            {text}
        </Text>
    );
};

interface TetrahedronProps {
    position: [number, number, number];
}

const TetrahedronDice: React.FC<TetrahedronProps> = ({ position }) => {
    const meshRef = useRef<Mesh>(null);
    const [texts, setTexts] = useState<Array<{ position: [number, number, number], rotation: Euler, text: string }>>([]);

    useEffect(() => {
        if (meshRef.current) {
            const geometry = meshRef.current.geometry;
            const positions = geometry.attributes.position.array;

            const vertices = [];
            for (let i = 0; i < positions.length; i += 3) {
                vertices.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
            }

            // Assuming vertices[4] is the centroid or any point inside the tetrahedron for reference
            const centroid = new Vector3(
                (vertices[0].x + vertices[1].x + vertices[2].x + vertices[3].x) / 4,
                (vertices[0].y + vertices[1].y + vertices[2].y + vertices[3].y) / 4,
                (vertices[0].z + vertices[1].z + vertices[2].z + vertices[3].z) / 4,
            );

            const facesConfig = [
                [vertices[0], vertices[1], vertices[2]], // Face 1
                [vertices[0], vertices[1], vertices[3]], // Face 2
                [vertices[1], vertices[2], vertices[3]], // Face 3
                [vertices[0], vertices[2], vertices[3]]  // Face 4
            ];

            const newTexts = facesConfig.map((face, index) => {
                const edge1 = new Vector3().subVectors(face[1], face[0]);
                const edge2 = new Vector3().subVectors(face[2], face[0]);
                let normal = new Vector3().crossVectors(edge1, edge2).normalize();

                // Check if the normal is pointing towards the centroid, if so, invert it
                const faceCenter = new Vector3(
                    (face[0].x + face[1].x + face[2].x) / 3,
                    (face[0].y + face[1].y + face[2].y) / 3,
                    (face[0].z + face[1].z + face[2].z) / 3,
                );
                const toCentroid = new Vector3().subVectors(centroid, faceCenter);
                if (normal.dot(toCentroid) > 0) {
                    normal.negate(); // Reverse the direction if it's pointing inward
                }

                const offsetPosition = faceCenter.add(normal.multiplyScalar(0.1)); // Adjust scalar for better visibility
                const position: [number, number, number] = [
                    offsetPosition.x,
                    offsetPosition.y,
                    offsetPosition.z,
                ];
                const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);

                return {
                    position,
                    rotation: new Euler().setFromQuaternion(quaternion),
                    text: `Face ${index + 1}`
                };
            });

            setTexts(newTexts); // Update the state with the new texts
        }
    }, []);

    return (
        <mesh ref={meshRef} position={position}>
            <tetrahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color='orange' />
            {texts.map((textProps, index) => (
                <mesh
                key={`sphere-${index}`}
                position={textProps.position}
            >
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="blue" />
            </mesh>
            ))}
        </mesh>
    );
};

export default TetrahedronDice;
