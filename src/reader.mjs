import { readChar, peekChar, unreadChar } from "./streams.mjs"
import { LispChar } from "./characters.mjs";
import { digitCharP } from "./characters.mjs";
import { lispInstance } from "./lisp-instance.mjs";
import { intern } from "./symbols.mjs";
import { digitChar } from "./characters.mjs";
export class Readtable {
    case = "UPCASE";

    constructor(r = null) {
        if(r) {
            this.coreSyntax = {...r.coreSyntax};
            this.case = r.case;
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

        for(let i=start; i<=end; i++)
            coreSyntax[String.fromCharCode(i)] = type;
}

function charSyntaxSet(str, type) {
    for(let i=0; i<str.length; i++)
        coreSyntax[str[i]] = type;
}


charSyntaxRange("0", "9", "constituent");
charSyntaxRange("a", "z", "constituent");
charSyntaxRange("A", "Z", "constituent");
charSyntaxSet("!$%&*+-./:<=>?@[]^_{}~\x7F", "constituent");
charSyntaxSet("\t\n\r\f\v ", "whitespace");

charSyntaxSet("\\", "single escape");
charSyntaxSet("|", "multiple escape");

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
    let inEscape = false;
    let token = "";
    function caseConvert(ch) {
        switch(lispInstance.READTABLE.case) {
            case "UPCASE":
                return ch.toUpperCase();
            case "DOWNCASE":
                return ch.toLowerCase();
            case "INVERT":
                if(ch.toLowerCase() == ch && ch.toUpperCase() != ch)
                    return ch.toUpperCase();
                if(ch.toUppwerCase() == ch && ch.toLowerCase() != ch)
                    return ch.toLowerCase();
        }
        return ch;
    }

    function readToken() {
        // OM NOM NOM
        outer: for(;;) {
            let ch = readChar(inputStream, false, null, recursiveP);
            if(ch === null)
                break;
            let res = syntaxType(ch);
            if(inEscape && res !== "multiple escape") {
                token += ch.value;
                continue;
            }

            switch(res) {
                case "invalid":
                    throw "Invalid character";
                case "whitespace":
                    return;
                case "single escape":
                    potentialNumber = false;
                    ch = readChar(inputStream, true, eofValue, recursiveP);
                    token += ch.value;
                    continue;
                case "multiple escape":
                    potentialNumber = false;
                    inEscape = !inEscape;
                    continue;
                case "constituent":
                    if(potentialNumber)
                        potentialNumber = digitCharP(ch, lispInstance.READ_BASE);
                    token += caseConvert(ch.value);
                    continue;
                default:
                    if(res instanceof MacroChar && res.terminating)
                        unreadChar(ch, inputStream);
                    break outer;
            }
        }
    }

    outer: for(;;) {
        // if inputStream EOF, bail eofy

        // read character x from inputStream.
        let ch = readChar(inputStream, eofErrorP, eofValue, recursiveP);
        if(ch === null)
            break outer;
        let res = syntaxType(ch);
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
                token += caseConvert(ch.value);
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
            // parse bigint.
            let sign = 1;
            let value = 0n;

            let i = 0;
            if(token[i] === "-") {
                sign = -sign;
                i++;
            }
            for(; i<token.length; i++) {
                value *= BigInt(lispInstance.READ_BASE);
                let res = digitChar(new LispChar(token[i]), lispInstance.READ_BASE);

                value += BigInt(res);
            }

            let num = parseInt(token, lispInstance.READ_BASE);
            if(!isNaN(num)) {
                if(value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
                    return Number(num); // fixnum
                return value;
            }
        
            num = parseFloat(token);
            if(!isNaN(num))
                return Number(num); // double-float

            //   rational?
        }
        return intern(token);
    }
}

// read-preserving-whitespace
// read-delimited-list
// read-from-string

// readtable-case
export function readtableCase(x = lispInstance.READTABLE) {
    if(!readtablep(x))
        throw "Type error";
    return intern(x.case, lispInstance.KEYWORD_PACKAGE);
}

// readtablep
export function readtablep(x) {
    return x instanceof Readtable;
}

// set-dispatch-macro-character
// get-dispatch-macro-character

// set-macro-character
// get-macro-character

// set-syntax-from-char