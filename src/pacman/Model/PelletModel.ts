import { MapTile } from 'pacman/Map';
import { Buffer, Color, Shader, vec2 } from 'sengine';

const OFFSCREEN_PELLET = [-1, -1, 0, -1, 0, 0, 0, 0, -1, 0, -1, -1];
export default class PelletModel extends Shader.SimpleShader {
	private readonly pellets: Pellet[];
	private readonly pelletSize: number;

	public constructor(pellets: vec2[], pelletColor: Color, pelletSize: number = 2) {
		super(undefined, pelletColor);
		this.pellets = pellets as Pellet[];
		this.pelletSize = pelletSize;

		this.setBuffer(new Buffer(
			getUpdatedBuffer(pellets, pelletSize),
			{
				renderMode: WebGLRenderingContext.TRIANGLES,
				bufferUsages: [{ size: 2 }],
			},
		));
	}

	public removePelletAt(coords: vec2): boolean {
		const index = this.pellets.findIndex((v) => v.exactEquals(coords));
		if (index > -1) {
			const p = this.pellets[index];
			if (p.consumed) return false;
			this.buffer.updateBuffer(OFFSCREEN_PELLET, index * 12 * 4);
			p.consumed = true;
			return true;
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

// tslint:disable-next-line:max-classes-per-file
class Pellet extends vec2 {
	public consumed: boolean = false;
}
