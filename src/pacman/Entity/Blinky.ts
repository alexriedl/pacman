import 'pacman/images/blinky.png';

import { GhostModel } from 'pacman/Model';
import { vec2 } from 'sengine';

import GhostEntity from './GhostEntity';
import PacEntity from './PacEntity';

export default class Blinky extends GhostEntity {
	protected shader: GhostModel;

	public constructor(pacman: PacEntity) {
		super(new GhostModel('images/blinky.png'), pacman);
	}

	public getTargetTile(): vec2 {
		switch (this.ghostMode) {
			case GhostEntity.GhostMode.CHASE: return this.pacman.tilePosition;
			case GhostEntity.GhostMode.SCATTER: return this.scatterTarget;
			default: return super.getTargetTile();
		}
	}
}
