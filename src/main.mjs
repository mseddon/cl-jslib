//import "./hashtable";
import * as conses from "./conses.mjs";
import * as arrays from "./arrays.mjs";
import * as reader from "./reader.mjs";
import * as equal from "./equal.mjs";
import * as streams from "./streams.mjs";
import * as characters from "./characters.mjs";
import * as sequences from "./sequences.mjs";
//import "./string";
import * as symbols from "./symbols.mjs";

let env = {...conses, ...streams, ...arrays, ...characters, ...equal, ...reader, ...symbols, ...sequences};

globalThis["clJsLib"] = env;

let CL = symbols.CL_PACKAGE;

let foo = new symbols.Package("FOO");


let arr = new arrays.LispArray([2, 3]);
console.log(arrays.arrayDimensions(arr)+"");

symbols.intern("HI", CL);
symbols.usePackage(conses.list("CL"), foo);
symbols.$export("HI", CL);

symbols.unusePackage(conses.list("CL"), foo);


