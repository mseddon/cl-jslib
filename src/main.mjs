//import "./hashtable";
import * as conses from "./conses.mjs";
import * as arrays from "./arrays.mjs";
import * as reader from "./reader.mjs";
import * as equal from "./equal.mjs";
import * as streams from "./streams.mjs";
import * as characters from "./characters.mjs";
import * as sequences from "./sequences.mjs";
import * as symbols from "./symbols.mjs";
import * as strings from "./strings.mjs";
import * as printer from "./printer.mjs";

import { setInstance, LispInstance, lispInstance } from "./lisp-instance.mjs"
import { PrettyPrintDispatchTable } from "./printer.mjs";
import { makeStringInputStream } from "./streams.mjs";
import { format } from "./printer.mjs";

function initializeInstance(inst) {
    setInstance(inst);
    inst.packageNames = new Map();
    inst.CL_PACKAGE = new symbols.Package("COMMON-LISP", ["CL"]);

    inst.CL_PACKAGE.QUOTE = symbols.intern("QUOTE", inst.CL_PACKAGE);
    inst.CL_PACKAGE.FUNCTION = symbols.intern("FUNCTION", inst.CL_PACKAGE);

    inst.CL_PACKAGE.BACKQUOTE = symbols.intern("BACKQUOTE", inst.CL_PACKAGE);
    inst.CL_PACKAGE.UNQUOTE = symbols.intern("UNQUOTE", inst.CL_PACKAGE);
    inst.CL_PACKAGE.UNQUOTE_SPLICING = symbols.intern("UNQUOTE-SPLICING", inst.CL_PACKAGE);

    symbols.$export(conses.list(inst.CL_PACKAGE.QUOTE, inst.CL_PACKAGE.FUNCTION), inst.CL_PACKAGE)

    inst.PACKAGE = new symbols.Package("COMMON-LISP-USER", ["CL-USER"]);
    symbols.usePackage(inst.CL_PACKAGE, inst.PACKAGE);
    inst.KEYWORD_PACKAGE = new symbols.Package("KEYWORD", []);

    inst.READ_BASE = 10;
    inst.READ_EVAL = true;
    inst.READ_SUPPRESS = false;
    inst.READTABLE = new reader.copyReadtable(reader.standardReadtable);

    inst.PRINT_ARRAY = true;
    inst.PRINT_BASE  = 10;
    inst.PRINT_RADIX = false;
    inst.PRINT_CASE = symbols.intern("UPCASE", inst.KEYWORD_PACKAGE);
    inst.PRINT_CIRCLE = false;
    inst.PRINT_ESCAPE = true;
    inst.PRINT_GENSYM = true;
    inst.PRINT_LEVEL  = conses.NIL;
    inst.PRINT_LENGTH = conses.NIL;
    inst.PRINT_LINES = conses.NIL;
    inst.PRINT_MISER_WIDTH = conses.NIL;
    inst.PRINT_PPRINT_DISPATCH = new PrettyPrintDispatchTable();
    inst.PRINT_PRETTY = true;
    inst.PRINT_READABLY = false;
    inst.PRINT_RIGHT_MARGIN = conses.NIL;

    inst.STANDARD_OUTPUT = new streams.makeStringOutputStream();

    return inst;
}

globalThis["CL-JSLIB"] = {...conses, ...streams, ...arrays, ...characters, ...equal, ...reader, ...symbols, ...sequences, ...strings, ...printer};

function makeInstance() {
    return setInstance(initializeInstance(new LispInstance()));
}

makeInstance();

format(conses.NIL, "~2,,'A@:Cfoo")

let is = streams.makeStringInputStream(`(#1=(a b c) #1# #1#)`);
printer.princ(reader.read(makeStringInputStream('#1a((1 2) (3 4))')));

console.log(lispInstance.STANDARD_OUTPUT.outputString);