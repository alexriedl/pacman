import { Map, MapInitializer } from 'pacman/Map';
import { Direction } from 'pacman/Utils';
import { Game } from 'sengine';

const MILLISECONDS_PER_FRAME = (1 / 60) * 1000;

function buttonPressed(button: GamepadButton | number): boolean {
	if (typeof (button) === 'object') return button.pressed;
	return button > 0;
}

function getControllers() {
	const n = navigator as any;
	return n.getGamepads ? n.getGamepads() : (n.webkitGetGamepads ? n.webkitGetGamepads() : []);
}

const requireManualControllerScan = !('ongamepadconnected' in window);
const DEAD_ZONE = 0.5;

export default class PacmanGame extends Game {
	public scene: Map;
	protected frameTime: number = 0;

	protected readonly controllers: Gamepad[] = [];
	protected left: boolean;
	protected right: boolean;
	protected up: boolean;
	protected down: boolean;

	public constructor(glContext: WebGLRenderingContext | string) {
		super(glContext);
		const map = MapInitializer.createMap(MapInitializer.MapType.ORIGINAL);
		map.reset();
		this.setScene(map);
	}

	public onkeydown(event: KeyboardEvent): boolean {
		const stringCode = String.fromCharCode(event.keyCode);
		switch (stringCode) {
			case 'A': case '%': this.left = true; return false;
			case 'D': case "'": this.right = true; return false;
			case 'S': case '(': this.down = true; return false;
			case 'W': case '&': this.up = true; return false;
		}
	}

	public onkeyup(event: KeyboardEvent) {
		const stringCode = String.fromCharCode(event.keyCode);
		switch (stringCode) {
			case 'A': case '%': this.left = false; return false;
			case 'D': case "'": this.right = false; return false;
			case 'S': case '(': this.down = false; return false;
			case 'W': case '&': this.up = false; return false;
		}
	}

	public addController(controller: Gamepad) {
		this.controllers[controller.index] = controller;
	}

	public updateController(controller: Gamepad) {
		this.controllers[controller.index] = controller;
	}

	public removeController(controller: Gamepad) {
		delete this.controllers[controller.index];
	}

	protected scanControllers() {
		const controllers = getControllers();
		for (const controller of controllers) {
			if (controller) {
				this.updateController(controller);
			}
		}
	}

	protected update(deltaTime: number): void {
		if (requireManualControllerScan) {
			this.scanControllers();
		}

		for (const controller of this.controllers) {
			if (controller && controller.connected) {
				this.left = this.left || controller.axes[0] < -DEAD_ZONE;
				this.right = this.right || controller.axes[0] > +DEAD_ZONE;
				this.up = this.up || controller.axes[1] < -DEAD_ZONE;
				this.down = this.down || controller.axes[1] > +DEAD_ZONE;

				this.left = this.left || buttonPressed(controller.buttons[14]);
				this.right = this.right || buttonPressed(controller.buttons[15]);
				this.up = this.up || buttonPressed(controller.buttons[12]);
				this.down = this.down || buttonPressed(controller.buttons[13]);
			}
		}

		let d;
		if (this.left) d = Direction.LEFT;
		if (this.right) d = Direction.RIGHT;
		if (this.up) d = Direction.UP;
		if (this.down) d = Direction.DOWN;
		if (d !== undefined) {
			this.scene.setPlayerDirection(d);
		}
		this.left = this.right = this.up = this.down = false;

		this.frameTime += deltaTime;
		while (this.frameTime >= MILLISECONDS_PER_FRAME) {
			this.frameTime -= MILLISECONDS_PER_FRAME;
			super.update(MILLISECONDS_PER_FRAME);
		}
	}
}
