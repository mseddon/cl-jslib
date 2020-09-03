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

let env = {...conses, ...streams, ...arrays, ...characters, ...equal, ...reader, ...symbols, ...sequences, ...strings};

globalThis["clJsLib"] = env;

let CL = symbols.CL_PACKAGE;

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

console.log(sequences.elt(new strings.LispString("Hello\nworld this is fun"), 2)+"")