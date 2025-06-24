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

export default function Simulation2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [gravity, setGravity] = useState(10);
  const [gravityDirection, setGravityDirection] = useState(270); // 270 degrees = down
  const [blueMass, setBlueMass] = useState(1);
  const [grayMass, setGrayMass] = useState(0.8);
  const dragHistoryRef = useRef<Array<{ x: number; y: number; time: number }>>(
    [],
  );

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

    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Separate balls to prevent overlap
    const overlap = ball1.radius + ball2.radius - distance;
    const totalMass = ball1.mass + ball2.mass;
    const separation1 = overlap * (ball2.mass / totalMass);
    const separation2 = overlap * (ball1.mass / totalMass);

    ball1.x -= nx * separation1;
    ball1.y -= ny * separation1;
    ball2.x += nx * separation2;
    ball2.y += ny * separation2;

    // Calculate relative velocity
    const dvx = ball2.vx - ball1.vx;
    const dvy = ball2.vy - ball1.vy;
    const dvn = dvx * nx + dvy * ny;

    // Objects separating
    if (dvn > 0) return;

    // Calculate collision impulse
    const impulse = (2 * dvn) / totalMass;

    ball1.vx += impulse * ball2.mass * nx * RESTITUTION;
    ball1.vy += impulse * ball2.mass * ny * RESTITUTION;
    ball2.vx -= impulse * ball1.mass * nx * RESTITUTION;
    ball2.vy -= impulse * ball1.mass * ny * RESTITUTION;
  };

  const updatePhysics = (deltaTime: number) => {
    setBalls((prevBalls) => {
      const newBalls = prevBalls.map((ball) => ({ ...ball }));
      const canvas = canvasRef.current;
      if (!canvas) return newBalls;

      // Apply physics to each ball
      newBalls.forEach((ball) => {
        if (!ball.isDragging) {
          // Apply gravity in the specified direction
          const gravityRadians = (gravityDirection * Math.PI) / 180;
          ball.vx += Math.cos(gravityRadians) * gravity * deltaTime;
          ball.vy += Math.sin(gravityRadians) * gravity * deltaTime;

          // Update position (no friction applied)
          ball.x += ball.vx * deltaTime;
          ball.y += ball.vy * deltaTime;

          // Boundary collisions
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

      // Check ball-to-ball collisions
      for (let i = 0; i < newBalls.length; i++) {
        for (let j = i + 1; j < newBalls.length; j++) {
          if (checkCollision(newBalls[i], newBalls[j])) {
            resolveCollision(newBalls[i], newBalls[j]);
          }
        }
      }

      return newBalls;
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw balls
    balls.forEach((ball, index) => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.strokeStyle = ball.isDragging ? "#ef4444" : "#1f2937";
      ctx.lineWidth = ball.isDragging ? 3 : 2;
      ctx.stroke();

      // Draw mass indicator
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(ball.mass.toFixed(1), ball.x, ball.y + 4);
    });

    // Draw info
    ctx.fillStyle = "#374151";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Drag balls to move them", 10, 25);
    ctx.fillText(`Gravity: ${gravity} m/s² at ${gravityDirection}°`, 10, 45);
    ctx.fillText("Blue & Gray: adjustable mass", 10, 65);

    // Draw gravity direction arrow
    const centerX = canvas.width - 50;
    const centerY = 50;
    const arrowLength = 30;
    const gravityRadians = (gravityDirection * Math.PI) / 180;
    const arrowEndX = centerX + Math.cos(gravityRadians) * arrowLength;
    const arrowEndY = centerY + Math.sin(gravityRadians) * arrowLength;

    // Draw arrow
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.stroke();

    // Draw arrowhead
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

  useEffect(() => {
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balls]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(e);
    const currentTime = performance.now();

    setBalls((prevBalls) => {
      const newBalls = [...prevBalls];

      for (let i = newBalls.length - 1; i >= 0; i--) {
        const ball = newBalls[i];
        const dx = mousePos.x - ball.x;
        const dy = mousePos.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= ball.radius) {
          ball.isDragging = true;
          ball.vx = 0;
          ball.vy = 0;

          // Initialize drag history with current position
          dragHistoryRef.current = [
            { x: ball.x, y: ball.y, time: currentTime },
          ];
          break;
        }
      }

      return newBalls;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(e);
    const currentTime = performance.now();

    setBalls((prevBalls) => {
      const newBalls = [...prevBalls];
      const draggingBall = newBalls.find((ball) => ball.isDragging);

      if (draggingBall) {
        const canvas = canvasRef.current;
        if (canvas) {
          const newX = Math.max(
            draggingBall.radius,
            Math.min(canvas.width - draggingBall.radius, mousePos.x),
          );
          const newY = Math.max(
            draggingBall.radius,
            Math.min(canvas.height - draggingBall.radius, mousePos.y),
          );

          draggingBall.x = newX;
          draggingBall.y = newY;

          // Update drag history with ball position (not mouse position)
          dragHistoryRef.current.push({ x: newX, y: newY, time: currentTime });

          // Keep only recent history (last 150ms for smoother momentum)
          dragHistoryRef.current = dragHistoryRef.current.filter(
            (pos) => currentTime - pos.time <= 150,
          );
        }
      }

      return newBalls;
    });
  };

  const handleMouseUp = () => {
    setBalls((prevBalls) => {
      const newBalls = [...prevBalls];
      const draggingBall = newBalls.find((ball) => ball.isDragging);

      if (draggingBall && dragHistoryRef.current.length >= 2) {
        // Calculate velocity based on recent ball movement
        const recent = dragHistoryRef.current;
        const current = recent[recent.length - 1];

        // Find a point from earlier in the drag history
        let previous = recent[0];
        for (let i = recent.length - 2; i >= 0; i--) {
          if (current.time - recent[i].time >= 50) {
            // At least 50ms ago
            previous = recent[i];
            break;
          }
        }

        const timeDiff = (current.time - previous.time) / 1000; // Convert to seconds

        if (timeDiff > 0) {
          const velocityScale = 3; // Increased for more noticeable momentum
          draggingBall.vx =
            ((current.x - previous.x) / timeDiff) * velocityScale;
          draggingBall.vy =
            ((current.y - previous.y) / timeDiff) * velocityScale;

          // Limit maximum velocity
          const maxVelocity = 800;
          const velocity = Math.sqrt(
            draggingBall.vx * draggingBall.vx +
              draggingBall.vy * draggingBall.vy,
          );
          if (velocity > maxVelocity) {
            const scale = maxVelocity / velocity;
            draggingBall.vx *= scale;
            draggingBall.vy *= scale;
          }
        }
      }

      return newBalls.map((ball) => ({ ...ball, isDragging: false }));
    });

    // Clear drag history
    dragHistoryRef.current = [];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Physics Simulation
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gravity: {gravity.toFixed(1)} m/s²
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>30</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gravity Direction: {gravityDirection}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="15"
            value={gravityDirection}
            onChange={(e) => setGravityDirection(parseFloat(e.target.value))}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0° (→)</span>
            <span>360° (→)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blue Ball: {blueMass.toFixed(1)} kg
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={blueMass}
            onChange={(e) => setBlueMass(parseFloat(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5</span>
            <span>5.0</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gray Ball: {grayMass.toFixed(1)} kg
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={grayMass}
            onChange={(e) => setGrayMass(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5</span>
            <span>5.0</span>
          </div>
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="block cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Instructions:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click and drag balls to move them around</li>
          <li>Release balls while moving to give them momentum</li>
          <li>Adjust gravity strength and direction with sliders</li>
          <li>Change ball masses to see collision effects</li>
          <li>Red arrow shows gravity direction</li>
          <li>No friction - balls keep moving until they hit something!</li>
          <li>Try sideways or upward gravity for fun effects</li>
        </ul>
      </div>
    </div>
  );
}
