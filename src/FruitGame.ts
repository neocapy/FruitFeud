import { Application, Assets, Sprite, Texture, Spritesheet } from 'pixi.js';
import * as PIXI from 'pixi.js';

import { TileAtlas } from './TileAtlas';
import { RootContainer } from './RootContainer';
import { CONFIG } from './Config';

export class FruitGame extends PIXI.Application {

  protected _atlas: TileAtlas = new TileAtlas();
  protected _root: RootContainer;

  constructor() {
    super();
  }

  private everyFrameTick(ticker: PIXI.Ticker): void {
    
  }

  onResize(screenWidth: number, screenHeight: number, resolution: number): void {
    this._root.resize(screenWidth, screenHeight);
  }

  async init(): Promise<void> {
    const containerEl = document.querySelector(".container") as HTMLDivElement;

    await super.init({
      backgroundColor: 0x1099bb,
      resizeTo: containerEl,
      resolution: window.devicePixelRatio || 1,
      depth: true,
      antialias: true,
    });
    containerEl.appendChild(this.canvas);

    await this._atlas.load();

    this._root = new RootContainer(CONFIG.designWidth, CONFIG.designHeight);
    this.stage.addChild(this._root);

    for (let x = 0; x < CONFIG.designWidth; x++) {
      for (let y = 0; y < CONFIG.designHeight; y++) {
        const sprite = this._atlas.createSprite(`board-${y % 3}${x % 3}`);
        sprite.x = x;
        sprite.y = y;
        this._root.addChild(sprite);
      }
    }

    this.ticker.add(this.everyFrameTick.bind(this));

    this.renderer.on('resize', this.onResize.bind(this));
    this.onResize(this.screen.width, this.screen.height, this.renderer.resolution);
  }
}
