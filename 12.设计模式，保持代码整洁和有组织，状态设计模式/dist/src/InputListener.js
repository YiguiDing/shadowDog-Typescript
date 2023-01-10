export class InputListener {
    constructor() {
        this.inputs = [];
        this.listen();
    }
    listen() {
        window.addEventListener("keydown", event => {
            this.inputs.pop(); // 出栈
            switch (event.key) {
                case InputListener.KeyMaps.PressRight:
                    this.inputs.push(InputListener.KeyMaps.PressRight);
                    break;
                case InputListener.KeyMaps.PressLeft:
                    this.inputs.push(InputListener.KeyMaps.PressLeft);
                    break;
                case InputListener.KeyMaps.PressUp:
                    this.inputs.push(InputListener.KeyMaps.PressUp);
                    break;
                case InputListener.KeyMaps.PressDown:
                    this.inputs.push(InputListener.KeyMaps.PressDown);
                    break;
            }
        });
        window.addEventListener("keyup", event => {
            this.inputs.pop(); // 出栈
        });
    }
}
InputListener.KeyMaps = {
    PressRight: "ArrowRight",
    PressLeft: "ArrowLeft",
    PressUp: "ArrowUp",
    PressDown: "ArrowDown"
};
