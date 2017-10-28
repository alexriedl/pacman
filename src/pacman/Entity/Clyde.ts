import GhostEntity from './GhostEntity';
import PacEntity from './PacEntity';
import 'pacman/images/clyde.png';
import { GhostModel } from 'pacman/Model';
import { vec2 } from 'sengine/Math';

export default class Clyde extends GhostEntity {
	public constructor(pacman: PacEntity) {
		super(new GhostModel('images/clyde.png'), pacman);
	}

	public getTargetTile(): vec2 {
		switch (this.ghostMode) {
			case GhostEntity.GhostMode.CHASE:
				const distance = this.tilePosition.dist(this.pacman.tilePosition);
				if (distance >= 8) return this.pacman.tilePosition;
				else return this.scatterTarget;
			case GhostEntity.GhostMode.SCATTER: return this.scatterTarget;
			// TODO: Add logic to get frightened target tile, or change the logic to not use target tiles during that mode
		}
	}
}
