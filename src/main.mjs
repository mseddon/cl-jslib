//import "./hashtable";
import * as conses from "./conses.mjs";
//import "./arrays";
import * as reader from "./reader.mjs";
import * as equal from "./equal.mjs";
import * as streams from "./streams.mjs";
import * as characters from "./characters.mjs";
import * as sequences from "./sequences.mjs";
//import "./string";
import * as symbols from "./symbols.mjs";

let env = {...conses, ...streams, ...characters, ...equal, ...reader, ...symbols, ...sequences};

// console.log(env); // just to ensure we don't treeshake everything.

let lst = conses.list(1, 2, 3, 4);

let s = new streams.StringInputStream("Hello\nWorld");

/*
console.log(sequences.reverse(lst)); // yay, sequence functions!

console.log(streams.readLine(s, false));
console.log(streams.readLine(s, false));

*/

let CL = symbols.CL_PACKAGE;

let foo = new symbols.Package("FOO");


symbols.intern("HI", CL);
symbols.usePackage(conses.list("CL"), foo);
symbols.$export("HI", CL);

symbols.unusePackage(conses.list("CL"), foo);
console.log(symbols.findSymbol("HI", foo));

