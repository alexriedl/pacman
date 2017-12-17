import { MapTile } from 'pacman/Map';
import { EyesModel, GhostModel } from 'pacman/Model';
import { Direction } from 'pacman/Utils';
import { mat4, vec2 } from 'sengine';

import { methodTracker } from '../../sengine/src/Utils/Performance';
import PacEntity from './PacEntity';

interface IPenState {
	entering: boolean;
	leaving: boolean;
	direction: Direction;
	exitTile: vec2;
	remainingTicks: number;
}

abstract class GhostEntity extends PacEntity {
	protected readonly pacman: PacEntity;
	protected nextDesiredDirection: Direction;

	public ghostMode: GhostEntity.GhostMode;
	protected frightenedModeDurationInFrames: number;
	protected penState: IPenState;
	protected danceTile: vec2;
	protected scatterTarget: vec2;
	protected deadTarget: vec2;

	protected ghostModel: GhostModel;
	protected eyesModel: EyesModel;

	protected get roundingSize(): number { return 0; }
	protected get followRestrictions(): boolean {
		return this.ghostMode === GhostEntity.GhostMode.SCATTER ||
			this.ghostMode === GhostEntity.GhostMode.CHASE;
	}

	public constructor(model: GhostModel, pacman: PacEntity) {
		super();
		this.pacman = pacman;

		this.ghostModel = model;
		this.eyesModel = new EyesModel();

		this.setShader(this.ghostModel);
	}

	public initialize(scatterTarget: vec2, deadTarget: vec2): void {
		this.scatterTarget = scatterTarget;
		this.deadTarget = deadTarget;
	}

	protected get speed(): number {
		if (this.penState) return 30;
		switch (this.ghostMode) {
			case GhostEntity.GhostMode.DEAD: return PacEntity.GHOST_DEAD_SPEED;
			case GhostEntity.GhostMode.FRIGHTENED: return PacEntity.GHOST_FRIGHTENED_SPEED;
		}
		const tileInfo = this.parent.getTileInfo(this.tilePosition);
		switch (tileInfo) {
			case MapTile.BasicMapTile.SLOW: return 40;
		}
		return PacEntity.MAX_SPEED;
	}

	public getTargetTile(): vec2 {
		switch (this.ghostMode) {
			case GhostEntity.GhostMode.DEAD: return this.deadTarget;
			default: return new vec2();
		}
	}

	public setDesired(direction: Direction) {
		if (!direction) return;
		super.setDesired(direction);
		switch (direction) {
			case Direction.LEFT: this.shader.goLeft(); break;
			case Direction.RIGHT: this.shader.goRight(); break;
			case Direction.UP: this.shader.goUp(); break;
			case Direction.DOWN: this.shader.goDown(); break;
		}
		this.shader.nextFrame();
	}

	public setFrightenedMode(durationInFrames: number) {
		// NOTE: Ghosts in the pen are not affected by energizers
		if (this.penState) return;

		// TODO: Verify entering frightened mode while already in frightened mode causes a ghost to reverse direction
		this.setGhostMode(GhostEntity.GhostMode.FRIGHTENED);
		this.frightenedModeDurationInFrames = durationInFrames;
	}

	public setGhostMode(newMode: GhostEntity.GhostMode, reverse: boolean = true) {
		const oldMode = this.ghostMode;
		this.ghostMode = newMode;
		if (reverse) {
			// TODO: If ghost is in a tile against a wall, the ghost could turn around into the wall and get stuck
			this.facing = Direction.getOpposite(this.facing);
			this.nextDesiredDirection = undefined;
			this.setDesired(this.facing);
			this.updateDesiredDirection();
		}

		switch (newMode) {
			case GhostEntity.GhostMode.DEAD: this.setShader(this.eyesModel); break;
			default:
				if (oldMode === GhostEntity.GhostMode.DEAD) {
					this.setShader(this.ghostModel);
				}
				break;
		}
	}

	protected enterPen(facing: Direction = Direction.DOWN): void {
		this.penState = {
			entering: false,
			leaving: this.constructor.name === 'Pinky',
			direction: facing,
			exitTile: new vec2(14, 17),
			remainingTicks: this.constructor.name === 'Inky' ? 50 : this.constructor.name === 'Clyde' ? 100 : 0,
		};
		this.setDesired(this.penState.direction);
	}

	public reset(): void {
		super.reset();
		this.danceTile = this.startTile;
		this.nextDesiredDirection = undefined;
		this.ghostMode = GhostEntity.GhostMode.SCATTER;
		this.enterPen(this.facing);
	}

	protected onTileChange(oldPixelPos: vec2): void {
		if (this.penState) return;

		switch (this.ghostMode) {
			case GhostEntity.GhostMode.FRIGHTENED: this.updateFrightenedDirection(); break;
			case GhostEntity.GhostMode.DEAD:
				const tileInfo = this.parent.getTileInfo(this.tilePosition);
				if (tileInfo === MapTile.BasicMapTile.ENTER_GHOST_PEN) {
					const newMode = this.parent.currentGhostMode === GhostEntity.GhostMode.FRIGHTENED ?
						this.parent.pausedGhostMode : this.parent.currentGhostMode;
					this.setGhostMode(newMode);
				}

			default: this.updateDesiredDirection();
		}
	}

	@methodTracker()
	protected tick(): void {
		switch (this.ghostMode) {
			case GhostEntity.GhostMode.HIDDEN: break;
			case GhostEntity.GhostMode.FRIGHTENED:
				// NOTE: Post decrement to get at least a frame of frightened mode
				if (this.frightenedModeDurationInFrames-- <= 0) {
					this.updateDesiredDirection();
					this.setGhostMode(this.parent.currentGhostMode, false);
				}
				else {
					super.tick();
					break;
				}
		}

		const tileInfo = this.parent.getTileInfo(this.tilePosition);

		switch (tileInfo) {
			case MapTile.BasicMapTile.GHOST_PEN:
				if (!this.penState) {
					this.enterPen();
				}
				break;
			default:
				if (this.penState) {
					this.penState = undefined;
					this.facing = Direction.LEFT;
					this.setDesired(this.facing);
				}
				break;
		}

		if (this.penState) this.inPenTick();
		else super.tick();
	}

	protected inPenTick(): void {
		this.penState.remainingTicks--;
		if (this.penState.remainingTicks <= 0) {
			this.penState.leaving = true;
		}

		// Simple Movement
		{
			this.pixelPosition = PacEntity.move(this.pixelPosition, this.penState.direction);
			this.setDesired(this.penState.direction);

			// NOTE: Ensure pixel and tile position is valid, and re-orient if not.
			if (this.pixelPosition.x >= MapTile.PIXELS_PER_TILE || this.pixelPosition.x < 0 ||
				this.pixelPosition.y >= MapTile.PIXELS_PER_TILE || this.pixelPosition.y < 0) {
				this.tilePosition = PacEntity.move(this.tilePosition, this.penState.direction);
				this.pixelPosition = this.pixelPosition.cmod(MapTile.PIXELS_PER_TILE);
			}
		}

		// Update direction
		const exitXPixel = 0;
		const exitYPixel = 4;
		if (this.penState.leaving) {
			if (this.tilePosition.x === this.penState.exitTile.x && this.pixelPosition.x === exitXPixel) {
				this.penState.direction = Direction.UP;
			}
			else if (this.tilePosition.y !== this.penState.exitTile.y || this.pixelPosition.y !== exitYPixel) {
				const tileOffset = Math.sign(this.penState.exitTile.y - this.tilePosition.y);
				if (tileOffset) {
					if (tileOffset > 0) this.penState.direction = Direction.DOWN;
					if (tileOffset < 0) this.penState.direction = Direction.UP;
				}
				else {
					const pixelOffset = Math.sign(exitYPixel - this.pixelPosition.y);
					if (pixelOffset) {
						if (pixelOffset > 0) this.penState.direction = Direction.DOWN;
						if (pixelOffset < 0) this.penState.direction = Direction.UP;
					}
				}
			}
			else {
				const tileOffset = Math.sign(this.penState.exitTile.x - this.tilePosition.x);
				if (tileOffset) {
					if (tileOffset > 0) this.penState.direction = Direction.RIGHT;
					if (tileOffset < 0) this.penState.direction = Direction.LEFT;
				}
				else {
					const pixelOffset = Math.sign(exitXPixel - this.pixelPosition.x);
					if (pixelOffset) {
						if (pixelOffset > 0) this.penState.direction = Direction.RIGHT;
						if (pixelOffset < 0) this.penState.direction = Direction.LEFT;
					}
				}
			}
		}
		else if (this.penState.direction === Direction.UP &&
			this.tilePosition.exactEquals(this.danceTile.addValues(0, -1)) &&
			this.pixelPosition.y > 4) {
			this.penState.direction = Direction.DOWN;
		}
		else if (this.penState.direction === Direction.DOWN &&
			this.tilePosition.exactEquals(this.danceTile.addValues(0, 1)) &&
			this.pixelPosition.y < 4) {
			this.penState.direction = Direction.UP;
		}
	}

	protected updateFrightenedDirection(): void {
		const invalidOpposite = this.desired && Direction.getOpposite(this.desired);

		// NOTE: The order of this array is the tie-breaker order
		const options = [
			Direction.getRandom(),
			Direction.UP,
			Direction.LEFT,
			Direction.DOWN,
			Direction.RIGHT,
		].filter((d) => d !== invalidOpposite);
		for (const direction of options) {
			const testTile = PacEntity.move(this.tilePosition, direction);
			if (this.parent.canMoveToTile(testTile, direction)) {
				this.setDesired(direction);
				return;
			}
		}
	}

	protected updateDesiredDirection(): void {
		let desired = this.nextDesiredDirection || this.desired;
		let nextTile = PacEntity.move(this.tilePosition, desired);

		// NOTE: If new direction is pointing towards a wall, recalculate direction
		const tileInfo = this.parent.getTileInfo(nextTile);
		if (tileInfo === MapTile.BasicMapTile.BLOCK) {
			desired = this.getValidDirection(this.tilePosition);
			nextTile = PacEntity.move(this.tilePosition, desired);
		}

		this.setDesired(desired);
		this.nextDesiredDirection = this.getValidDirection(nextTile, desired);
	}

	private getValidDirection(currentTile: vec2, currentDirection?: Direction): Direction {
		const invalidOpposite = currentDirection && Direction.getOpposite(currentDirection);
		// NOTE: The order of this array is the tie-breaker order
		const options = [
			Direction.UP,
			Direction.LEFT,
			Direction.DOWN,
			Direction.RIGHT,
		].filter((d) => d !== invalidOpposite);

		let shortestDistance = Number.MAX_SAFE_INTEGER;
		let shortestDirection;
		for (const direction of options) {
			const testTile = PacEntity.move(currentTile, direction);
			if (this.parent.canMoveToTile(testTile, direction)) {
				const distanceToTarget = testTile.sqrDist(this.getTargetTile());
				if (distanceToTarget < shortestDistance) {
					shortestDistance = distanceToTarget;
					shortestDirection = direction;
				}
			}
		}

		return shortestDirection;
	}

	public render(gl: WebGLRenderingContext, viewMatrix: mat4, projectionMatrix: mat4): this {
		switch (this.ghostMode) { case GhostEntity.GhostMode.HIDDEN: return; }
		return super.render(gl, viewMatrix, projectionMatrix);
	}
}

namespace GhostEntity {
	export enum GhostMode {
		CHASE = 'CHASE',
		SCATTER = 'SCATTER',
		FRIGHTENED = 'FRIGHTENED',
		HIDDEN = 'HIDDEN',
		DEAD = 'DEAD',
	}
}

export default GhostEntity;
