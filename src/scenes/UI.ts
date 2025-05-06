import { GameObjects } from "phaser";
import EventBus from "../constants/event-bus";
import { EVENTS } from "../constants/event";
import { AdaptiveDisplay } from "../classes/utility/AdaptiveDisplay";

export class UI extends Phaser.Scene {
    private counter: GameObjects.Text;
    private score: number = 0;
    private hp: number = 6;
    private hearths: GameObjects.Sprite[] = [];
    private adaptiveDisplay: AdaptiveDisplay;
    
    // Константы дизайна (основаны на референсном разрешении 360x800)
    private readonly DESIGN = {
        scoreX: 350,         // X-координата счетчика очков
        scoreY: 10,          // Y-координата счетчика очков
        heartStartX: 10,     // Начальная X-координата для первого сердца
        heartY: 20,          // Y-координата сердец
        heartSpacing: 50,    // Расстояние между сердцами
        heartSize: 60        // Базовый размер сердца
    };

    constructor() {
        super('ui');
        
        // Привязываем методы к this, чтобы сохранить контекст
        this.updateLayout = this.updateLayout.bind(this);
    }

    init() {
        // Сбрасываем все переменные при инициализации сцены
        this.score = 0;
        this.hp = 6;
        this.hearths = [];
        
        // Очищаем существующие обработчики событий, чтобы избежать дубликатов
        this.removeListeners();
    }

    create() {
        // Инициализируем адаптивный дисплей
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this,
            debug: false
        });

        this.createAnimations();

        // Создаем элементы интерфейса
        this.createScoreCounter();
        this.createHearts();
        
        // Добавляем обработчики событий
        this.addListeners();
        
        // Добавляем обработчик изменения размера окна
        this.scale.on('resize', this.updateLayout, this);
    }

    createAnimations() {
        this.anims.create({
            key: 'lost-heart',
            frames: this.anims.generateFrameNames('hearts', {
                start: 1,
                end: 5,
                prefix: `hearts_`,
                suffix: '.png',
            }),
            frameRate: 12,
            repeat: 0,
        });
    }
    
    // Обновляем макет при изменении размера экрана
    private updateLayout() {
        // Проверяем активность сцены и существование адаптивного дисплея
        if (!this.scene.isActive('ui') || !this.adaptiveDisplay) {
            return;
        }
        
        // Обновляем счетчик очков
        if (this.counter && this.counter.active) {
            this.updateScoreCounter();
        }
        
        // Обновляем сердца
        this.updateHearts();
    }
    
    private createScoreCounter() {
        // Создаем счетчик очков (выровненный по правому краю)
        this.counter = this.add.text(
            0, 0, 
            `${this.score}`, 
            { 
                fontSize: '48px', 
                fontFamily: 'Arial', 
                color: '#ffffff',
                fontStyle: 'bold',
            }
        ).setOrigin(1, 0);
        
        // Обновляем позицию и размер счетчика
        this.updateScoreCounter();
    }
    
    private updateScoreCounter() {
        if (!this.counter || !this.counter.active) return;
        
        // Размещаем счетчик в дизайнерских координатах
        this.adaptiveDisplay.placeAt(this.DESIGN.scoreX, this.DESIGN.scoreY, this.counter);
        
        // Масштабируем текст
        const scale = this.adaptiveDisplay.getScaleX();
        this.counter.setFontSize(Math.floor(48 * scale) + 'px');
    }
    
    private createHearts() {
        this.hearths = [];
        
        // Создаем сердца (жизни)
        for (let i = 0; i < this.hp; i++) {
            const heart = this.add.sprite(0, 0, 'hearts');
            heart.setOrigin(0, 0);
            this.hearths.push(heart);
        }
        
        // Обновляем позиции и размеры сердец
        this.updateHearts();
    }
    
    private updateHearts() {
        const scale = this.adaptiveDisplay.getScaleX();
        const heartSize = this.DESIGN.heartSize * scale;
        
        // Обновляем каждое сердце
        for (let i = 0; i < this.hearths.length; i++) {
            const heart = this.hearths[i];
            if (!heart || !heart.active) continue;
            
            // Размещаем сердце в дизайнерских координатах
            const heartX = this.DESIGN.heartStartX + i * this.DESIGN.heartSpacing;
            this.adaptiveDisplay.placeAt(heartX, this.DESIGN.heartY, heart);
            
            // Масштабируем сердце
            heart.setDisplaySize(heartSize, heartSize / 1.5);
        }
    }

    private addListeners() {
        EventBus.on(EVENTS.scoreChange, (points: number) => {
            EventBus.emit(EVENTS.playFX, 'success', 0.1, 1.3);
            this.score += Math.floor(points);
            this.counter.setText(`${this.score}`);
            EventBus.emit(EVENTS.scoreChanged, this.score);
        });
        
        EventBus.on(EVENTS.getDamage, () => {
            if (this.hp <= 0) return;
            
            this.hp--;
            EventBus.emit(EVENTS.playFX, 'lose', 0.1, 1.3);
            if (this.hp <= 0) {
                EventBus.emit(EVENTS.gameOver);
                return;
            }
            
            if (this.hearths[this.hp] && this.hearths[this.hp].active) {
                this.hearths[this.hp].play('lost-heart')
            }
        });
    }

    private removeListeners() {
        EventBus.removeListener(EVENTS.scoreChange);
        EventBus.removeListener(EVENTS.getDamage);
    }
    
    shutdown() {
        // Отписываемся от событий ДО удаления объектов
        this.removeListeners();
        this.scale.off('resize', this.updateLayout, this);
        
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
        }
    }
    
    // Дополнительно очищаем ресурсы при уничтожении сцены
    destroy() {
        this.removeListeners();
        this.scale.off('resize', this.updateLayout, this);
    }
}