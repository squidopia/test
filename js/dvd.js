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

  // Canvas setup
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  document.body.appendChild(c);

  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Load or initialize state with slower speed
  let state = JSON.parse(localStorage.getItem('dvdState')) || {
    x: 100,
    y: 100,
    vx: 2.5, // slower horizontal speed
    vy: 2,   // slower vertical speed
    color: '#00ff99',
    count: 0,
    corner: 0,
    lastUpdate: Date.now(),
  };

  // Generate bright random color
  function randColor() {
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
    opacity: '0.3',
    transition: 'opacity 0.4s',
    zIndex: '9999',
  });
  document.body.appendChild(backBtn);

  backBtn.onmouseenter = () => backBtn.style.opacity = '1';
  backBtn.onmouseleave = () => backBtn.style.opacity = '0.3';
  backBtn.onclick = () => {
    localStorage.removeItem('dvdState');
    window.location.href = './play.html';
  };

  // DVD text dimensions
  const dvdWidth = 80;
  const dvdHeight = 48;

  // Smaller random speed jitter on bounce to keep movement smoother
  function jitterSpeed(speed) {
    const jitter = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25
    return speed + jitter;
  }

  // Helper: check if a is near b within tolerance (bigger tolerance for easier corner detection)
  function near(a, b, tolerance = 10) {
    return Math.abs(a - b) <= tolerance;
  }

  // Update simulation state
  function update() {
    state.x += state.vx;
    state.y += state.vy;

    let bounced = false;

    // Bounce right wall
    if (state.x + dvdWidth > c.width) {
      state.x = c.width - dvdWidth - 1;
      state.vx = -Math.abs(jitterSpeed(state.vx));
      bounced = true;
    }
    // Bounce left wall
    else if (state.x < 0) {
      state.x = 1;
      state.vx = Math.abs(jitterSpeed(state.vx));
      bounced = true;
    }

    // Bounce bottom wall
    if (state.y > c.height) {
      state.y = c.height - 1;
      state.vy = -Math.abs(jitterSpeed(state.vy));
      bounced = true;
    }
    // Bounce top wall
    else if (state.y - dvdHeight < 0) {
      state.y = dvdHeight + 1;
      state.vy = Math.abs(jitterSpeed(state.vy));
      bounced = true;
    }

    if (bounced) {
      state.count++;

      const onLR = near(state.x, 1) || near(state.x, c.width - dvdWidth - 1);
      const onTB = near(state.y, dvdHeight + 1) || near(state.y, c.height - 1);

      if (onLR && onTB) {
        state.corner++;
        state.color = randColor();
      }
    }
  }

  // Draw frame
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

  // Main animation loop
  function loop() {
    const now = Date.now();
    let elapsed = now - state.lastUpdate;
    state.lastUpdate = now;

    const step = 16; // ~60fps
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
