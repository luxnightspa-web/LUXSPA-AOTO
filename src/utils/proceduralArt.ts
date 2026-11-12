/**
 * Creates rich, colorful, painterly storybook illustration data URLs
 * for immediate display and fallback previews.
 */
export function createStoryIllustration(
  theme: 'whale' | 'dragon' | 'detective' | 'garden' | 'custom',
  pageIndex: number,
  title: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
  if (theme === 'whale') {
    bgGrad.addColorStop(0, '#0c1b33');
    bgGrad.addColorStop(0.5, '#1e3d59');
    bgGrad.addColorStop(1, '#17b978');
  } else if (theme === 'dragon') {
    bgGrad.addColorStop(0, '#36096d');
    bgGrad.addColorStop(0.5, '#37d5d6');
    bgGrad.addColorStop(1, '#ffedd5');
  } else if (theme === 'detective') {
    bgGrad.addColorStop(0, '#1f1c2c');
    bgGrad.addColorStop(0.6, '#928dab');
    bgGrad.addColorStop(1, '#f6d365');
  } else if (theme === 'garden') {
    bgGrad.addColorStop(0, '#0f2027');
    bgGrad.addColorStop(0.5, '#203a43');
    bgGrad.addColorStop(1, '#2c5364');
  } else {
    bgGrad.addColorStop(0, '#4b134f');
    bgGrad.addColorStop(0.5, '#c94b4b');
    bgGrad.addColorStop(1, '#fcd670');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 600);

  // Twinkling Stars / Magical Motes
  for (let i = 0; i < 45; i++) {
    const x = (i * 97) % 800;
    const y = (i * 61) % 400;
    const r = ((i % 5) + 1) * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + (i % 6) * 0.1})`;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Magical Cloud / Hill layers
  const hillGrad = ctx.createLinearGradient(0, 300, 0, 600);
  if (theme === 'whale') {
    hillGrad.addColorStop(0, 'rgba(40, 180, 200, 0.7)');
    hillGrad.addColorStop(1, 'rgba(10, 50, 90, 0.95)');
  } else if (theme === 'dragon') {
    hillGrad.addColorStop(0, 'rgba(255, 120, 100, 0.7)');
    hillGrad.addColorStop(1, 'rgba(70, 20, 80, 0.95)');
  } else {
    hillGrad.addColorStop(0, 'rgba(100, 220, 140, 0.6)');
    hillGrad.addColorStop(1, 'rgba(20, 70, 50, 0.95)');
  }

  // Draw Rolling waves / hills
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.bezierCurveTo(200, 370 + pageIndex * 10, 400, 460 - pageIndex * 15, 800, 400);
  ctx.lineTo(800, 600);
  ctx.lineTo(0, 600);
  ctx.fillStyle = hillGrad;
  ctx.fill();

  // Glow Moon or Floating Sun
  ctx.save();
  ctx.beginPath();
  ctx.arc(680, 120, 55, 0, Math.PI * 2);
  ctx.fillStyle = '#fff4cc';
  ctx.shadowColor = '#ffea88';
  ctx.shadowBlur = 35;
  ctx.fill();
  ctx.restore();

  // Draw Central Character / Subject based on theme
  ctx.save();
  if (theme === 'whale') {
    // Star Whale
    const wx = 380;
    const wy = 290;
    ctx.fillStyle = '#64b5f6';
    ctx.beginPath();
    ctx.ellipse(wx, wy, 140, 70, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(wx - 130, wy);
    ctx.lineTo(wx - 220, wy - 50);
    ctx.lineTo(wx - 190, wy);
    ctx.lineTo(wx - 220, wy + 50);
    ctx.closePath();
    ctx.fill();

    // Eye & Smile
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(wx + 90, wy - 15, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0d47a1';
    ctx.beginPath();
    ctx.arc(wx + 93, wy - 15, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rainbow water spout
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(wx + 40, wy - 65);
    ctx.quadraticCurveTo(wx + 30, wy - 140, wx - 10, wy - 150);
    ctx.stroke();

    ctx.strokeStyle = '#ff80ab';
    ctx.beginPath();
    ctx.moveTo(wx + 45, wy - 65);
    ctx.quadraticCurveTo(wx + 70, wy - 140, wx + 100, wy - 140);
    ctx.stroke();
  } else if (theme === 'dragon') {
    // Cute Little Dragon
    const dx = 400;
    const dy = 320;

    // Body
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.ellipse(dx, dy, 75, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.moveTo(dx - 40, dy - 20);
    ctx.lineTo(dx - 120, dy - 80);
    ctx.lineTo(dx - 60, dy + 20);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(dx + 40, dy - 20);
    ctx.lineTo(dx + 120, dy - 80);
    ctx.lineTo(dx + 60, dy + 20);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#81c784';
    ctx.beginPath();
    ctx.arc(dx, dy - 95, 50, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#ffa726';
    ctx.beginPath();
    ctx.moveTo(dx - 25, dy - 135);
    ctx.lineTo(dx - 40, dy - 170);
    ctx.lineTo(dx - 10, dy - 140);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(dx + 25, dy - 135);
    ctx.lineTo(dx + 40, dy - 170);
    ctx.lineTo(dx + 10, dy - 140);
    ctx.fill();

    // Big gentle cute eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dx - 18, dy - 95, 14, 0, Math.PI * 2);
    ctx.arc(dx + 18, dy - 95, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(dx - 16, dy - 95, 7, 0, Math.PI * 2);
    ctx.arc(dx + 16, dy - 95, 7, 0, Math.PI * 2);
    ctx.fill();

    // Rainbow spark bubble instead of fire
    ctx.fillStyle = 'rgba(255, 128, 200, 0.8)';
    ctx.shadowColor = '#ff4081';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(dx + 55, dy - 105, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(dx + 85, dy - 125, 22, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'detective') {
    // Detective Pip the Fox/Puppy
    const px = 400;
    const py = 330;

    // Body
    ctx.fillStyle = '#fb8c00';
    ctx.beginPath();
    ctx.ellipse(px, py, 65, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Detective Trench Coat collar
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.moveTo(px - 50, py - 40);
    ctx.lineTo(px, py + 10);
    ctx.lineTo(px + 50, py - 40);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffa726';
    ctx.beginPath();
    ctx.arc(px, py - 85, 48, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.moveTo(px - 40, dySafe(py - 110));
    ctx.lineTo(px - 55, dySafe(py - 160));
    ctx.lineTo(px - 15, dySafe(py - 125));
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 40, dySafe(py - 110));
    ctx.lineTo(px + 55, dySafe(py - 160));
    ctx.lineTo(px + 15, dySafe(py - 125));
    ctx.fill();

    // Detective hat
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(px - 50, py - 135, 100, 16);
    ctx.beginPath();
    ctx.ellipse(px, py - 145, 38, 20, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Magnifying glass
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(px + 65, py - 40, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 82, py - 23);
    ctx.lineTo(px + 105, py);
    ctx.stroke();
  } else {
    // Secret Garden / Glowing tree
    const gx = 400;
    const gy = 330;

    // Glowing Magic Tree Trunk
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.moveTo(gx - 25, 520);
    ctx.quadraticCurveTo(gx - 10, 360, gx - 40, 260);
    ctx.lineTo(gx + 40, 260);
    ctx.quadraticCurveTo(gx + 10, 360, gx + 25, 520);
    ctx.fill();

    // Tree Foliage with glowing bubbles
    ctx.fillStyle = '#2e7d32';
    ctx.shadowColor = '#69f0ae';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(gx, 210, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.arc(gx - 65, 230, 65, 0, Math.PI * 2);
    ctx.arc(gx + 65, 230, 65, 0, Math.PI * 2);
    ctx.fill();

    // Firefly lanterns
    for (let f = 0; f < 9; f++) {
      const fx = gx - 120 + ((f * 35) % 240);
      const fy = 150 + ((f * 47) % 180);
      ctx.fillStyle = '#ffeb3b';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(fx, fy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Bottom ribbon badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, 540, 800, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`✨ ${title} - Page ${pageIndex + 1} ✨`, 400, 578);

  return canvas.toDataURL('image/png');
}

function dySafe(val: number): number {
  return val;
}
