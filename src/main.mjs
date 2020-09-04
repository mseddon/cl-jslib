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

import { setInstance, LispInstance, lispInstance } from "./lisp-instance.mjs"

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

    return inst;
}

globalThis["CL-JSLIB"] = {...conses, ...streams, ...arrays, ...characters, ...equal, ...reader, ...symbols, ...sequences, ...strings};

function makeInstance() {
    return setInstance(initializeInstance(new LispInstance()));
}

makeInstance();

let blorp = symbols.intern("BLORP", lispInstance.CL_PACKAGE);
let FOO = new symbols.Package("FOO");
symbols.usePackage("CL-USER", FOO)
let bar = symbols.intern("BAR", FOO);

let is = streams.makeStringInputStream(`#1a(1 2 3 4)`);
console.log(reader.read(is)+"");
