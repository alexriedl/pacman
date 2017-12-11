import 'pacman/images/pinky.png';

import { GhostModel } from 'pacman/Model';
import { Direction } from 'pacman/Utils';
import { vec2 } from 'sengine';

import GhostEntity from './GhostEntity';
import PacEntity from './PacEntity';

export default class Pinky extends GhostEntity {
	public constructor(pacman: PacEntity) {
		super(new GhostModel('images/pinky.png'), pacman);
	}

	public getTargetTile(): vec2 {
		switch (this.ghostMode) {
			case GhostEntity.GhostMode.CHASE:
				let target = this.pacman.tilePosition.add(Direction.getVector(this.pacman.facing).scale(4));
				// NOTE: Re-implementation of original pacman bug
				if (this.pacman.facing === Direction.UP) target = target.addValues(-4, 0);
				return target;
			case GhostEntity.GhostMode.SCATTER: return this.scatterTarget;
			// TODO: Add logic to get frightened target tile, or change the logic to not use target tiles during that mode
		}
	}
}
