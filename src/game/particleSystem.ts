import { Particle } from '../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];
  private nextId: number = 0;
  private maxParticles: number = 160;

  public clear() {
    this.particles = [];
  }

  // Create feather puff when bird flaps
  public spawnFlapPuff(x: number, y: number, color: string) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 1.2;
      const speed = 30 + Math.random() * 50;
      this.particles.push({
        id: this.nextId++,
        x: x - 10 + (Math.random() - 0.5) * 8,
        y: y + 6 + (Math.random() - 0.5) * 6,
        vx: -Math.cos(angle) * speed - 20,
        vy: Math.sin(angle) * speed * 0.4,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
        size: 3 + Math.random() * 3,
        color,
        shape: Math.random() > 0.4 ? 'feather' : 'circle',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
      });
    }
  }

  // Create star sparkles when passing a pipe
  public spawnScoreSparkles(x: number, y: number, color: string = '#FDE047') {
    const count = 12;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 70 + Math.random() * 90;
      this.particles.push({
        id: this.nextId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.25,
        size: 3.5 + Math.random() * 3,
        color: i % 2 === 0 ? color : '#FFFFFF',
        shape: 'star',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10,
      });
    }
  }

  // Create golden milestone celebration fireworks
  public spawnMilestoneBurst(x: number, y: number) {
    const colors = ['#FBBF24', '#F43F5E', '#38BDF8', '#4ADE80', '#A855F7'];
    const count = 28;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 150;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        id: this.nextId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.65 + Math.random() * 0.4,
        size: 4 + Math.random() * 4,
        color,
        shape: Math.random() > 0.5 ? 'star' : 'circle',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
      });
    }
  }

  // Collision impact dust & sparks
  public spawnHitSparks(x: number, y: number) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 140;
      this.particles.push({
        id: this.nextId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.2,
        size: 2.5 + Math.random() * 3.5,
        color: Math.random() > 0.3 ? '#EF4444' : '#F59E0B',
        shape: 'circle',
        rotation: 0,
        vRot: 0,
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics update
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;

      // Friction & slight gravity
      p.vx *= 0.96;
      p.vy += 80 * dt;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      const alpha = Math.max(0, 1 - progress);
      const currentSize = p.size * (1 - progress * 0.4);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'circle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const spikes = 5;
        const outer = currentSize * 1.4;
        const inner = currentSize * 0.6;
        for (let j = 0; j < spikes * 2; j++) {
          const r = j % 2 === 0 ? outer : inner;
          const a = (j * Math.PI) / spikes;
          if (j === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'feather') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, currentSize * 1.8, currentSize * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
