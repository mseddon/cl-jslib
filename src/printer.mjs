import { svref } from "./arrays.mjs"
import { lispInstance } from "./lisp-instance.mjs";
import { writeChar } from "./streams.mjs";
import { Cons, Nil, consp, car, cdr, nullp } from "./conses.mjs";
import { eql } from "./equal.mjs"
import { symbolp } from "./symbols.mjs"
import { LispString } from "./strings.mjs";
import { PRINT_OBJECT, printObject } from "./print-object.mjs";
import { makeStringOutputStream } from "./streams.mjs";
import { getOutputStreamString } from "./streams.mjs";
import { LispArray } from "./arrays.mjs";
import { LispVector } from "./arrays.mjs";

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

// print-not-readable-object

// format

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

Cons.prototype.toString = printToStringInternal;

Nil.prototype[PRINT_OBJECT] = (object, stream) => {
    princ('NIL');
}

Nil.prototype.toString = printToStringInternal;

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
}

LispArray.prototype.toString = printToStringInternal;


LispVector.prototype[PRINT_OBJECT] = (object, stream) => {
    let end = object.fillPointer !== undefined ? object.fillPointer : object._data.length;
    princ("#(", stream);
    for(let i=0; i<end; i++) {
        printObject(object._data[i], stream);
        if(i+1 < end)
            writeChar(' ', stream);
    }
    writeChar(')', stream)
}
LispVector.prototype.toString = printToStringInternal;