import { Application, Assets, Sprite, Texture, Spritesheet } from 'pixi.js';
import * as PIXI from 'pixi.js';

import Tiles01 from './tiles-01.png';

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
  new TileInfo(0, 0, 1, 3, 1, 'uwu'),
  new TileInfo(0, 0, 2, 2, 2, 'owo'),
];

class TileAtlas {
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

  get(name: string): Texture {
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
}


class FruitGame {
  public app: Application;
  public bunny: Sprite | null = null;
  public atlas: TileAtlas = new TileAtlas();

  constructor() {
    this.app = new Application();
  }

  private everyFrameTick(ticker: PIXI.Ticker): void {
    if (!this.bunny) return;

    const deltaMS = ticker.deltaMS;
    this.bunny.rotation += 0.1 * (deltaMS / 1000);

    const elapsedTimeSeconds = ticker.lastTime / 1000;
    const angle = (2 * Math.PI * elapsedTimeSeconds) / 5;
    const scaleValue = 2 + Math.sin(angle);
    this.bunny.scale.set(scaleValue);
  }

  async init(): Promise<void> {
    const containerEl = document.querySelector(".container") as HTMLDivElement;

    await this.app.init({
      backgroundColor: 0x1099bb,
      resizeTo: containerEl,
      resolution: window.devicePixelRatio || 1,
      depth: true,
    });
    containerEl.appendChild(this.app.canvas);

    await this.atlas.load();

    this.bunny = new Sprite(this.atlas.get('solid'));
    this.bunny.anchor.set(0.5);
    this.bunny.x = this.app.screen.width / (2 * window.devicePixelRatio);
    this.bunny.y = this.app.screen.height / (2 * window.devicePixelRatio);
    

    this.app.stage.addChild(this.bunny);

    // Use the separate ticker function for frame updates.
    this.app.ticker.add(this.everyFrameTick.bind(this));
  }

  destroy(): void {
    this.app.destroy();
  }
}

declare global {
  interface Window {
    fruitGame: FruitGame | undefined;
  }
}

async function main(): Promise<void> {
  const fruitGame = new FruitGame();
  window.fruitGame = fruitGame;
  await fruitGame.init();
}

main();

