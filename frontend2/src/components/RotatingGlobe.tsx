'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { TextureLoader, LinearFilter, ClampToEdgeWrapping, DoubleSide } from 'three'
import type { Mesh } from 'three'
import { Suspense, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** 地球儀メッシュ */
function Globe() {
  const ref = useRef<Mesh>(null!)
  const router = useRouter()
  const texture = useLoader(TextureLoader, '/images/toppagephoto.jpg')

  // NPOTテクスチャ対応: mipmaps無効化とラッピング設定
  useEffect(() => {
    texture.generateMipmaps = false
    texture.minFilter = LinearFilter
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.needsUpdate = true
  }, [texture])

  // 画像のアスペクト比に合わせて平面サイズを計算
  const planeArgs = useMemo<[number, number]>(() => {
    const img = texture.image as HTMLImageElement
    const aspect = img.width / img.height
    const height = 2
    const width = aspect * height
    // タプル型としてキャスト
    return [width, height] as [number, number]
  }, [texture])

  // 毎フレームY軸周りに回転抑揚をつける
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    // 基本速度（0.05）にサイン波で変化（±0.02）を追加
    const speed = 1 + Math.sin(time * 1.5) * 0.02
    ref.current.rotation.y += delta * speed
  })

  return (
    <mesh
      ref={ref}
      onClick={() => router.push('/flexibility')}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <planeGeometry args={planeArgs} />
      <meshBasicMaterial
        map={texture}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function RotatingGlobe() {
  return (
    <div className="w-full h-[60vh]">
      <Canvas frameloop="always" camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[0, 0, 5]} intensity={0.5} />

        <Suspense fallback={null}>
          <Globe />
        </Suspense>
        <OrbitControls enableZoom={false} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
      </Canvas>
    </div>
  )
} 