(() => {
    document.body.innerHTML = "";
    Object.assign(document.body.style, {
        margin: 0,
        background: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "monospace",
        color: "#0f0"
    });

    let g = document.createElement("div"),
        p = document.createElement("div"),
        ui = document.createElement("div"),
        over = document.createElement("div");

    // GAME BOX
    g.style = "position:relative;width:420px;height:600px;background:#1b1b1b;border-radius:14px;overflow:hidden;box-shadow:0 0 30px #00ff99"; // green glow

    // PLAYER
    p.style = "position:absolute;width:60px;height:16px;background:#00ff99;bottom:12px;left:180px;border-radius:8px;box-shadow:0 0 15px #00ff99";

    // UI
    ui.style = "margin-top:10px;text-align:center;font-size:18px;color:#00ff99";

    // GAME OVER
    over.style = "position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;background:#000c;font-size:32px;color:#ff5555;text-shadow:0 0 10px #ff0000";
    over.innerHTML = `<div style="margin-bottom:16px;">GAME OVER</div><button style="padding:10px 20px;font-size:18px;font-weight:bold;border:none;border-radius:10px;background:#00ff99;color:#000;cursor:pointer;box-shadow:0 0 15px #00ff99, 0 0 40px #00ff99;">Restart</button>`;
    over.querySelector("button").onclick = () => location.reload();

    let wrap = document.createElement("div");
    wrap.append(g, ui);
    g.append(p, over);

    // GAME VARIABLES
    let x = 180,
        score = 0,
        hs = +localStorage.fallHS || 0,
        cubes = [],
        spd = 3,
        keys = {};

    // Tweakable spawn chances
    const POWERUP_CHANCE = 0.06;      // rainbow rectangle
    const RAINBOW_CIRCLE_CHANCE = 0.01; // rare slow circle
    const MAX_SPEED_MULT = 1.6;       // max 60% faster

    onkeydown = e => keys[e.key] = 1;
    onkeyup = e => keys[e.key] = 0;

    function rectCollide(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    // Create regular red cube
    function createCube() {
        let size = 40;
        let c = document.createElement("div");
        c.style = `position:absolute;width:${size}px;height:${size}px;left:${Math.random()*(420-size)}px;top:-${size}px;background:red;border-radius:8px;box-shadow:0 0 18px red`;
        g.append(c);
        cubes.push({ e: c, x: parseFloat(c.style.left), y: -size, size, speed: spd, isPowerup: false });
    }

    // Create rainbow rectangle powerup
    function createPowerup() {
        let size = 30;
        let c = document.createElement("div");
        c.style = `position:absolute;width:${size}px;height:${size}px;left:${Math.random()*(420-size)}px;top:-${size}px;border-radius:8px;box-shadow:0 0 18px #fff`;
        g.append(c);
        cubes.push({ e: c, x: parseFloat(c.style.left), y: -size, size, speed: spd * 0.6, scoreBonus: 10, isPowerup: true, hue: Math.random() * 360 });
    }

    // Create super rare rainbow circle
    function createRainbowCircle() {
        let size = 20;
        let c = document.createElement("div");
        c.style = `position:absolute;width:${size}px;height:${size}px;left:${Math.random()*(420-size)}px;top:-${size}px;border-radius:50%;box-shadow:0 0 18px #fff`;
        g.append(c);
        cubes.push({ e: c, x: parseFloat(c.style.left), y: -size, size, speed: spd * 0.2, scoreBonus: 50, isPowerup: true, hue: Math.random() * 360, isCircle: true });
    }

    // Spawn cubes and powerups
    setInterval(() => {
        createCube();
        if (Math.random() < POWERUP_CHANCE) createPowerup();
        if (Math.random() < RAINBOW_CIRCLE_CHANCE) createRainbowCircle();
    }, 900);

    // SPEED INCREASE OVER TIME
    const speedIncreaseRate = 0.0005; // per frame
    let speedMultiplier = 1;

    (function loop() {
        // Move player
        if (keys.ArrowLeft || keys.a) x -= 7;
        if (keys.ArrowRight || keys.d) x += 7;
        x = Math.max(0, Math.min(360, x));
        p.style.left = x + "px";

        // Increase speed gradually
        speedMultiplier = Math.min(MAX_SPEED_MULT, speedMultiplier + speedIncreaseRate);
        
        // Move cubes
        for (let i = cubes.length - 1; i >= 0; i--) {
            let b = cubes[i];
            b.y += b.speed * speedMultiplier;
            b.e.style.top = b.y + "px";

            // Rainbow powerup color shift
            if (b.isPowerup) {
                b.hue += 2;
                b.e.style.background = `hsl(${b.hue % 360}, 100%, 50%)`;
                b.e.style.boxShadow = `0 0 18px hsl(${b.hue % 360}, 100%, 50%)`;
            }

            // Collision with top of board
            let playerTop = 584;
            let playerBottom = 600;
            if (b.y + b.size >= playerTop && b.y <= playerBottom && rectCollide(x, playerTop, 60, b.size, b.x, b.y, b.size, b.size)) {
                if (b.isPowerup) {
                    score += b.scoreBonus;
                    b.e.remove();
                    cubes.splice(i, 1);
                } else {
                    over.style.display = "flex"; // hit red cube = game over
                    return;
                }
            } else if (b.y > 620) {
                // missed cube gives +1 point
                if (!b.isPowerup) score++;
                b.e.remove();
                cubes.splice(i, 1);
            }
        }

        if (score > hs) localStorage.fallHS = hs = score;
        ui.textContent = `Score: ${score} | Highscore: ${hs}`;

        requestAnimationFrame(loop);
    })();
})();
