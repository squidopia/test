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

    g.style = "position:relative;width:420px;height:600px;background:#1b1b1b;border-radius:14px;overflow:hidden;box-shadow:0 0 30px #00ff99";
    p.style = "position:absolute;width:60px;height:16px;background:#00ff99;bottom:12px;left:180px;border-radius:8px;box-shadow:0 0 15px #00ff99";
    ui.style = "margin-top:10px;text-align:center";
    over.style = "position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;background:#000c;font-size:28px";
    over.innerHTML = `<div>GAME OVER</div><button style="margin-top:12px;padding:6px 14px;font-size:16px;cursor:pointer">Restart</button>`;
    over.querySelector("button").onclick = () => location.reload();

    let wrap = document.createElement("div");
    wrap.append(g, ui);
    g.append(p, over);
    document.body.append(wrap);

    let x = 180, score = 0, hs = +localStorage.fallHS || 0, cubes = [], spd = 3, keys = {};

    onkeydown = e => keys[e.key] = 1;
    onkeyup = e => keys[e.key] = 0;

    function randomColor() {
        const colors = ["#00ff99", "#ff0080", "#ffdd00", "#00aaff", "#ff5500"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setInterval(() => {
        // Spawn 1-2 cubes at random positions
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
            let c = document.createElement("div");
            let size = 40;
            c.style = `position:absolute;width:${size}px;height:${size}px;left:${Math.random()*(420-size)}px;top:-${size}px;background:${randomColor()};border-radius:8px;box-shadow:0 0 18px ${randomColor()}`;
            g.append(c);
            cubes.push({ e: c, x: parseFloat(c.style.left), y: -size, size, speed: spd + Math.random() });
        }
    }, 800);

    function rectCollide(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    (function loop() {
        if (keys.ArrowLeft || keys.a) x -= 7;
        if (keys.ArrowRight || keys.d) x += 7;
        x = Math.max(0, Math.min(360, x));
        p.style.left = x + "px";

        for (let i = cubes.length - 1; i >= 0; i--) {
            let b = cubes[i];
            b.y += b.speed;
            b.e.style.top = b.y + "px";

            if (rectCollide(x, 584, 60, 16, b.x, b.y, b.size, b.size)) {
                over.style.display = "flex";
                return;
            }

            if (b.y > 620) {
                b.e.remove();
                cubes.splice(i, 1);
                score++;
                spd += 0.02; // gradually increase speed
            }
        }

        if (score > hs) localStorage.fallHS = hs = score;
        ui.textContent = `Score: ${score} | Highscore: ${hs}`;

        requestAnimationFrame(loop);
    })();
})();
