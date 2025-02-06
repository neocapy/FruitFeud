import { Assets, Sprite, Texture, Spritesheet } from 'pixi.js';

import Tiles01 from './assets/tiles-01.png';

class AtlasInfo {
  constructor(
    public name: string,
    public url: string,
    public width: number,
    public height: number,
  ) {}
}

class TileInfo {
  constructor(
    public atlas: number,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public name: string,
  ) { }
}

const ATLAS_INFOS = [
  new AtlasInfo('tiles-01', Tiles01, 256, 256), // 0
];

const TILE_INFOS = [
  new TileInfo(0, 0, 0, 1, 1, 'dotgrid'),
  new TileInfo(0, 1, 0, 1, 1, 'border-thick-left'),
  new TileInfo(0, 2, 0, 1, 1, 'border-thick-top'),
  new TileInfo(0, 3, 0, 1, 1, 'border-thick-right'),
  new TileInfo(0, 4, 0, 1, 1, 'border-thick-bottom'),
  new TileInfo(0, 5, 0, 1, 1, 'solid'),
  new TileInfo(0, 6, 0, 1, 1, 'MISSINGTEX'),

  new TileInfo(0, 0, 1, 1, 1, 'board-00'),
  new TileInfo(0, 1, 1, 1, 1, 'board-01'),
  new TileInfo(0, 2, 1, 1, 1, 'board-02'),
  new TileInfo(0, 0, 2, 1, 1, 'board-10'),
  new TileInfo(0, 1, 2, 1, 1, 'board-11'),
  new TileInfo(0, 2, 2, 1, 1, 'board-12'),
  new TileInfo(0, 0, 3, 1, 1, 'board-20'),
  new TileInfo(0, 1, 3, 1, 1, 'board-21'),
  new TileInfo(0, 2, 3, 1, 1, 'board-22'),

  new TileInfo(0, 0, 4, 1, 1, 'paint-big-0'),
  new TileInfo(0, 1, 4, 1, 1, 'paint-big-1'),
  new TileInfo(0, 0, 5, 1, 1, 'paint-small-0'),
  new TileInfo(0, 1, 5, 1, 1, 'paint-small-1'),
  new TileInfo(0, 2, 5, 1, 1, 'paint-small-2'),
  new TileInfo(0, 3, 5, 1, 1, 'paint-small-3'),
];

export class TileAtlas {
  private _nameMap: Map<string, Texture> = new Map();
  private _sheets: Spritesheet[] = [];

  constructor() { }

  async load(): Promise<void> {
    for (let i = 0; i < ATLAS_INFOS.length; i++) {
      const atlasInfo = ATLAS_INFOS[i];
      const tileInfos = TILE_INFOS.filter(tileInfo => tileInfo.atlas === i);

      const texture = await Assets.load(atlasInfo.url);
      if (!texture) {
        console.error('Failed to load texture:', atlasInfo.name);
        continue;
      }
      texture.baseTexture.scaleMode = 'nearest';

      const frames: { [key: string]: any } = {};
      const meta = { image: atlasInfo.url, scale: 1, size: { w: atlasInfo.width, h: atlasInfo.height } };

      for (let j = 0; j < tileInfos.length; j++) {
        const tileInfo = tileInfos[j];
        const frame = {
          frame: { x: tileInfo.x * 16, y: tileInfo.y * 16, w: tileInfo.width * 16, h: tileInfo.height * 16 },
          spriteSourceSize: { x: 0, y: 0, w: tileInfo.width * 16, h: tileInfo.height * 16 },
          sourceSize: { w: tileInfo.width * 16, h: tileInfo.height * 16 },
        };
        frames[tileInfo.name] = frame;
      }

      const sheet = new Spritesheet(texture, { frames, meta });
      await sheet.parse();
      this._sheets.push(sheet);

      for (let j = 0; j < tileInfos.length; j++) {
        const tileInfo = tileInfos[j];
        this._nameMap.set(tileInfo.name, sheet.textures[tileInfo.name]);
      }
    }
  }

  getTexture(name: string): Texture {
    const texture = this._nameMap.get(name);
    if (!texture) {
      console.error('Failed to get texture:', name);
      const missing = this._nameMap.get('MISSINGTEX');
      if (missing) {
        return missing;
      }
      throw new Error('Could not find MISSINGTEX to recover from missing texture!');
    }
    return texture;
  }

  createSprite(texName: string, anchorX = 0.0, anchorY = 0.0, tint: number = 0xFFFFFF): Sprite {
    const sprite = new Sprite(this.getTexture(texName));
    sprite.anchor.set(anchorX, anchorY);
    sprite.tint = tint;
    sprite.scale.set(1/16, 1/16);
    return sprite;
  }
}