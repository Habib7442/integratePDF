'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Box, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'

// PDF Document representation
function PDFDocument({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  return (
    <group position={position}>
      <Box ref={meshRef} args={[1.2, 1.6, 0.1]} castShadow>
        <meshStandardMaterial color="#ef4444" />
      </Box>
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        PDF
      </Text>
    </group>
  )
}

// Data particles flowing from PDF to Notion
function DataParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = useMemo(() => {
    const positions = new Float32Array(50 * 3)
    const colors = new Float32Array(50 * 3)
    
    for (let i = 0; i < 50; i++) {
      // Start from PDF position and flow to Notion position
      const t = i / 50
      positions[i * 3] = -3 + t * 6 // x: from -3 to 3
      positions[i * 3 + 1] = Math.sin(t * Math.PI * 2) * 0.5 // y: wave pattern
      positions[i * 3 + 2] = 0 // z: flat
      
      // Color gradient from red to blue
      colors[i * 3] = 1 - t // red
      colors[i * 3 + 1] = t * 0.5 // green
      colors[i * 3 + 2] = t // blue
    }
    
    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < 50; i++) {
        const t = (i / 50 + state.clock.elapsedTime * 0.2) % 1
        positions[i * 3] = -3 + t * 6
        positions[i * 3 + 1] = Math.sin(t * Math.PI * 4 + state.clock.elapsedTime) * 0.3
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={50}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={50}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} />
    </points>
  )
}

// Notion Database representation
function NotionDatabase({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + Math.PI) * 0.1
    }
  })

  return (
    <group position={position}>
      <Box ref={meshRef} args={[1.4, 1, 0.2]} castShadow>
        <meshStandardMaterial color="#0ea5e9" />
      </Box>
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        NOTION
      </Text>
    </group>
  )
}

// Connection line between PDF and Notion
function ConnectionLine() {
  const points = useMemo(() => [
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(-1, 0.3, 0),
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(1, 0.3, 0),
    new THREE.Vector3(2, 0, 0)
  ], [])

  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={3}
      transparent
      opacity={0.6}
    />
  )
}

// Main 3D Scene
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* 3D Elements */}
      <PDFDocument position={[-3, 0, 0]} />
      <NotionDatabase position={[3, 0, 0]} />
      <ConnectionLine />
      <DataParticles />
      
      {/* Ground plane for shadows */}
      <mesh receiveShadow position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial transparent opacity={0.1} />
      </mesh>
    </>
  )
}

// Main component
export function PDFFlowVisualization() {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45 }}
        shadows
        className="w-full h-full"
      >
        <Scene />
      </Canvas>
    </div>
  )
}
