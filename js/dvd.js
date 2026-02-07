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

  // Canvas
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  document.body.appendChild(c);

  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Load state from localStorage or default
  let state = JSON.parse(localStorage.getItem('dvdState')) || {
    x: 100,
    y: 100,
    vx: 5,
    vy: 4,
    color: '#00ff99',
    count: 0,
    corner: 0,
    lastUpdate: Date.now(),
  };

  // Generate random color in bright spectrum for visibility
  function randColor() {
    // Limit RGB to 100-255 range for bright colors
    const r = 100 + Math.floor(Math.random() * 156);
    const g = 100 + Math.floor(Math.random() * 156);
    const b = 100 + Math.floor(Math.random() * 156);
    return `rgb(${r},${g},${b})`;
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
    zIndex: '9999',
  });
  document.body.appendChild(backBtn);

  backBtn.onmouseenter = () => backBtn.style.opacity = '1';
  backBtn.onmouseleave = () => backBtn.style.opacity = '0.1';
  backBtn.onclick = () => {
    localStorage.removeItem('dvdState');
    window.location.href = './play.html';
  };

  // DVD text dimensions
  const dvdWidth = 80;
  const dvdHeight = 48;

  // Add tiny random speed jitter on bounce
  function jitterSpeed(speed) {
    const jitter = (Math.random() - 0.5) * 1.5; // random between -0.75 and +0.75
    return speed + jitter;
  }

  // Update simulation state
  function update() {
    state.x += state.vx;
    state.y += state.vy;

    let bounced = false;

    // Bounce right wall
    if (state.x + dvdWidth > c.width) {
      state.x = c.width - dvdWidth - 1; // tiny offset to avoid sticking
      state.vx = -Math.abs(jitterSpeed(state.vx)); // ensure going left with jitter
      bounced = true;
    }
    // Bounce left wall
    else if (state.x < 0) {
      state.x = 1; // tiny offset
      state.vx = Math.abs(jitterSpeed(state.vx)); // ensure going right with jitter
      bounced = true;
    }

    // Bounce bottom wall
    if (state.y > c.height) {
      state.y = c.height - 1; // tiny offset
      state.vy = -Math.abs(jitterSpeed(state.vy)); // ensure going up with jitter
      bounced = true;
    }
    // Bounce top wall
    else if (state.y - dvdHeight < 0) {
      state.y = dvdHeight + 1; // tiny offset
      state.vy = Math.abs(jitterSpeed(state.vy)); // ensure going down with jitter
      bounced = true;
    }

    if (bounced) {
      state.count++;

      const onLR = (state.x === 1 || state.x === c.width - dvdWidth - 1);
      const onTB = (state.y === dvdHeight + 1 || state.y === c.height - 1);

      if (onLR && onTB) {
        state.corner++;
        state.color = randColor();
      }
    }
  }

  // Draw current frame
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.fillStyle = state.color;
    ctx.font = '48px monospace';
    ctx.fillText('DVD', state.x, state.y);

    ctx.fillStyle = '#0f0';
    ctx.font = '20px monospace';
    ctx.fillText('Bounces: ' + state.count, 10, 30);
    ctx.fillText('Corner Bounces: ' + state.corner, 10, 60);
  }

  // Main loop with time-based stepping
  function loop() {
    const now = Date.now();
    let elapsed = now - state.lastUpdate;
    state.lastUpdate = now;

    const step = 16; // ~60 updates/sec
    while (elapsed >= step) {
      update();
      elapsed -= step;
    }

    draw();
    localStorage.setItem('dvdState', JSON.stringify(state));
    requestAnimationFrame(loop);
  }

  loop();
})();
