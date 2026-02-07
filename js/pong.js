(() => {
  // Clear body and style setup
  document.body.innerHTML = '';
  Object.assign(document.body.style, {
    margin: '0',
    overflow: 'hidden',
    background: '#000',
    color: '#0f0',
    fontFamily: 'monospace',
    userSelect: 'none',
    position: 'relative',
    height: '100vh',
  });

  // Create canvas and append
  const c = document.createElement('canvas');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  c.style.display = 'block';
  document.body.appendChild(c);
  const ctx = c.getContext('2d');

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

  backBtn.addEventListener('mouseenter', () => (backBtn.style.opacity = '1'));
  backBtn.addEventListener('mouseleave', () => (backBtn.style.opacity = '0.1'));
  backBtn.addEventListener('click', () => {
    window.location.href = '../play.html'; // change path if needed
  });

  // Game variables
  const paddleWidth = 120;
  const paddleHeight = 15;
  const paddleSpeed = 10;

  const ballRadius = 12;

  let paddleX = c.width / 2 - paddleWidth / 2;
  let ballX = c.width / 2;
  let ballY = c.height / 2;
  let ballVX = 5 * (Math.random() < 0.5 ? 1 : -1);
  let ballVY = 5;

  let score = 0;
  let highscore = Number(localStorage.getItem('pongHighscore') || 0);

  let gameOver = false;

  // Track mouse position for paddle movement
  let mouseX = paddleX + paddleWidth / 2;
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
  });

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);

    // Draw paddle with glowing green border
    ctx.fillStyle = '#00ff99';
    ctx.shadowColor = '#00ff99';
    ctx.shadowBlur = 15;
    ctx.fillRect(paddleX, c.height - paddleHeight - 20, paddleWidth, paddleHeight);

    ctx.shadowBlur = 0;

    // Draw ball
    ctx.beginPath();
    ctx.fillStyle = '#00ff99';
    ctx.shadowColor = '#00ff99';
    ctx.shadowBlur = 20;
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.shadowBlur = 0;

    // Draw score + highscore
    ctx.fillStyle = '#0f0';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score}`, c.width / 2, 40);
    ctx.fillText(`Highscore: ${highscore}`, c.width / 2, 70);

    if (gameOver) {
      ctx.fillStyle = '#00ff99';
      ctx.font = '48px monospace';
      ctx.fillText('GAME OVER', c.width / 2, c.height / 2);
      ctx.font = '20px monospace';
      ctx.fillText('Refresh page to try again', c.width / 2, c.height / 2 + 40);
      return;
    }

    // Move paddle towards mouse smoothly
    const targetX = mouseX - paddleWidth / 2;
    const diff = targetX - paddleX;
    paddleX += diff * 0.2;
    // Keep paddle inside canvas
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > c.width) paddleX = c.width - paddleWidth;

    // Move ball
    ballX += ballVX;
    ballY += ballVY;

    // Bounce ball off left/right walls
    if (ballX + ballRadius > c.width) {
      ballX = c.width - ballRadius;
      ballVX = -ballVX;
    } else if (ballX - ballRadius < 0) {
      ballX = ballRadius;
      ballVX = -ballVX;
    }

    // Bounce ball off paddle
    if (
      ballY + ballRadius >= c.height - paddleHeight - 20 &&
      ballX > paddleX &&
      ballX < paddleX + paddleWidth
    ) {
      ballY = c.height - paddleHeight - 20 - ballRadius;
      ballVY = -ballVY;

      // Slightly increase speed for difficulty ramp
      ballVX *= 1.05;
      ballVY *= 1.05;

      score++;
      if (score > highscore) {
        highscore = score;
        localStorage.setItem('pongHighscore', highscore);
      }
    }

    // If ball hits bottom (miss paddle) -> game over
    if (ballY - ballRadius > c.height) {
      gameOver = true;
    }

    requestAnimationFrame(draw);
  }

  // Resize canvas when window size changes
  window.addEventListener('resize', () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  });

  draw();
})();
