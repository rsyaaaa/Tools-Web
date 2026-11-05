import { CapturedPhoto, StripConfig } from '../types';
import { loadImage } from './image-compressor';

// In-memory cache for decoded photo HTMLImageElements to make theme switching instant (0ms image re-decode)
const photoImageCache = new Map<string, HTMLImageElement>();

export function clearPhotoboothImageCache(): void {
  photoImageCache.clear();
}

async function getCachedPhotoElement(photo: CapturedPhoto): Promise<HTMLImageElement> {
  const key = photo.id || photo.dataUrl;
  const existing = photoImageCache.get(key);
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return existing;
  }
  const img = await loadImage(photo.dataUrl);
  photoImageCache.set(key, img);
  return img;
}

/**
 * Creates procedural film grain texture buffer
 */
function createNoiseBuffer(width: number, height: number, intensity: number): HTMLCanvasElement {
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const ctx = noiseCanvas.getContext('2d');
  if (!ctx) return noiseCanvas;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const amount = Math.min(255, Math.max(0, intensity * 255));

  for (let i = 0; i < data.length; i += 4) {
    const val = (Math.random() - 0.5) * amount * 2;
    data[i] = 128 + val;
    data[i + 1] = 128 + val;
    data[i + 2] = 128 + val;
    data[i + 3] = Math.round(intensity * 180); // alpha
  }

  ctx.putImageData(imgData, 0, 0);
  return noiseCanvas;
}

/**
 * Helper to draw a heart shape
 */
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  // top left curve
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  // bottom left curve
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.4, x, y + size);
  // bottom right curve
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.4, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  // top right curve
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to draw a 4-point twinkle star
 */
function drawStar4(ctx: CanvasRenderingContext2D, cx: number, cy: number, rOuter: number, rInner: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const x1 = cx + Math.cos(angle) * rOuter;
    const y1 = cy + Math.sin(angle) * rOuter;
    ctx.lineTo(x1, y1);

    const angleInner = angle + Math.PI / 4;
    const x2 = cx + Math.cos(angleInner) * rInner;
    const y2 = cy + Math.sin(angleInner) * rInner;
    ctx.lineTo(x2, y2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to draw a cherry blossom (Sakura) petal or flower
 */
function drawSakuraFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -size, size * 0.45, size * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Center pistil
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to draw Chinese auspicious cloud (Xiangyun)
 */
function drawChineseCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, 16 * scale, Math.PI, 0, false);
  ctx.arc(x + 22 * scale, y + 2 * scale, 12 * scale, Math.PI, 0, false);
  ctx.arc(x - 18 * scale, y + 4 * scale, 10 * scale, Math.PI, 0.4 * Math.PI, false);
  ctx.stroke();
  ctx.restore();
}

/**
 * Helper to draw a delicate snowflake
 */
function drawSnowflake(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const xEnd = cx + Math.cos(angle) * radius;
    const yEnd = cy + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(xEnd, yEnd);
    // branch v
    const midX = cx + Math.cos(angle) * (radius * 0.6);
    const midY = cy + Math.sin(angle) * (radius * 0.6);
    const bAngle1 = angle + Math.PI / 4;
    const bAngle2 = angle - Math.PI / 4;
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX + Math.cos(bAngle1) * (radius * 0.35), midY + Math.sin(bAngle1) * (radius * 0.35));
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX + Math.cos(bAngle2) * (radius * 0.35), midY + Math.sin(bAngle2) * (radius * 0.35));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws rich vector theme patterns and decorations across the card
 */
function drawThemeDecorations(
  ctx: CanvasRenderingContext2D,
  config: StripConfig,
  width: number,
  height: number,
  footerY: number
) {
  const pattern = config.patternType || 'warm-cream';
  const margin = config.innerPadding || 44;

  switch (pattern) {
    case 'romantic-hearts': {
      // Draw floating cute hearts along margins and footer
      const heartColor = config.borderColor || '#F472B6';
      drawHeart(ctx, margin / 2, 70, 24, heartColor);
      drawHeart(ctx, width - margin / 2, 140, 20, heartColor);
      drawHeart(ctx, margin / 2, 320, 18, heartColor);
      drawHeart(ctx, width - margin / 2, height / 2, 26, heartColor);
      drawHeart(ctx, margin / 2, footerY - 40, 22, heartColor);
      drawHeart(ctx, width - margin / 2, footerY + 20, 28, heartColor);

      // Sweet bottom ribbon doodle
      ctx.save();
      ctx.strokeStyle = config.textColor;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width / 2 - 60, footerY + 65, 8, 0, Math.PI * 2);
      ctx.arc(width / 2 + 60, footerY + 65, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'space-galaxy': {
      // Glowing starfield
      ctx.save();
      for (let i = 0; i < 45; i++) {
        const sx = (i * 127 + 31) % width;
        const sy = (i * 241 + 47) % height;
        const r = (i % 3) * 0.8 + 0.8;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(165, 180, 252, 0.9)';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4-point twinkle stars
      drawStar4(ctx, margin / 2, 90, 16, 4, '#818CF8');
      drawStar4(ctx, width - margin / 2, 220, 20, 5, '#C084FC');
      drawStar4(ctx, margin / 2, height - 160, 18, 4, '#38BDF8');
      drawStar4(ctx, width - margin / 2, height - 80, 22, 6, '#818CF8');

      // Crescent moon in footer corner
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(width - 50, footerY + 35, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1E1B4B';
      ctx.beginPath();
      ctx.arc(width - 55, footerY + 32, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'education-grid': {
      // Blueprint graph paper grid lines
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Measurement ruler tick marks along left margin
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      for (let y = 30; y < height - 30; y += 12) {
        const tickLength = y % 60 === 0 ? 12 : y % 24 === 0 ? 8 : 4;
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(10 + tickLength, y);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'ocean-waves': {
      // Sinusoidal waves along top, margins, and bottom
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 2;
      for (let offset = 0; offset < 3; offset++) {
        ctx.beginPath();
        const baseY = height - 70 + offset * 14;
        for (let x = 0; x <= width; x += 10) {
          const y = baseY + Math.sin(x * 0.03 + offset) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Bubbles
      ctx.fillStyle = 'rgba(103, 232, 249, 0.4)';
      const bubbles = [
        [20, 120, 6], [ width - 24, 180, 8], [18, 380, 5],
        [width - 20, 540, 7], [30, footerY + 20, 9], [width - 35, footerY + 50, 11]
      ];
      bubbles.forEach(([bx, by, br]) => {
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();
      break;
    }

    case 'forest-botanical': {
      // Botanical leaves and vine curls on margins
      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      const leafPoints = [
        [margin / 2, 80, 0.4], [width - margin / 2, 160, -0.5],
        [margin / 2, 360, 0.3], [width - margin / 2, 520, -0.4],
        [margin / 2, footerY + 10, 0.5], [width - margin / 2, footerY + 40, -0.6]
      ];
      leafPoints.forEach(([lx, ly, rot]) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
      break;
    }

    case 'minimalist-mono': {
      // Elegant architectural double hairline
      ctx.save();
      ctx.strokeStyle = config.borderColor || '#94A3B8';
      ctx.lineWidth = 1;
      const inset = 14;
      ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

      // Corner crosshair marks
      const crossSize = 8;
      const corners = [
        [inset, inset], [width - inset, inset],
        [inset, height - inset], [width - inset, height - inset]
      ];
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.moveTo(cx - crossSize, cy);
        ctx.lineTo(cx + crossSize, cy);
        ctx.moveTo(cx, cy - crossSize);
        ctx.lineTo(cx, cy + crossSize);
        ctx.stroke();
      });
      ctx.restore();
      break;
    }

    case 'modern-y2k': {
      // Hologram chrome stars & cyber crosshairs
      drawStar4(ctx, margin / 2, 70, 22, 5, '#F472B6');
      drawStar4(ctx, width - margin / 2, 190, 18, 4, '#22D3EE');
      drawStar4(ctx, margin / 2, 420, 26, 6, '#C084FC');
      drawStar4(ctx, width - margin / 2, 590, 20, 5, '#F472B6');
      drawStar4(ctx, width / 2 - 200, footerY + 28, 14, 3, '#38BDF8');
      drawStar4(ctx, width / 2 + 200, footerY + 28, 14, 3, '#D946EF');

      // Cyber diagonal scanline grid accent in footer
      ctx.save();
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(width / 2 - 40 + i * 12, footerY + 75);
        ctx.lineTo(width / 2 - 30 + i * 12, footerY + 87);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'japan-sakura': {
      // Fluttering sakura cherry blossoms
      drawSakuraFlower(ctx, 24, 75, 14, '#FDA4AF');
      drawSakuraFlower(ctx, width - 26, 170, 16, '#FB7185');
      drawSakuraFlower(ctx, 22, 330, 13, '#FECDD3');
      drawSakuraFlower(ctx, width - 24, 490, 15, '#FDA4AF');
      drawSakuraFlower(ctx, 35, footerY + 30, 18, '#F43F5E');
      drawSakuraFlower(ctx, width - 35, footerY + 35, 18, '#FB7185');

      // Floating sakura petals
      const petals = [
        [width - 18, 90, 0.4], [16, 220, -0.6], [width - 15, 390, 0.8],
        [20, 580, -0.3], [width / 2 - 90, footerY + 30, 0.2]
      ];
      ctx.save();
      ctx.fillStyle = '#FDA4AF';
      petals.forEach(([px, py, prot]) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(prot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
      break;
    }

    case 'korea-pastel': {
      // Cute fluffy clouds and Life4Cuts sparkles
      const drawCloud = (cx: number, cy: number, cscale: number) => {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(cx, cy, 14 * cscale, 0, Math.PI * 2);
        ctx.arc(cx + 14 * cscale, cy - 6 * cscale, 16 * cscale, 0, Math.PI * 2);
        ctx.arc(cx + 28 * cscale, cy, 12 * cscale, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      drawCloud(16, 60, 0.9);
      drawCloud(width - 55, 200, 0.9);
      drawCloud(14, 420, 0.8);
      drawCloud(width - 60, footerY + 15, 1.0);

      // Sweet mini sparkles
      drawStar4(ctx, width - 24, 90, 12, 3, '#A855F7');
      drawStar4(ctx, 24, 280, 14, 3.5, '#EC4899');
      drawStar4(ctx, width - 20, 480, 10, 2.5, '#8B5CF6');
      drawStar4(ctx, 35, footerY + 60, 12, 3, '#D946EF');
      break;
    }

    case 'china-heritage': {
      // Golden traditional auspicious clouds & corner knots
      drawChineseCloud(ctx, 30, 60, 0.9, '#FBBF24');
      drawChineseCloud(ctx, width - 35, 180, 0.85, '#FBBF24');
      drawChineseCloud(ctx, 30, 390, 0.8, '#FBBF24');
      drawChineseCloud(ctx, width - 35, 560, 0.85, '#FBBF24');
      drawChineseCloud(ctx, 45, footerY + 30, 0.9, '#FDE047');
      drawChineseCloud(ctx, width - 55, footerY + 30, 0.9, '#FDE047');

      // Double imperial border lines
      ctx.save();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(12, 12, width - 24, height - 24);
      ctx.strokeRect(18, 18, width - 36, height - 36);
      ctx.restore();
      break;
    }

    case 'sunset-glow': {
      // Horizon sun arc and twilight birds in footer
      ctx.save();
      // Glowing sun arc in footer
      const sunGrad = ctx.createRadialGradient(width / 2, footerY + 80, 5, width / 2, footerY + 80, 80);
      sunGrad.addColorStop(0, 'rgba(254, 215, 170, 0.8)');
      sunGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.3)');
      sunGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width / 2, footerY + 80, 80, Math.PI, 0, false);
      ctx.fill();

      // Silhouetted flying birds
      const drawBird = (bx: number, by: number, bsize: number) => {
        ctx.strokeStyle = '#9A3412';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx - bsize, by, bsize, Math.PI, 0, true);
        ctx.arc(bx + bsize, by, bsize, Math.PI, 0, true);
        ctx.stroke();
      };
      drawBird(width - 40, 110, 6);
      drawBird(width - 25, 95, 4.5);
      drawBird(30, 240, 5);
      ctx.restore();
      break;
    }

    case 'vintage-film': {
      // 35mm film roll sprocket holes along both left and right margins
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      const holeW = 14;
      const holeH = 22;
      const holeGap = 36;
      for (let y = 30; y < height - 30; y += holeGap) {
        // Left sprocket hole
        ctx.beginPath();
        ctx.roundRect(10, y, holeW, holeH, 3);
        ctx.fill();

        // Right sprocket hole
        ctx.beginPath();
        ctx.roundRect(width - 10 - holeW, y, holeW, holeH, 3);
        ctx.fill();
      }

      // Analog frame counter text
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.fillStyle = '#78350F';
      ctx.fillText('35mm · ISO 400', 32, footerY + 70);
      ctx.fillText('▶ 01A', width - 75, footerY + 70);
      ctx.restore();
      break;
    }

    case 'neon-synth': {
      // 80s arcade neon perspective grid lines
      ctx.save();
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.35)';
      ctx.lineWidth = 1.5;
      const centerX = width / 2;
      for (let i = -5; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * 25, footerY - 20);
        ctx.lineTo(centerX + i * 85, height);
        ctx.stroke();
      }
      for (let y = footerY + 15; y < height; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Neon corner brackets
      drawStar4(ctx, 24, 75, 16, 4, '#06B6D4');
      drawStar4(ctx, width - 24, 180, 18, 5, '#EC4899');
      ctx.restore();
      break;
    }

    case 'autumn-maple': {
      // Falling maple leaves on margins
      const drawMaple = (mx: number, my: number, mrot: number, mcolor: string) => {
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(mrot);
        ctx.fillStyle = mcolor;
        ctx.beginPath();
        ctx.ellipse(0, -10, 5, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(-8, -4, 4, 10, -0.6, 0, Math.PI * 2);
        ctx.ellipse(8, -4, 4, 10, 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawMaple(24, 80, 0.4, '#D97706');
      drawMaple(width - 24, 190, -0.5, '#B45309');
      drawMaple(20, 370, 0.7, '#EA580C');
      drawMaple(width - 20, 540, -0.3, '#D97706');
      drawMaple(width / 2 - 200, footerY + 30, 0.6, '#C2410C');
      drawMaple(width / 2 + 200, footerY + 30, -0.5, '#D97706');
      break;
    }

    case 'winter-snow': {
      // Delicate snowflake vector stars
      drawSnowflake(ctx, 24, 80, 14, '#38BDF8');
      drawSnowflake(ctx, width - 25, 180, 18, '#0284C7');
      drawSnowflake(ctx, 22, 380, 15, '#7DD3FC');
      drawSnowflake(ctx, width - 24, 530, 16, '#38BDF8');
      drawSnowflake(ctx, 35, footerY + 30, 20, '#0284C7');
      drawSnowflake(ctx, width - 35, footerY + 35, 20, '#38BDF8');
      break;
    }

    case 'coffee-mocha': {
      // Coffee beans and warm steam swirls
      const drawCoffeeBean = (bx: number, by: number, brot: number) => {
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(brot);
        ctx.fillStyle = '#8D6E63';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.quadraticCurveTo(2, 0, 0, 9);
        ctx.stroke();
        ctx.restore();
      };
      drawCoffeeBean(22, 85, 0.4);
      drawCoffeeBean(width - 22, 190, -0.6);
      drawCoffeeBean(20, 390, 0.8);
      drawCoffeeBean(width - 20, 560, -0.3);
      drawCoffeeBean(width / 2 - 190, footerY + 30, 0.2);
      drawCoffeeBean(width / 2 + 190, footerY + 30, -0.4);
      break;
    }

    case 'artistic-watercolor': {
      // Soft artistic watercolor splatter dots
      ctx.save();
      const splatters = [
        [24, 90, 8, '#C084FC'], [width - 22, 160, 12, '#F472B6'],
        [20, 340, 10, '#38BDF8'], [width - 25, 480, 9, '#C084FC'],
        [32, footerY + 25, 14, '#F472B6'], [width - 32, footerY + 35, 12, '#38BDF8']
      ];
      splatters.forEach(([sx, sy, sr, scolor]) => {
        ctx.fillStyle = scolor as string;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(sx as number, sy as number, sr as number, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc((sx as number) + 6, (sy as number) - 4, (sr as number) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      break;
    }

    case 'comic-pop': {
      // Dynamic comic pop art corner brackets & halftone dots
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.arc(16 + c * 8, 40 + r * 8, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(width - 32 + c * 8, height - 70 + r * 8, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Pop art burst corner
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, 28, 28);
      ctx.strokeRect(width - 40, height - 40, 28, 28);
      ctx.restore();
      break;
    }

    case 'botanical-floral': {
      // Elegant gold line-art botanicals on dark emerald
      ctx.save();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      const vines = [
        [22, 90, 0.3], [width - 22, 190, -0.4],
        [20, 390, 0.5], [width - 20, 560, -0.3]
      ];
      vines.forEach(([vx, vy, vrot]) => {
        ctx.save();
        ctx.translate(vx, vy);
        ctx.rotate(vrot);
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.quadraticCurveTo(8, 0, 0, 16);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(4, -6, 3, 7, 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(4, 6, 3, 7, -0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
      break;
    }

    case 'music-vinyl': {
      // Concentric vinyl record groove arcs in footer
      ctx.save();
      ctx.strokeStyle = 'rgba(254, 110, 0, 0.35)';
      ctx.lineWidth = 1.5;
      for (let r = 30; r <= 65; r += 10) {
        ctx.beginPath();
        ctx.arc(width - 20, footerY + 50, r, 0.8 * Math.PI, 1.4 * Math.PI);
        ctx.stroke();
      }

      // Audio frequency equalizer bars
      ctx.fillStyle = '#FE6E00';
      const eqHeights = [8, 16, 24, 12, 20, 28, 14, 22, 18, 10];
      eqHeights.forEach((eh, idx) => {
        ctx.fillRect(35 + idx * 7, footerY + 65 - eh, 4, eh);
      });
      ctx.restore();
      break;
    }

    case 'midnight-city': {
      // Subtle night city skyline in footer
      ctx.save();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      const buildings = [
        [width / 2 - 120, 35, 20], [width / 2 - 95, 48, 18],
        [width / 2 - 72, 30, 24], [width / 2 + 50, 42, 22],
        [width / 2 + 76, 52, 16], [width / 2 + 96, 36, 20]
      ];
      buildings.forEach(([bx, bh, bw]) => {
        ctx.fillRect(bx, footerY + 70 - bh, bw, bh);
      });

      // Twinkling bokeh circles
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(25, 90, 8, 0, Math.PI * 2);
      ctx.arc(width - 30, 160, 11, 0, Math.PI * 2);
      ctx.arc(28, 420, 9, 0, Math.PI * 2);
      ctx.arc(width - 25, 530, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'warm-cream':
    default: {
      // Classic clean studio frame with fine embossed line
      ctx.save();
      ctx.strokeStyle = config.borderColor || '#D4C4B2';
      ctx.lineWidth = 1;
      ctx.strokeRect(18, 18, width - 36, height - 36);
      ctx.restore();
      break;
    }
  }
}

/**
 * Renders the photobooth strip onto a high-resolution Canvas
 * Supports 1, 2, 3, and 4 shots seamlessly with custom illustrated themes
 */
export async function renderPhotoboothStrip(
  photos: CapturedPhoto[],
  config: StripConfig
): Promise<HTMLCanvasElement> {
  const count = Math.max(1, Math.min(photos.length, config.shotCount || 4));
  const stripWidth = 800; // Base high-res width
  const marginX = config.innerPadding || 44;
  const marginTop = config.innerPadding || 44;
  const photoGap = 24;
  const footerHeight = count === 1 ? 140 : 130;

  const photoWidth = stripWidth - marginX * 2;
  // Aspect ratio for photos: 4:3 (height = width * 0.75), or slightly taller for 1-shot (0.80)
  const photoHeight = count === 1 ? Math.round(photoWidth * 0.8) : Math.round(photoWidth * 0.75);

  const totalHeight = marginTop + count * photoHeight + (count - 1) * photoGap + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = stripWidth;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // 1. Fill Frame Background (supports linear gradient or solid)
  if (config.gradientTo && config.gradientTo.toLowerCase() !== config.frameColor.toLowerCase()) {
    const grad = ctx.createLinearGradient(0, 0, 0, totalHeight);
    grad.addColorStop(0, config.frameColor);
    grad.addColorStop(1, config.gradientTo);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = config.frameColor;
  }
  ctx.fillRect(0, 0, stripWidth, totalHeight);

  // 2. Draw Vector Theme Pattern & Illustrations
  const footerStartY = totalHeight - footerHeight + 15;
  drawThemeDecorations(ctx, config, stripWidth, totalHeight, footerStartY);

  // 3. Outer decorative border if configured
  if (config.borderWidth > 0 && config.borderColor) {
    ctx.strokeStyle = config.borderColor;
    ctx.lineWidth = config.borderWidth;
    ctx.strokeRect(
      config.borderWidth / 2,
      config.borderWidth / 2,
      stripWidth - config.borderWidth,
      totalHeight - config.borderWidth
    );
  }

  // 4. Draw Photos
  for (let i = 0; i < count; i++) {
    const photo = photos[i];
    if (!photo) continue;
    const yPos = marginTop + i * (photoHeight + photoGap);

    const img = await getCachedPhotoElement(photo);

    // Subtle photo frame / border
    ctx.save();

    // Rounded rectangle path for photo
    const radius = 6;
    ctx.beginPath();
    ctx.moveTo(marginX + radius, yPos);
    ctx.lineTo(marginX + photoWidth - radius, yPos);
    ctx.quadraticCurveTo(marginX + photoWidth, yPos, marginX + photoWidth, yPos + radius);
    ctx.lineTo(marginX + photoWidth, yPos + photoHeight - radius);
    ctx.quadraticCurveTo(
      marginX + photoWidth,
      yPos + photoHeight,
      marginX + photoWidth - radius,
      yPos + photoHeight
    );
    ctx.lineTo(marginX + radius, yPos + photoHeight);
    ctx.quadraticCurveTo(marginX, yPos + photoHeight, marginX, yPos + photoHeight - radius);
    ctx.lineTo(marginX, yPos + radius);
    ctx.quadraticCurveTo(marginX, yPos, marginX + radius, yPos);
    ctx.closePath();
    ctx.clip();

    // Center crop image to fit
    const imgRatio = img.width / img.height;
    const targetRatio = photoWidth / photoHeight;
    let sW = img.width;
    let sH = img.height;
    let sX = 0;
    let sY = 0;

    if (imgRatio > targetRatio) {
      sW = img.height * targetRatio;
      sX = (img.width - sW) / 2;
    } else {
      sH = img.width / targetRatio;
      sY = (img.height - sH) / 2;
    }

    ctx.drawImage(img, sX, sY, sW, sH, marginX, yPos, photoWidth, photoHeight);
    ctx.restore();

    // Subtle inner border line around the photo
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(marginX, yPos, photoWidth, photoHeight);
  }

  // 5. Procedural Film Grain Overlay
  if (config.grainIntensity > 0) {
    const noise = createNoiseBuffer(stripWidth, totalHeight, config.grainIntensity);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(noise, 0, 0);
    ctx.restore();
  }

  // 6. Metadata and Typography Stamping in Footer Area
  ctx.fillStyle = config.textColor;
  ctx.textAlign = 'center';

  // Branding Label
  const displayLabel = config.label || 'GRAPHIXLAB PHOTOBOOTH';
  ctx.font = 'bold 20px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(displayLabel.toUpperCase(), stripWidth / 2, footerStartY + 30);

  // Timestamp and Monospace Metadata
  if (config.showTimestamp) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '.');
    const timeStr = now.toTimeString().slice(0, 8);
    const shotLabel = count === 1 ? '1 SHOT' : `${count} SHOTS`;
    const metaString = `${dateStr} // ${timeStr} · ${shotLabel} · QUANTIZED`;

    ctx.font = '400 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.globalAlpha = 0.8;
    ctx.fillText(metaString, stripWidth / 2, footerStartY + 60);
    ctx.globalAlpha = 1.0;
  }

  // Small bottom accent line
  ctx.strokeStyle = config.textColor;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(stripWidth / 2 - 40, footerStartY + 80);
  ctx.lineTo(stripWidth / 2 + 40, footerStartY + 80);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  return canvas;
}

/**
 * Downloads photobooth strip as high-res PNG
 */
export async function downloadPhotoboothStrip(
  canvas: HTMLCanvasElement,
  customName?: string
): Promise<void> {
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = customName ? `${customName}.png` : `graphixlab-strip-${dateTag}.png`;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      resolve();
    }, 'image/png');
  });
}
