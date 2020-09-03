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

import { setInstance, LispInstance } from "./lisp-instance.mjs"

function initializeInstance(inst) {
    setInstance(inst);
    inst.packageNames = new Map();
    inst.CL_PACKAGE = new symbols.Package("COMMON-LISP", ["CL"]);
    inst.PACKAGE = new symbols.Package("COMMON-LISP-USER", ["CL-USER"]);
    symbols.usePackage(inst.CL_PACKAGE, inst.PACKAGE);
    inst.KEYWORD_PACKAGE = new symbols.Package("KEYWORD", []);

    inst.READ_BASE = 10;
    inst.READ_EVAL = true;
    inst.READ_SUPPRESS = false;
    inst.READTABLE = new reader.Readtable();

    return inst;
}

globalThis["CL-JSLIB"] = {...conses, ...streams, ...arrays, ...characters, ...equal, ...reader, ...symbols, ...sequences, ...strings};

function makeInstance() {
    return setInstance(initializeInstance(new LispInstance()));
}

    makeInstance();

    let is = streams.makeStringInputStream("23247348723894734");
    console.log(reader.read(is));

    console.log(reader.readtableCase()+"")
