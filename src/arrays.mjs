import { list } from "./conses.mjs"

export class LispArray {
    constructor(dimensions) {
        this.dimensions = dimensions;
        this._data = Array(this.dimensions.reduce((x, y) => x * y));
    }
}

// make-array
// adjust-array
// adjustable-array-p
// aref

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
