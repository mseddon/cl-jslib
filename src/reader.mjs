import { readChar, peekChar, unreadChar } from "./streams.mjs"
import { LispChar } from "./characters.mjs";
import { digitCharP } from "./characters.mjs";
import { lispInstance } from "./lisp-instance.mjs";
import { intern } from "./symbols.mjs";
export class Readtable {
    constructor(r = null) {
        if(r) {
            this.coreSyntax = {...r.coreSyntax};
        } else {
            this.coreSyntax = {...coreSyntax};
        }
    }
}

/** This is the 'core syntax' table. */
const coreSyntax = {};

/** Add a range of characters to a syntax type */
function charSyntaxRange(start, end, type) {
    start = start.charCodeAt(0);
    end = end.charCodeAt(0);
    if(end < start)
        [start, end] = [end, start];

        for(let i=start; i<end; i++)
        coreSyntax[String.fromCharCode(i)] = type;
}

function charSyntaxSet(str, type) {
    for(let i=0; i<str.length; i++)
        coreSyntax[String.fromCharCode(i)] = type;
}


charSyntaxRange("0", "9", "constituent");
charSyntaxRange("a", "z", "constituent");
charSyntaxRange("A", "Z", "constituent");
charSyntaxSet("!$%&*+-./:<=>?@[]^_{}~\x7F", "constituent");
charSyntaxSet("\t\n\r\f\v ", "whitespace");

coreSyntax["\\"] = "single escape";
coreSyntax["|"] = "multiple escape";

function syntaxType(x) {
    if(x instanceof LispChar)
        x = x.value;
    return coreSyntax[x] || "invalid";
}


export class MacroChar {
    constructor(terminating = false, fn) {
        this.terminating = terminating;
        this.fn = fn;
    };
}

// copy-readtable
export function copyReadtable(x) {
    if(!readtablep(x))
        throw "Type error";
    return new Readtable(x);
}


// This totally doesn't work yet.
export function read(inputStream, eofErrorP = true, eofValue = null, recursiveP = null, object = eofValue) {
    let potentialNumber = true;

    let token = "";
    function readToken() {
        // OM NOM NOM
        outer: for(;;) {
            let ch = readChar(inputStream, eofErrorP, eofValue, recursiveP);
            let res = syntaxType(ch);
            switch(res) {
                case "single escape":
                    potentialNumber = false;
                    ch = readChar(inputStream, true, eofValue, recursiveP);
                    token += ch.value;
                    continue;
                case "multiple escape":
                    potentialNumber = false;
                    inEscape = !inEscape;
                case "constituent":
                    if(potentialNumber)
                        potentialNumber = digitCharP(ch, lispInstance.READ_BASE);
                    token += ch.value;
                    continue;
                case "whitespace":
                default:
                    break outer;
            }
        }
    }

    outer: for(;;) {
        // if inputStream EOF, bail eofy

        // read character x from inputStream.
        let ch = readChar(inputStream, eofErrorP, eofValue, recursiveP);
        let res = syntaxType(ch);
        let inEscape;
        switch(res) {
            case "invalid":
                throw "Invalid character";
            case "whitespace":
                continue outer;
            case "single escape":
                potentialNumber = false;
                ch = readChar(inputStream, true, eofValue, recursiveP);
                token += ch.value;
                readToken();
                break;
            case "multiple escape":
                potentialNumber = false;
                inEscape = true;
                readToken();
                break;
            case "constituent":
                token += ch.value;
                if(ch.value !== '-')
                    potentialNumber = digitCharP(ch, lispInstance.READ_BASE);
                readToken();
                break;
            default: {
                if(res instanceof MacroChar) {
                    res = res.fn(inputStream, ch);
                    if(res === undefined) // function returned zero values. re-enter
                        continue outer;
                    return res // function returned a single result (hopefully ;) - return it.
                }
                throw "DERP";
            }
        }
        if(potentialNumber) {
            let num = parseInt(token, lispInstance.READ_BASE);
            if(!isNaN(num)) {
                return Number(num);
            }
            return intern(res);
        }
    }
}

// read-preserving-whitespace
// read-delimited-list
// read-from-string
// readtable-case

// readtablep
export function readtablep(x) {
    return x instanceof Readtable;
}

// set-dispatch-macro-character
// get-dispatch-macro-character
// set-macro-character
// get-macro-character
// set-syntax-from-char