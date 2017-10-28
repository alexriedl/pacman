import GhostEntity from './GhostEntity';
import PacEntity from './PacEntity';
import 'pacman/images/blinky.png';
import { GhostModel } from 'pacman/Model';
import { vec2 } from 'sengine/Math';

export default class Blinky extends GhostEntity {
	protected model: GhostModel;

	public constructor(pacman: PacEntity) {
		super(new GhostModel('images/blinky.png'), pacman);
	}

	public getTargetTile(): vec2 {
		switch (this.ghostMode) {
			case GhostEntity.GhostMode.CHASE: return this.pacman.tilePosition;
			case GhostEntity.GhostMode.SCATTER: return this.scatterTarget;
			// TODO: Add logic to get frightened target tile, or change the logic to not use target tiles during that mode
		}
	}
}
