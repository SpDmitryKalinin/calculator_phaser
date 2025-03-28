import { Scene } from 'phaser';

interface AdaptiveDisplayConfig {
    designWidth: number;
    designHeight: number;
    scene: Scene;
    debug?: boolean;
}

export class AdaptiveDisplay {
    private designWidth: number;
    private designHeight: number;
    private scene: Scene;
    private debug: boolean;
    
    private scaleFactorX: number = 1;
    private scaleFactorY: number = 1;
    private offsetX: number = 0;
    private offsetY: number = 0;
    
    private bounds: Phaser.Geom.Rectangle;
    
    private debugGraphics: Phaser.GameObjects.Graphics | null = null;

    /**
     * @param config Конфигурация адаптивного дисплея
     */
    
    constructor(config: AdaptiveDisplayConfig) {
        this.designWidth = config.designWidth || 360;
        this.designHeight = config.designHeight || 800;
        this.scene = config.scene;
        this.debug = config.debug || false;
        
        this.bounds = new Phaser.Geom.Rectangle(0, 0, 0, 0);
        
        // Обновляем размеры и масштаб
        this.updateScale();
        
        // Добавляем слушатель для обновления при изменении размера
        this.scene.scale.on('resize', this.updateScale, this);
        
        if (this.debug) {
            this.debugGraphics = this.scene.add.graphics();
            this.drawDebug();
        }
    }

    /**
     * Обновляет масштаб и смещения при изменении размера экрана
     */
    updateScale(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        
        // Вычисляем соотношения сторон
        const gameRatio = gameWidth / gameHeight;
        const designRatio = this.designWidth / this.designHeight;
        
        if (gameRatio > designRatio) {
            // Экран шире, чем дизайн (pillarbox)
            const newWidth = gameHeight * designRatio;
            this.scaleFactorY = gameHeight / this.designHeight;
            this.scaleFactorX = this.scaleFactorY;
            
            this.offsetX = (gameWidth - newWidth) / 2;
            this.offsetY = 0;
            
            this.bounds.setTo(this.offsetX, this.offsetY, newWidth, gameHeight);
        } else {
            // Экран выше, чем дизайн (letterbox)
            const newHeight = gameWidth / designRatio;
            this.scaleFactorX = gameWidth / this.designWidth;
            this.scaleFactorY = this.scaleFactorX;
            
            this.offsetX = 0;
            this.offsetY = (gameHeight - newHeight) / 2;
            
            this.bounds.setTo(this.offsetX, this.offsetY, gameWidth, newHeight);
        }
        
        if (this.debug && this.debugGraphics) {
            this.drawDebug();
        }
    }

    /**
     * Преобразует x-координату из дизайнерского пространства в реальные координаты экрана
     */
    public toScreenX(x: number): number {
        return this.offsetX + (x * this.scaleFactorX);
    }

    /**
     * Преобразует y-координату из дизайнерского пространства в реальные координаты экрана
     */
    public toScreenY(y: number): number {
        return this.offsetY + (y * this.scaleFactorY);
    }

    /**
     * Преобразует x-координату из реальных координат экрана в дизайнерское пространство
     */
    public toDesignX(screenX: number): number {
        return (screenX - this.offsetX) / this.scaleFactorX;
    }

    /**
     * Преобразует y-координату из реальных координат экрана в дизайнерское пространство
     */
    public toDesignY(screenY: number): number {
        return (screenY - this.offsetY) / this.scaleFactorY;
    }

    /**
     * Преобразует точку из дизайнерского пространства в реальные координаты экрана
     */
    public toScreenPoint(point: Phaser.Types.Math.Vector2Like): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(
            this.toScreenX(point.x),
            this.toScreenY(point.y)
        );
    }

    /**
     * Преобразует точку из реальных координат экрана в дизайнерское пространство
     */
    public toDesignPoint(screenPoint: Phaser.Types.Math.Vector2Like): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(
            this.toDesignX(screenPoint.x),
            this.toDesignY(screenPoint.y)
        );
    }

    /**
     * Возвращает текущий масштаб по X
     */
    public getScaleX(): number {
        return this.scaleFactorX;
    }

    /**
     * Возвращает текущий масштаб по Y
     */
    public getScaleY(): number {
        return this.scaleFactorY;
    }

    /**
     * Позиционирует игровой объект согласно дизайнерским координатам
     */
    public placeAt(
        x: number, 
        y: number, 
        gameObject: Phaser.GameObjects.GameObject
    ): Phaser.GameObjects.GameObject {
        const screenX = this.toScreenX(x);
        const screenY = this.toScreenY(y);
        
        (gameObject as any).setPosition(screenX, screenY);
        
        return gameObject;
    }

    /**
     * Масштабирует игровой объект согласно текущему масштабу
     */
    public scaleObject(
        gameObject: Phaser.GameObjects.GameObject
    ): Phaser.GameObjects.GameObject {
        (gameObject as any).setScale(this.scaleFactorX, this.scaleFactorY);
        return gameObject;
    }

    /**
     * Рисует отладочную информацию
     */
    private drawDebug(): void {
        if (!this.debugGraphics) return;
        
        this.debugGraphics.clear();
        
        // Отображаем границы дизайнерского пространства
        this.debugGraphics.lineStyle(2, 0xff00ff, 1);
        this.debugGraphics.strokeRect(
            this.bounds.x, 
            this.bounds.y, 
            this.bounds.width, 
            this.bounds.height
        );
        
        // Отображаем сетку 
        this.debugGraphics.lineStyle(1, 0x00ff00, 0.3);
        
        // Вертикальные линии
        for (let x = 0; x <= this.designWidth; x += 60) {
            const screenX = this.toScreenX(x);
            this.debugGraphics.lineBetween(
                screenX, this.bounds.y, 
                screenX, this.bounds.y + this.bounds.height
            );
        }
        
        // Горизонтальные линии
        for (let y = 0; y <= this.designHeight; y += 100) {
            const screenY = this.toScreenY(y);
            this.debugGraphics.lineBetween(
                this.bounds.x, screenY, 
                this.bounds.x + this.bounds.width, screenY
            );
        }
        
        // Отображаем информацию о масштабе
        const text = `Scale: ${this.scaleFactorX.toFixed(2)} x ${this.scaleFactorY.toFixed(2)}
Design: ${this.designWidth} x ${this.designHeight}
Screen: ${Math.round(this.scene.scale.width)} x ${Math.round(this.scene.scale.height)}`;
        
        this.scene.add.text(10, 10, text, {
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setDepth(1000).setScrollFactor(0);
    }

    /**
     * Очищает ресурсы
     */
    public destroy(): void {
        this.scene.scale.off('resize', this.updateScale, this);
        
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
            this.debugGraphics = null;
        }
    }
}