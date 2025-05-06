import { Scene } from 'phaser';
import { AdaptiveDisplay } from './utility/AdaptiveDisplay';

export class Thermometer {
    private scene: Scene;
    adaptiveDisplay: AdaptiveDisplay
    progressBg: Phaser.GameObjects.Sprite;
    progressBarImg: Phaser.GameObjects.Sprite;
    progressBarMask: Phaser.GameObjects.Sprite;
    x: number;
    y: number;
    private redFill: Phaser.GameObjects.Graphics;
    
    constructor(scene: Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.create();
    }
    
    private create() {
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this.scene,
            debug: false
        });
        this.progressBg = this.scene.add.sprite(50, 50, 'progressBg');
        this.progressBg.setOrigin(0, 0);
        
        this.progressBarMask = this.scene.add.sprite(50, 50, 'progressMask');
        this.progressBarMask.setOrigin(0, 0);
        
        this.progressBarImg = this.scene.add.sprite(50, 50, 'progressBar');
        this.progressBarImg.setOrigin(0, 0);
        this.progressBarImg.setDepth(2);
        
        // Создаем из спрайта маску и применяем
        const mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.progressBarMask);
        
        // Делаем спрайт маски невидимым (он нужен только для создания маски)
        this.progressBarMask.setVisible(false);
        
        // Создаем красную заливку
        this.redFill = this.scene.add.graphics();
        this.redFill.setMask(mask);
        
        this.redraw();

        this.scene.scale.on('resize', this.redraw, this);
    }
    
    redraw() {
        const scale = this.adaptiveDisplay.getScaleX();
        
        // Обновляем размеры и позиции спрайтов
        this.progressBg.setDisplaySize(150 * scale, 645 * scale);
        this.adaptiveDisplay.placeAt(this.x, this.y, this.progressBg);
        
        this.progressBarImg.setDisplaySize(150 * scale, 645 * scale);
        this.adaptiveDisplay.placeAt(this.x + 6, this.y, this.progressBarImg);
        
        this.progressBarMask.setDisplaySize(150 * scale, 645 * scale);
        this.adaptiveDisplay.placeAt(this.x + 6, this.y, this.progressBarMask);
        
        // Получаем координаты и размеры для заливки
        const x = this.progressBarMask.x;
        const y = this.progressBarMask.y;
        const width = 150 * scale;
        const height = 645 * scale;
        
        // Очищаем предыдущую заливку
        this.redFill.clear();
        
        this.redFill.fillStyle(0xFF0000, 1); 
        this.redFill.fillRect(x, y, width, height);
    }
    
    setLevel(percent: number) {
        // Ограничиваем значение от 0 до 100
        percent = Phaser.Math.Clamp(percent, 0, 100);
        
        const scale = this.adaptiveDisplay.getScaleX();
        const x = this.progressBarMask.x;
        const y = this.progressBarMask.y + 125 * scale;
        const width = 150 * scale;
        const fullHeight = 500 * scale;
        
        // Высота заполнения в зависимости от процента
        const fillHeight = fullHeight * (percent / 100);
        const fillY = y + (fullHeight - fillHeight);
        
        // Очищаем предыдущую заливку
        this.redFill.clear();
        
        // Рисуем красный прямоугольник только на нужную высоту
        this.redFill.fillStyle(0xFF0000, 1);
        this.redFill.fillRect(x, fillY, width, fillHeight);
    }
    
    // Метод для уничтожения термометра и освобождения ресурсов
    destroy() {
        if (this.progressBg) this.progressBg.destroy();
        if (this.progressBarImg) this.progressBarImg.destroy();
        if (this.progressBarMask) this.progressBarMask.destroy();
        if (this.redFill) this.redFill.destroy();
    }
}