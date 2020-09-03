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

import { lispInstance, setInstance, LispInstance } from "./lisp-instance.mjs"

function initializeInstance(inst) {
    setInstance(inst);
    inst.packageNames = new Map();
    inst.CL_PACKAGE = new symbols.Package("COMMON-LISP", ["CL"]);
    inst.CURRENT_PACKAGE = new symbols.Package("COMMON-LISP-USER", ["CL-USER"]);
    symbols.usePackage(inst.CL_PACKAGE, inst.CURRENT_PACKAGE);
    inst.KEYWORD_PACKAGE = new symbols.Package("KEYWORD", []);

    inst.READ_BASE = 10;
    inst.READ_EVAL = true;
    inst.READ_SUPPRESS = false;
    inst.READTABLE = new reader.Readtable();

    return inst;
}

let env = {...conses, ...streams, ...arrays, ...characters, ...equal, ...reader, ...symbols, ...sequences, ...strings};


function makeInstance() {
    return setInstance(initializeInstance(new LispInstance()));
}

makeInstance();

globalThis["CL-JSLIB"] = env;

let CL = lispInstance.CL_PACKAGE;

let foo = new symbols.Package("FOO");


let arr = new arrays.LispVector(20, [2]);
arr.fillPointer = 0;
arrays.vectorPush(arr, 1);
arrays.vectorPush(arr, 2);
arrays.vectorPush(arr, 3);
console.log(arr+"");

symbols.intern("HI", CL);
symbols.usePackage(conses.list("CL"), foo);
symbols.$export("HI", CL);

symbols.unusePackage(conses.list("CL"), foo);

let str = new strings.LispString("Hello\nworld this is fun");
console.log(strings.stringUpcase(str)+"")

console.log(symbols.intern("HELLO", lispInstance.CURRENT_PACKAGE)+"")

console.log(lispInstance.CURRENT_PACKAGE+"");