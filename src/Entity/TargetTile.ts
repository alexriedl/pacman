import { GhostEntity } from '../Entity';
import { MapTile } from '../Map';

import { Color, Entity, SimpleRectangle, vec2, vec3 } from 'sengine';

export default class TargetTile extends Entity {
	private ghost: GhostEntity;
	public tilePosition: vec2;
	public pixelPosition: vec2;

	public constructor(color: Color, ghost: GhostEntity) {
		const size = MapTile.PIXELS_PER_TILE;
		super(new SimpleRectangle(color), new vec3(), new vec3(size, size, 1));
		this.ghost = ghost;
		this.pixelPosition = new vec2(MapTile.PIXELS_PER_TILE / 2, MapTile.PIXELS_PER_TILE / 2);
		this.tilePosition = new vec2(-1, -1);
	}

	public get position(): vec3 {
		return this.tilePosition.scale(MapTile.PIXELS_PER_TILE).add(this.pixelPosition).toVec3(0);
	}
	public set position(value: vec3) { return; }

	public update(deltaTime: number): boolean {
		this.tilePosition = this.ghost.getTargetTile();
		return true;
	}
}
