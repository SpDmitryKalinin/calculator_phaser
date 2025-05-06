import { GameObjects } from "phaser";
import { AdaptiveDisplay } from "./utility/AdaptiveDisplay";
import EventBus from "../constants/event-bus";
import { EVENTS } from "../constants/event";

export class DynamiteTimer {
    scene: Phaser.Scene;
    
    designX: number;
    designY: number;
    designWidth: number = 206; 
    designHeight: number = 400;  
    
    realX: number;
    realY: number;
    realWidth: number;
    realHeight: number;
    
    maxTime: number = 5000;
    timeStarted: number;
    timerEvent: Phaser.Time.TimerEvent | null = null;
    onTimeOut: Function;
    fuse: GameObjects.Sprite;
    dinamit: GameObjects.Sprite;
    currentAnim: string | null = null;
    isInflating: boolean = true;
    shouldTriggerTimeout: boolean = false;
    forceLastAnim = false;
    container: Phaser.GameObjects.Container; // Fixed typo from 'conainer'

    private adaptiveDisplay: AdaptiveDisplay | null = null;
    maxFrames: 12;
    
    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        adaptiveDisplay?: AdaptiveDisplay,
        maxTime?: number
    ) {
        this.scene = scene;
        // Сохраняем дизайнерские координаты и размеры
        this.designX = x;
        this.designY = y;
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
        
        // Обновляем положение и размер контейнера
        this.updateContainer();
    }
    
    init() {
        this.createAnimations();
        this.createElements();
        this.addListeners();
    }

    addListeners() {
        EventBus.on('getDamage', () => {
            this.stop();
        });
    }

    createElements() {
        if (this.adaptiveDisplay === null) {
            return;
        }
        const scale = this.adaptiveDisplay.getScaleX();
        
        // Создаем контейнер в начальной позиции
        this.container = this.scene.add.container(this.realX, this.realY);
        
        // Создаем спрайты внутри контейнера
        this.dinamit = this.scene.add.sprite(0, 0, 'dinamit');
        this.dinamit.setOrigin(0, 0);
        this.dinamit.setDisplaySize(this.designWidth * scale, this.designHeight * scale);
        
        this.fuse = this.scene.add.sprite(0, 0, 'phetil');
        this.fuse.setOrigin(0, 0);
        this.fuse.setDisplaySize(this.designWidth * scale, this.designHeight * scale);

        
        // Добавляем спрайты в контейнер
        this.container.add([this.dinamit, this.fuse]);
        this.container.setAlpha(0.3)
        this.container.setRotation(Math.PI / 3);
        
        // Обновляем позицию контейнера с помощью AdaptiveDisplay
        this.updateContainer();
    }

    updateContainer() {
        if (this.adaptiveDisplay === null) {
            return;
        }
        
        const scale = this.adaptiveDisplay.getScaleX();
        
        // Обновляем размеры спрайтов
        this.dinamit.setDisplaySize(this.designWidth * scale, this.designHeight * scale);
        this.fuse.setDisplaySize(this.designWidth * scale, this.designHeight * scale);
        
        // Получаем реальные координаты для контейнера
        const realPos = this.adaptiveDisplay.toScreenPoint({
            x: this.designX,
            y: this.designY
        });
        
        // Обновляем позицию контейнера
        this.container.setPosition(realPos.x, realPos.y);
    }

    createAnimations() {
        // Быстрые анимации надувания
        this.scene.anims.create({
            key: 'dinamit-inflate-1',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 1,
                end: 5,
                prefix: 'dinamit_',
                suffix: '.png'
            }),
            frameRate: 16, 
            repeat: 0,
        });

        // Остальные анимации без изменений...
        this.scene.anims.create({
            key: 'dinamit-inflate-2',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 1,
                end: 7,
                prefix: 'dinamit_',
                suffix: '.png'
            }),
            frameRate: 16, 
            repeat: 0,
        });

        this.scene.anims.create({
            key: 'dinamit-inflate-3',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 1,
                end: 11,
                prefix: 'dinamit_',
                suffix: '.png'
            }),
            frameRate: 16,
            repeat: 0,
        });

        // Медленные анимации сдувания
        this.scene.anims.create({
            key: 'dinamit-deflate-1',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 5,
                end: 1,
                prefix: 'dinamit_',
                suffix: '.png'
            }),
            frameRate: 8, 
            repeat: 0,
        });

        this.scene.anims.create({
            key: 'dinamit-deflate-2',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 7,
                end: 1,
                prefix: 'dinamit_',
                suffix: '.png'
            }),
            frameRate: 8, 
            repeat: 0,
        });

        this.scene.anims.create({
            key: 'dinamit-deflate-3',
            frames: this.scene.anims.generateFrameNames('dinamit', {
                start: 11,
                end: 1,
                prefix: 'dinamit_',
                suffix: '.png'
            }),
            frameRate: 8, 
            repeat: 0,
        });
    }
    
    // Установка коллбэка на окончание времени
    setTimeOutCallback(callback: Function) {
        this.currentAnim = null;

        this.onTimeOut = callback;
    }
    
    // Остальные методы без изменений...
    // Запуск таймера
    start() {
        this.stop();
        
        this.timeStarted = Date.now();
        this.shouldTriggerTimeout = false;
        
        this.timerEvent = this.scene.time.addEvent({
            delay: 100,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
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
        
        if (remaining <= 0 && this.shouldTriggerTimeout) {
            this.scene.cameras.main.shake(100)
            EventBus.emit(EVENTS.playFX, 'boom', 1, 1.3);
            this.currentAnim = null;
            this.stop();
            this.onTimeOut()
            return;
        }
        
        // Вычисляем процент оставшегося времени
        const percent = remaining / this.maxTime;
        const frameIndex = Math.floor((1 - percent) * 12);
        const clampedFrameIndex = Math.min(11, Math.max(0, frameIndex) + 1);
        this.dinamitAnimController(percent);
        this.fuse.setFrame(`ph${clampedFrameIndex}.png`);
    }
    
    setTime(milliseconds: number) {
        this.maxTime = milliseconds;
        this.currentAnim = null;
    }
    
    addTime(milliseconds: number) {
        if (this.timerEvent) {
            const elapsed = Date.now() - this.timeStarted;
            const newElapsed = Math.max(0, elapsed - milliseconds);
            this.timeStarted = Date.now() - newElapsed;
        }
    }
    
    // Сброс таймера (но не запуск)
    reset() {
        this.stop();
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
        
        // Уничтожаем контейнер и все его содержимое
        if (this.container) {
            this.container.destroy();
        }
    }

    dinamitAnimController(percent: number) {
        // Логика анимации без изменений
        const progressPercent = 1 - percent;
        if(this.currentAnim === null) {
            this.dinamit.play('dinamit-inflate-1');
            this.currentAnim = 'dinamit-inflate-1'
        }

        if(progressPercent > 1 && this.dinamit.anims.getProgress() === 1 && this.currentAnim === 'dinamit-inflate-3') {
            this.dinamit.stop();
            this.shouldTriggerTimeout = true;
            this.forceLastAnim = false;
            return
        }
        
        if(progressPercent < 0.33 && this.dinamit.anims.getProgress() === 1 && this.currentAnim === 'dinamit-deflate-1') {
            this.dinamit.play('dinamit-inflate-1');
            this.currentAnim = 'dinamit-inflate-1'
        }

        if(this.dinamit.anims.getProgress() === 1 && this.currentAnim === 'dinamit-inflate-1') {
            this.dinamit.play('dinamit-deflate-1');
            this.currentAnim = 'dinamit-deflate-1'
        }

        if(progressPercent < 0.66 && this.dinamit.anims.getProgress() === 1 && this.currentAnim === 'dinamit-deflate-1') {
            this.dinamit.play('dinamit-inflate-2')
            this.currentAnim = 'dinamit-inflate-2'
        }

        if(this.dinamit.anims.getProgress() === 1 && this.currentAnim === 'dinamit-inflate-2') {
            this.dinamit.play('dinamit-deflate-2');
            this.currentAnim = 'dinamit-deflate-2'
            if(Phaser.Math.RND.realInRange(0, 1) < 0.2) {
                EventBus.emit(EVENTS.playFX, 'time', 1, 1.3);
            }
        }

        if(progressPercent < 0.66 && this.dinamit.anims.getProgress() === 1 && this.currentAnim === 'dinamit-deflate-2') {
            this.dinamit.play('dinamit-inflate-2')
            this.currentAnim = 'dinamit-inflate-2'
        }

        if((progressPercent < 1 || (progressPercent > 1 && !this.forceLastAnim)) && this.dinamit.anims.getProgress() === 1 && (this.currentAnim === 'dinamit-deflate-2' || this.currentAnim === 'dinamit-deflate-1')) {
            this.forceLastAnim = true
            this.dinamit.play('dinamit-inflate-3')
            this.currentAnim = 'dinamit-inflate-3'
        }

        if(this.dinamit.anims.getProgress() === 1 && this.currentAnim === 'dinamit-inflate-3') {
            this.dinamit.play('dinamit-deflate-3');
            this.currentAnim = 'dinamit-deflate-3'
        }

        if(this.dinamit.anims.getProgress() === 1 && this.currentAnim === 'dinamit-deflate-3') {
            this.dinamit.play('dinamit-inflate-3')
            this.currentAnim = 'dinamit-inflate-3'
        }
    }
}