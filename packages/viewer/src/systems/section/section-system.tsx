import { type SectionNode, useScene } from '@aruct/core'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  ArrowHelper,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Line,
  LineDashedMaterial,
  MeshBasicMaterial,
  Plane,
  PlaneGeometry,
  Vector3,
} from 'three'
import useViewer from '../../store/use-viewer'

// ─── Scratch vectors (allocated once, reused each frame) ─────────────────────

const _normal = new Vector3()
const _point = new Vector3()
const _quatFrom = new Vector3(0, 0, 1)
const _cutDir = new Vector3()
const _localY = new Vector3()
const _up = new Vector3(0, 1, 0)
const _right = new Vector3(1, 0, 0)

// ─── Clipping plane controller ───────────────────────────────────────────────

/**
 * Reads `sectionViewPlaneId` from the viewer store and applies (or removes) a
 * THREE.Plane clipping plane on the WebGL renderer each frame.
 */
const SectionClipController = () => {
  const gl = useThree((state) => state.gl)
  const planeRef = useRef(new Plane())

  useFrame(() => {
    const sectionViewPlaneId = useViewer.getState().sectionViewPlaneId
    if (!sectionViewPlaneId) {
      if (gl.clippingPlanes.length > 0) {
        gl.clippingPlanes = []
        gl.localClippingEnabled = false
      }
      return
    }

    const nodes = useScene.getState().nodes
    const section = nodes[sectionViewPlaneId as SectionNode['id']] as SectionNode | undefined
    if (!section) {
      if (gl.clippingPlanes.length > 0) {
        gl.clippingPlanes = []
        gl.localClippingEnabled = false
      }
      return
    }

    const [nx, ny, nz] = section.planeNormal
    const [px, py, pz] = section.planePosition
    _normal.set(nx, ny, nz).normalize()
    _point.set(px, py, pz)
    // Plane equation: normal · x + constant = 0  → constant = -normal · point
    planeRef.current.set(_normal, -_normal.dot(_point))

    gl.localClippingEnabled = true
    gl.clippingPlanes = [planeRef.current]
  })

  return null
}

// ─── Active cut-plane indicator ───────────────────────────────────────────────

/**
 * Renders a translucent blue quad at the active section cut position.  Shown
 * only when `sectionViewPlaneId` is set.
 */
const ActiveCutPlaneIndicator = () => {
  const sectionViewPlaneId = useViewer((s) => s.sectionViewPlaneId)
  const groupRef = useRef<Group>(null)

  const geometry = useMemo(() => new PlaneGeometry(1, 1), [])
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0x4488ff,
        opacity: 0.18,
        transparent: true,
        side: DoubleSide,
        depthWrite: false,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const id = useViewer.getState().sectionViewPlaneId
    if (!id) {
      group.visible = false
      return
    }

    const nodes = useScene.getState().nodes
    const section = nodes[id as SectionNode['id']] as SectionNode | undefined
    if (!section) {
      group.visible = false
      return
    }

    const [px, py, pz] = section.planePosition
    const [nx, ny, nz] = section.planeNormal
    _normal.set(nx, ny, nz).normalize()

    group.position.set(px, py, pz)
    group.scale.set(section.width, section.height, 1)

    // Orient the plane mesh so its face aligns with the section normal.
    // PlaneGeometry faces +Z by default; setFromUnitVectors rotates that to _normal.
    group.quaternion.setFromUnitVectors(_quatFrom, _normal)
    group.visible = true
  })

  if (!sectionViewPlaneId) return null

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={material} />
    </group>
  )
}

// ─── Per-section marker (dashed cut-line + arrow) ─────────────────────────────

type SectionMarkerProps = {
  sectionId: string
  isActive: boolean
}

/** Builds a dashed line representing the cut edge across `width`. */
function buildCutLineGeometry(width: number): BufferGeometry {
  const half = width / 2
  const geom = new BufferGeometry()
  geom.setAttribute(
    'position',
    new Float32BufferAttribute([-half, 0, 0, half, 0, 0], 3),
  )
  return geom
}

const SectionMarker = ({ sectionId, isActive }: SectionMarkerProps) => {
  const groupRef = useRef<Group>(null)
  const lineRef = useRef<Line | null>(null)
  const arrowRef = useRef<ArrowHelper | null>(null)
  const prevWidthRef = useRef<number>(-1)

  const color = isActive ? 0x2266ff : 0x888888

  // Create the dashed line and arrow once on mount, attach to the group.
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    const mat = new LineDashedMaterial({
      color,
      dashSize: 0.3,
      gapSize: 0.15,
      linewidth: 1,
    })
    const geom = buildCutLineGeometry(20) // width corrected on first frame
    const line = new Line(geom, mat)
    line.computeLineDistances()
    lineRef.current = line
    group.add(line)

    const arrow = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 1.2, color, 0.4, 0.2)
    arrowRef.current = arrow
    group.add(arrow)

    return () => {
      mat.dispose()
      geom.dispose()
      lineRef.current = null
      arrowRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const nodes = useScene.getState().nodes
    const section = nodes[sectionId as SectionNode['id']] as SectionNode | undefined
    if (!section) return

    const [px, py, pz] = section.planePosition
    const [nx, ny, nz] = section.planeNormal
    _normal.set(nx, ny, nz).normalize()

    // Orient the group so local +X = cut-line direction, local +Z = normal.
    const tangent = Math.abs(_normal.dot(_up)) < 0.9 ? _up : _right
    const cutDir = _cutDir.crossVectors(tangent, _normal).normalize()
    const localY = _localY.crossVectors(_normal, cutDir).normalize()
    group.matrixAutoUpdate = false
    group.matrix.makeBasis(cutDir, localY, _normal)
    group.matrix.setPosition(px, py, pz)
    group.matrixWorldNeedsUpdate = true

    // Rebuild line geometry when width changes
    const line = lineRef.current
    if (line && section.width !== prevWidthRef.current) {
      line.geometry.dispose()
      line.geometry = buildCutLineGeometry(section.width)
      line.computeLineDistances()
      prevWidthRef.current = section.width
    }
    // Arrow is a child of the group whose local +Z already aligns to normal,
    // so no per-frame direction update is needed.
  })

  return <group ref={groupRef} />
}

// ─── All-sections markers container ──────────────────────────────────────────

const SectionMarkers = () => {
  const sectionViewPlaneId = useViewer((s) => s.sectionViewPlaneId)
  // Re-render when scene nodes change (sections added/removed)
  const nodes = useScene((s) => s.nodes)

  const sectionIds = useMemo(() => {
    return Object.values(nodes)
      .filter((n) => n?.type === 'section')
      .map((n) => n!.id)
  }, [nodes])

  return (
    <>
      {sectionIds.map((id) => (
        <SectionMarker key={id} sectionId={id} isActive={id === sectionViewPlaneId} />
      ))}
    </>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

/**
 * SectionSystem — mounts into the R3F canvas tree and handles:
 *
 * 1. Applying a THREE.Plane clipping plane to the renderer when
 *    `useViewer.sectionViewPlaneId` is set.
 * 2. Showing a translucent blue indicator at the active cut position.
 * 3. Rendering a dashed line + arrow marker for every section node in the
 *    scene (active section is highlighted in blue, inactive in grey).
 */
export const SectionSystem = () => {
  return (
    <>
      <SectionClipController />
      <ActiveCutPlaneIndicator />
      <SectionMarkers />
    </>
  )
}
