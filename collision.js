
export function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}


export function resolvePlatforms(player, platforms, prevX, prevY) {
  let grounded = false;
  const result = { grounded: false, hitCeiling: false };

  for (const p of platforms) {
    if (!aabb(player, p)) continue;


    const fromTop = prevY + player.h <= p.y;
    const fromBottom = prevY >= p.y + p.h;
    const fromLeft = prevX + player.w <= p.x;
    const fromRight = prevX >= p.x + p.w;


    if (fromTop && player.vy >= 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      grounded = true;
    } else if (fromBottom && player.vy < 0) {
      player.y = p.y + p.h;
      player.vy = 0;
      result.hitCeiling = true;
    } else if (fromLeft && player.vx > 0) {
      player.x = p.x - player.w;
      player.vx = 0;
    } else if (fromRight && player.vx < 0) {
      player.x = p.x + p.w;
      player.vx = 0;
    } else {

      const overlapLeft = (player.x + player.w) - p.x;
      const overlapRight = (p.x + p.w) - player.x;
      const overlapTop = (player.y + player.h) - p.y;
      const overlapBottom = (p.y + p.h) - player.y;

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop && player.vy >= 0) {
        player.y = p.y - player.h;
        player.vy = 0;
        grounded = true;
      } else if (minOverlap === overlapBottom && player.vy < 0) {
        player.y = p.y + p.h;
        player.vy = 0;
      } else if (minOverlap === overlapLeft) {
        player.x = p.x - player.w;
        player.vx = 0;
      } else {
        player.x = p.x + p.w;
        player.vx = 0;
      }
    }
  }

  result.grounded = grounded;
  return result;
}


export function overlaps(a, b) {
  return aabb(a, b);
}