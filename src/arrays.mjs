import { ELT, LENGTH } from "./sequences.mjs"
import { list } from "./conses.mjs"

export class LispArray {
    constructor(dimensions, initial = []) {
        this.displacement = 0;
        this.dimensions = dimensions;
        this._row_minor = [dimensions[0]];
        for(let i=1; i<dimensions.length; i++)
            this._row_minor.push(dimensions[i]*this._row_minor[this._row_minor.length-1]);
        initial.length = this.dimensions.reduce((x, y) => x * y);
        this._data = initial;
    }

    toString() {
        let index = 0;
        let out = "";

        const arrayToString = n => {
            if(n >= this.dimensions.length) {
                out += this._data[this.displacement+index++];
                return;
            }
            out += "(";
            const sz = this.dimensions[n];
            for(let i=0; i<sz; i++) {
                arrayToString(n+1);
                if(i + 1 < sz)
                    out += " ";
            }
            out += ")";
            return out;
        }
        
        return "#"+this.dimensions.length+"A"+arrayToString(0);
    }
}

export class LispVector extends LispArray {
    constructor(length, initial) {
        super([length], initial);
    }

    fillPointer = undefined;

    toString() {
        let end = this.fillPointer !== undefined ? this.fillPointer : this._data.length;
        let out = "#(";
        for(let i=0; i<end; i++) {
            out+=this._data[i];
            if(i+1 < end)
                out += " ";
        }
        return out+")";
    }

    [ELT](me, n) {
        return svref(me, n);
    }

    [LENGTH](me) {
        return this.fillPointer !== undefined ? this.fillPointer : this._data.length;
    }
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
            throw "Too many subscripts to array";
    }
    let index = 0;
    for(let i=0; i<subscripts.length; i++) {
        if(subscripts[i] >= array.dimensions[i])
            throw "Array index out of bounds for dimension "+i+", "+subscripts[i];
        index += subscripts[i]*array._row_minor[i];
    }
    return array._data[array.displacement+index];
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

// array-dimensions
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
export function arrayDisplacement(array) {
    if(!arrayp(array))
        throw "Type Error";
    return array.displacement;
}

// array-in-bounds-p
export function arrayInBoundsP(array, ...subscripts) {
    if(!arrayp(array))
        throw "Type error";
    if(array.dimensions.length !== subscripts.length)
        return false;
    for(let i=0; i<subscripts.length; i++) {
        if(subscripts[i] < 0 || subscripts[i] >= array.dimensions[i])
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
export function rowMajorAref(array, index) {
    if(!arrayp(array))
        throw "Type error";
    return array._data[array.displacement + index];
}

// upgraded-array-element-type

// array-dimension-limit
// array-rank-limit
// array-total-size-limit

// simple-vector-p
export function simpleVectorP(vector) {
    return vector instanceof LispVector;
}

// svref
export function svref(vector, index) {
    if(!simpleVectorP(vector))
        throw "Type Error";
    if(index < 0 || index > vector._data.length)
        throw "Vector index out of range";
    return vector._data[index];
}

// vector
export function vector(...objects) {
    return new LispVector(objects.length, objects);
}

// vector-pop
export function vectorPop(vector) {
    if(!arrayHasFillPointer(vector))
        throw "Vector does not have fill pointer";
    if(vector.fillPointer <= 0)
        throw "vector-pop underflow";
    return vector._data[--vector.fillPointer];
}

// vector-push
export function vectorPush(vector, value) {
    if(!arrayHasFillPointer(vector))
        throw "Vector does not have fill pointer";
    if(vector.fillPointer >= vector._data.length)
        return;
    vector._data[vector.fillPointer++] = value;
}

// vector-push-extend
export function vectorPushExtend(vector, value) {
    // TODO: &optional extension
    const extension = 100;
    
    if(!arrayHasFillPointer(vector))
        throw "Vector does not have fill pointer";
    if(vector.fillPointer >= vector._data.length)
        vector._data.length += extension
    vector._data[vector.fillPointer++] = value;
}

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
