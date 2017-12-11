import Map from './Map';
import MapTile from './MapTile';
import OriginalMap from './OriginalMap';
import { Blinky, Clyde, GhostEntity, Inky, PacEntity, Pacman, Pinky, TargetTile } from 'pacman/Entity';
import { Direction } from 'pacman/Utils';
import { Color, vec2, Texture } from 'sengine';

// TODO: Move these
export interface IStringMap<T> { [key: string]: T; }
export interface INumberMap<T> { [key: number]: T; }

const mapInfos: IStringMap<IMapInfo> = { };

export interface IEntities<T> {
	pacman?: T;
	blinky?: T;
	pinky?: T;
	inky?: T;
	clyde?: T;
}

export interface IMapInfo {
	tileDimensions: vec2;
	basicMapTiles: MapTile.BasicMapTile[][];
	mapTexture: Texture;
	pellets: vec2[];
	energizers: vec2[];
	startingTiles: IEntities<vec2>;
	scatterTargets: IEntities<vec2>;
}

namespace MapInitializer {
	const entities: IEntities<PacEntity> = {};

	export const DISPLAY_TARGET_TILE: boolean = false;

	export const COLORS = {
		BORDER: new Color(0x21, 0x21, 0xFF, 0xFF),
		GATE: new Color(0xFF, 0xB8, 0xFF, 0xFF),
		EMPTY: new Color(0x00, 0x00, 0x00, 0xFF),
		PELLET: new Color(0xFF, 0xB5, 0x94, 0xFF),
		PACMAN: new Color(0xFF, 0xCC, 0x00, 0xFF),
		BLINKY: new Color(0xFF, 0x00, 0x00, 0xFF),
		PINKY: new Color(0xFF, 0x9C, 0xCE, 0xFF),
		INKY: new Color(0x31, 0xFF, 0xFF, 0xFF),
		CLYDE: new Color(0xFF, 0xCE, 0x31, 0xFF),
	};

	export enum MapType {
		ORIGINAL = 'ORIGINAL',
	}

	export function createMap(mapType: MapType): Map {
		entities.pacman = entities.pacman || new Pacman();
		entities.blinky = entities.blinky || new Blinky(entities.pacman);
		entities.pinky = entities.pinky || new Pinky(entities.pacman);
		entities.inky = entities.inky || new Inky(entities.pacman, entities.blinky);
		entities.clyde = entities.clyde || new Clyde(entities.pacman);

		const info = getMapInfo(mapType);

		const map = new Map(info.mapTexture, info.basicMapTiles, info.tileDimensions);
		map.initializePellets(info.pellets, info.energizers, COLORS.PELLET.normalize());
		map.initializeEntity(entities.pacman, info.startingTiles.pacman, Direction.LEFT);
		map.initializeEntity(entities.blinky, info.startingTiles.blinky, Direction.LEFT, info.scatterTargets.blinky);
		map.initializeEntity(entities.pinky, info.startingTiles.pinky, Direction.UP, info.scatterTargets.pinky);
		map.initializeEntity(entities.inky, info.startingTiles.inky, Direction.DOWN, info.scatterTargets.inky);
		map.initializeEntity(entities.clyde, info.startingTiles.clyde, Direction.DOWN, info.scatterTargets.clyde);

		if (DISPLAY_TARGET_TILE) {
			new TargetTile(MapInitializer.COLORS.BLINKY.normalize(), entities.blinky as GhostEntity).setParent(map);
			new TargetTile(MapInitializer.COLORS.PINKY.normalize(), entities.pinky as GhostEntity).setParent(map);
			new TargetTile(MapInitializer.COLORS.INKY.normalize(), entities.inky as GhostEntity).setParent(map);
			new TargetTile(MapInitializer.COLORS.CLYDE.normalize(), entities.clyde as GhostEntity).setParent(map);
		}

		return map;
	}

	function getMapInfo(mapType: MapType): IMapInfo {
		if (mapInfos[mapType]) return mapInfos[mapType];
		const tiles = getMapTiles(mapType);
		const dimensions = new vec2(tiles[0].length, tiles.length);

		const info = buildMapInfo(tiles, dimensions);

		mapInfos[mapType] = info;
		return info;
	}

	function getMapTiles(mapType: MapType): MapTile[][] {
		switch (mapType) {
			case MapType.ORIGINAL: return OriginalMap();
		}

		return null;
	}

	function buildMapInfo(tiles: MapTile[][], tileDimensions: vec2): IMapInfo {
		const scatterTargets: IEntities<vec2> = {};
		const startingTiles: IEntities<vec2> = {};
		const basicMapTiles = [];
		const pellets = [];
		const energizers = [];
		for (let tileY = 0; tileY < tileDimensions.y; tileY++) {
			const tileRow = tiles[tileY];
			const basicRowInfo = [];
			basicMapTiles.push(basicRowInfo);
			for (let tileX = 0; tileX < tileDimensions.x; tileX++) {
				const tileEnum = tileRow[tileX];
				basicRowInfo.push(MapTile.toBasicMapTile(tileEnum));
				switch (tileEnum) {
					case MapTile._PS: startingTiles.pacman = new vec2(tileX, tileY); break;
					case MapTile.GSB: startingTiles.blinky = new vec2(tileX, tileY); break;
					case MapTile.GSP: startingTiles.pinky = new vec2(tileX, tileY); break;
					case MapTile.GSI: startingTiles.inky = new vec2(tileX, tileY); break;
					case MapTile.GSC: startingTiles.clyde = new vec2(tileX, tileY); break;

					case MapTile.GTB: scatterTargets.blinky = new vec2(tileX, tileY); break;
					case MapTile.GTP: scatterTargets.pinky = new vec2(tileX, tileY); break;
					case MapTile.GTI: scatterTargets.inky = new vec2(tileX, tileY); break;
					case MapTile.GTC: scatterTargets.clyde = new vec2(tileX, tileY); break;

					case MapTile._p_: case MapTile.RUp: pellets.push(new vec2(tileX, tileY)); break;
					case MapTile._E_: energizers.push(new vec2(tileX, tileY)); break;
				}
			}
		}

		return {
			tileDimensions,
			basicMapTiles,
			mapTexture: buildMapTexture(tiles, tileDimensions),
			pellets,
			energizers,
			startingTiles,
			scatterTargets,
		};
	}

	function buildMapTexture(tiles: MapTile[][], tileDimensions: vec2): Texture {
		const textureData = [];
		for (let tileY = 0; tileY < tileDimensions.y; tileY++) {
			const tileRow = tiles[tileY];
			for (let pixelY = 0; pixelY < MapTile.PIXELS_PER_TILE; pixelY++) {
				for (let tileX = 0; tileX < tileDimensions.x; tileX++) {
					const tileEnum = tileRow[tileX];
					const color = MapTile.getTileColor(tileEnum, COLORS);
					const pixelInfo = MapTile.getPixelInfo(tileEnum);
					const pixelRow = pixelInfo[pixelY];

					for (let pixelX = MapTile.PIXELS_PER_TILE - 1; pixelX >= 0; pixelX--) {
						const pixel = MapTile.isBitSet(pixelX, pixelRow);
						textureData.push(...(pixel ? color : COLORS.EMPTY.rgba));
					}
				}
			}
		}
		const data = new Uint8Array(textureData);
		const texture = new Texture(data, tileDimensions);
		return texture;
	}
}

export default MapInitializer;
