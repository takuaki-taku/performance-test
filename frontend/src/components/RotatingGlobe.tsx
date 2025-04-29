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
    <div className="relative h-[50vh] w-full">
      <Canvas frameloop="always">
        <Suspense fallback={null}>
          <Globe />
          <OrbitControls enableZoom={false} enablePan={false} />
          <Stars />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-white text-lg font-bold mb-2">クリックして柔軟性チェックを始めましょう</p>
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 mx-auto text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  )
} 