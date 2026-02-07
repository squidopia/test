(() => {
  // Clear body and set styles
  document.body.innerHTML = '';
  Object.assign(document.body.style, {
    margin: '0',
    background: '#000',
    color: '#0f0',
    fontFamily: 'monospace',
    userSelect: 'none',
    position: 'relative',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  });

  const scale = 30;      // size of each cell in px
  const gridSize = 15;   // 15x15 grid

  const canvas = document.createElement('canvas');
  canvas.width = scale * gridSize;
  canvas.height = scale * gridSize;

  // Add glowing green border to canvas
  Object.assign(canvas.style, {
    boxShadow: '0 0 20px 5px #00ff99aa, inset 0 0 20px 3px #00ff99cc',
    borderRadius: '12px',
    display: 'block',
    marginBottom: '20px',
  });

  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Container for scores under canvas
  const scoreDiv = document.createElement('div');
  scoreDiv.style.color = '#0f0';
  scoreDiv.style.fontFamily = 'monospace';
  scoreDiv.style.fontSize = '20px';
  scoreDiv.style.textAlign = 'center';
  scoreDiv.style.width = canvas.width + 'px';
  scoreDiv.style.marginBottom = '10px';
  document.body.appendChild(scoreDiv);

  // Back button
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back';
  Object.assign(backBtn.style, {
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    padding: '8px 15px',
    fontSize: '16px',
    fontWeight: 'bold',
    background: '#00ff99',
    border: 'none',
    borderRadius: '8px',
    color: '#121212',
    cursor: 'pointer',
    boxShadow: '0 0 10px #00ff99',
    opacity: '0.1',
    transition: 'opacity 0.4s',
    userSelect: 'none',
    zIndex: '9999',
  });
  document.body.appendChild(backBtn);

  backBtn.addEventListener('mouseenter', () => {
    backBtn.style.opacity = '1';
  });
  backBtn.addEventListener('mouseleave', () => {
    backBtn.style.opacity = '0.1';
  });
  backBtn.addEventListener('click', () => {
    window.location.href = '/play.html'; // change as needed
  });

  // Load highscore
  let highscore = parseInt(localStorage.getItem('snakeHighscore')) || 0;

  // Game variables
  let snake = [{ x: 7, y: 7 }];
  let direction = { x: 1, y: 0 }; // start moving right
  let food = null;
  let gameOver = false;
  let score = 0;

  function placeFood() {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      if (!snake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        food = newFood;
        break;
      }
    }
  }

  placeFood();

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      x * scale,
      y * scale,
      scale - 1,
      scale - 1
    );
  }

  // Draw subtle checkerboard background
  function drawCheckerboard() {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isLight = (x + y) % 2 === 0;
        ctx.fillStyle = isLight ? '#003300' : '#002200'; // dark green shades
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  function draw() {
    drawCheckerboard();

    // Draw food
    drawCell(food.x, food.y, '#00ff99');

    // Draw snake with brighter tail
    snake.forEach((segment, i) => {
      if (i === 0) {
        drawCell(segment.x, segment.y, '#0f0'); // head bright green
      } else {
        // Tail: lighter green, brighter than before
        drawCell(segment.x, segment.y, '#28cc28');
      }
    });

    // Draw score and highscore text (moved to scoreDiv now)
    scoreDiv.textContent = `Score: ${score}    Highscore: ${highscore}`;

    if (gameOver) {
      ctx.fillStyle = '#f00';
      ctx.font = '40px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);

      ctx.font = '20px monospace';
      ctx.fillText('Press Space or R to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }
  }

  function update() {
    if (gameOver) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      gameOver = true;
      saveHighscore();
      return;
    }

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver = true;
      saveHighscore();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      placeFood();
    } else {
      snake.pop();
    }
  }

  function saveHighscore() {
    if (score > highscore) {
      highscore = score;
      localStorage.setItem('snakeHighscore', highscore);
    }
  }

  // Input handling
  window.addEventListener('keydown', e => {
    if (gameOver && (e.key === ' ' || e.key.toLowerCase() === 'r')) {
      restart();
      return;
    }
    if (gameOver) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        if (direction.y !== 1) direction = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
        if (direction.y !== -1) direction = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
        if (direction.x !== 1) direction = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
        if (direction.x !== -1) direction = { x: 1, y: 0 };
        break;
    }
  });

  function restart() {
    snake = [{ x: 7, y: 7 }];
    direction = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    placeFood();
  }

  const frameDuration = 200; // slowed down from 150ms to 200ms
  let lastTime = 0;
  function gameLoop(timestamp = 0) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    if (delta > frameDuration) {
      update();
      lastTime = timestamp;
    }
    draw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
})();
