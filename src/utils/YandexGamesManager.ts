class YandexGamesManager {
    private ysdk: any = null;
    private initialized: boolean = false;

    /**
     * Инициализация SDK Яндекс Игр
     * @returns {Promise<YandexGamesManager>} Промис, который резолвится после инициализации
     */
    async initialize(): Promise<YandexGamesManager> {
        return new Promise((resolve, reject) => {
            if (typeof YaGames === 'undefined') {

                reject(new Error('SDK Яндекс Игр не обнаружено. Убедитесь, что скрипт подключен.'));
                return;
            }

            // Инициализация SDK
            YaGames
                .init()
                .then(ysdk => {
                    this.ysdk = ysdk;
                    this.initialized = true;
                    console.log('YandexGamesManager: SDK инициализировано успешно');
                    resolve(this);
                })
                .catch(error => {
                    console.error('YandexGamesManager: Ошибка инициализации SDK', error);
                    reject(error);
                });
        });
    }

    /**
     * Проверка, инициализировано ли SDK
     * @returns {boolean} true, если SDK инициализировано
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Получение экземпляра SDK
     * @returns {any} Экземпляр SDK или null, если не инициализировано
     */
    getSDK(): any {
        return this.ysdk;
    }
}

// Экспорт класса
export default YandexGamesManager;