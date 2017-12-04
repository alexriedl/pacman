import { GhostEntity } from 'pacman/Entity';
import { MapTile } from 'pacman/Map';
import { Color, Entity, vec2, vec3, Shader, Buffer } from 'sengine';

export default class TargetTile extends Entity {
	private ghost: GhostEntity;
	public tilePosition: vec2;
	public pixelPosition: vec2;

	public constructor(color: Color, ghost: GhostEntity) {
		super();

		const size = MapTile.PIXELS_PER_TILE;
		const halfTile = MapTile.PIXELS_PER_TILE / 2;

		const buffer = Buffer.createSquare(size);
		const shader = new Shader.SimplerShader(buffer, color);
		this.setShader(shader);

		this.pixelPosition = new vec2(halfTile, halfTile);
		this.tilePosition = new vec2(-1, -1);
		this.ghost = ghost;
	}

	public get position(): vec3 {
		return this.tilePosition.scale(MapTile.PIXELS_PER_TILE).add(this.pixelPosition).toVec3(0);
	}
	public set position(value: vec3) { return; }

	public update(deltaTime: number): this {
		this.tilePosition = this.ghost.getTargetTile();
		return super.update(deltaTime);
	}
}
