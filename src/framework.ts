import { Vector2 } from "./Vector2"

export const useAnimationCanvas = (canvas: HTMLCanvasElement) => {
  const setSize = (sizeVector: Vector2) => {
    canvas.width = sizeVector.x
    canvas.height = sizeVector.y
  }

  let lastTimestamp = 0;
  let fps = 0;

  const calculateFPS = (timestamp: number) => {
    if (lastTimestamp) {
      const delta = timestamp - lastTimestamp; // Time difference in milliseconds
      fps = 1000 / delta; // Convert to frames per second
    }
    lastTimestamp = timestamp;
    return fps;
  };
  
  const startAnimationLoop = (callback: (currentFPS: number,currentTime: number, startTime: number) => void): (() => void) => {
    const startTime = performance.now();
    let animationId: number;
    const animate = (currentTimestamp: number) => {
      animationId = requestAnimationFrame(animate);
      const currentFPS = calculateFPS(currentTimestamp);
      callback(currentFPS, currentTimestamp - startTime, startTime);
    }
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }

  const math = {
    /**
     * Linearly interpolates between two values.
     * @param a - The starting value.
     * @param b - The ending value.
     * @param t - The interpolation factor, typically between 0 and 1.
     * @returns The interpolated value.
     */
    lerp: (a: number, b: number, t: number): number => a + t * (b - a),
  
    /**
     * Clamps a number to lie within a specified range.
     * @param value - The input value to clamp.
     * @param min - The lower bound of the range.
     * @param max - The upper bound of the range.
     * @returns The clamped value, constrained between `min` and `max`.
     */
    clamp: (min: number, max: number, value: number): number =>
      Math.max(min, Math.min(value, max)),

    clampedLerp: (min: number, max: number, value: number): number => math.clamp(min, max, math.lerp(min, max, value)),

    randomSign: () => Math.random() > 0.5 ? 1 : -1
  };

  return {
    math,
    setSize,
    startAnimationLoop
  }
}