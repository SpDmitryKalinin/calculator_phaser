import { Scene, GameObjects } from 'phaser';
import { AdaptiveDisplay } from './AdaptiveDisplay';

export class BackgroundScene extends Scene {
    background: GameObjects.Image;
    private adaptiveDisplay: AdaptiveDisplay;

    constructor() {
        super('background');
    }

    create() {
        // Создаем adaptiveDisplay для отслеживания размеров
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 800,
            scene: this,
            debug: false
        });
        
        // Добавляем фоновое изображение
        this.background = this.add.image(0, 0, 'background')
            .setOrigin(0.5) // Центральная точка для растягивания
            .setDepth(-3);
        
        // Размещаем фон по центру
        this.centerBackground();
        
        // Применяем эффект cover для заполнения всего экрана
        this.applyFullScreenCover();
        
        // Слушаем событие изменения размера
        this.scale.on('resize', this.onResize, this);
    }

    /**
     * Центрирует фоновое изображение на экране
     */
    private centerBackground(): void {
        this.background.setPosition(
            this.scale.width / 2,
            this.scale.height / 2
        );
    }

    /**
     * Растягивает фон на 100% ширины и высоты экрана
     */
    private applyFullScreenCover(): void {
        if (!this.background || !this.background.texture) return;
        
        // Получаем размеры экрана и изображения
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const imageWidth = this.background.width;
        const imageHeight = this.background.height;
        
        // Вычисляем масштаб по ширине и высоте независимо
        const scaleX = screenWidth / imageWidth;
        const scaleY = screenHeight / imageHeight;
        
        // Применяем масштаб к изображению без сохранения пропорций
        this.background.setScale(scaleX, scaleY);
    }
    
    /**
     * Обработчик изменения размеров экрана
     */
    private onResize(gameSize: any): void {
        // Обновляем позицию фона по центру
        this.background.setPosition(
            gameSize.width / 2,
            gameSize.height / 2
        );
        
        // Пересчитываем масштаб для полного покрытия экрана
        this.applyFullScreenCover();
    }
    
    /**
     * Очищаем ресурсы при закрытии сцены
     */
    shutdown(): void {
        // Отписываемся от события resize
        this.scale.off('resize', this.onResize, this);
        
        // Очищаем adaptiveDisplay
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
        }
    }
}