export class LispInstance {
    constructor() {
        this.dynamicEnv = new Map();
    }
}

export let lispInstance = new LispInstance();

export function setInstance(newInstance) {
    return lispInstance = newInstance;
}