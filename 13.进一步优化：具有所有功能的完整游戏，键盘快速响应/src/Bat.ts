import { Animal } from "./Animal.js";
import { RandomRange } from "./utils.js";

// 蠕虫 继承 Animal 类
export class Bat extends Animal {
	Name = "Bat";
	shakeAngle = 0; // 摆动角度,初始摆动角度 单位: 弧度
	shakeDeltaAngle: number; // 摆动增量 单位:弧度/毫秒
	shakeGapRadius: number; // 摆动范围半径 单位：像素
	constructor(posX: number, posY: number) {
		super("./imgs/Bat.png", 266, 188, 0.5, [6], ["idle"]);
		this.posX = posX;
		this.posY = posY;
		this.moveSpeedX = RandomRange(0.05, 0.1);

		this.shakeAngle = RandomRange(Math.asin(-1), Math.asin(1));
		this.shakeDeltaAngle = RandomRange(Math.asin(0.001), Math.asin(0.003));
		this.shakeGapRadius = RandomRange(2, 5);
	}
	shake(timeInterval: number) {
		this.posY += this.shakeGapRadius * Math.sin(this.shakeAngle);
		this.shakeAngle += this.shakeDeltaAngle * timeInterval;
	}
	move(timeInterval: number) {
		this.posX -= this.moveSpeedX * timeInterval;
	}
	update(timeInterval: number): void {
		this.move(timeInterval);
		this.shake(timeInterval);
		super.update(timeInterval);
	}
}
