import { Scene } from "phaser";
import { AdaptiveDisplay } from "../classes/utility/AdaptiveDisplay";
import { Button } from "../classes/Button";
import RevealImage from "../classes/utility/RevealImage";
import { store } from "../globalStore";
import { EVENTS } from "../constants/event";
import EventBus from "../constants/event-bus";

export class RewardScreen extends Scene {
    adaptiveDisplay: AdaptiveDisplay | null;
    button: Button | null;
    buttonBack: Button | null;
    rewardSprite: Phaser.GameObjects.Sprite | null;
    rewardContainer: Phaser.GameObjects.Container | null;
    rewardRectangle: Phaser.GameObjects.Rectangle | null;
    rewardMask: Phaser.GameObjects.Image | null;
    rewardMaskObject: Phaser.Display.Masks.BitmapMask | null;
    
    constructor() {
        super('RewardScreen')
        this.rewardSprite = null;
        this.rewardContainer = null;
        this.rewardRectangle = null;
        this.rewardMask = null;
        this.rewardMaskObject = null;
    }

    create() {
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this,
            debug: false
        });
        store.nextStickerProgress();

        this.button = new Button({
            scene: this,
            x: 180,
            y: 100,
            text: store.stage === store.findLengthLevel() ? 'nextLevel' : 'nextStage',
            callback: () => {
                store.nextStage();
                this.destroy();
                this.scene.stop();
                this.scene.start('Game')
            },
            adaptiveDisplay: this.adaptiveDisplay
        })

        this.buttonBack = new Button({
            scene: this,
            x: 180,
            y: 200,
            text: 'mainMenu',
            callback: () => {
                store.nextStage();
                this.destroy();
                this.scene.stop();
                this.scene.start('MainMenu')
            },
            adaptiveDisplay: this.adaptiveDisplay
        })
        
        const pipeline = (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.get('RevealImage') as RevealImage;
        // Устанавливаем начальное значение прогресса сразу после получения pipeline
        pipeline.setProgress(store.previousStickerProgress());
        
        this.rewardContainer = this.add.container(0, 0);
        
        const baseWidth = 320;
        const baseHeight = 215;
        const padding = 5;
        
        this.rewardRectangle = this.add.rectangle(
            0, 0, 
            baseWidth + padding * 2, baseHeight + padding * 2
        )
        .setOrigin(0.5)
        .setStrokeStyle(4, 0xffffff);
        
        this.rewardRectangle.fillAlpha = 0;
        
        this.rewardSprite = this.add.sprite(0, 0, `reward${store.level}`);
        this.rewardSprite.setOrigin(0.5, 0.5);
        
        this.rewardContainer.add([this.rewardRectangle, this.rewardSprite]);
        
        // Создаем маску
        this.rewardMask = this.make.image({
            x: 180,
            y: 500,
            key: 'textureMask', // Используем ту же текстуру, что и для кнопок
            add: false
        });
        

        this.rewardMask.setDisplaySize(baseWidth + padding * 2, baseHeight + padding * 2);
        this.rewardMaskObject = this.rewardMask.createBitmapMask();
        this.rewardContainer.setMask(this.rewardMaskObject);
        this.rewardSprite.setPipeline(pipeline);
        // Повторно устанавливаем значение прогресса после привязки pipeline к спрайту
        pipeline.setProgress(store.previousStickerProgress());
        
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.placeAt(180, 500, this.rewardContainer);
            
            // Применяем масштабирование
            const scale = this.adaptiveDisplay.getScaleX();
            this.rewardSprite.setDisplaySize(baseWidth * scale, baseHeight * scale);
            this.rewardRectangle.setSize(
                (baseWidth + padding * 2) * scale, 
                (baseHeight + padding * 2) * scale
            );
            this.rewardRectangle.setStrokeStyle(4 * scale, 0xffffff);
            
            // Обновляем размер и позицию маски
            this.rewardMask.setDisplaySize(
                (baseWidth + padding * 2) * scale, 
                (baseHeight + padding * 2) * scale
            );
            this.adaptiveDisplay.placeAt(180, 500, this.rewardMask);
        }

        this.tweens.addCounter({
            from: store.previousStickerProgress(),
            to: store.stickerProgress,
            duration: 2000,
            yoyo: false,
            repeat: 0,
            ease: Phaser.Math.Easing.Cubic.InOut,
            onUpdate: (tween) => {
                pipeline.setProgress(tween.getValue());
            },
            onComplete: () => {
                EventBus.emit(EVENTS.playFX, 'success', 1, 1.3);
            } 
        });

        // Обновляем макет и подписываемся на событие изменения размера
        this.updateLayout();
        this.scale.on('resize', this.updateLayout, this);
    }

    updateLayout() {
        this.button?.updateLayout();
        this.buttonBack?.updateLayout();
        
        if (this.rewardContainer && this.rewardSprite && this.rewardRectangle && 
            this.rewardMask && this.adaptiveDisplay) {
            
            this.adaptiveDisplay.placeAt(180, 500, this.rewardContainer);
            
            this.adaptiveDisplay.placeAt(180, 500, this.rewardMask);
            
            const baseWidth = 310;
            const baseHeight = 215;
            const padding = 10;
            const scale = this.adaptiveDisplay.getScaleX();
            
            this.rewardSprite.setDisplaySize(baseWidth * scale, baseHeight * scale);
            
            this.rewardRectangle.setSize(
                (baseWidth + padding * 2) * scale, 
                (baseHeight + padding * 2) * scale
            );
            this.rewardRectangle.setStrokeStyle(4 * scale, 0xffffff);
            
            this.rewardMask.setDisplaySize(
                (baseWidth + padding * 2) * scale, 
                (baseHeight + padding * 2) * scale
            );
        }
    }

    destroy() {
        this.shutdown();
    }

    shutdown() {
        // Remove the resize event listener
        this.scale.off('resize', this.updateLayout, this);
        
        // Stop any active tweens
        this.tweens.killAll();
        
        // Clean up the mask
        if (this.rewardContainer && this.rewardMaskObject) {
            this.rewardContainer.clearMask();
            this.rewardMaskObject.destroy();
            this.rewardMaskObject = null;
        }
        
        if (this.rewardMask) {
            this.rewardMask.destroy();
            this.rewardMask = null;
        }
        
        // Clean up container and its contents
        if (this.rewardContainer) {
            this.rewardContainer.removeAll(true); // Destroy all children
            this.rewardContainer.destroy();
            this.rewardContainer = null;
        }
        
        // Clean up individual objects if they weren't in the container
        if (this.rewardSprite) {
            this.rewardSprite = null;
        }
        
        if (this.rewardRectangle) {
            this.rewardRectangle = null;
        }
        
        // Clean up buttons
        if (this.button) {
            this.button.destroy();
            this.button = null;
        }
        
        if (this.buttonBack) {
            this.buttonBack.destroy();
            this.buttonBack = null;
        }
        
        // Clean up adaptive display
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay = null;
        }
    }
}