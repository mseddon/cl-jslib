import { lispInstance } from "./lisp-instance.mjs";
import { writeChar } from "./streams.mjs";
import { consp, car } from "./conses.mjs";
import { eql } from "./equal.mjs"
import { symbolp } from "./symbolp.mjs"

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

// print-object object stream

// write object &key (array *print-array*) (base *print-base*) (circle *print-circle*) (escape *print-escape*) (gensym *print-gensym*) (length *print-length*) (level *print-level*) (lines *print-lines*) (miser-width *print-miser-width*) (*print-pprint-dispatch* pprint-dispatch) (pretty *print-pretty*) (radix *print-radix*) (readably *print-readably*) (right-margin *print-right-margin*) (stream *standard-output*)
export function write(object) {
}

// prin1 &optional output-stream
export function prin1(object) {
    let oPRINT_ESCAPE = lispInstance.PRINT_ESCAPE;
    try {
        lispInstance.PRINT_ESCAPE = true;
        write(object);
    } finally {
        lispInstance.PRINT_ESCAPE = oPRINT_ESCAPE;
    }
}

// princ &optional output-stream
export function princ(object) {
    let oPRINT_ESCAPE = lispInstance.PRINT_ESCAPE;
    let oPRINT_READABLY = lispInstance.PRINT_ESCAPE;
    try {
        lispInstance.PRINT_ESCAPE = false;
        lispInstance.PRINT_READABLY = false;
        write(object);
    } finally {
        lispInstance.PRINT_ESCAPE = oPRINT_ESCAPE;
        lispInstance.oPRINT_READABLY = oPRINT_READABLY;
    }
}

// print &optional output-stream
export function print(object, outputStream) {
    writeChar("\n");
    prin1(object, outputStream);
    writeChar(" ");
}

// pprint &optional output-stream

// write-to-string write object &key (array *print-array*) (base *print-base*) (circle *print-circle*) (escape *print-escape*) (gensym *print-gensym*) (length *print-length*) (level *print-level*) (lines *print-lines*) (miser-width *print-miser-width*) (*print-pprint-dispatch* pprint-dispatch) (pretty *print-pretty*) (radix *print-radix*) (readably *print-readably*) (right-margin *print-right-margin*)
// prin1-to-string object
// princ-to-string object

// print-not-readable-object

// format