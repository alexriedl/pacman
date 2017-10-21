import { Direction } from './Utils';
import { Map, MapInitializer } from './Map';

import { Game } from 'sengine';

const MILLISECONDS_PER_FRAME = (1 / 60) * 1000;

export default class PacmanGame extends Game {
	protected scene: Map;
	protected frameTime: number = 0;

	protected left: boolean;
	protected right: boolean;
	protected up: boolean;
	protected down: boolean;

	protected initialize(gl: WebGLRenderingContext): void {
		const map = MapInitializer.createMap(MapInitializer.MapType.ORIGINAL);
		super.initialize(gl);
		map.reset();
		this.setScene(map, map.pixelDimensions);
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

	protected update(deltaTime: number): void {
		let d;
		if (this.left) d = Direction.LEFT;
		if (this.right) d = Direction.RIGHT;
		if (this.up) d = Direction.UP;
		if (this.down) d = Direction.DOWN;
		if (d !== undefined) {
			this.scene.setPlayerDirection(d);
		}

		this.frameTime += deltaTime;
		while (this.frameTime >= MILLISECONDS_PER_FRAME) {
			this.frameTime -= MILLISECONDS_PER_FRAME;
			super.update(MILLISECONDS_PER_FRAME);
		}
	}
}
