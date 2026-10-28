import { getKeys } from './input.js';
import { playJump } from './sound.js';

const GRAVITY = 1800;
const MOVE_SPEED = 220;
const JUMP_SPEED = -680;
const MAX_FALL = 900;

export class Player {
  constructor(x, y) {
    this.w = 24;
    this.h = 32;
    this.reset(x, y);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.facing = 1;
  }

  update(dt) {
    const keys = getKeys();

    this.vx = 0;
    if (keys.left) {
      this.vx = -MOVE_SPEED;
      this.facing = -1;
    }
    if (keys.right) {
      this.vx = MOVE_SPEED;
      this.facing = 1;
    }

    if (keys.jump && this.grounded) {
      this.vy = JUMP_SPEED;
      this.grounded = false;
      playJump();
    }

    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    this.prevX = this.x;
    this.prevY = this.y;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }


  draw(ctx) {
    const px = Math.round(this.x);
    const py = Math.round(this.y);

   
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + 3, py + this.h, this.w - 6, 5);

   
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 1, py, this.w + 2, this.h);

    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(px + 3, py + 2, this.w - 6, 11);

    
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(px + 2, py + 13, this.w - 4, this.h - 15);

    
    ctx.fillStyle = '#000';
    if (this.facing > 0) {
      ctx.fillRect(px + 13, py + 5, 4, 4);
    } else {
      ctx.fillRect(px + 7, py + 5, 4, 4);
    }

    
    ctx.fillStyle = '#ff3333';
    const sx = this.facing > 0 ? px - 3 : px + this.w - 5;
    ctx.fillRect(sx, py + 14, 8, 12);
    
    ctx.fillRect(sx + (this.facing > 0 ? -2 : 4), py + 24, 6, 5);
  }
}