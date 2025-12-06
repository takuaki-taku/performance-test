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
  const texture = useLoader(TextureLoader, '/images/toppagephoto.png')

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
    const height = 5
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
      onClick={() => router.push('/training/flexibility')}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <planeGeometry args={planeArgs} /> {/* ← これを追加！ */}
      <meshBasicMaterial
        map={texture}
        side={DoubleSide}
        toneMapped={false}
        transparent={true}
        opacity={1}
      />
    </mesh>
  )
}

export default function RotatingGlobe() {
  return (
    <Canvas
      frameloop="always"
      gl={{ alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Globe />
        <OrbitControls enableZoom={false} enablePan={false} />
        <Stars />
      </Suspense>
    </Canvas>
  )
}