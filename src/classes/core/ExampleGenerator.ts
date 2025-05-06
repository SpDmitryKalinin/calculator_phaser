import { rangeFirst, rangePower, rangeSecond, StageConfig } from "../../difficultConfig";
import { store } from "../../globalStore";

export class ExampleGenerator {
    private config: StageConfig;
    
    constructor(config: StageConfig) {
        this.config = config;
    }
    
    createExample(stage: number) {
        const arrayNumbers = [];
        const arrayOperators = [];
        const exampleLength = this.getExampleLength();
        const isBigValue = Math.random() < this.config.probabiliyBigValue;
        let hasMultiplication = false;
        let hasDivider = false;
        let hadBigNumberBeforeMultiply = false;
        
        if(Math.random() < this.config.probabilityPower) {
            return this.createPowerExample();
        }

        
        for (let i = 0; i < exampleLength; i++) {
            let number;
            
            if (i > 0 && arrayOperators[i-1] === '*') {
                if (hadBigNumberBeforeMultiply) {
                    number = this.getRandomNumber(rangeFirst);
                } else {
                    if(isBigValue && Math.random() < this.config.probabiliyBigValueArray[i]) {
                        number = this.getRandomNumber(rangeSecond);
                    } else {
                        number = this.getRandomNumber(rangeFirst);
                    }
                }
            } else if (i > 0 && arrayOperators[i-1] === '/') {
                // For division, ensure the previous number is divisible by this number
                const prevNumber: number = arrayNumbers[i-1];
                const divisors = this.findDivisors(prevNumber, rangeFirst, rangeSecond);
                
                if (divisors.length > 0) {
                    // Choose random divisor from available options
                    number = divisors[Math.floor(Math.random() * divisors.length)];
                } else {
                    // Fallback to a safe option
                    number = prevNumber;
                }
            } else {
                if(isBigValue && Math.random() < this.config.probabiliyBigValueArray[i]) {
                    number = this.getRandomNumber(rangeSecond);
                } else {
                    number = this.getRandomNumber(rangeFirst);
                }
            }
            
            if (i > 0 && arrayOperators[i-1] === '-') {
                const prevNumber = arrayNumbers[i-1];
                const maxValueForSubtraction = prevNumber - 1;
                
                if (number >= prevNumber) {
                    number = this.getRandomNumber([1, maxValueForSubtraction]);
                }
            }
            
            arrayNumbers.push(number);
            
            // Update flag - was there a big number
            if (number >= rangeSecond[0]) {
                hadBigNumberBeforeMultiply = true;
            }
            
            if(exampleLength - 1 !== i) {
                let operator = this.getRandomOperator();
                
                // If multiplication already used, choose different operator
                if (hasMultiplication && operator === '*') {
                    // Get non-multiplication operators
                    const availableOperators = this.config.allowSymbols
                        .filter(s => s.symbol !== '*')
                        .map(s => s.symbol);
                    
                    // Select random non-multiplication operator
                    if (availableOperators.length > 0) {
                        const randomIndex = Math.floor(Math.random() * availableOperators.length);
                        operator = availableOperators[randomIndex];
                    }
                }

                if(hasDivider && operator === '/') {
                    const availableOperators = this.config.allowSymbols
                        .filter(s => s.symbol !== '/')
                        .map(s => s.symbol);
                    
                    // Select random non-multiplication operator
                    if (availableOperators.length > 0) {
                        const randomIndex = Math.floor(Math.random() * availableOperators.length);
                        operator = availableOperators[randomIndex];
                    }
                }
                
                if (operator === '*') {
                    hasMultiplication = true;
                }

                if (operator === '/') {
                    hasDivider = true;
                }
                
                arrayOperators.push(operator);
                
                if (operator !== '*') {
                    hadBigNumberBeforeMultiply = false;
                }
            }
            
            if (i > 0) {
                const currentResult = this.calculateExpression(arrayNumbers, arrayOperators);
                if (currentResult < 0) {
                    arrayOperators[arrayOperators.length - 1] = '+';
                }
            }
        }
        
        const result = this.calculateExpression(arrayNumbers, arrayOperators);
        const stringForUser = this.formatExpression(arrayNumbers, arrayOperators, true);
        return { string: stringForUser, result: result, power: null};
    }

    createPowerExample() {
        const power = this.getRandomNumber(rangePower);
        const number = this.getRandomNumber(rangeFirst);
        let result = Math.pow(number, power);
        const stringForUser = `${number} = ?`;
        return { string: stringForUser, result: result, power: power};
    }

    findDivisors(number: number, range1: [number, number], range2: [number, number]): number[] {
        const divisors = [];
        const minValue = Math.min(range1[0], range2[0]);
        const maxValue = Math.max(range1[1], range2[1]);
        
        for (let i = Math.max(2, minValue); i <= Math.min(number, maxValue); i++) {
            if (number % i === 0) {
                divisors.push(i);
            }
        }
        
        // Include 1 as a fallback if no other divisors found
        if (divisors.length === 0 && minValue <= 1) {
            divisors.push(1);
        }
        
        return divisors;
    }
    

    // Безопасный метод вычисления
    calculateExpression(numbers: number[], operators: string[]): number {
        let processedNumbers = [...numbers];
        let processedOperators = [...operators];
        
        // Обрабатываем умножение и деление
        let i = 0;
        while (i < processedOperators.length) {
            if (processedOperators[i] === '*' || processedOperators[i] === '/') {
                const leftNumber = processedNumbers[i];
                const rightNumber = processedNumbers[i + 1];
                
                let result;
                if (processedOperators[i] === '*') {
                    result = leftNumber * rightNumber;
                } else {
                    result = leftNumber / rightNumber;
                }
                
                // Заменяем два числа и удаляем оператор
                processedNumbers.splice(i, 2, result);
                processedOperators.splice(i, 1);
                
                // Не увеличиваем i, чтобы проверить следующий оператор на той же позиции
            } else {
                i++;
            }
        }
        
        // Теперь обрабатываем сложение и вычитание
        let result = processedNumbers[0];
        for (let j = 0; j < processedOperators.length; j++) {
            const nextNumber = processedNumbers[j + 1];
            if (processedOperators[j] === '+') {
                result += nextNumber;
            } else if (processedOperators[j] === '-') {
                result -= nextNumber;
            }
        }
        
        return result;
    }

    // Метод форматирования выражения
    formatExpression(numbers: number[], operators: string[], withQuestion: boolean = false): string {
        const parts = [];
        for (let i = 0; i < numbers.length; i++) {
            parts.push(numbers[i].toString());
            if (i < operators.length) {
                parts.push(operators[i]);
            }
        }
        
        return parts.join(' ') + (withQuestion ? ' = ?' : '');
    }

    getExampleLength(): number {
        const config = this.config.exampleLengthConfig;
        const totalProbability = config.reduce((sum, item) => sum + item.probability, 0);
        
        let random = Math.random() * totalProbability;
        
        for (const item of config) {
            random -= item.probability;
            if (random <= 0) {
                return item.length;
            }
        }
        
        return config[0].length;
    }

    generateWrongAnswers(correctAnswer: number): number[] {
        const wrongAnswers: number[] = [];
        const wrongAnswersCount = this.config.buttonCount - 1; 
        
        for (let i = 0; i < wrongAnswersCount; i++) {
            let offset;
            let wrongAnswer;
            do {
                offset = Math.floor(Math.random() * 5) + 1;
                wrongAnswer = Math.random() > 0.5 
                    ? correctAnswer + offset 
                    : correctAnswer - offset;
            } while(wrongAnswers.includes(wrongAnswer) || wrongAnswer === correctAnswer);
            
            wrongAnswers.push(wrongAnswer);
        }
        
        return wrongAnswers;
    }
    
    private getRandomNumber(range: number[]) {
        return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    }
    

    private getRandomOperator(): string {
        const operators = this.config.allowSymbols;
        let freeSpace = 0;
        let newOperators = operators.map(item => {
            let newItem = {
                symbol: item.symbol,
                probability: item.probability
            }
            if(item.symbol === '*') {
                newItem.probability = newItem.probability * store.multiplyCoeff;   
                freeSpace = freeSpace + item.probability - newItem.probability;
            }
            else if(item.symbol === '/') {
                newItem.probability = newItem.probability * store.dividerCoeff;
                freeSpace = freeSpace + item.probability - newItem.probability;
            }
            return newItem;
        })

        newOperators.forEach(item => {
            if(item.symbol === '+' || item.symbol === '-') {
                item.probability = item.probability + freeSpace / 2;
            }
        })

        const random = Math.random();
        let cumulativeProbability = 0;
        let randomSymbol;
        for (let item of newOperators) {
            cumulativeProbability += item.probability;
            
            if (random <= cumulativeProbability) {
                randomSymbol = item.symbol;
            }
          }
          return this.getRandomSymbol(newOperators);
    }

    getRandomSymbol(items: {symbol: '+' | '-' | '*' | '/', probability: number}[]) {
        const random = Math.random();
        let sum = 0;
        
        for (let item of items) {
          sum += item.probability;
          if (random < sum) {
            return item.symbol;
          }
        }
        
        // На случай округления
        return items[items.length - 1].symbol;
      }
    
    shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}