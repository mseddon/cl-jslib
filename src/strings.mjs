import { LispVector, svref } from "./arrays.mjs";
import { LispChar } from "./characters.mjs";
import * as sequences from "./sequences.mjs";
import { charUpcase } from "./characters.mjs";

export class LispString extends LispVector {
    constructor(str) {
        if(typeof str === "string") {
            let initial = Array(str.length);
            for(let i=0; i<str.length; i++)
                initial[i] = new LispChar(str[i]);
            super(str.length, initial);
        } else if(str instanceof Array) {
            // this is an array of LispChar
            super(str.length, str);
        }
    }

    [sequences.COPY_SEQ](x) {
        let len = sequences.length(x);
        return new LispString(x._data.slice(0, len));
    }

    toString() {
        let out = '"';
        let end = this.fillPointer === undefined ? this._data.length : this.fillPointer;
        for(let i=0; i<end; i++) {
            let ch = svref(this, i);
            if(ch.value === '"')
                out += "\\";
            out += ch.value;
        }
        return out + '"';
    }
}

// simple-string-p
// char
// schar
// string

// string-upcase
export function stringUpcase(str) {
    return nstringUpcase(sequences.copySeq(str));
}

// string-downcase
export function stringDowncase(str) {
    return nstringDowncase(sequences.copySeq(str));
}

// string-capitalize

// nstring-upcase
export function nstringUpcase(str) {
    if(!stringp(str))
        throw "Type error";
    let length = sequences.length(str);
    for(let i=0; i<length; i++)
        str._data[i] = charUpcase(str._data[i]);
    return str;
}

// nstring-downcase
export function nstringDowncase(str) {
    if(!stringp(str))
        throw "Type error";
    let length = sequences.length(str);
    for(let i=0; i<length; i++)
        str._data[i] = charDowncase(str._data[i]);
    return str;
}

// nstring-capitalize

// string-trim
// string-left-trim
// string-right-trim
// string=
// string/=
// string<
// string>
// string<=
// string>=
// string-equal
// string-not-equal
// string-lessp
// string-greaterp
// string-not-greaterp
// string-not-lessp

// stringp
export function stringp(x) {
    return x instanceof LispString;

}
// make-string