import { Scene, GameObjects } from 'phaser';
import { translator } from './Translator';

export class LocalizedBitmapText extends GameObjects.BitmapText {
    private translationKey: string;
    private translationParams: object;

    /**
     * @param scene
     * @param x 
     * @param y 
     * @param translationKey 
     * @param font - Название bitmap шрифта
     * @param size - Размер шрифта
     * @param align - Выравнивание текста
     * @param translationParams 
     */
    constructor(
        scene: Scene, 
        x: number, 
        y: number, 
        translationKey: string, 
        font: string,
        size: number = 16,
        align: number = 0,
        translationParams: object = {}
    ) {
        const translatedText = translator.t(translationKey, translationParams);
        super(scene, x, y, font, translatedText, size, align);

        this.translationKey = translationKey;
        this.translationParams = translationParams;
        this.currentFont = font;
        this.currentFontSize = size;

        scene.add.existing(this);

        translator.onLangChange(this.updateTranslation.bind(this));

        this.on('destroy', () => {
            translator.offLangChange(this.updateTranslation.bind(this));
        });
    }

    /**
     * Обновляет текст при смене языка
     */
    private updateTranslation(): void {
        //@ts-ignore
        if (this.scene && this.scene.sys.game && !this.destroyed) {
            const translatedText = translator.t(this.translationKey, this.translationParams);
            
            // Обновляем текст
            this.setText(translatedText);
        }
    }

    /**
     * Обновляет параметры перевода и сам текст
     * @param params
     */
    public updateParams(params: object): LocalizedBitmapText {
        this.translationParams = { ...this.translationParams, ...params };
        this.updateTranslation();
        return this;
    }

    /**
     * Изменяет ключ перевода
     * @param key - Новый ключ перевода
     */
    public setTranslationKey(key: string, params?: object): LocalizedBitmapText {
        this.translationKey = key;
        if (params) {
            this.translationParams = params;
        }
        
        // Обновляем текст
        this.updateTranslation();
        
        return this;
    }
    
    /**
     * Обновляем шрифт
     */
    public setFont(font: string, size?: number, align?: number): this {
        this.currentFont = font;
        
        if (size !== undefined) {
            this.currentFontSize = size;
        }
        
        return super.setFont(font, size, align);
    }
    
    /**
     * Обновляем размер шрифта
     */
    public setFontSize(size: number): this {
        this.currentFontSize = size;
        return super.setFontSize(size);
    }
}

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            localizedBitmapText(
                x: number,
                y: number,
                translationKey: string,
                font: string,
                size?: number,
                align?: number,
                translationParams?: object
            ): LocalizedBitmapText;
        }
    }
}

Phaser.GameObjects.GameObjectFactory.prototype.localizedBitmapText = function (
    x: number,
    y: number,
    translationKey: string,
    font: string,
    size: number = 16,
    align: number = 0,
    translationParams: object = {}
): LocalizedBitmapText {
    return new LocalizedBitmapText(this.scene, x, y, translationKey, font, size, align, translationParams);
};