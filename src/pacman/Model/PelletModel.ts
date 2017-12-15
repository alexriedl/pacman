import { MapTile } from 'pacman/Map';
import { Buffer, Color, Shader, vec2 } from 'sengine';

const OFFSCREEN_PELLET = [-1, -1, 0, -1, 0, 0, 0, 0, -1, 0, -1, -1];
export default class PelletModel extends Shader.SimpleShader {
	private readonly pellets: vec2[];
	public readonly pelletSize: number;
	private _pelletCount: number;

	public get pelletCount(): number { return this._pelletCount; }

	public constructor(pellets: vec2[], pelletColor: Color, pelletSize: number = 2) {
		super(undefined, pelletColor);
		this.pellets = pellets;
		this.pelletSize = pelletSize;
		this._pelletCount = pellets.length;

		this.setBuffer(new Buffer(
			getUpdatedBuffer(pellets, pelletSize),
			{
				renderMode: WebGLRenderingContext.TRIANGLES,
				bufferUsages: [{ size: 2 }],
			},
		));
	}

	public removePelletAt(coords: vec2): boolean {
		for (let index = 0; index < this.pellets.length; index++) {
			const pellet = this.pellets[index];
			if (pellet && pellet.exactEquals(coords)) {
				this.pellets[index] = undefined;
				this.buffer.updateBuffer(OFFSCREEN_PELLET, index * 12 * 4);
				this._pelletCount--;
				return true;
			}
		}

		return false;
	}
}

function getUpdatedBuffer(pellets: vec2[], size: number): number[] {
	const data: number[] = [];
	const start = MapTile.PIXELS_PER_TILE / 2 - size / 2;
	for (const coord of pellets) {
		const l = coord.x * MapTile.PIXELS_PER_TILE + start;
		const r = l + size;
		const t = coord.y * MapTile.PIXELS_PER_TILE + start;
		const b = t + size;

		data.push(l, t, r, t, r, b);
		data.push(r, b, l, b, l, t);
	}
	return data;
}
