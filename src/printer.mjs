import { svref } from "./arrays.mjs"
import { lispInstance } from "./lisp-instance.mjs";
import { writeChar } from "./streams.mjs";
import { charName } from "./characters.mjs";
import { Cons, Nil, consp, car, cdr, nullp } from "./conses.mjs";
import { eql } from "./equal.mjs"
import { symbolp, Sym, Package } from "./symbols.mjs"
import { LispString } from "./strings.mjs";
import { PRINT_OBJECT } from "./print-object.mjs";
import { makeStringOutputStream } from "./streams.mjs";
import { getOutputStreamString } from "./streams.mjs";
import { LispArray } from "./arrays.mjs";
import { LispVector } from "./arrays.mjs";
import { stringp } from "./strings.mjs";
import { arrayHasFillPointer } from "./arrays.mjs";
import { freshLine } from "./streams.mjs";
export { PRINT_OBJECT } from "./print-object.mjs";

export function printObject(object, outputStream) {
    if(object !== undefined && object !== null && object[PRINT_OBJECT])
        return object[PRINT_OBJECT](object, outputStream);
    return printNotReadableObject(object, outputStream);
}

const FAKE_ADDRESS = Symbol("address");

function padChar(char, str, n) {
    str = ""+str;
    while(str.length < n)
        str = char+str;
    return str;
}

export function mkId(object) {
    if(object[FAKE_ADDRESS] !== undefined)
        return object[FAKE_ADDRESS];
    return object[FAKE_ADDRESS] = Math.round(Math.random()*0xFFFFFFFF);
}

export function printNotReadableObject(object, outputStream) {
    object = Object(object);
    princ("#<"+object.constructor.name.toUpperCase()+" {"+padChar("0", mkId(object).toString(16), 8).toUpperCase()+"}>", outputStream);
}

export class PrettyPrintDispatchTable {
    constructor(oldTable) {
        if(oldTable) {
            this.conses = new Map(oldTable.conses);
            this.entries = [...oldTable.entries];
        }
    }

    // Maps symbols onto printer functions when they are the car of a list.
    //   (cons (member let flet)) for example would create an entry for LET and FLET in this map.
    conses = new Map();

    // More complex types that require more complex type discrimination.
    entries = []
}

// copy-pprint-dispatch &optional (table *print-pprint-dispatch*)
export function copyPPrintDispatch(table = lispInstance.PRINT_PPRINT_DISPATCH) {
    return new PrettyPrintDispatchTable(table);
}

// set-pprint-dispatch type-specifier function &optional (priority 0) (table *print-pprint-dispatch*)

// pprint-dispatch object &optional (table *print-pprint-dispatch*)
export function pprintDispatch(object, table = lispInstance.PRINT_PPRINT_DISPATCH) {
    if(consp(object) && symbolp(car(object))) {
        // TODO: spoilers, we can't use a JS Map here for eql in the general case because maps are eq hashtables only.
        //       we will need to replace this with a proper LispHashtable once implemented.
        let sym = car(object);
        let dispatch = table.conses.get(sym);
        if(dispatch) {
            lispInstance.values = [true];
            return dispatch;
        }
    }
    // okay, we want to just walk the entries then, picking the highest priority one that matches.

    // return print-object
}

// pprint-fill stream object &optional (colon-p t) at-sign-p
// pprint-linear stream object &optional (colon-p t) at-sign-p
// pprint-tabular stream object &optional (colon-p t) at-sign-p (tabsize 16)
// pprint-indent relative-to n &optional stream
// pprint-newline kind &optional stream
// pprint-tab kind column colinc &optional stream

// print-object object stream -- defined in print-object as symbol for js method

// write object &key (array *print-array*) (base *print-base*) (circle *print-circle*) (escape *print-escape*) (gensym *print-gensym*) (length *print-length*) (level *print-level*) (lines *print-lines*) (miser-width *print-miser-width*) (*print-pprint-dispatch* pprint-dispatch) (pretty *print-pretty*) (radix *print-radix*) (readably *print-readably*) (right-margin *print-right-margin*) (stream *standard-output*)
export function write(object) {
    printObject(object, lispInstance.STANDARD_OUTPUT);
}

// prin1 &optional output-stream
export function prin1(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    let oPRINT_ESCAPE = lispInstance.PRINT_ESCAPE;
    let oSTANDARD_OUTPUT = lispInstance.STANDARD_OUTPUT;
    try {
        lispInstance.PRINT_ESCAPE = true;
        lispInstance.STANDARD_OUTPUT = outputStream;
        write(object);
    } finally {
        lispInstance.PRINT_ESCAPE = oPRINT_ESCAPE;
        lispInstance.STANDARD_OUTPUT = oSTANDARD_OUTPUT;
    }
}

// princ &optional output-stream
export function princ(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    let oPRINT_ESCAPE = lispInstance.PRINT_ESCAPE;
    let oPRINT_READABLY = lispInstance.PRINT_READABLY;
    let oSTANDARD_OUTPUT = lispInstance.STANDARD_OUTPUT;
    try {
        lispInstance.PRINT_ESCAPE = false;
        lispInstance.PRINT_READABLY = false;
        lispInstance.STANDARD_OUTPUT = outputStream;
        write(object);
    } finally {
        lispInstance.PRINT_ESCAPE = oPRINT_ESCAPE;
        lispInstance.PRINT_READABLY = oPRINT_READABLY;
        lispInstance.STANDARD_OUTPUT = oSTANDARD_OUTPUT;
    }
}

// print &optional output-stream
export function print(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    writeChar("\n");
    prin1(object, outputStream);
    writeChar(" ");
}

// pprint &optional output-stream
export function pprint(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    let oPRINT_PRETTY = lispInstance.PRINT_PRETTY;
    let oSTANDARD_OUTPUT = lispInstance.STANDARD_OUTPUT;
    try {
        lispInstance.PRINT_PRETTY = true;
        lispInstance.STANDARD_OUTPUT = outputStream;
        writeChar("\n");
        prin1(object, outputStream);
        writeChar(" ");
    } finally {
        lispInstance.PRINT_PRETTY = oPRINT_PRETTY;
        lispInstance.STANDARD_OUTPUT = oSTANDARD_OUTPUT;
    }
}

// write-to-string write object &key (array *print-array*) (base *print-base*) (circle *print-circle*) (escape *print-escape*) (gensym *print-gensym*) (length *print-length*) (level *print-level*) (lines *print-lines*) (miser-width *print-miser-width*) (*print-pprint-dispatch* pprint-dispatch) (pretty *print-pretty*) (radix *print-radix*) (readably *print-readably*) (right-margin *print-right-margin*)

// prin1-to-string object
export function prin1ToString(object) {
    let str = makeStringOutputStream();
    prin1(object, str);
    return getOutputStreamString(str);
}

// princ-to-string object
export function princToString(object) {
    let str = makeStringOutputStream();
    princ(object, str);
    return getOutputStreamString(str);
}

// print-not-readable-object // defined in print-object

export const formatDirectives = {
    'C': (stream, args, atSign, colonSign, formatArgs) => {
        if(args.length)
            throw "Too many arguments to ~C directive";
        if(colonSign && atSign)
            princ(charName(formatArgs.shift()), stream);
        else if(atSign)
            prin1(formatArgs.shift(), stream);
        else if(colonSign)
            princ(charName(formatArgs.shift()), stream);
        else
            princ(formatArgs.shift(), stream);
    },
    '%': (stream, args, atSign, colonSign, formatArgs) => {
        let n = 1;
        if(args.length == 1) {
            if(typeof args[i] !== "number")
                throw "Number expected";
            
        } else if(args.length !== 0)
            throw "Too many arguments to ~% directive";
        while(n-- > 0)
            writeChar('\n', stream);
    },
    '&': (stream, args, atSign, colonSign, formatArgs) => {
        let n = 1;
        if(args.length == 1) {
            if(typeof args[i] !== "number")
                throw "Number expected";
        } else if(args.length !== 0)
            throw "Too many arguments to ~% directive";
        if(n > 0)
            freshLine(stream);
        while(n-- > 0)
            writeChar('\n', stream);
    },
    '~': (stream, args, atSign, colonSign, formatArgs) => {
        let n = 1;
        if(args.length == 1) {
            if(typeof args[i] !== "number")
                throw "Number expected";      
        } else if(args.length !== 0)
            throw "Too many arguments to ~% directive";
        while(n-- > 0)
            writeChar('~', stream);
    },
    '|': (stream, args, atSign, colonSign, formatArgs) => {
        let n = 1;
        if(args.length == 1) {
            if(typeof args[i] !== "number")
                throw "Number expected";      
        } else if(args.length !== 0)
            throw "Too many arguments to ~% directive";
        while(n-- > 0)
            writeChar('\v', stream);
    },
    'D': (stream, args, atSign, colonSign, formatArgs) => {
        let oPRINT_ESCAPE = lispInstance.PRINT_ESCAPE;
        let oPRINT_RADIX = lispInstance.PRINT_RADIX;
        let oPRINT_BASE = lispInstance.PRINT_BASE;
        let oPRINT_READABLY = lispInstance.PRINT_READABLY;

        try {
            let radix = 10;
            let mincol = 0;
            let padchar = ' ';
            let commachar = '';
            let commaInterval = 3;
            if(args.length) {
                radix = args[0];
                if(args.length >= 2) mincol = args[1];
                if(args.length >= 3) padchar = args[2];
                if(args.length >= 4) commachar = args[3];
                if(args.length >= 5) commaInterval = args[4];
            }
            let arg = formatArgs.shift()
            let prefix = "";
            
            if(atSign && arg >= 0)
                prefix = "+";
            
            lispInstance.PRINT_BASE = radix;
            let number = princToString(arg);
            if(number[0] == "-") {
                prefix = "-";
                number = number.substring(1);
            }
            if(typeof arg === "number" && colonSign && commaInterval > 0) {
                // now add commaaaahs.
                let s = "";
                
            }
            princ(stream, prefix+number)
        } finally {
            lispInstance.PRINT_ESCAPE = oPRINT_ESCAPE;
            lispInstance.PRINT_RADIX = oPRINT_RADIX;
            lispInstance.PRINT_BASE = oPRINT_BASE;
            lispInstance.PRINT_READABLY = oPRINT_READABLY;
        }
    }
}

// format
export function format(designator, controlString, ...args) {
    let stream;
    if(nullp(designator))
        stream = makeStringOutputStream();
    else if(designator === true)
        stream = lispInstance.STANDARD_OUTPUT;
    else if(stringp(designator) && arrayHasFillPointer(designator)) {
        throw "NYI";
    } else {
        throw "designator: Not a stream, string, nil or t";
    }

    if(typeof controlString !== "string")
        throw "Control string not a string, and that's all I do atm."
    let rp = 0;
    do {
        let ch = controlString[rp++];
        if(ch === '~') {
            let csArgs = [];
            for(;;) {
                ch = controlString[rp++];
                if(ch == ",") {
                    csArgs.push(undefined);
                    continue;
                } else if(ch == "'") {
                    csArgs.push(controlString[rp++]);
                } else if(ch == '+' || ch == '-' || (ch >= '0' && ch <= '9')){
                    // this is a numeric arg
                    let int = "";
                    let sign = "";
                    if(ch == "+" || ch == "-")
                        sign = ch;
                    else int = ch;
                    while(rp < controlString.length && controlString[rp] >= '0' && controlString[rp] <= '9') {
                        int += controlString[rp++];
                    }
                    if(!int.length)
                        throw "Integer parameter expected";
                    csArgs.push(parseInt(sign+int));
                }
                if(controlString[rp] == ',') {
                    rp++;
                    continue;
                }
                break;
            }

            let atSign = false, colonSign = false;

            while(rp < controlString.length) {
                if(controlString[rp] == '@') {
                    rp++;
                    if(atSign)
                        throw ": already appeared in this directive";
                    atSign = true;
                } else if(controlString[rp] == ':') {
                    rp++;
                    if(colonSign)
                        throw ": already appeared in this directive";
                    colonSign = true;
                } else
                    break;
            }

            let directive = controlString[rp++].toUpperCase();
            if(!formatDirectives[directive])
                throw "Invalid format directive ~"+directive;
            formatDirectives[directive](stream, csArgs, atSign, colonSign)
        } else {
            writeChar(ch, stream);
        }
    } while(rp < controlString.length)
}

/**** Print Object implementations ****/
function toStringPrintInternal() {
    return prin1ToString(this);
}

LispString.prototype[PRINT_OBJECT] = (object, stream) => {
    if(lispInstance.PRINT_READABLY || lispInstance.PRINT_ESCAPE) {
        writeChar('"', stream);
        let end = object.fillPointer === undefined ? object._data.length : object.fillPointer;
        for(let i=0; i<end; i++) {
            let ch = svref(object, i);
            if(ch.value === '"' || ch.value === '\\')
                writeChar("\\", stream);
            writeChar(ch, stream);
        }
        writeChar('"', stream);
    } else {
        let end = object.fillPointer === undefined ? object._data.length : object.fillPointer;
        for(let i=0; i<end; i++) {
            let ch = svref(object, i);
            writeChar(ch, stream);
        }
    }
}

LispString.prototype.toString = toStringPrintInternal;

Cons.prototype[PRINT_OBJECT] = (object, stream) => {
    writeChar('(', stream);
    let e = object;
    do {
        printObject(e.car, stream);
        e = cdr(e);
        if(!nullp(e))
            writeChar(' ', stream);
    } while(consp(e));

    if(!consp(e) && !nullp(e)) {
        princ(' .', stream);
        printObject(e, stream);
    }
    writeChar(')', stream);
}

Cons.prototype.toString = toStringPrintInternal;

Nil.prototype[PRINT_OBJECT] = (object, stream) => {
    princ('NIL');
}

Nil.prototype.toString = toStringPrintInternal;

String.prototype[PRINT_OBJECT] = (object, stream) => {
    if(lispInstance.PRINT_READABLY || lispInstance.PRINT_ESCAPE) {
        writeChar('"', stream);
        for(let i=0; i<object.length; i++) {
            if(object[i] === '"' || object[i] === '\\')
                writeChar("\\", stream);
            writeChar(object[i], stream);
        }
        writeChar('"', stream);
    } else {
        for(let i=0; i<object.length; i++)
            writeChar(object[i], stream);
    }
}

Number.prototype[PRINT_OBJECT] = (object, stream) => {
    princ(object+"", stream);
}

LispArray.prototype[PRINT_OBJECT] = (object, stream) => {
    if(lispInstance.PRINT_ARRAY) {
        let index = 0;

        const arrayToString = n => {
            if(n >= object.dimensions.length) {
                printObject(object._data[object.displacement+index++], stream);
                return;
            }
            writeChar("(", stream);
            const sz = object.dimensions[n];
            for(let i=0; i<sz; i++) {
                arrayToString(n+1);
                if(i + 1 < sz)
                    writeChar(" ", stream);
            }
            writeChar(")", stream);
        }
        
        writeChar("#", stream);
        princ(object.dimensions.length);
        writeChar("A", stream);
        arrayToString(0);
    } else {
        princ("#<(SIMPLE-ARRAY T ("+object.dimensions.join(' ')+") {"+padChar('0', mkId(object).toString(16).toUpperCase(), 8)+"}>")        
    }
}

LispArray.prototype.toString = toStringPrintInternal;

LispVector.prototype[PRINT_OBJECT] = (object, stream) => {
    let end = object.fillPointer !== undefined ? object.fillPointer : object._data.length;
    if(lispInstance.PRINT_ARRAY) {
        princ("#(", stream);
        for(let i=0; i<end; i++) {
            printObject(object._data[i], stream);
            if(i+1 < end)
                writeChar(' ', stream);
        }
        writeChar(')', stream)
    } else {
        princ("#<(SIMPLE-VECTOR "+object.dimensions.join(' ')+" {"+padChar('0', mkId(object).toString(16).toUpperCase(), 8)+"}>")
    }
}
LispVector.prototype.toString = toStringPrintInternal;

Package.prototype[PRINT_OBJECT] = (object, stream) => {
    princ("#<PACKAGE ", stream);
    prin1(object.name, stream);
    writeChar(">", stream);
}