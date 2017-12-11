import { Buffer, Shader, vec2 } from 'sengine';

const SHARED_VERTEX_BUFFER = Buffer.createSquare(16);

export default abstract class SpriteMap extends Shader.TextureShader {
	private currentFrames: number[];
	private currentFrame: number;

	protected abstract readonly left: number[];
	protected abstract readonly right: number[];
	protected abstract readonly up: number[];
	protected abstract readonly down: number[];

	public constructor(source: string) {
		super(undefined, undefined, source);
		this
			.setUVBuffer(this.getUVBuffer())
			.setVertBuffer(this.getVertexBuffer());
		this.goUp();
	}

	protected getVertexBuffer(): Buffer {
		return SHARED_VERTEX_BUFFER;
	}

	protected getUVBuffer(): Buffer {
		return Buffer.createGridUV(new vec2(16, 16), new vec2(16 * 3, 16 * 3), 9);
	}

	public goLeft(): void { this.currentFrames = this.left; }
	public goRight(): void { this.currentFrames = this.right; }
	public goUp(): void { this.currentFrames = this.up; }
	public goDown(): void { this.currentFrames = this.down; }

	public nextFrame(onLoop?: () => void): void {
		if (!this.metadata.program) return;
		if (!this.currentFrames || this.currentFrames.length <= 0) return;
		this.currentFrame = (this.currentFrame + 1) % this.currentFrames.length;
		const frameIndex = this.currentFrames[this.currentFrame];
		this.uvBuffer.options.bufferUsages[0].offset = frameIndex * 8 * 4;
		if (this.currentFrame === 0 && onLoop) onLoop();
	}

	public reset(): void {
		this.currentFrames = this.up;
		this.currentFrame = 0;
	}
}
