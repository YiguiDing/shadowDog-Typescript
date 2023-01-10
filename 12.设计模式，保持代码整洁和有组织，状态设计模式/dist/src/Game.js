import { BackgroundCity } from "./BackgroundCity.js";
import { ShadowDog } from "./ShadowDog.js";
export class Game {
    constructor(Context2D, CANVAS_WIDTH, CANVAS_HEIGHT) {
        this.Context2D = Context2D;
        this.CANVAS_WIDTH = CANVAS_WIDTH;
        this.CANVAS_HEIGHT = CANVAS_HEIGHT;
        this.background = new BackgroundCity(this.Context2D, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.background.backgroundMoveSpeedX = 0;
        this.player = new ShadowDog(this.Context2D, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }
    refresh(timeInterval) {
        this.background.refresh(timeInterval);
        this.player.refresh(timeInterval);
        return 0;
    }
    start() {
        let lastTimeStampFromStart = 0;
        const refreshDisplay = (currentTimeStampFromStart) => {
            const timeInterval = currentTimeStampFromStart - lastTimeStampFromStart; // 计算时间间隔
            lastTimeStampFromStart = currentTimeStampFromStart;
            this.refresh(timeInterval); // 刷新游戏
            requestAnimationFrame(refreshDisplay);
        };
        refreshDisplay(0);
        console.log("game is started.");
    }
}
