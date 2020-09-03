import { readChar, peekChar, unreadChar } from "./streams.mjs"
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
    }

    outer: for(;;) {
        // if inputStream EOF, bail eofy

        // read character x from inputStream.
        let x = readChar(inputStream, eofErrorP, eofValue, recursiveP);
        let res;
        let inEscape;
        switch(res = syntaxType(x)) {
            case "invalid":
                throw "Invalid character";
            case "whitespace":
                continue outer;
            case "single escape":
                potentialNumber = false;
                let x = readChar(inputStream, true, eofValue, recursiveP);
                token += x;
                readToken();
                break;
            case "multiple escape":
                potentialNumber = false;
                inEscape = true;
                readToken();
                break;
            case "constituent":
                token += x;
                readToken();
                break;
            default: {
                if(res instanceof MacroChar) {
                    res = res.fn(inputStream, x);
                    if(res === undefined) // function returned zero values. re-enter
                        continue outer;
                    return res // function returned a single result (hopefully ;) - return it.
                }
                throw "DERP";
            }
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