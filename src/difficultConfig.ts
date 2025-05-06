

export interface StageConfig {
    stage: number;
    lengthStage: number;
    time: number;
    buttonCount: number;
    probabiliyBigValue: number, // есть-ли в примере большие числа?
    probabiliyBigValueArray: number[]; //Вероятность большого числа для каждого числа
    probabilityPower: number, // Вероятность степени
    allowSymbols: {
        symbol: '+' | '-' | '*' | '/',
        probability: number
    }[];
    exampleLengthConfig: {
        length: number,
        probability: number,
    }[]
}

export const rangeFirst: [number, number] = [1, 9]
export const rangeSecond: [number, number] = [10, 99];
export const rangePower: [number, number] = [1, 3];

export interface LevelConfig {
    level: number,
    lengthLevel: number,
    config: StageConfig[]
}

export const timeCoeff = 5000;


export const difficultConfig: LevelConfig[] = [
    {
        level: 1,
        lengthLevel: 2,
        config: [
            {
                stage: 1,
                lengthStage: 15,
                time: 10000,
                probabiliyBigValue: 0.5,
                probabiliyBigValueArray: [1, 0.1, 0.1, 1],
                probabilityPower: 0,
                buttonCount: 4,

                exampleLengthConfig: [
                    { length: 2, probability: 1 },
                    { length: 3, probability: 0 },
                    { length: 4, probability: 0 }
                ],


                allowSymbols: [
                    {
                        symbol: '+',
                        probability: 0
                    },
                    {
                        symbol: '-',
                        probability: 0,
                    },
                    {
                        symbol: '*',
                        probability: 0,
                    },
                    {
                        symbol: '/',
                        probability: 1,
                    }
                ],
            },
            {
                stage: 2,
                lengthStage: 2,
                time: 1000,
                probabiliyBigValue: 0,
                probabiliyBigValueArray: [0.5, 0.5, 0.5],
                buttonCount: 2,
                probabilityPower: 1,
                exampleLengthConfig: [
                    { length: 2, probability: 0.8 },  // 80% - примеры с 2 числами
                    { length: 3, probability: 0.15 }, // 15% - примеры с 3 числами  
                    { length: 4, probability: 0.05 }  // 5% - примеры с 4 числами
                ],
                allowSymbols: [
                    {
                        symbol: '+',
                        probability: 0.5
                    },
                    {
                        symbol: '-',
                        probability: 0.5,
                    }
                ],
                
            },
            {
                stage: 3,
                lengthStage: 1,
                time: 30000,
                probabiliyBigValue: 0,
                probabiliyBigValueArray: [0.5, 0.5, 0.5],
                buttonCount: 2,
                probabilityPower: 1,
                exampleLengthConfig: [
                    { length: 2, probability: 0.8 },  // 80% - примеры с 2 числами
                    { length: 3, probability: 0.15 }, // 15% - примеры с 3 числами  
                    { length: 4, probability: 0.05 }  // 5% - примеры с 4 числами
                ],
                allowSymbols: [
                    {
                        symbol: '+',
                        probability: 0.5
                    },
                    {
                        symbol: '-',
                        probability: 0.5,
                    }
                ],
                
            }
        ]
    },
    {
        level: 2,
        lengthLevel: 3,
        config: [
            {
                stage: 1,
                lengthStage: 1,
                time: 30000,
                probabiliyBigValue: 0,
                probabiliyBigValueArray: [0.5, 0.5, 0.5],
                buttonCount: 2,
                probabilityPower: 1,
                exampleLengthConfig: [
                    { length: 2, probability: 0.8 },  // 80% - примеры с 2 числами
                    { length: 3, probability: 0.15 }, // 15% - примеры с 3 числами  
                    { length: 4, probability: 0.05 }  // 5% - примеры с 4 числами
                ],
                allowSymbols: [
                    {
                        symbol: '+',
                        probability: 0.2
                    },
                    {
                        symbol: '-',
                        probability: 0.2,
                    },
                    {
                        symbol: '*',
                        probability: 0.6,
                    }
                ],
                
               
            },
            {
                stage: 2,
                lengthStage: 1,
                time: 30000,
                probabiliyBigValue: 0,
                probabiliyBigValueArray: [0.5, 0.5, 0.5],
                buttonCount: 2,
                probabilityPower: 1,
                exampleLengthConfig: [
                    { length: 2, probability: 0.8 },  // 80% - примеры с 2 числами
                    { length: 3, probability: 0.15 }, // 15% - примеры с 3 числами  
                    { length: 4, probability: 0.05 }  // 5% - примеры с 4 числами
                ],
                allowSymbols: [
                    {
                        symbol: '+',
                        probability: 0.5
                    },
                    {
                        symbol: '-',
                        probability: 0.5,
                    }
                ],
                
            },
            {
                stage: 3,
                lengthStage: 1,
                time: 30000,
                probabiliyBigValue: 0,
                probabiliyBigValueArray: [0.5, 0.5, 0.5],
                buttonCount: 2,
                probabilityPower: 1,
                exampleLengthConfig: [
                    { length: 2, probability: 0.8 },  // 80% - примеры с 2 числами
                    { length: 3, probability: 0.15 }, // 15% - примеры с 3 числами  
                    { length: 4, probability: 0.05 }  // 5% - примеры с 4 числами
                ],
                allowSymbols: [
                    {
                        symbol: '+',
                        probability: 0.5
                    },
                    {
                        symbol: '-',
                        probability: 0.5,
                    }
                ],

            }
        ]
    }
];