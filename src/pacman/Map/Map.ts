import { GhostEntity, PacEntity, Pacman, PelletEntity } from 'pacman/Entity';
import { Direction } from 'pacman/Utils';
import { Buffer, Camera2D, Color, Entity, Scene, Shader, Texture, vec2 } from 'sengine';

import MapTile from './MapTile';

interface IGhostModeInfo {
	currentMode: GhostEntity.GhostMode;
	durationInFrames: number;
	pausedMode: GhostEntity.GhostMode;
	pausedModeDurationInFrames: number;
	swaps: number;
}

interface IPlayerDeadState {
	deadPauseTimer: number;
}

export default class Map extends Scene {
	public readonly pixelDimensions: vec2;
	public readonly tileDimensions: vec2;
	public readonly mapInfo: MapTile.BasicMapTile[][];

	private ghostModeInfo: IGhostModeInfo;
	private static readonly ghostModeDuration: number = 60 * 7; // 60fps = 7 seconds
	private static readonly frightenedModeDurationInFrames: number = 60 * 7; // 60fps = 7 seconds

	private playerDeadState: IPlayerDeadState;
	private pellets: PelletEntity[];
	private pacman: Pacman;

	private introTime: number;

	public get currentGhostMode(): GhostEntity.GhostMode { return this.ghostModeInfo.currentMode; }

	public constructor(mapTexture: Texture, mapInfo: MapTile.BasicMapTile[][], tileDimensions: vec2) {
		const pixelDimensions = tileDimensions.scale(MapTile.PIXELS_PER_TILE);
		const center = pixelDimensions.scale(0.5);
		const camera = new Camera2D(pixelDimensions, center);
		super(camera);

		this.pixelDimensions = pixelDimensions;
		this.tileDimensions = tileDimensions;
		this.mapInfo = mapInfo;

		this.setupBackground(mapTexture, pixelDimensions);
	}

	private setupBackground(mapTexture: Texture, pixelDimensions: vec2) {
		const center = pixelDimensions.scale(0.5);
		const vertexBuffer = Buffer.createRectangle(pixelDimensions.x, pixelDimensions.y);
		const textureBuffer = Buffer.createRectangleUV();
		const textureShader = new Shader.TextureShader(vertexBuffer, textureBuffer, mapTexture);
		const world = new Entity(center.toVec3());
		world.setShader(textureShader);
		world.setParent(this);
	}

	public initializePellets(pellets: vec2[], energizers: vec2[], color: Color): void {
		const pelletModel = new PelletEntity(pellets, color);
		const energizerModel = new PelletEntity(energizers, color, 6, true);
		pelletModel.setParent(this);
		energizerModel.setParent(this);
		this.pellets = [pelletModel, energizerModel];
	}

	public initializeEntity(entity: PacEntity, startingTile: vec2,
		facingDirection: Direction, scatterTarget?: vec2, deadTarget?: vec2): void {
		entity.setStartingInfo(startingTile, facingDirection);
		entity.setParent(this);

		if (entity instanceof GhostEntity) {
			entity.initialize(scatterTarget, deadTarget);
		}
		else if (entity instanceof Pacman) {
			this.pacman = entity;
		}
	}

	public reset(): void {
		this.introTime = 3 * 60;
		this.playerDeadState = undefined;
		this.ghostModeInfo = {
			currentMode: undefined,
			durationInFrames: Map.ghostModeDuration,
			pausedMode: undefined,
			pausedModeDurationInFrames: 0,
			swaps: 5,
		};
		this.setGhostMode(GhostEntity.GhostMode.SCATTER, false);
		this.children.forEach((c) => {
			if (c instanceof PacEntity) c.reset();
		});
		for (const pellet of this.pellets) {
			if (pellet) pellet.reset();
		}
	}

	/**
	 * Consume a pellet at coords. Returns the size of the pellet consumed
	 * - If pellet consumed is an energizer, frightened mode will begin
	 * - If pellet consumed is last pellet on level, level will be complete
	 * - If no pellet is consumed, 0 is returned
	 */
	public eatPelletAt(coords: vec2): number {
		let pelletSize = 0;
		let pelletCount = 0;
		for (const pellet of this.pellets) {
			if (pellet && pellet.removePelletAt(coords)) {
				pelletSize = pellet.pelletSize;
				pelletCount += pellet.pelletCount;
			}
		}

		if (pelletCount <= 0) {
			// TODO: Level Complete
		}

		// TODO: Don't hard code pellet size for energizer here.
		if (pelletSize > 4) {
			this.setGhostMode(GhostEntity.GhostMode.FRIGHTENED);
		}

		return pelletSize;
	}

	public setGhostMode(newMode: GhostEntity.GhostMode, reverse: boolean = true) {
		if (newMode === GhostEntity.GhostMode.FRIGHTENED) {
			// TODO: May need a check to prevent infinite frightened mode
			// NOTE: This could happen if an energizer is eaten while still in frightened mode
			this.ghostModeInfo.pausedMode = this.ghostModeInfo.currentMode;
			this.ghostModeInfo.pausedModeDurationInFrames = this.ghostModeInfo.durationInFrames;
			// TODO: Tell pacman about mode - speed is affected
		}

		this.ghostModeInfo.currentMode = newMode;
		this.ghostModeInfo.durationInFrames = Map.ghostModeDuration;
		this.children.forEach((child) => {
			if (child instanceof GhostEntity) {
				if (newMode === GhostEntity.GhostMode.FRIGHTENED) child.setFrightenedMode(Map.frightenedModeDurationInFrames);
				else child.setGhostMode(newMode, reverse);
			}
		});
	}

	public setPlayerDirection(direction: Direction): void {
		this.pacman.setDesired(direction);
	}

	public update(deltaTime: number): this {
		if (this.introTime) this.introTime--;
		else if (this.playerDeadState) this.deadTick(deltaTime);
		else this.gameTick(deltaTime);

		return this;
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

			for (const pellet of this.pellets) {
				if (pellet) pellet.update(deltaTime);
			}
			return;
		}

		super.update(deltaTime);
	}

	private gameTick(deltaTime: number): void {
		this.ghostModeInfo.durationInFrames--;

		if (this.ghostModeInfo.durationInFrames <= 0) {
			if (this.ghostModeInfo.currentMode === GhostEntity.GhostMode.FRIGHTENED) {
				this.ghostModeInfo.currentMode = this.ghostModeInfo.pausedMode;
				this.ghostModeInfo.durationInFrames = this.ghostModeInfo.pausedModeDurationInFrames;
			}
			else if (this.ghostModeInfo.swaps > 0) {
				this.ghostModeInfo.swaps--;
				this.setGhostMode(this.ghostModeInfo.currentMode === GhostEntity.GhostMode.SCATTER ?
					GhostEntity.GhostMode.CHASE : GhostEntity.GhostMode.SCATTER);
			}
		}

		super.update(deltaTime);

		if (this.pacman.isAlive) {
			this.children.forEach((c) => {
				if (c instanceof GhostEntity && c.tilePosition.exactEquals(this.pacman.tilePosition)) {
					switch (c.ghostMode) {
						case GhostEntity.GhostMode.SCATTER:
						case GhostEntity.GhostMode.CHASE:
							this.playerDeadState = {
								deadPauseTimer: 1 * 60,
							};
							break;
						case GhostEntity.GhostMode.FRIGHTENED:
							c.setGhostMode(GhostEntity.GhostMode.DEAD, false);
					}
				}
			});
		}
	}

	public canMoveToTile(coords: vec2, direction?: Direction): boolean {
		switch (this.getTileInfo(coords)) {
			case MapTile.BasicMapTile.GHOST_PEN:
			case MapTile.BasicMapTile.BLOCK: return false;
			case MapTile.BasicMapTile.ENTER_GHOST_PEN:
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
