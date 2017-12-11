import 'pacman/images/dead.png';

import { Buffer, vec2 } from 'sengine';

import PacMap from './PacMap';

export default class DeadModel extends PacMap {
	private static readonly FRAMES: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	protected readonly spriteCount: number = DeadModel.FRAMES.length;
	protected readonly left: number[] = DeadModel.FRAMES;
	protected readonly right: number[] = DeadModel.FRAMES;
	protected readonly up: number[] = DeadModel.FRAMES;
	protected readonly down: number[] = DeadModel.FRAMES;

	public constructor() {
		super('images/dead.png');
	}

	protected getUVBuffer(): Buffer {
		return Buffer.createGridUV(new vec2(16, 16), new vec2(16 * 4, 16 * 3), 11);
	}
}
