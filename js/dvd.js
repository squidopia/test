(() => {
  // Clear body and set styles
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

  // Load saved state or set defaults
  let state = JSON.parse(localStorage.getItem('dvdState')) || {
    x: 100,
    y: 100,
    vx: 5,
    vy: 4,
    color: '#00ff99',
    count: 0,
    corner: 0,
  };

  // Random color helper
  function randColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  // Back button setup
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
    window.location.href = '../index.html'; // Change if your home page is elsewhere
  });

  // DVD dimensions (approx)
  const dvdWidth = 80;
  const dvdHeight = 48;

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.fillStyle = state.color;
    ctx.font = '48px monospace';
    ctx.fillText('DVD', state.x, state.y);

    // Move
    state.x += state.vx;
    state.y += state.vy;

    let bounced = false;

    // Bounce X
    if (state.x + dvdWidth > c.width) {
      state.x = c.width - dvdWidth;
      state.vx = -state.vx;
      bounced = true;
    } else if (state.x < 0) {
      state.x = 0;
      state.vx = -state.vx;
      bounced = true;
    }

    // Bounce Y
    if (state.y > c.height) {
      state.y = c.height;
      state.vy = -state.vy;
      bounced = true;
    } else if (state.y - dvdHeight < 0) {
      state.y = dvdHeight;
      state.vy = -state.vy;
      bounced = true;
    }

    if (bounced) {
      state.count++;
      // Check corner bounce: touching both X and Y edges simultaneously
      const onLeftOrRight = (state.x === 0 || state.x === c.width - dvdWidth);
      const onTopOrBottom = (state.y === dvdHeight || state.y === c.height);
      if (onLeftOrRight && onTopOrBottom) {
        state.corner++;
        state.color = randColor();
      }
    }

    // Draw counters
    ctx.fillStyle = '#0f0';
    ctx.font = '20px monospace';
    ctx.fillText('Bounces: ' + state.count, 10, 30);
    ctx.fillText('Corner Bounces: ' + state.corner, 10, 60);

    // Save state
    localStorage.setItem('dvdState', JSON.stringify(state));

    requestAnimationFrame(draw);
  }

  // Resize canvas on window resize
  window.addEventListener('resize', () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  });

  draw();
})();
