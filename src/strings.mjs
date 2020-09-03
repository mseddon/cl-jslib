import { LispVector, svref } from "./arrays.mjs";
import { LispChar } from "./characters.mjs";

export class LispString extends LispVector {
    constructor(str) {
        if(typeof str === "string") {
            let initial = Array(str.length);
            for(let i=0; i<str.length; i++)
                initial[i] = new LispChar(str[i]);
            super(str.length, initial);
        }
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
// string-downcase
// string-capitalize

// nstring-upcase
// nstring-downcase
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