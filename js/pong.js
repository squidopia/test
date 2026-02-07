(() => {
  // Setup canvas with fixed size and center it
  const canvasWidth = 600;
  const canvasHeight = 400;

  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.style.color = '#0f0';
  document.body.style.fontFamily = 'monospace';
  document.body.style.userSelect = 'none';
  document.body.style.display = 'flex';
  document.body.style.flexDirection = 'column';
  document.body.style.alignItems = 'center';
  document.body.style.justifyContent = 'center';
  document.body.style.height = '100vh';

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = canvasWidth + 'px';
  container.style.height = canvasHeight + 'px';
  container.style.background = '#121212';
  container.style.boxShadow = '0 0 20px #00ff9955';
  container.style.borderRadius = '12px';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const c = document.createElement('canvas');
  c.width = canvasWidth;
  c.height = canvasHeight;
  c.style.background = '#000';
  c.style.display = 'block';
  container.appendChild(c);
  const ctx = c.getContext('2d');

  // Back button
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back';
  Object.assign(backBtn.style, {
    position: 'absolute',
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
  container.appendChild(backBtn);
  backBtn.addEventListener('mouseenter', () => backBtn.style.opacity = '1');
  backBtn.addEventListener('mouseleave', () => backBtn.style.opacity = '0.1');
  backBtn.addEventListener('click', () => {
    window.location.href = 'play.html'; // change if your play page is somewhere else
  });

  // Game variables
  const paddleWidth = 100;
  const paddleHeight = 15;
  let paddleX = (canvasWidth - paddleWidth) / 2;
  const paddleY = canvasHeight - paddleHeight - 10;
  const paddleSpeed = 7;

  let ballRadius = 12;
  let ballX = canvasWidth / 2;
  let ballY = canvasHeight / 2;
  let ballSpeedX = 4;
  let ballSpeedY = -4;

  let leftPressed = false;
  let rightPressed = false;
  let aPressed = false;
  let dPressed = false;

  let score = 0;
  let highscore = parseInt(localStorage.getItem('pongHighscore')) || 0;
  let gameOver = false;

  // Draw paddle
  function drawPaddle() {
    ctx.fillStyle = '#00ff99';
    ctx.shadowColor = '#00ff99';
    ctx.shadowBlur = 15;
    ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.shadowBlur = 0;
  }

  // Draw ball
  function drawBall() {
    ctx.beginPath();
    ctx.fillStyle = '#00ff99';
    ctx.shadowColor = '#00ff99';
    ctx.shadowBlur = 20;
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  }

  // Draw score and highscore below the canvas
  function drawScore() {
    ctx.font = '20px monospace';
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score}`, canvasWidth / 2, canvasHeight + 30);
    ctx.fillText(`Highscore: ${highscore}`, canvasWidth / 2, canvasHeight + 55);
  }

  // Draw game over screen overlay
  function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#0f0';
    ctx.font = '36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 20);
    ctx.font = '20px monospace';
    ctx.fillText(`Final Score: ${score}`, canvasWidth / 2, canvasHeight / 2 + 20);
    ctx.fillText('Press SPACE or R to Restart', canvasWidth / 2, canvasHeight / 2 + 60);
  }

  // Update paddle position based on keys pressed
  function updatePaddle() {
    if (leftPressed || aPressed) {
      paddleX -= paddleSpeed;
      if (paddleX < 0) paddleX = 0;
    }
    if (rightPressed || dPressed) {
      paddleX += paddleSpeed;
      if (paddleX + paddleWidth > canvasWidth) paddleX = canvasWidth - paddleWidth;
    }
  }

  // Update ball position and handle collisions
  function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Bounce off left/right walls
    if (ballX + ballRadius > canvasWidth) {
      ballX = canvasWidth - ballRadius;
      ballSpeedX = -ballSpeedX;
    } else if (ballX - ballRadius < 0) {
      ballX = ballRadius;
      ballSpeedX = -ballSpeedX;
    }

    // Bounce off top wall
    if (ballY - ballRadius < 0) {
      ballY = ballRadius;
      ballSpeedY = -ballSpeedY;
    }

    // Bounce off paddle
    if (
      ballY + ballRadius >= paddleY &&
      ballX > paddleX &&
      ballX < paddleX + paddleWidth &&
      ballSpeedY > 0
    ) {
      ballY = paddleY - ballRadius;
      ballSpeedY = -ballSpeedY;
      score++;
      if (score > highscore) {
        highscore = score;
        localStorage.setItem('pongHighscore', highscore);
      }
    }

    // If ball hits bottom (missed paddle), game over
    if (ballY - ballRadius > canvasHeight) {
      gameOver = true;
    }
  }

  // Restart game function
  function restartGame() {
    ballX = canvasWidth / 2;
    ballY = canvasHeight / 2;
    ballSpeedX = 4 * (Math.random() < 0.5 ? 1 : -1);
    ballSpeedY = -4;
    paddleX = (canvasWidth - paddleWidth) / 2;
    score = 0;
    gameOver = false;
  }

  // Key listeners
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') leftPressed = true;
    if (e.code === 'ArrowRight') rightPressed = true;
    if (e.code === 'KeyA') aPressed = true;
    if (e.code === 'KeyD') dPressed = true;

    if (gameOver && (e.code === 'Space' || e.code === 'KeyR')) {
      restartGame();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
    if (e.code === 'KeyA') aPressed = false;
    if (e.code === 'KeyD') dPressed = false;
  });

  // Main game loop
  function loop() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawPaddle();
    drawBall();
    drawScore();

    if (!gameOver) {
      updatePaddle();
      updateBall();
    } else {
      drawGameOver();
    }
    requestAnimationFrame(loop);
  }

  restartGame();
  loop();
})();
