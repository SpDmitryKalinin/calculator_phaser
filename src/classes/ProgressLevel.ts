import { LocalizedBitmapText } from "../component/LocalizedBitmap";
import { AdaptiveDisplay } from "./utility/AdaptiveDisplay";

export class ProgressLevel {
    scene: Phaser.Scene;
    x: number;
    y: number;
    circles: {
        circle: Phaser.GameObjects.Container;
        innerCircle: Phaser.GameObjects.Graphics;
        numberText: LocalizedBitmapText;
        mainWrapper: Phaser.GameObjects.Container;
        mask: Phaser.GameObjects.Image;
        maskObject: Phaser.Display.Masks.BitmapMask;
    }[] = [];
    adaptiveDisplay: AdaptiveDisplay | null;
    index: number = 0;
    gap: number = 10;
    radius: number = 20;
    mainWrapper: Phaser.GameObjects.Container;
    // Массив для хранения состояния кругов (активирован/не активирован)
    activeArray: number[] = [];
    // Количество кругов в прогрессе
    circleCount: number;
    countStageFill: number = 1;
    NOD: number = 1;

    constructor(scene: Phaser.Scene, x: number, y: number, circleCount: number = 5) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.circleCount = circleCount;
        // Инициализируем массив состояний для кругов (все неактивные изначально)
        this.activeArray = [];
        this.create();
    }

    setLevel() {
        const currentCircle = this.activeArray.findIndex(item => item < 0.95);
        const fillStage = this.activeArray[currentCircle] + this.countStageFill;
        this.activeArray[currentCircle] = fillStage;
        const { circle, innerCircle, numberText } = this.circles[currentCircle];

        this.scene.tweens.add({
            targets: innerCircle,
            scale: fillStage,
            duration: 500,
            ease: 'Linear',
            yoyo: false,
            repeat: 0,
            onComplete: () => {
                if (this.activeArray[currentCircle] > 0.95) {
                    numberText.setTint(0x00CCFF);
                }
                if (this.activeArray.every(item => item >= 0.95)) {
                    this.destroy();
                    this.scene.scene.start('RewardScreen')
                    this.scene.scene.stop('ui')
                    
                }
            }
        });
    }

    findLargestDivisorWithLimit(num: number, maxDivisor: number = 5) {
        const upperLimit = Math.min(Math.floor(num / 2), maxDivisor);
        if (num <= maxDivisor) {
            return num;
        }

        for (let i = upperLimit; i >= 1; i--) {
            if (num % i === 0) {
                return i;
            }
        }

        return 1;
    }

    setLevelImmediate(index: number) {
        if (index > this.circles.length - 1) {
            return;
        }

        const { innerCircle, numberText } = this.circles[index];
        innerCircle.setScale(1);
        numberText.setTint(0x00CCFF);
    }

    create() {
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this.scene,
            debug: false
        });

        this.createCirclesArray();

        // Восстанавливаем состояние активированных кругов после создания
        this.restoreActiveCircles();

        this.scene.scale.on('resize', this.updateLayout, this);
    }

    createCirclesArray() {
        if (!this.adaptiveDisplay) {
            return;
        }

        const designWidth = 360;

        const normalCircleWidth = 48;
        const lastCircleWidth = 48;
        const lastCircleOffset = 24;
        this.NOD = this.findLargestDivisorWithLimit(this.circleCount);
        this.activeArray = Array(this.NOD).fill(0);
        this.countStageFill = this.NOD / this.circleCount;

        const totalWidth = (this.NOD - 1) * normalCircleWidth + lastCircleWidth +
            (this.gap * (this.NOD - 1)) + lastCircleOffset;

        const startX = (designWidth / 2) - (totalWidth / 2) + 16;

        for (let i = 0; i < this.NOD; i++) {
            let xPosition;
            if (i < this.NOD - 1) {
                xPosition = startX + i * (normalCircleWidth + this.gap);
            } else {
                xPosition = startX + i * (normalCircleWidth + this.gap) + lastCircleOffset;
            }
            
            const coordX = this.adaptiveDisplay.toScreenX(xPosition);
            const coordY = this.adaptiveDisplay.toScreenY(this.y);
            const adaptiveScale = this.adaptiveDisplay.getScaleX();
            const textContent = i < this.NOD - 1 ? (i + 1).toString() : '?';
            const scale = i < this.NOD - 1 ? 1 : 2;

            this.circles.push(this.createCircle(coordX, coordY, textContent, scale, adaptiveScale));
        }
    }

    createCircle(x: number, y: number, textContent: string, scale: number, adaptiveScale: number) {
        const mask = this.scene.make.image({
            x: x,
            y: y,
            key: 'textureMask',
            add: false
        });

        mask.setDisplaySize(600 * scale * adaptiveScale, 240 * scale * adaptiveScale);
        const maskObject = mask.createBitmapMask();

        const mainContainer = this.scene.add.container(0, 0)
        const container = this.scene.add.container(0, 0);

        const circle = this.scene.add.graphics();
        const radius = this.radius * scale * adaptiveScale;
        circle.lineStyle(2, 0xFFFFFF, 1);
        circle.fillCircle(0, 0, radius);
        circle.strokeCircle(0, 0, radius);

        const numberText = this.scene.add.localizedBitmapText(0, 0, textContent, 'chalkFont', 36 * scale * adaptiveScale);
        numberText.setOrigin(0.5, 0.5);

        container.add([circle]);
        container.setMask(maskObject);
        mainContainer.add([numberText, container])
        mainContainer.setDepth(2);

        const innerCircle = this.scene.add.graphics();
        innerCircle.fillStyle(0xFFFFFF);
        innerCircle.fillCircle(0, 0, radius);
        innerCircle.setMask(maskObject)
        innerCircle.setDepth(1);
        innerCircle.setScale(0);
        innerCircle.setPosition(0, 0);

        const mainWrapper = this.scene.add.container(x, y)
        mainWrapper.add([mainContainer, innerCircle])

        return { circle: mainContainer, innerCircle: innerCircle, numberText: numberText, mainWrapper: mainWrapper, mask: mask, maskObject: maskObject };
    }

    // Метод для восстановления активных кругов
    restoreActiveCircles() {
        for (let i = 0; i < this.activeArray.length; i++) {
            if (this.activeArray[i] && i < this.circles.length) {
                this.setLevelImmediate(i);
            }
        }
    }

    updateLayout() {
        if (!this.adaptiveDisplay) return;

        // Очищаем текущие круги
        this.circles.forEach(item => {
            if (item.mainWrapper) {
                item.mainWrapper.destroy();
            }
            if (item.mask) {
                item.mask.destroy();
            }
            if (item.maskObject) {
                item.maskObject.destroy()
            }
        });
        this.circles = [];

        this.createCirclesArray();

        this.restoreActiveCircles();
    }

    destroy() {
        this.scene.scale.off('resize', this.updateLayout, this);
        this.circles.forEach(item => {
            this.scene.tweens.killTweensOf(item.innerCircle);
            if (item.maskObject) {
                item.maskObject.destroy();
            }
            if (item.mask) {
                item.mask.destroy();
            }
            if (item.mainWrapper) {
                item.mainWrapper.destroy(true);
            }
        });

        this.circles = [];

        this.activeArray = Array(this.circleCount).fill(false);

        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
            this.adaptiveDisplay = null;
        }
    }
}