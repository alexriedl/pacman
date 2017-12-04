import { PelletModel } from 'pacman/Model';
import { Color, Entity, vec2 } from 'sengine';

export default class EnergizerEntity extends Entity {
	private flip;
	private flicker: boolean;
	private pelletModel: PelletModel;
	protected model: PelletModel;

	public constructor(pellets: vec2[], color: Color, size: number = 2, flicker: boolean = false) {
		super();

		this.flicker = flicker;
		this.pelletModel = new PelletModel(pellets, color, size);

		this.reset();
	}

	public update(deltaTime: number): this {
		if (!this.flicker) return;

		this.flip -= deltaTime;
		if (this.flip <= 0) {
			this.flip += 300;
			this.model = !!this.model ? undefined : this.pelletModel;
		}
		return super.update(deltaTime);
	}

	public removePelletAt(coords: vec2): boolean {
		return this.pelletModel.removePelletAt(coords);
	}

	public reset(): void {
		this.model = this.pelletModel;
		this.flip = 300;
	}
}
