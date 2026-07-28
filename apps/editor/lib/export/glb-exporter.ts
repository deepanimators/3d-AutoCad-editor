import type { Object3D } from 'three'

export async function exportSceneAsGLB(root: Object3D): Promise<Blob> {
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js')
  const exporter = new GLTFExporter()

  return new Promise((resolve, reject) => {
    exporter.parse(
      root,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(new Blob([result], { type: 'model/gltf-binary' }))
        } else {
          reject(new Error('GLTFExporter returned JSON instead of binary; pass binary: true'))
        }
      },
      (error) => reject(error),
      { binary: true },
    )
  })
}
