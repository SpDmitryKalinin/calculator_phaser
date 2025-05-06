import { Scene } from 'phaser';
import { AdaptiveDisplay } from '../classes/utility/AdaptiveDisplay';
import { Thermometer } from '../classes/Thermometer';
import { LocalizedText } from '../component/LocalizedText';

export class GameOver extends Scene {
    private adaptiveDisplay: AdaptiveDisplay;
    private score_text: LocalizedText
    private achievementTexts: Phaser.GameObjects.Text[] = [];
    private achievementShown: boolean[] = [];
    private restartButton: LocalizedText
    private buttonBg: Phaser.GameObjects.Graphics;
    private darkOverlay: Phaser.GameObjects.Graphics;
    
    // Термометр как свойство класса
    private thermometer: Thermometer;

    private finalScore: number = 0;
    private currentDisplayScore: number = 0;
    private readonly maxScore: number = 10000;

    private readonly achievements = [
        { score: 1000, label: "rankNovice" },
        { score: 3000, label: "rankIntermediate" },
        { score: 5000, label: "rankExperienced" },
        { score: 7000, label: "rankMaster" },
        { score: 9000, label: "rankGenius" },
        { score: 10000, label: "rankMegamind" }
    ];

    // Константы дизайна (основаны на референсном разрешении 360x800)
    private readonly DESIGN = {
        centerX: 180,      // Центр по горизонтали
        scoreY: 100,       // Позиция счета по Y
        thermX: 220,       // X-координата термометра
        thermY: 150,       // Y-координата термометра
        labelOffset: 20,   // Горизонтальное смещение лейблов от термометра
        labelVerticalOffset: 170, // Вертикальное смещение лейблов
        labelSpacingFactor: 0.9, // Коэффициент сжатия для расстояния между лейблами (меньше 1 = ближе)
        labelTopMargin: 0.1,     // Отступ от верхней части термометра (в процентах)
        labelBottomMargin: 0.1,  // Отступ от нижней части термометра (в процентах)
        buttonWidth: 200,  // Ширина кнопки
        buttonHeight: 60,  // Высота кнопки
        buttonY: 400,      // Позиция кнопки по Y
        buttonRadius: 10   // Радиус скругления кнопки
    };

    constructor() {
        super('GameOver');
    }

    init(data: { score?: number }) {
        this.finalScore = data.score || 0;
        this.currentDisplayScore = 0;
        this.achievementShown = new Array(this.achievements.length).fill(false);
        this.achievementTexts = [];
    }

    create() {
        // Инициализируем адаптивный дисплей
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this,
            debug: false
        });

        // Создаем термометр и устанавливаем начальный уровень 0
        this.thermometer = new Thermometer(this, this.DESIGN.thermX, this.DESIGN.thermY);
        this.thermometer.setLevel(0);

        // Создаем элементы интерфейса
        this.createScoreText();
        this.createAchievementLabels();

        // Запускаем анимацию счета
        this.animateScore();

        // Добавляем обработчик изменения размера окна
        this.scale.on('resize', this.updateLayout, this);
    }

    // Обновляем макет при изменении размера экрана
    private updateLayout = () => {
        // Проверяем активность сцены и существование адаптивного дисплея
        if (!this.scene.isActive('GameOver') || !this.adaptiveDisplay) {
            return;
        }

        // Обновляем текст счета
        if (this.score_text && this.score_text.active) {
            this.adaptiveDisplay.placeAt(this.DESIGN.centerX, this.DESIGN.scoreY, this.score_text);
            const scale = this.adaptiveDisplay.getScaleX();
            this.score_text.setFontSize(Math.floor(48 * scale) + 'px');
        }
        
        // Перерисовываем термометр при изменении размера окна
        if (this.thermometer) {
            this.thermometer.redraw();
        }

        // Обновляем позиции меток достижений
        this.updateAchievementPositions();

        // Обновляем кнопку, если она существует
        if (this.restartButton && this.buttonBg && this.restartButton.active && this.buttonBg.active) {
            this.updateRestartButton();
        }

        // Обновляем оверлей, если он существует
        if (this.darkOverlay && this.darkOverlay.active) {
            this.updateDarkOverlay();
        }
    }

    private createScoreText() {
        // Создаем текст счета с правильным центрированием
        this.score_text = this.add.localizedText(
            0, 0,
            `Score`, {score: 0},
            {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Размещаем с помощью адаптивного дисплея
        this.adaptiveDisplay.placeAt(this.DESIGN.centerX, this.DESIGN.scoreY, this.score_text);

        // Масштабируем размер шрифта
        const scale = this.adaptiveDisplay.getScaleX();
        this.score_text.setFontSize(Math.floor(48 * scale) + 'px');
    }

    private animateScore() {
        this.tweens.add({
            targets: this,
            currentDisplayScore: this.finalScore,
            duration: 2000,
            ease: 'Linear',
            onUpdate: () => {
                const current = Math.floor(this.currentDisplayScore);
                this.score_text.setTranslationKey('score', {score: current});
                this.score_text.setFontStyle('bold');
                // Анимируем термометр
                if (this.thermometer) {
                    const percent = Math.min(current / this.maxScore * 100, 100);
                    this.thermometer.setLevel(percent);
                }

                // Обновляем видимость достижений
                this.updateAchievementVisibility(current);
            },
            onComplete: () => {
                this.score_text.setTranslationKey('score', {score: this.finalScore});
                this.score_text.setFontStyle('bold');
                this.createDarkOverlay();
            }
        });
    }

    private createDarkOverlay() {
        // Создаем затемняющий слой
        this.darkOverlay = this.add.graphics();
        this.updateDarkOverlay();
        this.darkOverlay.setAlpha(0);
        this.darkOverlay.setDepth(10);

        // Анимируем появление затемнения
        this.tweens.add({
            targets: this.darkOverlay,
            alpha: 0.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                this.addRestartButton();
            }
        });
    }

    private updateDarkOverlay() {
        if (!this.darkOverlay) return;

        this.darkOverlay.clear();
        this.darkOverlay.fillStyle(0x000000, 1);
        this.darkOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
    }

    private createAchievementLabels() {
        const scale = this.adaptiveDisplay.getScaleX();

        const labelStyle = {
            fontSize: `${Math.floor(14 * scale)}px`,
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'right'
        };

        // Создаем метки для каждого уровня достижения
        this.achievements.forEach((achievement, i) => {
            // Создаем текстовую метку (изначально невидимую)
            const label = this.add.localizedText(0, 0, achievement.label, labelStyle)
                .setOrigin(1, 0)
                .setAlpha(0);

            this.achievementTexts.push(label);
        });

        // Обновляем позиции
        this.updateAchievementPositions();
    }

    private updateAchievementPositions() {
        // Если меток достижений еще нет, выходим
        if (this.achievementTexts.length === 0) return;

        // Получаем масштабированные размеры
        const scale = this.adaptiveDisplay.getScaleX();
        const thermX = this.adaptiveDisplay.toScreenX(this.DESIGN.thermX);
        const thermY = this.adaptiveDisplay.toScreenY(this.DESIGN.thermY);
        const thermHeight = 300 * scale; // Высота термометра
        const labelOffset = this.DESIGN.labelOffset * scale; // Горизонтальное смещение лейблов
        
        // Применяем отступы от краев термометра
        const usableHeight = thermHeight * (1 - this.DESIGN.labelTopMargin - this.DESIGN.labelBottomMargin);
        const topY = thermY + (thermHeight * this.DESIGN.labelTopMargin);

        // Обновляем размер шрифта и позиции для каждого достижения
        for (let i = 0; i < this.achievements.length; i++) {
            // Если используем коэффициент сжатия для более плотного расположения
            const normalizedPosition = this.DESIGN.labelSpacingFactor * 
                (this.achievements.length - 1 - i) / (this.achievements.length - 1);
                
            // Вычисляем Y-координату с учетом отступов и сжатия
            const labelY = topY + (usableHeight * normalizedPosition);

            // Обновляем текст
            const label = this.achievementTexts[i];
            label.setPosition(thermX - labelOffset, labelY + (this.DESIGN.labelVerticalOffset * scale));
            label.setFontSize(Math.floor(14 * scale) + 'px');
        }
    }

    private updateAchievementVisibility(score: number) {
        for (let i = 0; i < this.achievements.length; i++) {
            if (score >= this.achievements[i].score && !this.achievementShown[i]) {
                this.achievementShown[i] = true;

                // Анимируем появление метки достижения
                this.tweens.add({
                    targets: this.achievementTexts[i],
                    alpha: 1,
                    duration: 500,
                    ease: 'Power2'
                });
            }
        }
    }

    private addRestartButton() {
        // Создаем фон кнопки
        this.buttonBg = this.add.graphics();

        // Создаем текст кнопки
        this.restartButton = this.add.localizedText(
            0, 0,
            'restart',
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setAlpha(0);

        // Устанавливаем глубину для наложения слоев
        this.buttonBg.setDepth(11);
        this.restartButton.setDepth(12);

        // Обновляем внешний вид кнопки
        this.updateRestartButton();

        // Настраиваем область нажатия и обработчик кликов
        this.setupButtonInteraction();

        // Анимируем появление кнопки
        this.tweens.add({
            targets: [this.restartButton, this.buttonBg],
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }

    private updateRestartButton() {
        if (!this.buttonBg || !this.restartButton) return;

        // Очищаем существующую графику кнопки
        this.buttonBg.clear();

        // Получаем масштабированные значения
        const scale = this.adaptiveDisplay.getScaleX();
        const buttonWidth = this.DESIGN.buttonWidth * scale;
        const buttonHeight = this.DESIGN.buttonHeight * scale;
        const buttonRadius = this.DESIGN.buttonRadius * scale;

        // Рассчитываем экранные координаты
        const buttonX = this.adaptiveDisplay.toScreenX(this.DESIGN.centerX - this.DESIGN.buttonWidth / 2);
        const buttonY = this.adaptiveDisplay.toScreenY(this.DESIGN.buttonY - this.DESIGN.buttonHeight / 2);

        // Рисуем фон кнопки
        this.buttonBg.fillStyle(0x4a90e2, 1);
        this.buttonBg.fillRoundedRect(
            buttonX,
            buttonY,
            buttonWidth,
            buttonHeight,
            buttonRadius
        );

        // Позиционируем текст кнопки
        this.adaptiveDisplay.placeAt(this.DESIGN.centerX, this.DESIGN.buttonY, this.restartButton);

        // Обновляем размер текста
        this.restartButton.setFontSize(Math.floor(24 * scale) + 'px');
    }

    private setupButtonInteraction() {
        // Создаем область нажатия в дизайнерских координатах
        const hitArea = new Phaser.Geom.Rectangle(
            this.DESIGN.centerX - this.DESIGN.buttonWidth / 2,
            this.DESIGN.buttonY - this.DESIGN.buttonHeight / 2,
            this.DESIGN.buttonWidth,
            this.DESIGN.buttonHeight
        );

        // Настраиваем обработчик кликов
        this.input.on('pointerup', (pointer: any) => {
            // Преобразуем координаты клика в дизайнерские координаты
            const designPoint = this.adaptiveDisplay.toDesignPoint(pointer);

            if (hitArea.contains(designPoint.x, designPoint.y)) {
                // Перезапускаем игру
                this.scene.stop('GameOver');
                this.scene.start('MainMenu');
            }
        });
    }

    // Очищаем ресурсы при закрытии сцены
    shutdown() {
        // Отписываемся от событий ДО удаления объектов
        this.input.off('pointerup');
        this.scale.off('resize', this.updateLayout, this);

        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
        }
        
        // Уничтожаем термометр
        if (this.thermometer) {
            this.thermometer.destroy();
        }
    }

    // Дополнительно очищаем ресурсы при уничтожении сцены
    destroy() {
        // Гарантированно отписываемся от событий
        this.scale.off('resize', this.updateLayout, this);
    }
}