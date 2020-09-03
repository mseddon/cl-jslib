export class LispInstance {
    /** Extra return values */
    values = [];

    /** The number of multiple-values the callee wants. If it's <= 1, we don't do anything but set values.length = 0. otherwise the second return value onwards is pushed onto values. */
    wantMV = 1;
}

export let lispInstance = new LispInstance();

export function setInstance(newInstance) {
    return lispInstance = newInstance;
}