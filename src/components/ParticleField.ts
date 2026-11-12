import * as THREE from 'three';

export class ParticleField extends THREE.Object3D {
  private particles: THREE.Points;
  private particleCount = 120;
  private positions: Float32Array;
  private velocities: Float32Array;

  constructor() {
    super();

    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      // Spread around storybook area: x: [-1.2, 1.2], y: [0.8, 2.0], z: [-0.6, -1.6]
      this.positions[i3] = (Math.random() - 0.5) * 2.4;
      this.positions[i3 + 1] = 0.8 + Math.random() * 1.3;
      this.positions[i3 + 2] = -0.7 - Math.random() * 0.9;

      this.velocities[i3] = (Math.random() - 0.5) * 0.003;
      this.velocities[i3 + 1] = 0.001 + Math.random() * 0.003;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Create a circular glowing sprite canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 230, 1)');
      grad.addColorStop(0.3, 'rgba(255, 220, 130, 0.8)');
      grad.addColorStop(0.8, 'rgba(255, 180, 80, 0.2)');
      grad.addColorStop(1, 'rgba(255, 150, 50, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.045,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xfff2a3,
    });

    this.particles = new THREE.Points(geometry, material);
    this.add(this.particles);
  }

  public update(): void {
    const posAttr = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      array[i3] += this.velocities[i3];
      array[i3 + 1] += this.velocities[i3 + 1];
      array[i3 + 2] += this.velocities[i3 + 2];

      // Respawn if too high or drifted away
      if (array[i3 + 1] > 2.2) {
        array[i3 + 1] = 0.8;
        array[i3] = (Math.random() - 0.5) * 2.2;
        array[i3 + 2] = -0.7 - Math.random() * 0.9;
      }
    }

    posAttr.needsUpdate = true;
  }

  public dispose(): void {
    this.particles.geometry.dispose();
    if (Array.isArray(this.particles.material)) {
      this.particles.material.forEach((m) => m.dispose());
    } else {
      this.particles.material.dispose();
    }
  }
}
