import { MapTile } from 'pacman/Map';
import { Buffer, Color, Shader, vec2 } from 'sengine';

export default class PelletModel extends Shader.SimplerShader {
	protected buffer: Buffer;
	private readonly pellets: vec2[];
	private readonly pelletSize: number;

	public constructor(pellets: vec2[], pelletColor: Color, pelletSize: number = 2) {
		super(undefined, pelletColor);
		this.pellets = pellets;
		this.pelletSize = pelletSize;

		this.buffer = new Buffer(
			getUpdatedBuffer(pellets, pelletSize),
			{
				renderMode: WebGLRenderingContext.TRIANGLES,
				bufferUsages: [{ size: 2 }],
			},
		);
	}

	public removePelletAt(coords: vec2): boolean {
		const index = this.pellets.findIndex((v) => v.exactEquals(coords));
		if (index > -1) {
			this.pellets.splice(index, 1);
			this.buffer.setBuffer(getUpdatedBuffer(this.pellets, this.pelletSize));
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
