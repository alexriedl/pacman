import { DeadModel, PacmanModel } from 'pacman/Model';
import { Direction } from 'pacman/Utils';
import { vec2 } from 'sengine/Math';

import PacEntity from './PacEntity';

export default class Pacman extends PacEntity {
	protected deadTicks: number;
	protected alive: boolean;

	protected mainModel: PacmanModel;
	protected deadModel: DeadModel;

	private deadAnimationFinished: () => void;

	public constructor() {
		super();

		const mainModel = new PacmanModel();
		const deadModel = new DeadModel();

		this.mainModel = mainModel;
		this.deadModel = deadModel;

		this.setShader(this.mainModel);
	}

	public get isAlive(): boolean { return this.alive; }

	public reset(): void {
		super.reset();

		this.deadTicks = 0;
		this.alive = true;
		this.shader = this.mainModel;
		this.shader.reset();
	}

	protected onPixelChange(oldPixelPos: vec2): void {
		switch (this.facing) {
			case Direction.LEFT: this.shader.goLeft(); break;
			case Direction.RIGHT: this.shader.goRight(); break;
			case Direction.UP: this.shader.goUp(); break;
			case Direction.DOWN: this.shader.goDown(); break;
		}
		this.shader.nextFrame();
	}

	protected onTileChange(oldPixelPos: vec2): void {
		const deadFrames = this.parent.removePelletAt(this.tilePosition);
		if (deadFrames > 0) {
			this.deadTicks += deadFrames;
		}
	}

	protected tick(): void {
		if (this.deadTicks > 0) {
			this.deadTicks--;
			return;
		}

		if (this.isAlive) {
			super.tick();
		}
		else {
			if (this.shader) {
				this.deadTicks = 3; // NOTE: Hack for animation frame rate
				this.shader.nextFrame(this.deadAnimationFinished);
			}
		}
	}

	public kill(animationFinished: () => void): void {
		this.alive = false;
		this.shader = this.deadModel;
		this.shader.reset();
		this.deadTicks = 3;
		this.deadAnimationFinished = () => {
			this.shader = undefined;
			animationFinished();
		};
	}
}
