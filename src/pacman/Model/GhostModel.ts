import { Buffer, vec2 } from 'sengine';

import PacMap from './PacMap';

export default class GhostModel extends PacMap {
	protected readonly left = [4, 5];
	protected readonly right = [6, 7];
	protected readonly up = [0, 1];
	protected readonly down = [2, 3];

	protected getUVBuffer(): Buffer {
		return Buffer.createGridUV(new vec2(16, 16), new vec2(16 * 3, 16 * 3), 8);
	}
}
