import { GameObjects } from "phaser";
import { AdaptiveDisplay } from "../scenes/AdaptiveDisplay";
import EventBus from "../constants/event-bus";

export class DynamiteTimer {
    scene: Phaser.Scene;
    
    designX: number;
    designY: number;
    designWidth: number = 200; 
    designHeight: number = 20;  
    
    realX: number;
    realY: number;
    realWidth: number;
    realHeight: number;
    
    maxTime: number = 5000;
    timeStarted: number;
    timerEvent: Phaser.Time.TimerEvent | null = null;
    onTimeOut: Function;
    dinamit: GameObjects.Sprite;

    private adaptiveDisplay: AdaptiveDisplay | null = null;
    private currentAnimation: string = ''; // Track current animation
    
    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        width?: number, 
        height?: number, 
        adaptiveDisplay?: AdaptiveDisplay,
        maxTime?: number
    ) {
        this.scene = scene;
        // Сохраняем дизайнерские координаты и размеры
        this.designX = x;
        this.designY = y;
        if (width) this.designWidth = width;
        if (height) this.designHeight = height;
        if (maxTime) this.maxTime = maxTime;
        
        // Если передан adaptiveDisplay, используем его
        if (adaptiveDisplay) {
            this.adaptiveDisplay = adaptiveDisplay;
            this.updateRealDimensions();
            
            // Слушаем событие изменения размера окна
            this.scene.scale.on('resize', this.onResize, this);
        } else {
            // Иначе используем дизайнерские значения как реальные
            this.realX = x;
            this.realY = y;
            this.realWidth = this.designWidth;
            this.realHeight = this.designHeight;
        }
        
        this.init();
    }
    
    /**
     * Обновляет реальные размеры и координаты на основе AdaptiveDisplay
     */
    private updateRealDimensions(): void {
        if (!this.adaptiveDisplay) return;
        
        // Получаем реальные координаты
        const realPos = this.adaptiveDisplay.toScreenPoint({
            x: this.designX,
            y: this.designY
        });
        
        this.realX = realPos.x;
        this.realY = realPos.y;
        
        // Масштабируем размеры
        const scale = this.adaptiveDisplay.getScaleX();
        this.realWidth = this.designWidth * scale;
        this.realHeight = this.designHeight * scale;
    }
    
    /**
     * Обработчик изменения размера окна
     */
    private onResize(): void {
        // Обновляем реальные размеры и координаты
        this.updateRealDimensions();
        
        // Обновляем положение и размер динамита
        this.updateDinamit();
    }
    
    init() {

        this.createAnimations();
        this.createDinamit();
        this.addListeners();
    }

    addListeners() {
        EventBus.on('getDamage', () => {
            this.stop();
            this.playDinamitAnimation('boom');
        })
    }

    createDinamit() {
        if(this.adaptiveDisplay === null) {
            return;
        }
        const scale = this.adaptiveDisplay.getScaleX();
        this.dinamit = this.scene.add.sprite(0, 0, 'dinamit');
        this.dinamit.setOrigin(0.5, 0);
        this.adaptiveDisplay?.placeAt(this.designX, this.designY, this.dinamit);
        this.dinamit.setDisplaySize(this.designWidth * scale, this.designHeight * scale);
        
        
        this.dinamit.on('animationcomplete-boom', this.onBoomComplete, this);
        this.dinamit.on('animationupdate', (animation: any, frame:any) => {
            if(animation.key === 'boom') {
                this.onBoomUpdate(frame)
            }
            
        })
        
        // Start with the first animation
        this.playDinamitAnimation('dinamit-1');
    }

    updateDinamit() {
        if(this.adaptiveDisplay === null) {
            return;
        }
        const scale = this.adaptiveDisplay.getScaleX();
        this.adaptiveDisplay?.placeAt(this.designX, this.designY, this.dinamit);
        this.dinamit.setDisplaySize(this.designWidth * scale, this.designHeight * scale);
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'dinamit-1',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 2,
                end: 3,
                prefix: `dinamit_`,
                suffix: '.png',
            }),
            frameRate: 12,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'dinamit-2',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 4,
                end: 5,
                prefix: `dinamit_`,
                suffix: '.png',
            }),
            frameRate: 12,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'dinamit-3',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 6,
                end: 7,
                prefix: `dinamit_`,
                suffix: '.png',
            }),
            frameRate: 12,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'dinamit-4',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 8,
                end: 9,
                prefix: `dinamit_`,
                suffix: '.png',
            }),
            frameRate: 12,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'dinamit-5',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 10,
                end: 11,
                prefix: `dinamit_`,
                suffix: '.png',
            }),
            frameRate: 12,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'boom',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 12,
                end: 18,
                prefix: `dinamit_`,
                suffix: '.png',
            }),
            frameRate: 10,
            repeat: 0
        });
    }
    
    // Играть определенную анимацию динамита, только если она отличается от текущей
    playDinamitAnimation(animationKey: string) {
        if (this.currentAnimation !== animationKey) {
            this.dinamit.play(animationKey);
            this.currentAnimation = animationKey;
        }
    }
    
    // Обработчик завершения анимации взрыва
    onBoomComplete() {
        // Когда анимация взрыва завершена, вызываем callback для обработки окончания времени
        if (this.onTimeOut) {
            // Добавляем небольшую задержку, чтобы взрыв был хорошо виден
            this.scene.time.delayedCall(300, () => {
                this.onTimeOut();
            });
        }
    }

    onBoomUpdate(frame: Phaser.Animations.AnimationFrame) {
        if (frame.index === 4) {
            this.scene.cameras.main.shake(200, 0.02);
        }
    }

    
    // Установка коллбэка на окончание времени
    setTimeOutCallback(callback: Function) {
        this.onTimeOut = callback;
    }
    
    // Запуск таймера
    start() {
        // Если предыдущий таймер был запущен, останавливаем его
        this.stop();
        
        this.timeStarted = Date.now();
        
        // Создаем новый таймер, обновляющий динамит каждые 100мс
        this.timerEvent = this.scene.time.addEvent({
            delay: 100,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        // Начинаем с первой анимации
        this.playDinamitAnimation('dinamit-1');
    }
    
    // Остановка таймера
    stop() {
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
    }
    
    // Обновление таймера - вызывается регулярно
    updateTimer() {
        const elapsed = Date.now() - this.timeStarted;
        const remaining = this.maxTime - elapsed;
        
        if (remaining <= 0) {
            this.stop();
            this.playDinamitAnimation('boom');
            
            return;
        }
        
        // Вычисляем процент оставшегося времени
        const percent = remaining / this.maxTime;
        
        // Обновляем анимацию динамита в зависимости от оставшегося времени
        if (percent > 0.8 && percent <= 1) {
            this.playDinamitAnimation('dinamit-1');
        } else if (percent > 0.6 && percent <= 0.8) {
            this.playDinamitAnimation('dinamit-2');
        } else if (percent > 0.4 && percent <= 0.6) {
            this.playDinamitAnimation('dinamit-3');
        } else if (percent > 0.2 && percent <= 0.4) {
            this.playDinamitAnimation('dinamit-4');
        } else if (percent <= 0.2) {
            this.playDinamitAnimation('dinamit-5');
        }
    }
    
    // Изменение времени таймера
    setTime(milliseconds: number) {
        this.maxTime = milliseconds;
    }
    
    // Добавление времени к таймеру (для бонусов)
    addTime(milliseconds: number) {
        if (this.timerEvent) {
            // Если таймер активен, просто обновляем время начала
            const elapsed = Date.now() - this.timeStarted;
            const newElapsed = Math.max(0, elapsed - milliseconds);
            this.timeStarted = Date.now() - newElapsed;
        }
    }
    
    // Сброс таймера (но не запуск)
    reset() {
        this.stop();
        this.playDinamitAnimation('dinamit-1');
    }
    
    // Пауза таймера
    pause() {
        if (this.timerEvent) {
            this.timerEvent.paused = true;
        }
    }
    
    // Возобновление таймера
    resume() {
        if (this.timerEvent) {
            this.timerEvent.paused = false;
        }
    }
    
    // Получение процента оставшегося времени
    getTimePercent(): number {
        if (!this.timerEvent) return 1;
        
        const elapsed = Date.now() - this.timeStarted;
        const remaining = this.maxTime - elapsed;
        return Math.max(0, remaining) / this.maxTime;
    }
    
    // Уничтожение таймера при необходимости
    destroy() {
        this.stop();
        
        // Удаляем слушателя события изменения размера окна
        if (this.adaptiveDisplay) {
            this.scene.scale.off('resize', this.onResize, this);
        }
        
        if (this.dinamit) {
            this.dinamit.off('animationcomplete-boom', this.onBoomComplete, this);
            this.dinamit.destroy();
        }
    }
}