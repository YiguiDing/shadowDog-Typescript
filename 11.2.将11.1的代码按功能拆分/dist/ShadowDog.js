import { Animal } from "./Animal.js";
import { RandomRange } from "./utils.js";
export class ShadowDog extends Animal {
    constructor(game) {
        super(game, "./imgs/shadow_dog.png", 575, 523, 0.4, [7, 7, 7, 9, 11, 5, 7, 7, 12, 4], ["idle", "jump", "fall", "run", "dizzy", "sit", "roll", "bite", "ko", "gethit"]);
        this.animateFrameStage = 4;
        this.posX = RandomRange(0, this.drawWidth);
        this.posY = this.game.CANVAS_HEIGHT - this.drawHeight - this.drawHeight / 4;
        this.actionMoveSpeedX = RandomRange(0.3, 0.3);
        this.actionMoveSpeedY = RandomRange(0.3, 0.3);
        this.jumpWeight = 0.08;
        this.jumpSpeed = 0;
        this.jumpSpeedConst = -RandomRange(1.5, 1.5);
    }
    inSky() {
        return this.posY <= this.game.CANVAS_HEIGHT - this.drawHeight - this.drawHeight / 4;
    }
    // ["idle", "jump", "fall", "run", "dizzy", "sit", "roll", "bite", "ko", "gethit"]
    action_default() {
        this.moveSpeedX = this.actionMoveSpeedX * 0;
        this.animateFrameStageFactor = 1.0;
        this.changeAnimateByName("run");
    }
    action_ahead() {
        this.moveSpeedX = this.actionMoveSpeedX * 1.0;
        this.animateFrameStageFactor = 1.5;
        this.changeAnimateByName("run");
    }
    action_back() {
        this.moveSpeedX = -this.actionMoveSpeedX * 1.0;
        this.animateFrameStageFactor = 1.0;
        this.changeAnimateByName("run");
    }
    action_idle() {
        this.moveSpeedX = 0;
        this.moveSpeedY = 0;
        this.animateFrameStageFactor = 1.0;
        this.changeAnimateByName("idle");
    }
    action_sit() {
        this.moveSpeedX = 0;
        this.moveSpeedY = 0;
        this.animateFrameStageFactor = 1.0;
        this.changeAnimateByName("sit");
    }
    action_roll() {
        this.moveSpeedX = -this.actionMoveSpeedX * 1;
        this.animateFrameStageFactor = 1.0;
        this.changeAnimateByName("roll");
    }
    action_dizzy() {
        this.moveSpeedX = 0;
        this.moveSpeedY = 0;
        this.animateFrameStageFactor = 1.0;
        this.changeAnimateByName("dizzy");
    }
    action_bite() {
        this.moveSpeedX = 0;
        this.moveSpeedY = 0;
        this.animateFrameStageFactor = 1.0;
        this.changeAnimateByName("bite");
    }
    action_ko() {
        this.moveSpeedX = 0;
        this.moveSpeedY = 0;
        this.aliveFlag = false; // ???????????????
        this.animateFrameStageFactor = 2.0;
        this.changeAnimateByName("ko"); // ??????????????????
        this.requestAnimateFrameAtFirstFrame(); // ?????????????????????
        this.requestStopAnimateFrameAtLastFrame(); // ????????????????????????????????????????????????
    }
    action_gethit() {
        this.moveSpeedX = 0;
        this.moveSpeedY = 0;
        this.changeAnimateByName("gethit");
    }
    action_jump() {
        if (!this.inSky()) {
            this.changeAnimateByName("jump");
            this.jumpSpeed = this.jumpSpeedConst; // ????????????
        }
    }
    // ????????????
    gravity() {
        if (this.inSky()) {
            this.jumpSpeed += this.jumpWeight;
            if (this.jumpSpeed < 0 && this.isAlive())
                this.changeAnimateByName("jump");
            if (this.jumpSpeed > 0 && this.isAlive())
                this.changeAnimateByName("fall");
        }
    }
    // ???????????? ????????????
    dragBack() {
        // ?????????????????? ????????????
        if (this.posX < 0)
            this.posX = 0;
        else if (this.posX + this.drawWidth > this.game.CANVAS_WIDTH)
            this.posX = this.game.CANVAS_WIDTH - this.drawWidth;
        // ?????????????????? ????????????
        if (this.posY < 0)
            this.posY = 0;
        else if (this.posY + this.drawHeight > this.game.CANVAS_HEIGHT)
            this.posY = this.game.CANVAS_HEIGHT - this.drawHeight;
    }
    // ??????
    move(timeInterval) {
        this.posX += this.moveSpeedX * timeInterval;
        this.posY += this.moveSpeedY * timeInterval + this.jumpSpeed * timeInterval;
    }
    update(timeInterval) {
        this.move(timeInterval);
        this.gravity();
        this.dragBack();
    }
    isAlive() {
        return this.aliveFlag;
    }
}
