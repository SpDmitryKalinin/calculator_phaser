import { Scene, GameObjects } from 'phaser';
import { AdaptiveDisplay } from '../classes/utility/AdaptiveDisplay';

export class BackgroundScene extends Scene {
    background: GameObjects.Image;
    private adaptiveDisplay: AdaptiveDisplay;

    constructor() {
        super('background');
    }

    create() {
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this,
            debug: false
        });
        
        this.background = this.add.image(0, 0, 'background')
            .setOrigin(0.5) 
            .setDepth(-3);
        
        this.centerBackground();
        
        this.applyFullScreenCover();
        this.scale.on('resize', this.onResize, this);
    }

    private centerBackground(): void {
        this.background.setPosition(
            this.scale.width / 2,
            this.scale.height / 2
        );
    }


    private applyFullScreenCover(): void {
        if (!this.background || !this.background.texture) return;
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const imageWidth = this.background.width;
        const imageHeight = this.background.height;
        
        const scaleX = screenWidth / imageWidth;
        const scaleY = screenHeight / imageHeight;
        
        this.background.setScale(scaleX, scaleY);
    }
    
    private onResize(gameSize: any): void {
        this.background.setPosition(
            gameSize.width / 2,
            gameSize.height / 2
        );
        this.applyFullScreenCover();
    }
    
    shutdown(): void {
        this.scale.off('resize', this.onResize, this);
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
        }
    }
}