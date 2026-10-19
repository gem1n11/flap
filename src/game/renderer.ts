import { BirdSkin, EnvironmentTheme, PipePair } from '../types/game';
import { VIRTUAL_WIDTH, GROUND_HEIGHT } from '../physics/constants';

export class GameRenderer {
  private cloudOffset: number = 0;
  private mountainOffset: number = 0;
  private hillOffset: number = 0;
  private groundOffset: number = 0;
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private wingCycle: number = 0;

  public updateBackgrounds(dt: number, speed: number, isMoving: boolean) {
    if (!isMoving) return;
    this.cloudOffset = (this.cloudOffset + speed * 0.15 * dt) % VIRTUAL_WIDTH;
    this.mountainOffset = (this.mountainOffset + speed * 0.35 * dt) % VIRTUAL_WIDTH;
    this.hillOffset = (this.hillOffset + speed * 0.65 * dt) % VIRTUAL_WIDTH;
    this.groundOffset = (this.groundOffset + speed * dt) % 24; // 24px ground repeat
  }

  public updateAnimations(dt: number, isFlapping: boolean) {
    // Wing fluttering cycle
    if (isFlapping) {
      this.wingCycle += dt * 26;
    } else {
      this.wingCycle += dt * 8;
    }

    // Eye blinking logic
    this.blinkTimer += dt;
    if (this.blinkTimer > 3.8) {
      this.isBlinking = true;
      if (this.blinkTimer > 4.0) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }
  }

  // Draw Sky & celestial bodies dynamically adapted to any screen height
  public drawSky(
    ctx: CanvasRenderingContext2D,
    theme: EnvironmentTheme,
    virtualWidth: number,
    playableHeight: number
  ) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, playableHeight);
    skyGrad.addColorStop(0, theme.skyGradient[0]);
    skyGrad.addColorStop(1, theme.skyGradient[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, virtualWidth, playableHeight);

    // Sun / Moon with celestial glow
    ctx.save();
    if (theme.nightMode) {
      // Crescent glowing moon
      const moonX = virtualWidth - 65;
      const moonY = Math.min(105, playableHeight * 0.18);
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 45);
      moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
      moonGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 45, 0, Math.PI * 2);
      ctx.fill();

      // Moon body
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Soft stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const starPositions = [
        [40, 45], [95, 30], [160, 60], [240, 25], [310, 55], [370, 90],
        [70, 120], [190, 105], [280, 140], [30, 175], [130, 160], [330, 190]
      ];
      for (const [sx, sy] of starPositions) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Warm daytime sun
      const sunX = virtualWidth - 70;
      const sunY = Math.min(110, playableHeight * 0.19);
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 65);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
      sunGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.2)');
      sunGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Distant Clouds
    this.drawCloudLayer(ctx, theme.cloudColor, this.cloudOffset, virtualWidth);

    // Distant Mountains / Skyline
    this.drawMountainLayer(ctx, theme.mountainColor, this.mountainOffset, virtualWidth, playableHeight);

    // Midground rolling hills
    this.drawHillsLayer(ctx, theme.hillColor, this.hillOffset, virtualWidth, playableHeight);
  }

  private drawCloudLayer(ctx: CanvasRenderingContext2D, color: string, offset: number, virtualWidth: number) {
    ctx.save();
    ctx.fillStyle = color;
    const clouds = [
      { x: 50, y: 70, scale: 0.9 },
      { x: 220, y: 110, scale: 0.75 },
      { x: 380, y: 65, scale: 0.85 },
      { x: 540, y: 95, scale: 0.7 },
    ];

    for (const c of clouds) {
      let cx = (c.x - offset) % (virtualWidth + 140);
      if (cx < -70) cx += virtualWidth + 140;
      const cy = c.y;
      const s = c.scale;

      ctx.beginPath();
      ctx.arc(cx, cy, 18 * s, 0, Math.PI * 2);
      ctx.arc(cx + 14 * s, cy - 8 * s, 22 * s, 0, Math.PI * 2);
      ctx.arc(cx + 34 * s, cy - 4 * s, 18 * s, 0, Math.PI * 2);
      ctx.arc(cx + 46 * s, cy + 4 * s, 14 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawMountainLayer(
    ctx: CanvasRenderingContext2D,
    color: string,
    offset: number,
    virtualWidth: number,
    playableHeight: number
  ) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, playableHeight);

    // Repeated mountain silhouette
    const width = virtualWidth + 80;
    for (let x = -80; x <= width; x += 10) {
      const worldX = x + offset;
      const y = playableHeight - 75 - Math.sin(worldX * 0.015) * 35 - Math.cos(worldX * 0.008) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(virtualWidth, playableHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawHillsLayer(
    ctx: CanvasRenderingContext2D,
    color: string,
    offset: number,
    virtualWidth: number,
    playableHeight: number
  ) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, playableHeight);

    const width = virtualWidth + 60;
    for (let x = -60; x <= width; x += 8) {
      const worldX = x + offset;
      const y = playableHeight - 35 - Math.sin(worldX * 0.025) * 16 - Math.cos(worldX * 0.012) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(virtualWidth, playableHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw Ground with moving striped curb
  public drawGround(
    ctx: CanvasRenderingContext2D,
    theme: EnvironmentTheme,
    virtualWidth: number,
    virtualHeight: number,
    playableHeight: number
  ) {
    ctx.save();
    const groundY = playableHeight;
    const groundH = virtualHeight - groundY;

    // Ground dirt body
    const bodyGrad = ctx.createLinearGradient(0, groundY, 0, virtualHeight);
    bodyGrad.addColorStop(0, theme.groundBodyColor);
    bodyGrad.addColorStop(1, '#1e140a');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(0, groundY, virtualWidth, groundH);

    // Moving striped curb
    const stripeWidth = 14;
    ctx.fillStyle = theme.groundTopColor;
    ctx.fillRect(0, groundY, virtualWidth, 12);

    // Moving diagonal pattern on top trim
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.beginPath();
    for (let x = -this.groundOffset; x < virtualWidth + 24; x += 24) {
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + stripeWidth, groundY);
      ctx.lineTo(x + stripeWidth - 6, groundY + 12);
      ctx.lineTo(x - 6, groundY + 12);
    }
    ctx.fill();

    // Grass turf highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, groundY, virtualWidth, 2.5);

    ctx.restore();
  }

  // Draw Pipes / Obstacles with cylindrical depth, rim collars, and lights
  public drawPipes(
    ctx: CanvasRenderingContext2D,
    pipes: PipePair[],
    theme: EnvironmentTheme,
    playableHeight: number
  ) {
    for (const pipe of pipes) {
      const effectiveTopHeight = pipe.topHeight + pipe.verticalOffset;
      const effectiveBottomY = pipe.bottomY + pipe.verticalOffset;
      const pipeWidth = pipe.width;
      const lipHeight = 24;
      const lipOverhang = 5;

      ctx.save();

      // Top Pipe Body
      this.drawCylindricalPipe(ctx, pipe.x, 0, pipeWidth, effectiveTopHeight - lipHeight, theme);
      // Top Pipe Lip Collar
      this.drawPipeLip(ctx, pipe.x - lipOverhang, effectiveTopHeight - lipHeight, pipeWidth + lipOverhang * 2, lipHeight, theme, false);

      // Bottom Pipe Lip Collar
      this.drawPipeLip(ctx, pipe.x - lipOverhang, effectiveBottomY, pipeWidth + lipOverhang * 2, lipHeight, theme, true);
      // Bottom Pipe Body
      this.drawCylindricalPipe(ctx, pipe.x, effectiveBottomY + lipHeight, pipeWidth, playableHeight - (effectiveBottomY + lipHeight), theme);

      // Indicator light if pipe moves vertically
      if (pipe.isMoving) {
        const lightY = (effectiveTopHeight + effectiveBottomY) / 2;
        ctx.fillStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.beginPath();
        ctx.arc(pipe.x + pipeWidth / 2, lightY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawCylindricalPipe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, theme: EnvironmentTheme) {
    if (h <= 0) return;
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, theme.pipeLipColor);
    grad.addColorStop(0.2, theme.pipeMainColor);
    grad.addColorStop(0.45, '#FFFFFF'); // Specular highlight
    grad.addColorStop(0.65, theme.pipeMainColor);
    grad.addColorStop(1, theme.pipeTrimColor);

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Hairline border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
  }

  private drawPipeLip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, theme: EnvironmentTheme, isBottom: boolean) {
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, theme.pipeLipColor);
    grad.addColorStop(0.25, theme.pipeMainColor);
    grad.addColorStop(0.5, '#FFFFFF');
    grad.addColorStop(0.75, theme.pipeMainColor);
    grad.addColorStop(1, theme.pipeTrimColor);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Rivets / bolts on collar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    const rivetY = y + h / 2;
    for (let rx = x + 8; rx < x + w - 4; rx += 13) {
      ctx.beginPath();
      ctx.arc(rx, rivetY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw Original Bird Character "Pip"
  public drawBird(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    velocity: number,
    skin: BirdSkin,
    scaleX: number = 1,
    scaleY: number = 1
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Rotation calculation based on vertical velocity
    let angle = velocity * 0.12;
    angle = Math.max(-25, Math.min(78, angle));
    const rad = (angle * Math.PI) / 180;
    ctx.rotate(rad);

    // Squash & Stretch
    ctx.scale(scaleX, scaleY);

    // Tail Feathers
    ctx.fillStyle = skin.wingColor;
    ctx.beginPath();
    ctx.moveTo(-15, -3);
    ctx.lineTo(-24, -9);
    ctx.lineTo(-21, 0);
    ctx.lineTo(-25, 6);
    ctx.lineTo(-15, 4);
    ctx.closePath();
    ctx.fill();

    // Bird Main Body (Chubby round canary)
    const bodyGrad = ctx.createRadialGradient(-2, -4, 4, 0, 0, 18);
    bodyGrad.addColorStop(0, '#FFFFFF');
    bodyGrad.addColorStop(0.3, skin.bodyColor);
    bodyGrad.addColorStop(1, skin.wingColor);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16.5, 14.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly patch
    ctx.fillStyle = skin.bellyColor;
    ctx.beginPath();
    ctx.ellipse(3, 4, 10.5, 7.5, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = skin.beakColor;
    ctx.beginPath();
    ctx.moveTo(11, -3);
    ctx.lineTo(21, 1);
    ctx.lineTo(11, 6);
    ctx.closePath();
    ctx.fill();
    // Beak mouth crease
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(11, 1.5);
    ctx.lineTo(18, 1.5);
    ctx.stroke();

    // Eye (with blinking)
    const eyeX = 7;
    const eyeY = -4.5;
    if (this.isBlinking) {
      // Closed happy eyelid
      ctx.strokeStyle = skin.eyeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // Big friendly cartoon eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 5.2, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = skin.eyeColor;
      ctx.beginPath();
      ctx.arc(eyeX + 1.2, eyeY, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Eye catchlight reflection
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeX + 2.2, eyeY - 1.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Aviator Goggles / Visor
    if (skin.gogglesColor) {
      ctx.strokeStyle = skin.gogglesColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 6.2, 0, Math.PI * 2);
      ctx.stroke();

      // Goggle leather strap around head
      ctx.beginPath();
      ctx.moveTo(eyeX - 6.2, eyeY);
      ctx.lineTo(-14, eyeY + 1);
      ctx.stroke();
    }

    // Animated Wing
    const wingFlapOffset = Math.sin(this.wingCycle) * 6;
    ctx.fillStyle = skin.wingColor;
    ctx.beginPath();
    ctx.ellipse(-4, 2, 9.5, 6.5, (wingFlapOffset * Math.PI) / 180, 0, Math.PI * 2);
    ctx.fill();

    // Wing edge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Draw assist ghost gap guide (for practice / assist mode)
  public drawAssistGuide(ctx: CanvasRenderingContext2D, birdY: number, nextPipe: PipePair | null) {
    if (!nextPipe) return;
    const targetGapCenter = (nextPipe.topHeight + nextPipe.bottomY) / 2 + nextPipe.verticalOffset;

    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(110, birdY);
    ctx.lineTo(nextPipe.x, targetGapCenter);
    ctx.stroke();

    // Target ghost ring
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.arc(nextPipe.x + nextPipe.width / 2, targetGapCenter, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
