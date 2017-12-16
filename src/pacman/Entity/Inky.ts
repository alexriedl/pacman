import 'pacman/images/inky.png';

import { GhostModel } from 'pacman/Model';
import { Direction } from 'pacman/Utils';
import { vec2 } from 'sengine';

import GhostEntity from './GhostEntity';
import PacEntity from './PacEntity';

export default class Inky extends GhostEntity {
	private blinky: PacEntity;

	public constructor(pacman: PacEntity, blinky: PacEntity) {
		super(new GhostModel('images/inky.png'), pacman);
		this.blinky = blinky;
	}

	public getTargetTile(): vec2 {
		switch (this.ghostMode) {
			case GhostEntity.GhostMode.CHASE:
				let pacmanFacing = Direction.getVector(this.pacman.facing).scale(2);

				// NOTE: Re-implementation of original pacman bug
				if (this.pacman.facing === Direction.UP) pacmanFacing = pacmanFacing.addValues(-2, 0);

				const crossTile = this.pacman.tilePosition.add(pacmanFacing);
				const diff = this.blinky.tilePosition.sub(crossTile);
				const target = crossTile.sub(diff);
				return target;
			case GhostEntity.GhostMode.SCATTER: return this.scatterTarget;
			default: return super.getTargetTile();
		}
	}
}
