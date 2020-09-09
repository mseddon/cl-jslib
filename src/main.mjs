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
    const kw = (name) => symbols.intern(name, inst.KEYWORD_PACKAGE);

    inst.KW_CASE = kw("CASE");
    inst.KW_UPCASE = kw("UPCASE");
    inst.KW_DOWNCASE = kw("DOWNCASE");
    inst.KW_INVERT = kw("INVERT");
    inst.KW_PRESERVE = kw("PRESERVE");

    inst.KW_TEST = kw("TEST");
    inst.KW_TEST_NOT = kw("TEST-NOT");
    inst.KW_KEY = kw("KEY");

    inst.KW_START = kw("START");
    inst.KW_END = kw("END");

    inst.KW_PRESERVE_WHITSPACE = kw("PRESERVE-WHITESPACE");

    inst.KW_ARRAY = kw("ARRAY");
    inst.KW_BASE = kw("BASE");
    inst.KW_CIRCLE = kw("CIRCLE");
    inst.KW_ESCAPE = kw("ESCAPE");
    inst.KW_GENSYM = kw("GENSYM");
    inst.KW_LENGTH = kw("LENGTH");
    inst.KW_LEVEL = kw("LEVEL");
    inst.KW_LINES = kw("LINES");
    inst.KW_MISER_WIDTH = kw("MISER-WIDTH");
    inst.KW_PPRINT_DISPATCH = kw("PPRINT-DISPATCH");
    inst.KW_PRETTY = kw("PRETTY");
    inst.KW_RADIX = kw("RADIX");
    inst.KW_READABLY = kw("READABLY");
    inst.KW_READABLY = kw("RIGHT-MARGIN");
    inst.KW_STREAM = kw("STREAM");
    
    inst.KW_ELEMENT_TYPE = kw("ELEMENT-TYPE");
    inst.KW_INITIAL_ELEMENT = kw("INITIAL-ELEMENT");
    inst.KW_INITIAL_CONTENTS = kw("INITIAL-CONTENTS");
    inst.KW_ADJUSTABLE = kw("ADJUSTABLE");
    inst.KW_FILL_POINTER = kw("FILL-POINTER");
    inst.KW_DISPLACED_TO = kw("DISPLACED-TO");
    inst.KW_DISPLACED_INDEX_OFFSET = kw("DISPLACED-INDEX-OFFSET");

    inst.READ_BASE = 10;
    inst.READ_EVAL = true;
    inst.READ_SUPPRESS = false;
    inst.READTABLE = new reader.copyReadtable(reader.standardReadtable);

    inst.PRINT_ARRAY = true;
    inst.PRINT_BASE  = 10;
    inst.PRINT_RADIX = false;
    inst.PRINT_CASE = inst.KW_UPCASE;
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


format(true, "~:R", -104342350508302n);

console.log(lispInstance.STANDARD_OUTPUT.outputString);