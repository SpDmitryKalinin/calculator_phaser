import { difficultConfig, LevelConfig, StageConfig, timeCoeff } from "./difficultConfig";

class Store {
    private static instance: Store | null = null;
    level: number;
    levelLength: number;
    stage: number;
    config: LevelConfig[];
    stickerProgress = 0;
    isSound: boolean = true;
    
    counterTimeout: number = 0;
    counterDivider: number = 0;
    counterMultiply: number = 0;
    counterPower: number = 0;
    counterCurrentTimeout: number = 0;
    counterCurrentDivider: number = 0;
    counterCurrentMultiply: number = 0;
    counterCurrentPower: number = 0;
    counterCurrentTime: number = 0;
    dividerCoeff: number = 1;
    multiplyCoeff: number = 1;
    timeCoeff: number = 0;
    powerCoeff: number = 1;



    private constructor() {
        this.level = 1;
        this.stage = 1;
        this.config = difficultConfig;
    }

    public static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        
        // Return the singleton instance
        return Store.instance;
    }

    findCurrentConfig(): StageConfig {
        return this.config.find(item => item.level === this.level)?.config.find(item => item.stage === this.stage)!;
    }

    nextStage() {
        this.stage = this.stage + 1;
        
        if(this.isNextLevel()) {
            this.nextLevel();
        }
    }
    
    setCounterCurrentTime() {
        this.counterCurrentTime = this.counterCurrentTime + 1;
        this.counterTimeout = 0;
        
        if(this.counterCurrentTime === 3) {
            this.counterCurrentTime = 0;
            this.timeCoeff = this.timeCoeff - timeCoeff;
        }
    }

    resetCounterCurrentTime() {
        this.counterCurrentTime = 0;
    }

    setCounterTimeout() {
        this.counterTimeout = this.counterTimeout + 1;
        this.counterCurrentTime = 0; 
        if(this.counterTimeout === 3) {
            this.counterTimeout = 0;
            this.timeCoeff =  this.timeCoeff + timeCoeff;
        }
    }

    setCounterWrongDivider() {
        this.counterDivider = this.counterDivider + 1;
        this.counterCurrentDivider = 0;
        if(this.counterDivider === 3) {
            this.counterDivider = 0;
            this.dividerCoeff = this.dividerCoeff * 0.5;
        }
    }

    setCounterCurrentDivider() {
        this.counterCurrentDivider = this.counterCurrentDivider + 1;
        if(this.counterCurrentDivider === 3) {
            this.resetCounterWrongDivider();
            this.resetDividerCoeff();
        }
    }

    resetCounterWrongDivider() {
        this.counterDivider = 0;
    }

    resetDividerCoeff() {
        this.dividerCoeff = 1;
    }

    setCounterWrongPower() {
        this.counterPower = this.counterPower + 1;
        this.counterCurrentPower = 0;
        if(this.counterPower === 3) {
            this.counterPower = 0;
            this.powerCoeff = this.powerCoeff * 0.5;
        }
    }

    setCounterCurrentPower() {
        this.counterCurrentPower = this.counterCurrentPower + 1;
        if(this.counterCurrentPower === 3) {
            this.resetCounterWrongPower();
            this.resetPowerCoeff();
        }
    }

    resetCounterWrongPower() {
        this.counterPower = 0;
    }

    resetPowerCoeff() {
        this.powerCoeff = 1;
    }

    setCounterWrongMultiply() {
        this.counterMultiply = this.counterMultiply + 1;
        this.counterCurrentMultiply = 0;
        if(this.counterMultiply === 3) {
            this.counterMultiply = 0;
            this.multiplyCoeff = this.multiplyCoeff * 0.5;
            console.log(this.multiplyCoeff);
        }
    }

    setCounterCurrentMultiply() {
        this.counterCurrentMultiply = this.counterCurrentMultiply + 1;
        if(this.counterCurrentMultiply === 3) {
            this.resetCounterWrongMultiply();
            this.resetMultiplCoeff();
        }
    }

    resetCounterWrongMultiply() {
        this.counterMultiply = 0;
    }

    resetMultiplCoeff() {
        this.multiplyCoeff = 1;
    }


    nextStickerProgress() {
        this.stickerProgress = this.stickerProgress + 1 / this.findLengthLevel();
    }

    previousStickerProgress() {
        return this.stickerProgress - 1 / this.findLengthLevel();
    }

    isNextLevel() {
        return this.stage > this.findLengthLevel();
    }

    nextLevel() {
        this.stickerProgress = 0;
        this.stage = 1; // Fixed the double assignment
        this.level = this.level + 1;
    }

    setSound(value: boolean) {
        this.isSound = value;
    }

    findLengthLevel(): number {
        return this.config.find(item => item.level === this.level)?.lengthLevel!;
    }
}

// Export the getInstance method instead of a store instance
export const store = Store.getInstance();