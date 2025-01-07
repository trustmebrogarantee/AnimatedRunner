import { useAnimationCanvas } from './framework'
import './style.css'

import { Vector2 } from './Vector2'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<canvas id="scene"></canvas>`;
const canvas = document.getElementById('scene') as HTMLCanvasElement;

const global = {
  canvas,
  ctx: canvas.getContext('2d') as CanvasRenderingContext2D,
  v2_canvasSize: new Vector2(window.innerWidth, window.innerHeight),
};

window.addEventListener('resize', () => {
  global.v2_canvasSize.x = window.innerWidth;
  global.v2_canvasSize.y = window.innerHeight;
  setSize(global.v2_canvasSize);
});

const { startAnimationLoop, setSize, math, dpr } = useAnimationCanvas(global.canvas);

let yy = 0
document.addEventListener('mousemove', (e) => {
  // yy = e.clientY;
});

const MAX_DEGREES = 360
const DEGREE = (Math.PI * 2) / MAX_DEGREES

const randomMinMax = (min: number, max: number) => (Math.random() * (max - min)) + min
let path: [number, number][] = [];

const createRunner = (ctx: CanvasRenderingContext2D, color: string) => {
  let x = 0;
  let y = global.v2_canvasSize.y / 2;
  let targetY = y; 
  let lastStepTimestamp = 0
  let rand = randomMinMax(0.5, 0.9)


  const move = (currentTime: number) => {
    const lerpSpeed = 0.1;
    
    if (!lastStepTimestamp || ((currentTime - lastStepTimestamp) > 1000 / 10)) {
      lastStepTimestamp = currentTime
      rand = randomMinMax(1, 1.5)
    }

    const degrees = (currentTime / 10) % MAX_DEGREES
    
    targetY = 
      global.v2_canvasSize.y * 
      Math.sin(DEGREE * degrees) * 0.1 + 
      (global.v2_canvasSize.y / 2) * rand

    y = math.lerp(y, targetY, lerpSpeed);
    x = x + (math.clampedLerp(0, (global.canvas.width) / 2, 0.005)) * rand;
    
    return { x, y, degrees }
  }

  const drawAt = (x: number, y: number, cameraOffsetX: number) => {
    path = path.filter(([px]) => px > cameraOffsetX);
    path.push([x, y]);
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    for (let i = 0; i < path.length; i++) {
      const [px, py] = path[i];
      if (i === 0) ctx.moveTo(px, py);
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    
    // Draw dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '12px Mono';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(y.toFixed(0), x, y - 20)
  }
  
  return { move, drawAt }
}

const whiteSnake = createRunner(global.ctx, 'white')
const greenSnake = createRunner(global.ctx, 'lightgreen')
const yellowSnake = createRunner(global.ctx, 'yellow')

let cameraOffsetX = 0;

let greenSnakeX = 0, greenSnakeY = 0
let yellowSnakeX = 0, yellowSnakeY = 0

startAnimationLoop((currentFPS, currentTime) => {
  const { ctx } = global;
  ctx.save();
  ctx.clearRect(0, 0, (global.canvas.width), (global.canvas.height));
  setSize(global.v2_canvasSize);

  ctx.translate(-cameraOffsetX, 0);

  let { x, y } = whiteSnake.move(currentTime)

  
  if (yy) {
    let mouseFactorY = y * (yy / (global.canvas.height))
    y = y + mouseFactorY - ((global.canvas.height) / 2)
  }
  // x = x + mouseFactorX - (global.canvas.width / 2)

  greenSnakeX = math.lerp(greenSnakeX, x, 0.35)
  yellowSnakeX = math.lerp(yellowSnakeX, x, 0.05)
  greenSnakeY = math.lerp(greenSnakeY, y, 0.035)
  yellowSnakeY = math.lerp(yellowSnakeY, y, 0.05)

  whiteSnake.drawAt(x, y, cameraOffsetX)

  greenSnake.drawAt(greenSnakeX, greenSnakeY, cameraOffsetX)
  yellowSnake.drawAt(yellowSnakeX, yellowSnakeY, cameraOffsetX)


  cameraOffsetX = x < (global.canvas.width) ? 0 : x - (global.canvas.width);
  cameraOffsetX = math.lerp(cameraOffsetX, x, 0.1);
  
  // Show FPS
  ctx.font = '48px Mono';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(dpr.toFixed(2) + ':' + currentFPS, cameraOffsetX + 30, 60)
  
  ctx.restore();
});
