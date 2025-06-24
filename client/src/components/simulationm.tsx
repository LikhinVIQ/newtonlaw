import React, { useRef, useEffect, useState, useCallback } from "react";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  isDragging: boolean;
}

const RESTITUTION = 0.8;

export default function Simulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const ballsRef = useRef<Ball[]>([]); // live ball state for animation
  const dragHistoryRef = useRef<Array<{ x: number; y: number; time: number }>>(
    [],
  );

  // States for gravity and masses
  const [gravity, setGravity] = useState(10);
  const [gravityDirection, setGravityDirection] = useState(270);
  const [blueMass, setBlueMass] = useState(1);
  const [grayMass, setGrayMass] = useState(0.8);

  // Refs to keep latest values accessible inside animation loop
  const gravityRef = useRef(gravity);
  const gravityDirectionRef = useRef(gravityDirection);

  useEffect(() => {
    gravityRef.current = gravity;
  }, [gravity]);

  useEffect(() => {
    gravityDirectionRef.current = gravityDirection;
  }, [gravityDirection]);

  // Initial balls state
  const [balls, setBalls] = useState<Ball[]>([
    {
      x: 150,
      y: 100,
      vx: 0,
      vy: 0,
      radius: 25,
      mass: 1,
      color: "#3b82f6",
      isDragging: false,
    },
    {
      x: 350,
      y: 100,
      vx: 0,
      vy: 0,
      radius: 20,
      mass: 0.8,
      color: "#6b7280",
      isDragging: false,
    },
  ]);

  // Sync ballsRef whenever balls state changes
  useEffect(() => {
    ballsRef.current = balls;
  }, [balls]);

  // Update masses and radii based on sliders
  const updateBallMass = useCallback(() => {
    setBalls((prev) =>
      prev.map((ball, index) => {
        if (index === 0) {
          return {
            ...ball,
            mass: blueMass,
            radius: Math.max(15, 15 + blueMass * 5),
          };
        } else if (index === 1) {
          return {
            ...ball,
            mass: grayMass,
            radius: Math.max(15, 15 + grayMass * 5),
          };
        }
        return ball;
      }),
    );
  }, [blueMass, grayMass]);

  useEffect(() => {
    updateBallMass();
  }, [updateBallMass]);

  const checkCollision = (ball1: Ball, ball2: Ball): boolean => {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ball1.radius + ball2.radius;
  };

  const resolveCollision = (ball1: Ball, ball2: Ball) => {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    const overlap = ball1.radius + ball2.radius - distance;
    const totalMass = ball1.mass + ball2.mass;
    const separation1 = overlap * (ball2.mass / totalMass);
    const separation2 = overlap * (ball1.mass / totalMass);

    ball1.x -= nx * separation1;
    ball1.y -= ny * separation1;
    ball2.x += nx * separation2;
    ball2.y += ny * separation2;

    const dvx = ball2.vx - ball1.vx;
    const dvy = ball2.vy - ball1.vy;
    const dvn = dvx * nx + dvy * ny;

    if (dvn > 0) return;

    const impulse = (2 * dvn) / totalMass;

    ball1.vx += impulse * ball2.mass * nx * RESTITUTION;
    ball1.vy += impulse * ball2.mass * ny * RESTITUTION;
    ball2.vx -= impulse * ball1.mass * nx * RESTITUTION;
    ball2.vy -= impulse * ball1.mass * ny * RESTITUTION;
  };

  const updatePhysics = (deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newBalls = ballsRef.current.map((ball) => ({ ...ball }));

    newBalls.forEach((ball) => {
      if (!ball.isDragging) {
        // Use refs for latest gravity values
        const gravityRadians = (gravityDirectionRef.current * Math.PI) / 180;
        ball.vx += Math.cos(gravityRadians) * gravityRef.current * deltaTime;
        ball.vy += Math.sin(gravityRadians) * gravityRef.current * deltaTime;

        ball.x += ball.vx * deltaTime;
        ball.y += ball.vy * deltaTime;

        // Bounce off walls
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx * RESTITUTION;
        } else if (ball.x + ball.radius > canvas.width) {
          ball.x = canvas.width - ball.radius;
          ball.vx = -ball.vx * RESTITUTION;
        }

        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy * RESTITUTION;
        } else if (ball.y + ball.radius > canvas.height) {
          ball.y = canvas.height - ball.radius;
          ball.vy = -ball.vy * RESTITUTION;
        }
      }
    });

    for (let i = 0; i < newBalls.length; i++) {
      for (let j = i + 1; j < newBalls.length; j++) {
        if (checkCollision(newBalls[i], newBalls[j])) {
          resolveCollision(newBalls[i], newBalls[j]);
        }
      }
    }

    ballsRef.current = newBalls;
    setBalls(newBalls);
  };

  useEffect(() => {
    const animate = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 1000,
        1 / 30,
      );
      lastTimeRef.current = currentTime;

      if (deltaTime > 0) {
        updatePhysics(deltaTime);
      }
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ballsRef.current.forEach((ball) => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.strokeStyle = ball.isDragging ? "#ef4444" : "#1f2937";
      ctx.lineWidth = ball.isDragging ? 3 : 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(ball.mass.toFixed(1), ball.x, ball.y + 4);
    });

    ctx.fillStyle = "#374151";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Drag balls to move them", 10, 25);
    ctx.fillText(
      `Gravity: ${gravityRef.current.toFixed(1)} m/s² at ${gravityDirectionRef.current.toFixed(0)}°`,
      10,
      45,
    );
    ctx.fillText("Blue & Gray: adjustable mass", 10, 65);

    const centerX = canvas.width - 50;
    const centerY = 50;
    const arrowLength = 30;
    const gravityRadians = (gravityDirectionRef.current * Math.PI) / 180;
    const arrowEndX = centerX + Math.cos(gravityRadians) * arrowLength;
    const arrowEndY = centerY + Math.sin(gravityRadians) * arrowLength;

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.stroke();

    const headLength = 8;
    const headAngle = Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(arrowEndX, arrowEndY);
    ctx.lineTo(
      arrowEndX - headLength * Math.cos(gravityRadians - headAngle),
      arrowEndY - headLength * Math.sin(gravityRadians - headAngle),
    );
    ctx.moveTo(arrowEndX, arrowEndY);
    ctx.lineTo(
      arrowEndX - headLength * Math.cos(gravityRadians + headAngle),
      arrowEndY - headLength * Math.sin(gravityRadians + headAngle),
    );
    ctx.stroke();
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    return {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(e);
    const now = performance.now();

    setBalls((prev) => {
      const newBalls = [...prev];
      for (let i = newBalls.length - 1; i >= 0; i--) {
        const ball = newBalls[i];
        const dx = mousePos.x - ball.x;
        const dy = mousePos.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= ball.radius) {
          ball.isDragging = true;
          ball.vx = 0;
          ball.vy = 0;
          dragHistoryRef.current = [{ x: ball.x, y: ball.y, time: now }];
          break;
        }
      }
      ballsRef.current = newBalls;
      return newBalls;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(e);
    const now = performance.now();

    setBalls((prev) => {
      const newBalls = [...prev];
      const draggingBall = newBalls.find((b) => b.isDragging);
      if (draggingBall) {
        const canvas = canvasRef.current!;
        draggingBall.x = Math.max(
          draggingBall.radius,
          Math.min(canvas.width - draggingBall.radius, mousePos.x),
        );
        draggingBall.y = Math.max(
          draggingBall.radius,
          Math.min(canvas.height - draggingBall.radius, mousePos.y),
        );

        dragHistoryRef.current.push({
          x: draggingBall.x,
          y: draggingBall.y,
          time: now,
        });
        dragHistoryRef.current = dragHistoryRef.current.filter(
          (pos) => now - pos.time <= 150,
        );
      }
      ballsRef.current = newBalls;
      return newBalls;
    });
  };

  const handleMouseUp = () => {
    setBalls((prev) => {
      const newBalls = prev.map((ball) => ({ ...ball }));
      const draggingBall = newBalls.find((b) => b.isDragging);

      if (draggingBall && dragHistoryRef.current.length >= 2) {
        const recent = dragHistoryRef.current;
        const current = recent[recent.length - 1];

        let previous = recent[0];
        for (let i = recent.length - 2; i >= 0; i--) {
          if (current.time - recent[i].time >= 50) {
            previous = recent[i];
            break;
          }
        }

        const dt = (current.time - previous.time) / 1000;
        if (dt > 0) {
          const velocityScale = 3;
          draggingBall.vx = ((current.x - previous.x) / dt) * velocityScale;
          draggingBall.vy = ((current.y - previous.y) / dt) * velocityScale;

          const maxVelocity = 800;
          const v = Math.hypot(draggingBall.vx, draggingBall.vy);
          if (v > maxVelocity) {
            const scale = maxVelocity / v;
            draggingBall.vx *= scale;
            draggingBall.vy *= scale;
          }
        }
      }

      dragHistoryRef.current = [];
      const finalBalls = newBalls.map((b) => ({ ...b, isDragging: false }));
      ballsRef.current = finalBalls;
      return finalBalls;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white space-y-4">
      <h1 className="text-3xl font-bold mb-4">Physics Simulation -Chatgpt</h1>

      {/* Sliders for gravity strength and direction */}
      <div className="flex flex-col space-y-2 max-w-md">
        <label>
          Gravity Strength: {gravity.toFixed(1)} m/s²
          <input
            type="range"
            min="0"
            max="50"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label>
          Gravity Direction: {gravityDirection.toFixed(0)}°
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={gravityDirection}
            onChange={(e) => setGravityDirection(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label>
          Blue Ball Mass: {blueMass.toFixed(1)}
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={blueMass}
            onChange={(e) => setBlueMass(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label>
          Gray Ball Mass: {grayMass.toFixed(1)}
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={grayMass}
            onChange={(e) => setGrayMass(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border-2 border-gray-300 rounded-lg shadow-lg cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
