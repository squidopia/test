(() => {
    // GAME WRAPPER
    let container = document.getElementById("game-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "game-container";
        document.body.appendChild(container);
    }
    container.innerHTML = ""; // safe: only clears this div

    // CREATE ELEMENTS
    let g = document.createElement("div"),
        p = document.createElement("div"),
        ui = document.createElement("div"),
        over = document.createElement("div");

    // GAME BOX
    g.style = `
        position:relative;
        width:420px;
        height:600px;
        background:#222;
        border-radius:14px;
        overflow:hidden;
        box-shadow:0 0 30px #00ff99;
        margin:auto;
    `;

    // PLAYER
    p.style = `
        position:absolute;
        width:60px;
        height:16px;
        background:#00ff99;
        bottom:12px;
        left:180px;
        border-radius:8px;
        box-shadow:0 0 20px #00ff99;
    `;

    // UI
    ui.style = `
        margin-top:10px;
        text-align:center;
        font-size:20px;
        font-weight:bold;
        color:#00ff99;
        text-shadow: 0 0 10px #00ff99;
        font-family: monospace;
    `;

    // GAME OVER
    over.style = `
        position:absolute;
        inset:0;
        display:none;
        align-items:center;
        justify-content:center;
        flex-direction:column;
        background:#000c;
        font-size:32px;
        color:#ff5555;
        text-shadow:0 0 10px #ff0000;
    `;
    over.innerHTML = `
        <div style="margin-bottom:16px;">GAME OVER</div>
        <button style="
            padding:10px 20px;
            font-size:18px;
            font-weight:bold;
            border:none;
            border-radius:10px;
            background:#00ff99;
            color:#000;
            cursor:pointer;
            box-shadow:0 0 15px #00ff99,0 0 40px #00ff99;
        ">Restart</button>
    `;
    over.querySelector("button").onclick = () => location.reload();

    container.append(g, ui);
    g.append(p, over);

    // BACK BUTTON
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

    // GAME VARIABLES
    let x = 180,
        score = 0,
        hs = +localStorage.fallHS || 0,
        cubes = [],
        spd = 3,
        keys = {};

    const POWERUP_CHANCE = 0.06;
    const RAINBOW_CIRCLE_CHANCE = 0.01;
    const MAX_SPEED_MULT = 1.6;

    document.onkeydown = e => keys[e.key] = 1;
    document.onkeyup = e => keys[e.key] = 0;

    function rectCollide(ax, ay, aw, ah, bx, by, bw, bh){
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function circleRectCollide(cx, cy, radius, rx, ry, rw, rh){
        let closestX = Math.max(rx, Math.min(cx, rx+rw));
        let closestY = Math.max(ry, Math.min(cy, ry+rh));
        let dx = cx - closestX;
        let dy = cy - closestY;
        return (dx*dx + dy*dy) < radius*radius;
    }

    function removeCube(i){
        cubes[i].e.remove();
        cubes.splice(i,1);
    }

    function createCube(){
        let size=40;
        let c=document.createElement("div");
        c.style=`
            position:absolute;
            width:${size}px;
            height:${size}px;
            left:${Math.random()*(420-size)}px;
            top:-${size}px;
            background:red;
            border-radius:8px;
            box-shadow:0 0 20px red;
        `;
        g.append(c);
        cubes.push({e:c, x:parseFloat(c.style.left), y:-size, size, speed:spd, isPowerup:false});
    }

    function createPowerup(){
        let size=30;
        let c=document.createElement("div");
        c.style=`
            position:absolute;
            width:${size}px;
            height:${size}px;
            left:${Math.random()*(420-size)}px;
            top:-${size}px;
            border-radius:8px;
            box-shadow:0 0 20px #fff;
        `;
        g.append(c);
        cubes.push({e:c, x:parseFloat(c.style.left), y:-size, size, speed:spd*0.6, scoreBonus:10, isPowerup:true, hue:Math.random()*360});
    }

    function createRainbowCircle(){
        let size=20;
        let c=document.createElement("div");
        c.style=`
            position:absolute;
            width:${size}px;
            height:${size}px;
            left:${Math.random()*(420-size)}px;
            top:-${size}px;
            border-radius:50%;
            box-shadow:0 0 20px #fff;
        `;
        g.append(c);
        cubes.push({e:c, x:parseFloat(c.style.left), y:-size, size, speed:spd*0.2, scoreBonus:50, isPowerup:true, hue:Math.random()*360, isCircle:true});
    }

    setInterval(()=>{
        createCube();
        if(Math.random()<POWERUP_CHANCE) createPowerup();
        if(Math.random()<RAINBOW_CIRCLE_CHANCE) createRainbowCircle();
    },900);

    const speedIncreaseRate = 0.0005;
    let speedMultiplier = 1;

    (function loop(){
        // MOVE PLAYER
        if(keys.ArrowLeft||keys.a) x-=7;
        if(keys.ArrowRight||keys.d) x+=7;
        x=Math.max(0,Math.min(360,x));
        p.style.left=x+"px";

        // SPEEDUP
        speedMultiplier = Math.min(MAX_SPEED_MULT, speedMultiplier + speedIncreaseRate);

        // MOVE CUBES + COLLISIONS
        for(let i=cubes.length-1;i>=0;i--){
            let b=cubes[i];
            b.y += b.speed*speedMultiplier;
            b.e.style.top=b.y+"px";

            // RAINBOW COLOR + GLOW
            if(b.isPowerup){
                b.hue = (b.hue + 3) % 360;
                b.e.style.background = `hsl(${b.hue},100%,50%)`;
                b.e.style.boxShadow = `0 0 20px hsl(${b.hue},100%,50%)`;
            }

            let playerTop=584, playerBottom=600;

            if(b.isCircle){
                if(circleRectCollide(b.x+b.size/2,b.y+b.size/2,b.size/2,x,playerTop,60,playerBottom-playerTop)){
                    score+=b.scoreBonus;
                    removeCube(i);
                }
            } else {
                if(b.y+b.size>=playerTop && b.y<=playerBottom &&
                   rectCollide(x,playerTop,60,b.size,b.x,b.y,b.size,b.size)){
                    if(b.isPowerup){ score+=b.scoreBonus; removeCube(i); }
                    else{ over.style.display="flex"; return; }
                }
            }

            if(b.y>620){
                if(!b.isPowerup) score++;
                removeCube(i);
            }
        }

        if(score>hs) localStorage.fallHS=hs=score;
        ui.textContent=`Score: ${score} | Highscore: ${hs}`;

        requestAnimationFrame(loop);
    })();
})();
