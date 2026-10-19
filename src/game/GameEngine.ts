import { BirdSkin, EnvironmentTheme, GameState, PhysicsConfig, PipePair } from '../types/game';
import {
  VIRTUAL_WIDTH,
  DEFAULT_VIRTUAL_HEIGHT,
  GROUND_HEIGHT,
  calculateVirtualDimensions,
  DEFAULT_PHYSICS,
  BIRD_SKINS,
  ENVIRONMENT_THEMES,
} from '../physics/constants';
import { GameRenderer } from './renderer';
import { ParticleSystem } from './particleSystem';
import { soundManager } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onScoreChange: (score: number) => void;
  onStateChange: (state: GameState) => void;
  onGameOver: (score: number, isNewHigh: boolean) => void;
  onMedalUnlocked: (medalName: string) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState = 'MENU';
  private callbacks: GameEngineCallbacks;

  // Dynamic Viewport Dimensions for any Android aspect ratio
  public virtualWidth: number = VIRTUAL_WIDTH;
  public virtualHeight: number = DEFAULT_VIRTUAL_HEIGHT;
  public playableHeight: number = DEFAULT_VIRTUAL_HEIGHT - GROUND_HEIGHT;

  // Visuals & Audio
  private renderer: GameRenderer;
  private particles: ParticleSystem;
  private currentSkin: BirdSkin = BIRD_SKINS[0];
  private currentTheme: EnvironmentTheme = ENVIRONMENT_THEMES[0];

  // Physics & Tuning
  private physics: PhysicsConfig = { ...DEFAULT_PHYSICS };
  private assistMode: boolean = false;

  // Bird Entity
  private birdX: number = 105;
  private birdY: number = (DEFAULT_VIRTUAL_HEIGHT - GROUND_HEIGHT) / 2;
  private birdVelocity: number = 0;
  private birdScaleX: number = 1;
  private birdScaleY: number = 1;
  private bobTimer: number = 0; // For gentle idle hover in MENU & READY

  // Obstacle Management
  private pipes: PipePair[] = [];
  private pipeSpawnTimer: number = 0;
  private pipeNextId: number = 0;
  private currentPipeSpeed: number = DEFAULT_PHYSICS.pipeSpeed;

  // Score & Stats
  private score: number = 0;
  private highScore: number = 0;
  private totalFlapsInRun: number = 0;

  // Game Feel: Hitstop & Screen Shake
  private hitstopTimer: number = 0;
  private screenShakeAmount: number = 0;
  private hitFlashAlpha: number = 0;

  // Animation Loop
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: GameEngineCallbacks,
    initialHighScore: number = 0
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.callbacks = callbacks;
    this.highScore = initialHighScore;

    this.renderer = new GameRenderer();
    this.particles = new ParticleSystem();

    this.resetToReady();
    this.startLoop();
  }

  // Dynamic dimension resize for any portrait Android device
  public resize(containerW: number, containerH: number) {
    const dims = calculateVirtualDimensions(containerW, containerH);
    this.virtualWidth = dims.width;
    this.virtualHeight = dims.height;
    this.playableHeight = dims.playableHeight;

    this.canvas.width = this.virtualWidth;
    this.canvas.height = this.virtualHeight;

    // Adjust bird position if in menu/ready
    if (this.state === 'MENU' || this.state === 'READY') {
      this.birdY = this.playableHeight / 2 - 15;
    }
  }

  public setSkin(skin: BirdSkin) {
    this.currentSkin = skin;
  }

  public setTheme(theme: EnvironmentTheme) {
    this.currentTheme = theme;
  }

  public setPhysics(config: PhysicsConfig) {
    this.physics = { ...config };
    this.currentPipeSpeed = config.pipeSpeed;
  }

  public setAssistMode(enabled: boolean) {
    this.assistMode = enabled;
  }

  public setHighScore(score: number) {
    this.highScore = score;
  }

  public getState(): GameState {
    return this.state;
  }

  public getScore(): number {
    return this.score;
  }

  // State transitions
  public startFromMenu() {
    this.state = 'READY';
    this.callbacks.onStateChange('READY');
    this.resetToReady();
  }

  public openMenu() {
    this.state = 'MENU';
    this.callbacks.onStateChange('MENU');
    this.resetToReady();
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.callbacks.onStateChange('PAUSED');
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.callbacks.onStateChange('PLAYING');
      this.lastTime = performance.now();
    }
  }

  public restartRun() {
    this.state = 'READY';
    this.callbacks.onStateChange('READY');
    this.resetToReady();
  }

  private resetToReady() {
    this.birdX = 105;
    this.birdY = this.playableHeight / 2 - 15;
    this.birdVelocity = 0;
    this.birdScaleX = 1;
    this.birdScaleY = 1;
    this.bobTimer = 0;
    this.pipes = [];
    this.pipeSpawnTimer = 0;
    this.score = 0;
    this.totalFlapsInRun = 0;
    this.currentPipeSpeed = this.physics.pipeSpeed;
    this.hitstopTimer = 0;
    this.screenShakeAmount = 0;
    this.hitFlashAlpha = 0;
    this.particles.clear();
    this.callbacks.onScoreChange(0);
  }

  // Handle Edge-Triggered Flap
  public handleFlap() {
    if (this.state === 'MENU') {
      this.startFromMenu();
      return;
    }

    if (this.state === 'READY') {
      this.state = 'PLAYING';
      this.callbacks.onStateChange('PLAYING');
      this.executeFlapImpulse();
      return;
    }

    if (this.state === 'PLAYING') {
      this.executeFlapImpulse();
      return;
    }

    if (this.state === 'GAME_OVER') {
      if (this.hitstopTimer <= 0) {
        this.restartRun();
      }
    }
  }

  private executeFlapImpulse() {
    this.birdVelocity = this.physics.flapStrength;
    this.totalFlapsInRun++;

    // Squash & Stretch
    this.birdScaleX = 0.82;
    this.birdScaleY = 1.25;

    soundManager.playFlap();
    this.particles.spawnFlapPuff(this.birdX, this.birdY, this.currentSkin.trailColor);
  }

  // Main Loop
  private startLoop() {
    this.lastTime = performance.now();
    const tick = (now: number) => {
      const rawDt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      // Clamped delta time to prevent physics clipping
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private update(dt: number) {
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.screenShakeAmount > 0) {
      this.screenShakeAmount = Math.max(0, this.screenShakeAmount - dt * 28);
    }
    if (this.hitFlashAlpha > 0) {
      this.hitFlashAlpha = Math.max(0, this.hitFlashAlpha - dt * 4);
    }

    this.birdScaleX += (1 - this.birdScaleX) * Math.min(1, dt * 14);
    this.birdScaleY += (1 - this.birdScaleY) * Math.min(1, dt * 14);

    this.particles.update(dt);
    this.renderer.updateAnimations(dt, this.birdVelocity < 0);

    if (this.state === 'MENU' || this.state === 'READY') {
      this.bobTimer += dt * 4;
      this.birdY = this.playableHeight / 2 - 15 + Math.sin(this.bobTimer) * 9;
      this.birdVelocity = Math.cos(this.bobTimer) * 30;

      this.renderer.updateBackgrounds(dt, 40, true);
      return;
    }

    if (this.state === 'PAUSED') {
      return;
    }

    if (this.state === 'PLAYING') {
      this.renderer.updateBackgrounds(dt, this.currentPipeSpeed, true);

      // Bird Physics
      this.birdVelocity += this.physics.gravity * dt;
      if (this.birdVelocity > this.physics.maxFallSpeed) {
        this.birdVelocity = this.physics.maxFallSpeed;
      }
      this.birdY += this.birdVelocity * dt;

      // Ceiling Collision Check
      if (this.birdY - this.physics.birdRadius <= 0) {
        this.birdY = this.physics.birdRadius;
        this.birdVelocity = 0;
      }

      // Ground Collision Check
      if (this.birdY + this.physics.birdRadius >= this.playableHeight) {
        this.triggerCollision(true);
        return;
      }

      // Progressive speed ramp
      this.currentPipeSpeed = Math.min(195, this.physics.pipeSpeed + this.score * 0.9);

      // Obstacle Generation & Updates
      this.updatePipes(dt);

      // Collision checks with pipes
      this.checkPipeCollisions();
    } else if (this.state === 'GAME_OVER') {
      if (this.birdY + this.physics.birdRadius < this.playableHeight) {
        this.birdVelocity += this.physics.gravity * dt * 1.3;
        this.birdY = Math.min(
          this.playableHeight - this.physics.birdRadius,
          this.birdY + this.birdVelocity * dt
        );
      }
    }
  }

  private updatePipes(dt: number) {
    this.pipeSpawnTimer += dt;
    const spawnInterval = Math.max(1.35, 230 / this.currentPipeSpeed);

    if (this.pipeSpawnTimer >= spawnInterval) {
      this.pipeSpawnTimer = 0;
      this.spawnPipePair();
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.currentPipeSpeed * dt;

      if (pipe.isMoving) {
        pipe.verticalOffset += pipe.verticalSpeed * dt;
        if (pipe.verticalOffset > pipe.maxOffset || pipe.verticalOffset < pipe.minOffset) {
          pipe.verticalSpeed = -pipe.verticalSpeed;
        }
      }

      if (!pipe.scored && pipe.x + pipe.width < this.birdX) {
        pipe.scored = true;
        this.awardPoint(pipe);
      }

      if (pipe.x < -pipe.width - 20) {
        this.pipes.splice(i, 1);
      }
    }
  }

  private spawnPipePair() {
    const pipeWidth = 62;
    const gap = this.assistMode ? this.physics.gapSize + 30 : this.physics.gapSize;
    const minHeight = 65;
    const maxHeight = this.playableHeight - gap - minHeight;

    const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
    const bottomY = topHeight + gap;

    const canMove =
      this.physics.dynamicMovingPipes &&
      !this.assistMode &&
      this.score >= 12 &&
      Math.random() > 0.45;

    this.pipes.push({
      id: this.pipeNextId++,
      x: this.virtualWidth + 10,
      topHeight,
      bottomY,
      gap,
      width: pipeWidth,
      passed: false,
      scored: false,
      isMoving: canMove,
      verticalOffset: 0,
      verticalSpeed: canMove ? (Math.random() > 0.5 ? 40 : -40) : 0,
      minOffset: -35,
      maxOffset: 35,
    });
  }

  private awardPoint(pipe: PipePair) {
    this.score++;
    this.callbacks.onScoreChange(this.score);

    soundManager.playScore();
    const gapCenter = (pipe.topHeight + pipe.bottomY) / 2 + pipe.verticalOffset;
    this.particles.spawnScoreSparkles(pipe.x + pipe.width, gapCenter, this.currentSkin.trailColor);

    if (this.score === 10) {
      soundManager.playMedal();
      this.particles.spawnMilestoneBurst(this.birdX, this.birdY);
      this.callbacks.onMedalUnlocked('Bronze Aviator (Score 10)');
    } else if (this.score === 25) {
      soundManager.playMedal();
      this.particles.spawnMilestoneBurst(this.birdX, this.birdY);
      this.callbacks.onMedalUnlocked('Silver Ace (Score 25)');
    } else if (this.score === 50) {
      soundManager.playMedal();
      this.particles.spawnMilestoneBurst(this.birdX, this.birdY);
      this.callbacks.onMedalUnlocked('Golden Horizon (Score 50)');
    } else if (this.score === 100) {
      soundManager.playMedal();
      this.particles.spawnMilestoneBurst(this.birdX, this.birdY);
      this.callbacks.onMedalUnlocked('Platinum Legend (Score 100)');
    }
  }

  private checkPipeCollisions() {
    const birdR = this.physics.birdRadius - (this.assistMode ? 2 : 0);
    const bx = this.birdX;
    const by = this.birdY;

    for (const pipe of this.pipes) {
      const effectiveTopHeight = pipe.topHeight + pipe.verticalOffset;
      const effectiveBottomY = pipe.bottomY + pipe.verticalOffset;
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + pipe.width;

      if (bx + birdR > pipeLeft && bx - birdR < pipeRight) {
        if (by - birdR < effectiveTopHeight) {
          this.triggerCollision(false);
          return;
        }

        if (by + birdR > effectiveBottomY) {
          this.triggerCollision(false);
          return;
        }
      }
    }
  }

  private triggerCollision(hitGround: boolean) {
    if (this.state !== 'PLAYING') return;

    this.state = 'GAME_OVER';
    this.hitstopTimer = 0.06;
    this.screenShakeAmount = 9;
    this.hitFlashAlpha = 0.45;

    soundManager.playHit();
    soundManager.playDie();
    this.particles.spawnHitSparks(this.birdX, this.birdY);

    if (hitGround) {
      this.birdY = this.playableHeight - this.physics.birdRadius;
      this.birdScaleX = 1.35;
      this.birdScaleY = 0.65;
    }

    const isNewHigh = this.score > this.highScore;
    if (isNewHigh) {
      this.highScore = this.score;
    }

    this.callbacks.onStateChange('GAME_OVER');
    this.callbacks.onGameOver(this.score, isNewHigh);
  }

  private render() {
    this.ctx.save();

    if (this.screenShakeAmount > 0) {
      const ox = (Math.random() - 0.5) * this.screenShakeAmount;
      const oy = (Math.random() - 0.5) * this.screenShakeAmount;
      this.ctx.translate(ox, oy);
    }

    // 1. Sky & Parallax Backgrounds
    this.renderer.drawSky(this.ctx, this.currentTheme, this.virtualWidth, this.playableHeight);

    // 2. Obstacles / Pipes
    this.renderer.drawPipes(this.ctx, this.pipes, this.currentTheme, this.playableHeight);

    // 3. Assist Guide (if enabled)
    if (this.assistMode && this.state === 'PLAYING') {
      const nextPipe = this.pipes.find(p => p.x + p.width > this.birdX) || null;
      this.renderer.drawAssistGuide(this.ctx, this.birdY, nextPipe);
    }

    // 4. Ground
    this.renderer.drawGround(
      this.ctx,
      this.currentTheme,
      this.virtualWidth,
      this.virtualHeight,
      this.playableHeight
    );

    // 5. Particles
    this.particles.draw(this.ctx);

    // 6. Bird Character
    this.renderer.drawBird(
      this.ctx,
      this.birdX,
      this.birdY,
      this.birdVelocity,
      this.currentSkin,
      this.birdScaleX,
      this.birdScaleY
    );

    // 7. Hit Flash Overlay
    if (this.hitFlashAlpha > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlashAlpha})`;
      this.ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
    }

    this.ctx.restore();
  }
}
