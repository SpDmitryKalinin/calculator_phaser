import { Scene, GameObjects } from 'phaser';
import { AdaptiveDisplay } from './utility/AdaptiveDisplay';
import { LocalizedBitmapText } from '../component/LocalizedBitmap';
import AudioPlayer from './utility/AudioPlayer';
import { EVENTS } from '../constants/event';
import EventBus from '../constants/event-bus';

export class Button {
    private scene: Scene;
    private x: number;
    private y: number;
    private text: string;
    private callback: Function;
    private adaptiveDisplay: AdaptiveDisplay;

    // UI элементы
    public button: GameObjects.Rectangle;
    public buttonText: LocalizedBitmapText;
    public mask: GameObjects.Image;
    public maskObject: Phaser.Display.Masks.BitmapMask;
    
    // Контейнер для группировки элементов
    private container: Phaser.GameObjects.Container;
    
    // Слой для анимации
    public animationLayer: GameObjects.Rectangle;
    width: number = 280;
    audioPlayer!: AudioPlayer;
    isSound: boolean;
    constructor(config: {
        scene: Scene,
        x: number,
        y: number,
        text: string,
        callback: Function,
        adaptiveDisplay: AdaptiveDisplay,
    }, width = 280, isSound = true) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.text = config.text;
        this.callback = config.callback;
        this.width = width;
        this.adaptiveDisplay = config.adaptiveDisplay;
        this.isSound = isSound;

        this.create();
    }

    /**
     * Создает интерактивную кнопку
     */
    private create() {
        // Создаем контейнер
        this.audioPlayer = new AudioPlayer(this.scene);
        this.container = this.scene.add.container(this.x, this.y);
        
        this.animationLayer = this.scene.add.rectangle(0, 0, this.width, 60, 0xffffff)
            .setOrigin(0.5);
        this.animationLayer.fillAlpha = 0; 
        
        this.button = this.scene.add.rectangle(0, 0, this.width, 60)
            .setOrigin(0.5)
            .setInteractive()
            .setStrokeStyle(4, 0xffffff);
        
        this.button.fillAlpha = 0;

        this.buttonText = this.scene.add.localizedBitmapText(0, 0, this.text, 'chalkFont', 36).setOrigin(0.5);

        this.container.add([this.animationLayer, this.button]);
        
        this.mask = this.scene.make.image({
            x: this.x,
            y: this.y,
            key: 'textureMask',
            add: false
        });
        
        this.mask.setDisplaySize(120, 60);
        
        this.maskObject = this.mask.createBitmapMask();
        
        this.container.setMask(this.maskObject);
        if(this.isSound) {
            this.button.on('pointerdown', () => {
                EventBus.emit(EVENTS.playFX, 'click', 0.3, 1.3);
            });
            this.button.on('pointerover', () => {
                // Проверяем, является ли устройство мобильным, используя встроенный API Phaser
                if (!this.scene.sys.game.device.input.touch) {
                    // Выполняем только на устройствах без сенсорного ввода (обычно это PC)
                    EventBus.emit(EVENTS.playFX, 'hover', 0.3, 1.3);
                }
            });
        }
        this.button.on('pointerdown', () => {
            this.callback();
        });
    }
    public updateLayout() {
        if (!this.container || !this.container.active) return;

        this.adaptiveDisplay.placeAt(this.x, this.y, this.container);

        if (this.mask && this.mask.active) {
            this.adaptiveDisplay.placeAt(this.x, this.y, this.mask);
            
            // Обновляем размер маски
            const scaleX = this.adaptiveDisplay.getScaleX();
            const scaleY = this.adaptiveDisplay.getScaleY();
            this.mask.setDisplaySize(this.width * scaleX, 60 * scaleY);
        }

        const scaleX = this.adaptiveDisplay.getScaleX();
        const scaleY = this.adaptiveDisplay.getScaleY();
        
        this.animationLayer.setSize(this.width * scaleX, 60 * scaleY);
        this.button.setSize(this.width * scaleX, 60 * scaleY);
        
        this.button.setStrokeStyle(6 * scaleX, 0xffffff);
        
        this.container.setScale(1, 1)
        
        this.buttonText.setFontSize(Math.floor(36 * scaleX));
        this.adaptiveDisplay.placeAt(this.x, this.y, this.buttonText)
    }

    public animate(color: number, duration: number = 100) {
        this.scene.tweens.add({
            targets: this.animationLayer,
            fillColor: { from: color, to: color },
            fillAlpha: { from: 0, to: 1 },
            duration: duration,
            ease: 'Power1',
            yoyo: true,
            repeat: 0
        });
    }

    public destroy() {
        if (this.button) {
            this.button.removeAllListeners();
        }

        if (this.container) {
            this.container.destroy(); // Это удалит все дочерние элементы
        }

        if (this.mask) {
            this.mask.destroy();
        }
        
        if (this.maskObject) {
            this.maskObject.destroy();
        }
    }
}