const myCanvas = document.querySelector("#myCanvas") as HTMLCanvasElement;
const collisionLayer = document.querySelector("#collisionLayer") as HTMLCanvasElement;
const ctx = myCanvas.getContext("2d") as CanvasRenderingContext2D;
const ctxCollision = collisionLayer.getContext("2d") as CanvasRenderingContext2D;

const CANVAS_WIDTH = myCanvas.width = collisionLayer.width = 1024;
const CANVAS_HEIGHT = myCanvas.height = collisionLayer.height = 760;

var explosions: Array<Explosion> = [];
var enemys: Array<Enemy> = [];
var particles: Array<Particle> = [];
// type ParticleNames = "a";
// type ParticleInfo = {
// }
class Particle {
    pos: Position = { x: 0, y: 0 }
    width: number
    height: number
    radius: number;
    color: [number, number, number, number];
    fillStyle0: string;
    fillStyle1: string;
    displearSpeed: number;
    radiusDecreasementSpeed: number;
    constructor(x, y, radius, color: [number, number, number, number]) {
        this.pos.x = x;
        this.pos.y = y;
        this.radius = radius;
        this.color = color;
        this.fillStyle0 = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${(this.color[3] + 20) / 255})`
        this.fillStyle1 = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.color[3] / 255})`
        this.displearSpeed = RandomRange(0.05, 0.1);
        this.radiusDecreasementSpeed = RandomRange(0.001, 0.01)
    }
    finished(timeInterval: number) {
        let displearStep = this.displearSpeed * timeInterval
        return this.color[3] <= displearStep
    }
    animate(timeInterval: number) {
        let displearStep = this.displearSpeed * timeInterval
        let radiusDecreasementStep = this.radiusDecreasementSpeed * timeInterval
        if (this.color[3] >= displearStep) this.color[3] -= displearStep;
        if (this.radius >= radiusDecreasementStep) this.radius -= radiusDecreasementStep
        this.fillStyle0 = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${(this.color[3]) / 255})`
        this.fillStyle1 = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${ 0 })`
    }
    update(timeInterval: number) {
        this.animate(timeInterval);
    }
    draw() {
        ctx.beginPath()
        var grd = ctx.createRadialGradient(this.pos.x, this.pos.y, this.radius, this.pos.x, this.pos.y, this.radius + 20);
        grd.addColorStop(0, this.fillStyle0);
        grd.addColorStop(1, this.fillStyle1);
        ctx.fillStyle = grd;
        // ctx.fillStyle = this.fillStyle0
        ctx.arc(this.pos.x, this.pos.y, this.radius + 20, 0, Math.PI * 2);
        // ctx.stroke();
        ctx.fill()
    }
    refresh(timeInterval: number) {
        this.update(timeInterval);
        this.draw();
    }
}



type MovementNames = "move_idle" | "move_ToLeft" | "move_UpAndDown" | "move_recycle" | "move_asline" | "move_randomMovement";
interface EnemyInfo {
    src: string;// ????????????
    frame_count: number;// ????????????
    frame_width: number;// ????????????
    frame_height: number;// ????????????
    draw_size: [number, number]; // ??????????????????
    movements: Array<MovementNames>;
    particle: boolean;

}
type EnemyNames = "enemy1" | "enemy2" | "enemy3" | "enemy4" | "crow"
type EnemyInfoMap = {
    [enemyName in EnemyNames]: EnemyInfo;
}
var enemyInfoMap: EnemyInfoMap = {
    "enemy1": {
        src: "./imgs/enemy1.png",
        frame_count: 6,
        frame_width: 293,
        frame_height: 155,
        draw_size: [1.0 / 2.5, 1.0 / 2.5],
        particle: false,
        movements: ["move_idle"]
    },
    "enemy2": {
        src: "./imgs/enemy2.png",
        frame_count: 6,
        frame_width: 266,
        frame_height: 188,
        draw_size: [1.0 / 2.5, 1.0 / 2.5],
        particle: false,
        movements: ["move_ToLeft", "move_UpAndDown", "move_recycle"]
    },
    "enemy3": {
        src: "./imgs/enemy3.png",
        frame_count: 6,
        frame_width: 218,
        frame_height: 177,
        draw_size: [1.0 / 2.5, 1.0 / 2.5],
        particle: false,
        movements: ["move_asline"]
    },
    "enemy4": {
        src: "./imgs/enemy4.png",
        frame_count: 9,
        frame_width: 213,
        frame_height: 212,
        draw_size: [1.0 / 2.5, 1.0 / 2.5],
        particle: false,
        movements: ["move_randomMovement"]
    },
    "crow": {
        src: "./imgs/crow.png",
        frame_count: 6,
        frame_width: 271,
        frame_height: 194,
        draw_size: [0.25, 0.75],
        particle: true,
        movements: [
            "move_idle",
            "move_ToLeft",
            "move_UpAndDown",
            // "move_asline",
            // "move_randomMovement",
            // "move_recycle"
        ]
    },
}
function RandomRange(from: number, end: number) {
    return Math.random() * (end - from) + from;
}
type ClassEnemyWithMethodNames = {
    [movementName in MovementNames]: (timeInterval: number) => void
};

class Enemy implements ClassEnemyWithMethodNames {
    enemyInfo: EnemyInfo;
    img: HTMLImageElement;
    draw_size: number;// ??????
    draw_width: number;// ??????????????????
    draw_height: number;// ??????????????????
    collisionColor: [number, number, number];//rgb() ????????????
    collisionfillStyle: string;
    // for movement
    pos: { x: number, y: number } = { x: 0, y: 0 };// ?????????????????????
    idle: { moveSpeed: number } = { moveSpeed: 0 };
    toLeft: { moveSpeed: number } = { moveSpeed: 0 };
    upAndDown: { angle: number, angleStep: number, moveSpeed } = {
        angle: 0,// ??????
        angleStep: 0,// ?????????
        moveSpeed: 0// ????????????
    };
    asline: { angle: number, angleIncreaseSpeed: number, factorX: number, factorY: number } = {
        angle: 0,
        angleIncreaseSpeed: 0,
        factorX: 0,
        factorY: 0
    }
    randomMovement: { targetPos: { x: number, y: number }, moveSpeed: number, timeAcc: number, refreshPosInterval: number } = {
        targetPos: { x: 0, y: 0 },// ?????????
        timeAcc: 0,// ???????????????
        refreshPosInterval: 0,// ???????????????????????????
        moveSpeed: 0// ????????????
    }
    // for animation
    animation: { frameStage: number, frameIndex: number, frameCount: number } = {
        frameStage: 0, // ???????????????????????????????????????????????????
        frameIndex: 0,  // ??????????????????????????????
        frameCount: 0  // ?????????
    };
    constructor(enemyInfo: EnemyInfo, x?: number, y?: number) {
        this.enemyInfo = enemyInfo;
        this.img = new Image();
        this.img.src = this.enemyInfo.src;
        // ??????
        this.draw_size = RandomRange(this.enemyInfo.draw_size[0], this.enemyInfo.draw_size[1]);
        this.draw_width = this.enemyInfo.frame_width * this.draw_size;
        this.draw_height = this.enemyInfo.frame_height * this.draw_size;
        // ????????????
        if (!x) this.pos.x = Math.random() * (CANVAS_WIDTH - this.draw_width);// ??????????????????????????????????????????
        else this.pos.x = x
        if (!y) this.pos.y = Math.random() * (CANVAS_HEIGHT - this.draw_height);
        else this.pos.y = y
        // ??????????????????
        this.collisionColor = [Math.floor(RandomRange(0, 255)), Math.floor(RandomRange(0, 255)), Math.floor(RandomRange(0, 255))]
        this.collisionfillStyle = `rgb(${this.collisionColor[0]},${this.collisionColor[1]},${this.collisionColor[2]})`
        // ?????????????????????
        this.animation.frameStage = Math.random() * 3 + 1;// 1 ~ 4
        // for idle
        this.idle.moveSpeed = RandomRange(0.1, 0.2)
        // for toLeft
        this.toLeft.moveSpeed = RandomRange(0.2, 0.3)
        // for upAndDown
        this.upAndDown.angle = Math.asin(RandomRange(-1, 1)) // ????????? -1 ~ 1
        this.upAndDown.angleStep = Math.asin(RandomRange(-0.25, 0.25));// ?????????????????? -0.25 ~ + 0.25
        this.upAndDown.moveSpeed = RandomRange(0.1, 0.2) // ?????????????????? 4 ~ 6
        // for asline
        this.asline.angle = Math.asin(RandomRange(-1, 1)) // ????????? -1 ~ 1
        this.asline.angleIncreaseSpeed = RandomRange(0.2, 0.3) // ???????????? -0.2 ~ 0.2
        this.asline.factorX = Math.PI / 365 * 0.45
        this.asline.factorY = Math.PI / 365 * 0.35
        // randomReArrangement
        this.randomMovement.refreshPosInterval = Math.floor(RandomRange(500, 2000));// ???500ms~2000ms????????????
        this.randomMovement.moveSpeed = RandomRange(0.5, 1);// ????????????
        this.randomMovement.targetPos.x = this.pos.x // ????????????
        this.randomMovement.targetPos.y = this.pos.y
    }
    move_idle(timeInterval: number) {// ??????
        let moveStepX = this.idle.moveSpeed * timeInterval
        let moveStepY = this.idle.moveSpeed * timeInterval
        this.pos.x += moveStepX * (Math.random() * 2 - 1);
        this.pos.y += moveStepY * (Math.random() * 2 - 1);
    }
    move_ToLeft(timeInterval: number) {// ????????????
        let moveStep = this.toLeft.moveSpeed * timeInterval
        this.pos.x -= moveStep
    }
    move_UpAndDown(timeInterval: number) {// ????????????
        let moveStep = this.upAndDown.moveSpeed * timeInterval
        this.pos.y += moveStep * Math.sin(this.upAndDown.angle);
        this.upAndDown.angle += this.upAndDown.angleStep
    }
    move_recycle(timeInterval: number) {// ??????,????????????????????????????????????
        if (this.pos.x + this.draw_width <= 0)
            this.pos.x = CANVAS_WIDTH;
    }
    move_asline(timeInterval: number) {// ????????????
        this.pos.x = CANVAS_WIDTH / 2 * Math.cos(this.asline.angle * this.asline.factorX) + (CANVAS_WIDTH / 2 - this.draw_width / 2);
        this.pos.y = CANVAS_HEIGHT / 2 * Math.sin(this.asline.angle * this.asline.factorY) + (CANVAS_HEIGHT / 2 - this.draw_height / 2);
        let angleStep = this.asline.angleIncreaseSpeed * timeInterval
        this.asline.angle += angleStep
    }
    move_randomMovement(timeInterval: number) {// ????????????
        let shouldRefreshPos = Math.floor((this.randomMovement.timeAcc += timeInterval) / this.randomMovement.refreshPosInterval) >= 1

        if (shouldRefreshPos) {
            this.randomMovement.targetPos.x = RandomRange(0, CANVAS_WIDTH - this.draw_width);
            this.randomMovement.targetPos.y = RandomRange(0, CANVAS_HEIGHT - this.draw_height);
            this.randomMovement.timeAcc = 0
        }
        let dx = (this.randomMovement.targetPos.x - this.pos.x) / 1000
        let dy = (this.randomMovement.targetPos.y - this.pos.y) / 1000

        let moveStep = this.randomMovement.moveSpeed * timeInterval

        this.pos.x += dx * moveStep
        this.pos.y += dy * moveStep
    }
    move(timeInterval: number) {
        this.enemyInfo.movements.forEach(movementMethodName => {
            this[movementMethodName](timeInterval);
        })
    }
    outOfCanvas() {
        return this.pos.x + this.draw_width <= 0
    }
    animate() {// ??????
        this.animation.frameIndex = Math.floor(this.animation.frameCount++ / this.animation.frameStage) % this.enemyInfo.frame_count;
    }
    particle() {
        if (this.enemyInfo.particle == true && Math.random() < 0.5) {
            particles.push(new Particle(
                this.pos.x + this.draw_width * 0.8, this.pos.y + this.draw_height / 2,
                Math.min(this.draw_width, this.draw_height) / 2 * RandomRange(0.2, 0.8),
                [...this.collisionColor, 255 * RandomRange(0.2, 0.8)])
            );
        }
    }
    update(timeInterval: number) {
        this.move(timeInterval)
        this.particle();
        this.animate();
    }
    draw() {
        ctx.drawImage(
            this.img,
            this.animation.frameIndex * this.enemyInfo.frame_width, 0,
            this.enemyInfo.frame_width, this.enemyInfo.frame_height,
            this.pos.x, this.pos.y,
            this.draw_width, this.draw_height
        );
        ctxCollision.fillStyle = this.collisionfillStyle
        ctxCollision.fillRect(
            this.pos.x, this.pos.y,
            this.draw_width, this.draw_height
        )
    }
    refresh(timeInterval: number) {
        this.update(timeInterval);
        this.draw();
    }
}

type ExplosionMovemetNames = "move_rotate"

interface ExplosionInfo {
    name: string,
    imgSrc: string,
    sodSrc: string,
    frameTotal: number,
    frameWidth: number,
    frameHeight: number,
    movements: Array<ExplosionMovemetNames>
}
type ExplosionNames = "boom"
type ExplosionInfoMap = {
    [explosionName in ExplosionNames]: ExplosionInfo;
}

interface Position {
    x: number, y: number
}

var explosionMap: ExplosionInfoMap = {
    "boom": {
        name: "boom",
        imgSrc: "./imgs/boom.png",
        sodSrc: "./sounds/Ice attack 2.wav",
        frameTotal: 5,
        frameWidth: 200,
        frameHeight: 179,
        movements: ["move_rotate"]
    }
}

type ExplosionWithMethodNames = {
    [ExplosionMovemetName in ExplosionMovemetNames]: (timeInterval?: number) => void;
}
class Explosion implements ExplosionWithMethodNames {
    info: ExplosionInfo;
    draw_size: number;
    draw_width: number;
    draw_height: number;
    img: HTMLImageElement;
    sod: HTMLAudioElement;
    pos: Position = { x: 0, y: 0 };
    animation = { frameStage: 5, frameCount: 0, frameIndex: 0 };
    angle: number;
    rotate = { angle: 0, angleStep: 0 }
    constructor(pos: Position, size: number, info: ExplosionInfo) {
        this.pos = pos
        this.info = info;
        this.draw_size = size;
        this.draw_width = this.draw_size * this.info.frameWidth
        this.draw_height = this.draw_size * this.info.frameHeight
        this.img = new Image();
        this.img.src = this.info.imgSrc;
        this.sod = new Audio();
        this.sod.src = this.info.sodSrc;
        this.rotate.angleStep = 0.05 * Math.asin(Math.random() * 2 - 1)
    }
    private animate() {// ????????????
        if (this.animation.frameCount == 0) this.sod.play();// ?????????????????? ????????????
        this.animation.frameIndex = Math.floor(this.animation.frameCount++ / this.animation.frameStage) % this.info.frameTotal;// ???????????????
    }
    private move() {
        this.info.movements.forEach(movementMethodName => {
            this[movementMethodName]();// ?????????????????????
        })
    }
    private update() {// ????????????
        this.move(); // ??????
        this.animate();// ????????????
    }
    move_rotate() {// ????????????
        this.rotate.angle += this.rotate.angleStep;
    }
    finished() {// ????????????????????????
        return Math.floor(this.animation.frameCount / this.animation.frameStage) >= this.info.frameTotal
    }
    private draw() {
        ctx.save();// ??????????????????context??????
        ctx.translate(this.pos.x + this.draw_width / 2, this.pos.y + this.draw_height / 2);//??????????????????
        ctx.rotate(this.rotate.angle);// ?????????????????????
        ctx.drawImage(
            this.img,
            this.animation.frameIndex * this.info.frameWidth,
            0,
            this.info.frameWidth, this.info.frameHeight,
            // this.pos.x, this.pos.y,
            -this.draw_width / 2, -this.draw_height / 2,
            this.draw_width, this.draw_height
        );
        ctx.restore();// ???????????????????????????context
    }
    refresh(timeInterval: number) {
        this.update();
        this.draw();
    }
}

function EnemysInit(size) {
    for (let index = 0; index < size; index++) {
        // enemys.push(new Enemy(enemyInfoMap["enemy1"]));
        // enemys.push(new Enemy(enemyInfoMap["enemy2"]));
        // enemys.push(new Enemy(enemyInfoMap["enemy3"]));
        // enemys.push(new Enemy(enemyInfoMap["enemy4"]));
        enemys.push(new Enemy(enemyInfoMap["crow"], CANVAS_WIDTH));
    }
    enemys.sort((a, b) => a.draw_size - b.draw_size)
}

var timeAcc = 0; // ?????????
var addEnemyInterval = 1000 // ????????????
function addEnemy(timeInterval: number) {// ??????????????????
    let shouldAdd = Math.floor((timeAcc += timeInterval) / addEnemyInterval) >= 1
    if (shouldAdd) {
        timeAcc = 0
        enemys.push(new Enemy(enemyInfoMap["crow"], CANVAS_WIDTH));
        enemys.sort((a, b) => a.draw_size - b.draw_size)
    }

}



var score = 0;
function refreshScore() {
    ctx.save()
    ctx.font = "40px Impact";
    ctx.textAlign = "left"
    ctx.fillStyle = "white"
    ctx.fillText("score:" + score, 0, 40);
    ctx.fillStyle = "black"
    ctx.fillText("score:" + score, 0 + 3, 40 + 3);

    ctx.restore()
}
function refreshFps(timeInterval: number) {
    let fps = 1 / timeInterval * 1000;
    ctx.save()
    ctx.font = "40px Impact";
    ctx.textAlign = "right"
    ctx.fillStyle = "white"
    ctx.fillText("fps:" + fps.toFixed(0), CANVAS_WIDTH - 3, 40 - 3);
    ctx.fillStyle = "black"
    ctx.fillText("fps:" + fps.toFixed(0), CANVAS_WIDTH, 40);
    ctx.restore()
}
function refreshGameStop() {
    ctx.save()
    ctx.font = "40px Impact";
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.fillText("Game Stoped", CANVAS_WIDTH / 2 - 3, CANVAS_HEIGHT / 2 - 3);
    ctx.fillStyle = "black"
    ctx.fillText("Game Stoped", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.font = "20px Impact";
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.fillText("Press Any Key To Continue", CANVAS_WIDTH / 2 - 3, 25 + CANVAS_HEIGHT / 2 - 3);
    ctx.fillStyle = "black"
    ctx.fillText("Press Any Key To Continue", CANVAS_WIDTH / 2, 25 + CANVAS_HEIGHT / 2);
    ctx.restore()
}
function refreshGameOver() { // ????????????????????????
    ctx.save()
    ctx.font = "40px Impact";
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.fillText("Game Over Your Score is : " + score, CANVAS_WIDTH / 2 - 3, CANVAS_HEIGHT / 2 - 3);
    ctx.fillStyle = "black"
    ctx.fillText("Game Over Your Score is : " + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.font = "20px Impact";
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.fillText("Press Any Key To Continue", CANVAS_WIDTH / 2 - 3, 25 + CANVAS_HEIGHT / 2 - 3);
    ctx.fillStyle = "black"
    ctx.fillText("Press Any Key To Continue", CANVAS_WIDTH / 2, 25 + CANVAS_HEIGHT / 2);
    ctx.restore()
}
function refreshGameInit() {// ????????????????????????
    ctx.save()
    ctx.font = "40px Impact";
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.fillText("Press Any Key To Start Game", CANVAS_WIDTH / 2 - 3, CANVAS_HEIGHT / 2 - 3);
    ctx.fillStyle = "black"
    ctx.fillText("Press Any Key To Start Game", CANVAS_WIDTH / 2 - 0, CANVAS_HEIGHT / 2 - 0);
    ctx.restore()
}






function pixelCollsionDetection(pixelA: [number, number, number], pixelB: [number, number, number]) {
    return (
        pixelA[0] == pixelB[0] &&
        pixelA[1] == pixelB[1] &&
        pixelA[2] == pixelB[2]
    )
}
function enemyDestory(pos: Position, pixelTarget: [number, number, number]) {
    for (let index = 0; index < enemys.length; index++) {
        const item = enemys[index];
        if (pixelCollsionDetection(item.collisionColor, pixelTarget)) {// ??????????????????
            enemys.splice(index, 1);// ?????????????????????
            explosions.push(new Explosion(item.pos, item.draw_size, explosionMap["boom"]))// ????????????????????????????????????
            score++;
            return
        }
    }
    // ?????????
    explosions.push(new Explosion(
        { x: pos.x - explosionMap["boom"].frameWidth / 2, y: pos.y - explosionMap["boom"].frameHeight / 2 },
        1.0,
        explosionMap["boom"]
    ))
}

// ??????????????????
myCanvas.addEventListener("mousedown", (event) => {
    let pos: Position = { x: event.offsetX, y: event.offsetY }
    let imgdata = ctxCollision.getImageData(pos.x, pos.y, 1, 1);// ????????????????????????
    enemyDestory(pos, [imgdata.data[0], imgdata.data[1], imgdata.data[2]])
})


// ??????????????????
window.addEventListener("keydown", () => {// ????????????????????????
    if (gameState == GameState.Init) {// ?????????????????????????????????
        StartGame()// ????????????
    } else if (gameState == GameState.Running) {
        StopGame()
    } else if (gameState == GameState.Stop) {
        RunningGame()
    } else if (gameState == GameState.GameOver) {// ?????????????????????????????????
        InitGame();// ???????????????
    }
})






enum GameState { Init, Running, Stop, GameOver }
var gameState: GameState = GameState.Init
InitGame();
function InitGame() {
    enemys = []
    explosions = []
    particles = []
    for (let index = 0; index < 10; index++) {
        enemys.push(new Enemy(enemyInfoMap["enemy1"]));
        enemys.push(new Enemy(enemyInfoMap["enemy2"]));
        enemys.push(new Enemy(enemyInfoMap["enemy3"]));
        enemys.push(new Enemy(enemyInfoMap["enemy4"]));
    }
    enemys.sort((a, b) => a.draw_size - b.draw_size)
    score = 0
    gameState = GameState.Init
}
function StartGame() {
    enemys = []
    explosions = []
    particles = []
    score = 0
    enemys.push(new Enemy(enemyInfoMap["crow"], CANVAS_WIDTH));
    gameState = GameState.Running
}
function StopGame() {
    gameState = GameState.Stop
}
function RunningGame() {
    gameState = GameState.Running
}
function GameOver() {
    gameState = GameState.GameOver
}
function checkGameOver() {
    for (let index = 0; index < enemys.length; index++) {
        const element = enemys[index];
        if (element.outOfCanvas()) {
            return true;
        }
    }
    return false
}

function refreshGame(timeInterval: number) {
    if (gameState == GameState.Init) {
        // ????????????
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctxCollision.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        [...particles, ...enemys, ...explosions].forEach(item => item.refresh(timeInterval));// ??????
        enemys = enemys.filter(item => !item.outOfCanvas())// ?????????????????????enemy
        explosions = explosions.filter(item => !item.finished())// ?????????????????????????????????
        particles = particles.filter(item => !item.finished(timeInterval))// ???????????????????????????

        addEnemy(timeInterval);// ??????????????????
        refreshScore();// ????????????
        refreshFps(timeInterval);// ????????????

        refreshGameInit(); // ????????????????????????
    } else if (gameState == GameState.Running) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctxCollision.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // refresh objects
        [...particles, ...enemys, ...explosions].forEach(item => item.refresh(timeInterval));
        addEnemy(timeInterval);//??????????????????
        explosions = explosions.filter(item => !item.finished())
        particles = particles.filter(item => !item.finished(timeInterval))
        refreshScore();// ????????????
        refreshFps(timeInterval);// ????????????
        if (checkGameOver())// ???????????????????????? 
            GameOver();
    } else if (gameState == GameState.Stop) {
        ctxCollision.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        refreshGameStop();
    }
    else if (gameState == GameState.GameOver) {
        ctxCollision.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);// ?????????????????????????????????????????????????????????????????????
        refreshGameOver()// ????????????????????????
    }
}


var lastTime = 0;
function animate(currentTime: DOMHighResTimeStamp) {
    let timeInterval = currentTime - lastTime; lastTime = currentTime;
    refreshGame(timeInterval);
    requestAnimationFrame(animate);// animate?????????????????????
}
animate(0);