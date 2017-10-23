import { Entity, SimpleTextureRectangle, Color, vec2 } from 'sengine';

import { Direction } from '../Utils';
import { PacEntity, GhostEntity, Pacman, PelletEntity } from '../Entity';
import MapTile from './MapTile';

interface IGhostModeInfo {
	currentGhostMode: GhostEntity.GhostMode;
	ghostModeDuration: number;
	swaps: number;
}

interface IPlayerDeadState {
	deadPauseTimer: number;
}

export default class Map extends Entity {
	public readonly pixelDimensions: vec2;
	public readonly tileDimensions: vec2;
	public readonly mapInfo: MapTile.BasicMapTile[][];

	private ghostModeInfo: IGhostModeInfo;
	private static readonly ghostModeDuration: number = 60 * 7; // 60fps = 7 seconds

	private playerDeadState: IPlayerDeadState;
	private pellets: PelletEntity;
	private energizers: PelletEntity;
	private pacman: Pacman;

	private introTime: number;

	public constructor(mapTexture: WebGLTexture, mapInfo: MapTile.BasicMapTile[][], tileDimensions: vec2) {
		const pixelDimensions = tileDimensions.scale(MapTile.PIXELS_PER_TILE);
		super(
			new SimpleTextureRectangle(mapTexture),
			pixelDimensions.scale(0.5).toVec3(),
			pixelDimensions.toVec3(1));

		this.pixelDimensions = pixelDimensions;
		this.tileDimensions = tileDimensions;
		this.mapInfo = mapInfo;
	}

	public initializePellets(pellets: vec2[], energizers: vec2[], color: Color): void {
		this.pellets = new PelletEntity(pellets, color);
		this.energizers = new PelletEntity(energizers, color, 6, true);
		this.pellets.setParent(this);
		this.energizers.setParent(this);
	}

	public initializeEntity(entity: PacEntity, startingTile: vec2,
		facingDirection: Direction, scatterTarget?: vec2): void {
		entity.setStartingInfo(startingTile, facingDirection);
		entity.setParent(this);

		if (scatterTarget && entity instanceof GhostEntity) {
			entity.scatterTarget = scatterTarget;
		}
		else if (entity instanceof Pacman) {
			this.pacman = entity;
		}
	}

	public reset(): void {
		this.introTime = 3 * 60;
		this.playerDeadState = undefined;
		this.ghostModeInfo = {
			currentGhostMode: undefined,
			ghostModeDuration: Map.ghostModeDuration,
			swaps: 5,
		};
		this.setGhostMode(GhostEntity.GhostMode.SCATTER, false);
		this.children.forEach((c) => {
			if (c instanceof PacEntity) c.reset();
		});
		this.energizers.reset();
		this.pellets.reset();
	}

	public removePelletAt(coords: vec2): number {
		if (this.energizers.removePelletAt(coords)) return 3;
		if (this.pellets.removePelletAt(coords)) return 1;
		// TODO: Check for level complete
		return 0;
	}

	public setGhostMode(newMode: GhostEntity.GhostMode, reverse: boolean = true) {
		this.ghostModeInfo.currentGhostMode = newMode;
		this.ghostModeInfo.ghostModeDuration = Map.ghostModeDuration;
		this.children.forEach((child) => {
			if (child instanceof GhostEntity) {
				child.setGhostMode(newMode, reverse);
			}
		});
	}

	public setPlayerDirection(direction: Direction): void {
		this.pacman.setDesired(direction);
	}

	public update(deltaTime: number): boolean {
		if (this.introTime) this.introTime--;
		else if (this.playerDeadState) this.deadTick(deltaTime);
		else this.gameTick(deltaTime);

		return true;
	}

	private deadTick(deltaTime: number): void {
		if (this.playerDeadState.deadPauseTimer > 0) {
			this.playerDeadState.deadPauseTimer--;
			if (this.playerDeadState.deadPauseTimer <= 0) {
				this.pacman.kill(() => {
					// TODO: Check for gameover
					this.reset();
				});
				this.setGhostMode(GhostEntity.GhostMode.HIDDEN, false);
			}

			this.energizers.update(deltaTime);
			return;
		}

		super.update(deltaTime);
	}

	private gameTick(deltaTime: number): void {
		this.ghostModeInfo.ghostModeDuration--;

		if (this.ghostModeInfo.ghostModeDuration <= 0 && this.ghostModeInfo.swaps > 0) {
			this.ghostModeInfo.swaps--;

			this.setGhostMode(this.ghostModeInfo.currentGhostMode === GhostEntity.GhostMode.SCATTER ?
				GhostEntity.GhostMode.CHASE : GhostEntity.GhostMode.SCATTER);
		}

		super.update(deltaTime);

		if (this.pacman.isAlive) {
			this.children.forEach((c) => {
				if (c instanceof GhostEntity && c.tilePosition.exactEquals(this.pacman.tilePosition)) {
					this.playerDeadState = {
						deadPauseTimer: 1 * 60,
					};
				}
			});
		}
	}

	public canMoveToTile(coords: vec2, direction?: Direction): boolean {
		switch (this.getTileInfo(coords)) {
			case MapTile.BasicMapTile.GHOST_PEN:
			case MapTile.BasicMapTile.BLOCK: return false;
			case MapTile.BasicMapTile.SLOW:
			case MapTile.BasicMapTile.OPEN: return true;
			case MapTile.BasicMapTile.RESTRICTED_UP: return !direction || direction !== Direction.UP;
		}
	}

	public getTileInfo(coords: vec2): MapTile.BasicMapTile {
		coords = this.orientCoords(coords);
		return this.mapInfo[coords.y][coords.x];
	}

	/**
	 * Wrap coords to other side of board if they are off of the edge
	 */
	public orientCoords(tileCoords: vec2): vec2 {
		return tileCoords.cmod(this.tileDimensions);
	}
}
