import * as PIXI from 'pixi.js';

export class RootContainer extends PIXI.Container {
  designWidth: number;
  designHeight: number;

  constructor(designWidth: number, designHeight: number) {
    super();
    this.designWidth = designWidth;
    this.designHeight = designHeight;
  }

  public resize(screenWidth: number, screenHeight: number): void {
    let scaleFactor: number;

    if (screenWidth / screenHeight > this.designWidth / this.designHeight) {
      scaleFactor = screenHeight / this.designHeight;
    } else {
      scaleFactor = screenWidth / this.designWidth;
    }

    // Set the scale of the container.
    this.scale.set(scaleFactor, scaleFactor);

    // Center the container.
    this.x = (screenWidth - this.designWidth * scaleFactor) / 2;
    this.y = (screenHeight - this.designHeight * scaleFactor) / 2;
  }
}