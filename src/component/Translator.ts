import i18next from 'i18next';

const resources = {
    en: {
        translation: {
            play: "Play",
            load: "Loading...",
            loadingProgress: "Loading... {{percent}}%",
            score: "score {{score}}",
            rankNovice: "Novice",      
            rankIntermediate: "Intermediate", 
            rankExperienced: "Experienced",  
            rankMaster: "Master",      
            rankGenius: "Genius",      
            rankMegamind: "Megamind",
            restart: 'Restart',
            done: 'done',
            nextLevel: 'Next Level',
            nextStage: 'Next Stage',
            mainMenu: 'Main menu'
        }
    },
    ru: {
        translation: {
            play: "Играть",
            load: "Загрузка...",
            loadingProgress: "Загрузка... {{percent}}%",
            score: "счет {{score}}",
            rankNovice: "Новичок",
            rankIntermediate: "Средний",
            rankExperienced: "Опытный",
            rankMaster: "Мастер",
            rankGenius: "Гений",
            rankMegamind: "Тупа мозг",
            restart: 'Сыграть снова',
            done: 'готово',
            nextLevel: 'Следующий уровень',
            nextStage: 'Следующий этап',
            mainMenu: 'Главное меню'
        }
    },
    es: {
        translation: {
            play: "Jugar",
            load: "Cargando...",
            loadingProgress: "Cargando... {{percent}}%",
            score: "controlar {{score}}",
            rankNovice: "Principiante",
            rankIntermediate: "Intermedio",
            rankExperienced: "Experimentado",
            rankMaster: "Maestro",
            rankGenius: "Genio",
            rankMegamind: "Supercerebro",
            restart: 'reanudar',
            done: 'Hecho',
            nextLevel: 'Siguiente nivel',
            nextStage: 'Siguiente etapa',
            mainMenu: 'Menú principal'
        }
    }
};

type LangType = 'en' | 'ru' | 'es'

class Translate {
    private currentLang: LangType;
    private onLangChangeCallbacks: Function[] = [];

    constructor(lang: LangType = 'en') {
        this.currentLang = lang;

        i18next.init({
            lng: lang,
            resources: resources,
            interpolation: {
                escapeValue: false
            }
        });
    }

    getLang(): LangType {
        return this.currentLang;
    }

    getAvailableLanguages(): LangType[] {
        return ['en', 'ru', 'es'];
    }

    changeLang(lang: LangType): boolean {
        if (this.getAvailableLanguages().includes(lang) && lang !== this.currentLang) {
            i18next.changeLanguage(lang);
            this.currentLang = lang;
            this.onLangChangeCallbacks.forEach(callback => callback(lang));

            return true;
        }
        return false;
    }

    t(key: string, options: object = {}): string {
        //@ts-ignore
        return i18next.t(key, options);
    }

    onLangChange(callback: Function): void {
        this.onLangChangeCallbacks.push(callback);
    }

    offLangChange(callback: Function): void {
        const index = this.onLangChangeCallbacks.indexOf(callback);
        if (index !== -1) {
            this.onLangChangeCallbacks.splice(index, 1);
        }
    }
}

export const translator = new Translate('ru');

