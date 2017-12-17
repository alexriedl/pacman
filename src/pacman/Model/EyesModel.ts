import 'pacman/images/eyes.png';

import { Buffer, vec2 } from 'sengine';

import PacMap from './PacMap';

export default class EyesModel extends PacMap {
	protected readonly left: number[] = [2];
	protected readonly right: number[] = [3];
	protected readonly up: number[] = [0];
	protected readonly down: number[] = [1];

	public constructor() {
		super('images/eyes.png');
	}

	protected getUVBuffer(): Buffer {
		return Buffer.createGridUV(new vec2(16, 16), new vec2(16 * 2, 16 * 2), 4);
	}
}
