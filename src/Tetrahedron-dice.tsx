import React, { useRef, useEffect, useState } from 'react';
import { Mesh, Vector3, Quaternion, BufferGeometry } from 'three';
import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

interface TextProps {
    position: Vector3;
    quaternion: Quaternion;
    text: string;
}

const TetrahedronText: React.FC<TextProps> = ({ position, quaternion, text }) => {
    return (
        <Text
            position={[position.x, position.y, position.z]}
            quaternion={quaternion}
            fontSize={0.3}
            color="black"
            anchorX="center"
            anchorY="middle"
        >
            {text}
        </Text>
    );
};

// Define an interface for the component props
interface TetrahedronProps {
    position: Vector3;  // Tuple type for position
    color: string;                      // Type for color prop
}

const TetrahedronDice: React.FC<TetrahedronProps> = ({ position, color }) => {
    const meshRef = useRef<Mesh>(null);
    const [texts, setTexts] = useState<Array<{ position: Vector3, quaternion: Quaternion, text: string }>>([]);
    const [diceValue, setDiceValue] = useState<number>(1);  // Assuming dice value management here
    const { camera } = useThree(); // Access the camera from the react-three-fiber context

    function extractVertices(geometry: BufferGeometry): Vector3[] {
        const positions = geometry.attributes.position.array;
        const vertices: Vector3[] = [];
        for (let i = 0; i < positions.length; i += 3) {
            vertices.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
        }
        return vertices;
    }

    function getFacesConfig(vertices: Vector3[]): Vector3[][] {
        return [
            [vertices[0], vertices[1], vertices[2]], // Face 1
            [vertices[0], vertices[1], vertices[3]], // Face 2
            [vertices[0], vertices[2], vertices[3]], // Face 3
            [vertices[1], vertices[2], vertices[3]], // Face 4
        ];
    }

    function getFaceVertices(geometry: BufferGeometry, diceValue: number): Vector3[] {
        const vertices = extractVertices(geometry);
        const facesConfig = getFacesConfig(vertices);
        return facesConfig[diceValue - 1]; // diceValue is assumed to be 1-indexed
    }

    // Function to calculate the centroid of the tetrahedron
    function calculateCentroid(geometry: BufferGeometry): Vector3 {
        const vertices = extractVertices(geometry);
        const centroid = new Vector3(
            (vertices[0].x + vertices[1].x + vertices[2].x + vertices[3].x) / 4,
            (vertices[0].y + vertices[1].y + vertices[2].y + vertices[3].y) / 4,
            (vertices[0].z + vertices[1].z + vertices[2].z + vertices[3].z) / 4,
        );
        return centroid;
    }

    // Function to calculate the center of a face given vertices
    function calculateFaceCenter(vertices: Vector3[]): Vector3 {
        const faceCenter = new Vector3(
            (vertices[0].x + vertices[1].x + vertices[2].x) / 3,
            (vertices[0].y + vertices[1].y + vertices[2].y) / 3,
            (vertices[0].z + vertices[1].z + vertices[2].z) / 3,
        );
        return faceCenter;
    }

    function calculateNormalAndOrientation(face: Vector3[], centroid: Vector3): Vector3 {
        const edge1 = new Vector3().subVectors(face[1], face[0]);
        const edge2 = new Vector3().subVectors(face[2], face[0]);
        let normal = new Vector3().crossVectors(edge1, edge2).normalize();
    
        const faceCenter = new Vector3(
            (face[0].x + face[1].x + face[2].x) / 3,
            (face[0].y + face[1].y + face[2].y) / 3,
            (face[0].z + face[1].z + face[2].z) / 3,
        );
        const toCentroid = new Vector3().subVectors(centroid, faceCenter);
        if (normal.dot(toCentroid) > 0) {
            normal.negate(); // Reverse the direction if it's pointing inward
        }
        return normal;
    }

    function calculateTextOffsetPosition(faceCenter: Vector3, normal: Vector3): Vector3 {
        return faceCenter.add(normal.multiplyScalar(0.0001)); // Adjust scalar for better visibility
    }
    
    function calculateTextOrientation(faceCenter: Vector3, centroid: Vector3, vertex: Vector3): Quaternion {
        const directionFromCentroid = new Vector3().subVectors(faceCenter, centroid).normalize();
        const quaternionZ = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), directionFromCentroid);
    
        const vectorY = new Vector3(0, 1, 0);
        vectorY.applyQuaternion(quaternionZ); // Rotate the y-axis to the face's normal
    
        const directionToVertex = new Vector3().subVectors(vertex, faceCenter).normalize();
        const quaternionY = new Quaternion().setFromUnitVectors(vectorY, directionToVertex);
    
        quaternionY.multiply(quaternionZ);
        return quaternionY;
    }

    // Direct the mesh to face the camera
    useEffect(() => {
        if (meshRef.current && camera) {
            const geometry = meshRef.current.geometry;
            const centroid = calculateCentroid(geometry);
            const faceVertices = getFaceVertices(geometry, 1); // Assuming diceValue 1 corresponds to face 1
            const faceCenter = calculateFaceCenter(faceVertices);
            const normal = calculateNormalAndOrientation(faceVertices, centroid);
        
            // Calculate the vector pointing from face center to the camera
            const cameraPosition = new Vector3().setFromMatrixPosition(camera.matrixWorld);
            const toCamera = new Vector3().subVectors(cameraPosition, centroid).normalize();
        
            // Calculate the quaternion to align the face normal to the camera direction
            const alignQuaternion = new Quaternion().setFromUnitVectors(normal, toCamera);
        
            // Calculate the quaternion to rotate the face's local Y-axis to the global Y-axis
            const globalY = new Vector3(0, 1, 0);
            const localY = faceVertices[0].clone().sub(faceCenter).normalize(); // Use faceCenter to faceVertices[0] vector
            localY.applyQuaternion(alignQuaternion).normalize(); // Rotate the local Y-axis to the camera direction
            const rotateYQuaternion = new Quaternion().setFromUnitVectors(localY, globalY);
        
            // Combine both quaternions to achieve desired orientation
            const finalQuaternion = new Quaternion();
            finalQuaternion.multiply(rotateYQuaternion).multiply(alignQuaternion);
        
            meshRef.current.quaternion.copy(finalQuaternion);
        }
    }, [camera.position]); // React on camera movement

    // Set the texts on the faces of the tetrahedron
    useEffect(() => {
        if (meshRef.current) {
            const geometry = meshRef.current.geometry;
            const centroid = calculateCentroid(geometry);
            const positions = geometry.attributes.position.array;
    
            const vertices = [];
            for (let i = 0; i < positions.length; i += 3) {
                vertices.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
            }
    
            const facesConfig = getFacesConfig(vertices);
    
            const newTexts = facesConfig.map((face, index) => {
                const normal = calculateNormalAndOrientation(face, centroid);
                const faceCenter = calculateFaceCenter(face);
                const offsetPosition = calculateTextOffsetPosition(faceCenter, normal);
                const quaternion = calculateTextOrientation(faceCenter, centroid, face[0]);
    
                return {
                    position: offsetPosition,
                    quaternion: quaternion,
                    text: `${index + 1}`
                };
            });
    
            setTexts(newTexts);
        }
    }, []);

    // Handle dice rotation on click
    const [isRotating, setIsRotating] = useState(false);
    const [rotationProgress, setRotationProgress] = useState(0);

    const handleRotationClick = () => {
        if (!isRotating) {  // Check if the animation is not already running
            setIsRotating(true);
            setRotationProgress(0); // Reset rotation progress
        }
    };

    useFrame((state, delta) => {
        if (isRotating && meshRef.current) {
            const duration = 3; // Duration in seconds
            const rotationAmount = Math.PI; // 180 degrees in radians
            setRotationProgress(prev => {
                const newProgress = prev + (delta / duration);
                if (newProgress >= 1) {
                    setIsRotating(false); // Stop the rotation
                    return 1; // Clamp at 100% progress
                }
                return newProgress;
            });

            // Apply the rotation
            meshRef.current.rotation.y += (rotationAmount * delta) / duration;
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={handleRotationClick}
        >
            <tetrahedronGeometry args={[1, 0]} />  
            <meshStandardMaterial color={color ? color : ''} />
            {texts.map((textProps, index) => (
                <TetrahedronText
                    key={`text-${index}`}
                    position={textProps.position}
                    quaternion={textProps.quaternion}
                    text={textProps.text}
                />
            ))}
            <axesHelper args={[3]} />
        </mesh>
    );
};

export default TetrahedronDice;
