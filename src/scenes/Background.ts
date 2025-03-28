import { Scene, GameObjects } from 'phaser';
import { AdaptiveDisplay } from './AdaptiveDisplay';

export class BackgroundScene extends Scene {
    background: GameObjects.Image;
    private adaptiveDisplay: AdaptiveDisplay;

    constructor() {
        super('background');
    }

    create() {
        // Создаем adptiveDisplay для отслеживания размеров
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 800,
            scene: this,
            debug: false
        });
        
        
        // Добавляем фоновое изображение
        this.background = this.add.image(0, 0, 'background')
            .setOrigin(0.5) // Меняем origin на центр для правильного масштабирования cover
            .setDepth(-3);

            
        
        // Размещаем фон по центру
        this.background.setPosition(
            this.scale.width / 2,
            this.scale.height / 2
        );
        
        // Применяем эффект cover
        this.applyBackgroundCover();
        
        // Слушаем событие изменения размера
        this.scale.on('resize', this.onResize, this);
    }

    private applyBackgroundCover(): void {
        if (!this.background || !this.background.texture) return;
        const screenWidth = this.scale.width + 20;
        const screenHeight = this.scale.height + 20;
        const imageWidth = this.background.width;
        const imageHeight = this.background.height;

        const screenRatio = screenWidth / screenHeight;
        const imageRatio = imageWidth / imageHeight;
        
        let scale;
        
        if (screenRatio > imageRatio) {
            scale = screenWidth / imageWidth;
        } else {
            scale = screenHeight / imageHeight;
        }
        
        // Применяем масштаб к изображению
        this.background.setScale(scale);
    }
    
    /**
     * Обработчик изменения размеров экрана
     */
    private onResize(gameSize: any): void {
        // Обновляем позицию фона (по центру экрана)
        this.background.setPosition(
            gameSize.width / 2,
            gameSize.height / 2
        );
        
        // Применяем эффект cover
        this.applyBackgroundCover();
    }
    
    /**
     * Очищаем ресурсы при закрытии сцены
     */
    shutdown(): void {
        this.scale.off('resize', this.onResize, this);
        
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
        }
    }
}