import { list } from "./conses.mjs"

export class LispArray {
    constructor(dimensions, initial = []) {
        this.dimensions = dimensions;
        this._row_minor = [dimensions[0]];
        for(let i=1; i<dimensions.length; i++)
            this._row_minor.push(dimensions[i]*this._row_minor[this._row_minor.length-1]);
        initial.length = this.dimensions.reduce((x, y) => x * y);
        this._data = initial;
    }
}

export class LispVector extends LispArray {
    constructor(length, initial) {
        super([length], initial);
    }
    fillPointer = undefined;
}

// make-array
// adjust-array
// adjustable-array-p

// aref
export function aref(array, ...subscripts) {
    if(!arrayp(array))
        throw "Type Error";
    if(subscripts.length !== array.dimensions.length) {
        if(subscripts.length < array.dimensions.length)
            throw "Not enough subscripts to array";
        if(subscripts.length > array.dimensions.length)
            throw "Not enough subscripts to array";
    }
    let index = 0;
    for(let i=0; i<subscripts.length; i++) {
        if(subscripts[i] >= array.dimensions[i])
            throw "Array index out of bounds for dimension "+i+", "+subscripts[i];
        index += subscripts[i]*array._row_minor[i];
    }
    return array._data[index];
}

// array-dimension
export function arrayDimension(a, axis) {
    if(!arrayp(a))
        throw "Type Error";
    if(a.length < axis)
        throw "Axis out of bounds";
    if(axis < 0)
        throw "Axis must be a positive integer";
    return a.dimensions[axis];
}

// array-demensions
export function arrayDimensions(a) {
    if(!arrayp(a))
        throw "Type Error";
    return list.apply(null, a.dimensions);
}

// array-element-type

// array-has-fill-pointer-p
export function arrayHasFillPointer(array) {
    if(!arrayp(array))
        throw "Type Error";
    return array.fillPointer !== undefined;
}

// array-displacement

// array-in-bounds-p
export function arrayInBoundsP(array, ...subscripts) {
    if(!arrayp(array))
        throw "Type error";
    if(array.dimensions.length !== subscripts.length)
        return false;
    for(let i=0; i<subscripts.length; i++) {
        if(subscripts[i] >= array.dimensions[i])
            return false;
    }
    return true;
}

// array-rank
export function arrayRank(x) {
    if(!arrayp(x))
        throw "Type Error";
    return x.dimensions.length;
}

// array-row-major-index

// array-total-size
export function arrayTotalSize(x) {
    if(!arrayp(x))
        throw "Type Error";
    return x._data.length;
}

// arrayp
export function arrayp(x) {
    return x instanceof LispArray;
}

// fill-pointer
export function fillPointer(array) {
    if(!arrayHasFillPointer(array))
        throw "Array does not have a fill pointer";
    return array.fillPointer;
}

// row-major-aref
// upgraded-array-element-type

// array-dimension-limit
// array-rank-limit
// array-total-size-limit

// simple-vector-p
// svref
// vector
// vector-pop
// vector-push
// vector-push-extend
// vectorp
export function vectorp(array) {
    return array instanceof LispVector;
}

// bit
// sbit
// bit-and
// bit-andc1
// bit-andc2
// bit-eqv
// bit-ior
// bit-nand
// bit-nor
// bit-not
// bit-orc1
// bit-orc2
// bit-xor
// bit-vector-p
// simple-bit-vector-p
