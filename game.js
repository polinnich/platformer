
import { Player } from './player.js';
import { resolvePlatforms, overlaps } from './collision.js';
import { clearKeys } from './input.js';
import {
  playCollect, playWin, playLose, playClick,
  toggleMute
} from './sound.js';

const CANVAS_W = 800;
const CANVAS_H = 450;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'menu'; 
    this.elapsed = 0;
    this.bestTime = this.loadBestTime();
    this.lastTime = 0;
    this.rafId = null;
    this.player = new Player(60, 300);

    this.setupLevel();
    this.bindUI();
    this.updateHUD();
    this.showOverlay('start');
  }

  setupLevel() {

    this.platforms = [
      { x: 30,  y: 380, w: 110, h: 16 }, 
      { x: 180, y: 300, w: 90,  h: 16 }, 
      { x: 320, y: 340, w: 130, h: 16 }, 
      { x: 475, y: 235, w: 80,  h: 16 }, 
      { x: 640, y: 290, w: 120, h: 16 }  
    ];


    this.items = [
      { x: 210, y: 250, w: 16, h: 16, collected: false }, 
      { x: 350, y: 310, w: 16, h: 16, collected: false }, 
      { x: 500, y: 185, w: 16, h: 16, collected: false }  
    ];


    this.hazards = [
      { x: 385, y: 324, w: 65, h: 16 }
    ];


    this.finish = { x: 700, y: 230, w: 40, h: 60 };

    this.elapsed = 0;
    this.player.reset(50, 380 - 32);
  }

  bindUI() {
    this.btnStart       = document.getElementById('btnStart');
    this.btnPause       = document.getElementById('btnPause');
    this.btnRestart     = document.getElementById('btnRestart');
    this.btnMute        = document.getElementById('btnMute');
    this.btnResume      = document.getElementById('btnResume');
    this.btnWinRestart  = document.getElementById('btnWinRestart');
    this.btnLoseRestart = document.getElementById('btnLoseRestart');

    this.timeEl   = document.getElementById('time');
    this.itemsEl  = document.getElementById('items');
    this.highEl   = document.getElementById('highscore');
    this.winTime  = document.getElementById('win-time');
    this.winRec   = document.getElementById('win-record');

    this.overlays = {
      start: document.getElementById('overlay-start'),
      pause: document.getElementById('overlay-pause'),
      win:   document.getElementById('overlay-win'),
      lose:  document.getElementById('overlay-lose')
    };

    this.btnStart.addEventListener('click', () => { playClick(); this.start(); });
    this.btnPause.addEventListener('click', () => { playClick(); this.togglePause(); });
    this.btnRestart.addEventListener('click', () => { playClick(); this.restart(); });
    this.btnResume.addEventListener('click', () => { playClick(); this.resume(); });
    this.btnWinRestart.addEventListener('click', () => { playClick(); this.restart(); });
    this.btnLoseRestart.addEventListener('click', () => { playClick(); this.restart(); });

    this.btnMute.addEventListener('click', () => {
      const m = toggleMute();
      this.btnMute.textContent = m ? '🔇' : '🔊';
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') {
        this.pause();
      }
    });
  }

  showOverlay(name) {
    for (const key of Object.keys(this.overlays)) {
      this.overlays[key].classList.toggle('hidden', key !== name);
    }
  }

  hideOverlays() {
    for (const key of Object.keys(this.overlays)) {
      this.overlays[key].classList.add('hidden');
    }
  }

  loadBestTime() {
    try {
      const v = localStorage.getItem('minit_platformer_best');
      return v ? parseFloat(v) : null;
    } catch {
      return null;
    }
  }

  saveBestTime() {
    try {
      if (this.bestTime === null || this.elapsed < this.bestTime) {
        this.bestTime = this.elapsed;
        localStorage.setItem('minit_platformer_best', String(this.bestTime));
      }
    } catch { }
  }

  formatTime(t) {
    if (t === null || t === undefined) return '—';
    return t.toFixed(1) + 'с';
  }

  collectedCount() {
    return this.items.filter(i => i.collected).length;
  }

  updateHUD() {
    this.timeEl.textContent = this.elapsed.toFixed(1);
    this.itemsEl.textContent = `${this.collectedCount()}/3`;
    this.highEl.textContent = this.formatTime(this.bestTime);
  }

  setButtons() {
    this.btnPause.disabled = this.state !== 'playing' && this.state !== 'paused';
    this.btnPause.textContent = this.state === 'paused' ? 'Продолжить' : 'Пауза';
    this.btnRestart.disabled = this.state === 'menu';
  }

  start() {
    if (this.state === 'playing') return;
    if (this.state === 'menu' || this.state === 'won' || this.state === 'lost') {
      this.setupLevel();
    }
    this.state = 'playing';
    this.lastTime = 0;
    this.hideOverlays();
    this.setButtons();
    this.updateHUD();
    this.loop(0);
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    clearKeys();
    this.showOverlay('pause');
    this.setButtons();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.lastTime = 0;
    this.hideOverlays();
    this.setButtons();
    this.loop(0);
  }

  togglePause() {
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  restart() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    clearKeys();
    this.setupLevel();
    this.state = 'playing';
    this.lastTime = 0;
    this.hideOverlays();
    this.setButtons();
    this.updateHUD();
    this.loop(0);
  }

  win() {
    this.state = 'won';
    this.saveBestTime();
    playWin();
    this.winTime.textContent = this.elapsed.toFixed(1);
    this.winRec.textContent = this.formatTime(this.bestTime);
    this.showOverlay('win');
    this.setButtons();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  lose() {
    this.state = 'lost';
    playLose();
    this.showOverlay('lose');
    this.setButtons();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  update(dt) {
    if (this.state !== 'playing') return;
    if (dt > 0.05) dt = 0.05;

    this.elapsed += dt;
    this.player.update(dt);

    const col = resolvePlatforms(
      this.player,
      this.platforms,
      this.player.prevX,
      this.player.prevY
    );
    this.player.grounded = col.grounded;

    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.w > CANVAS_W) {
      this.player.x = CANVAS_W - this.player.w;
    }

    for (const item of this.items) {
      if (!item.collected && overlaps(this.player, item)) {
        item.collected = true;
        playCollect();
      }
    }

    for (const h of this.hazards) {
      if (overlaps(this.player, h)) {
        this.lose();
        return;
      }
    }

    if (this.player.y > CANVAS_H + 20) {
      this.lose();
      return;
    }

    const allCollected = this.items.every(i => i.collected);
    if (allCollected && overlaps(this.player, this.finish)) {
      this.win();
    }

    this.updateHUD();
  }



  drawBackground() {
    const ctx = this.ctx;
  
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

   
    ctx.fillStyle = '#c0c0c0';
    for (let y = 0; y < CANVAS_H; y += 40) {
      for (let x = 0; x < CANVAS_W; x += 40) {
        if ((x / 40 + y / 40) % 2 === 0) {
          ctx.fillRect(x, y, 40, 40);
        }
      }
    }

  
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }


    ctx.fillStyle = '#222';
    ctx.fillRect(0, CANVAS_H - 12, CANVAS_W, 12);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, CANVAS_H - 4, CANVAS_W, 4);
  }

  drawPlatform(p) {
    const ctx = this.ctx;
  
    ctx.fillStyle = '#000';
    ctx.fillRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);

   
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(p.x, p.y, p.w, p.h);

    
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(p.x, p.y, p.w, 5);

    
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);

    
    ctx.fillStyle = '#000';
    ctx.fillRect(p.x + 4, p.y + p.h + 3, 8, 4);
    ctx.fillRect(p.x + p.w - 12, p.y + p.h + 3, 8, 4);
  }

  drawItem(item) {
    if (item.collected) return;
    const ctx = this.ctx;
    const cx = Math.round(item.x + item.w / 2);
    const cy = Math.round(item.y + item.h / 2);

    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx + 11, cy);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 11, cy);
    ctx.closePath();
    ctx.fill();

    
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 9);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx, cy + 9);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
    ctx.fill();

    
    ctx.fillStyle = '#ffdfdf';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 9);
    ctx.lineTo(cx + 4, cy - 2);
    ctx.lineTo(cx, cy + 1);
    ctx.lineTo(cx - 3, cy - 3);
    ctx.closePath();
    ctx.fill();
  }

  drawHazard(h) {
    const ctx = this.ctx;
  
    ctx.fillStyle = '#000';
    ctx.fillRect(h.x - 2, h.y - 6, h.w + 4, h.h + 8);

   
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(h.x, h.y - 4, h.w, h.h + 4);

    
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(h.x + 5, h.y - 2, h.w - 10, h.h);

   
    ctx.fillStyle = '#ffcc22';
    ctx.fillRect(h.x + 14, h.y + 1, h.w - 28, 7);

   
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(h.x + 3,  h.y - 10, 11, 8);
    ctx.fillRect(h.x + 20, h.y - 12, 14, 10);
    ctx.fillRect(h.x + 42, h.y - 9, 11, 7);

    
    ctx.fillStyle = '#ffcc22';
    ctx.fillRect(h.x + 6,  h.y - 10, 5, 4);
    ctx.fillRect(h.x + 25, h.y - 12, 5, 4);
  }

  drawFinish() {
    const f = this.finish;
    const ctx = this.ctx;

    
    ctx.fillStyle = '#000';
    ctx.fillRect(f.x + 5, f.y, 8, f.h);
    ctx.fillStyle = '#555';
    ctx.fillRect(f.x + 7, f.y + 2, 4, f.h - 4);

    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(f.x + 13, f.y + 2);
    ctx.lineTo(f.x + 44, f.y + 15);
    ctx.lineTo(f.x + 13, f.y + 28);
    ctx.closePath();
    ctx.fill();

    
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.moveTo(f.x + 15, f.y + 5);
    ctx.lineTo(f.x + 38, f.y + 15);
    ctx.lineTo(f.x + 15, f.y + 25);
    ctx.closePath();
    ctx.fill();

    
    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.moveTo(f.x + 15, f.y + 5);
    ctx.lineTo(f.x + 28, f.y + 12);
    ctx.lineTo(f.x + 15, f.y + 14);
    ctx.closePath();
    ctx.fill();

    
    ctx.fillStyle = '#000';
    ctx.fillRect(f.x - 2, f.y + f.h - 8, 24, 10);
    ctx.fillStyle = '#666';
    ctx.fillRect(f.x, f.y + f.h - 6, 20, 6);
  }

  render() {
    this.drawBackground();
    this.platforms.forEach(p => this.drawPlatform(p));
    this.hazards.forEach(h => this.drawHazard(h));
    this.drawFinish();
    this.items.forEach(item => this.drawItem(item));
    this.player.draw(this.ctx);
  }

  loop(timestamp) {
    if (this.state !== 'playing') return;

    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }
}