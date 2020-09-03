import { readChar, unreadChar } from "./streams.mjs"
import { LispChar } from "./characters.mjs";
import { digitCharP } from "./characters.mjs";
import { lispInstance } from "./lisp-instance.mjs";
import { intern } from "./symbols.mjs";
import { digitChar } from "./characters.mjs";
import { characterp } from "./characters.mjs";

export class Readtable {
    case = "UPCASE";

    constructor(r = null) {
        if(r) {
            this.syntax = {...r.syntax};
            this.case = r.case;
        } else {
            this.syntax = {...standardSyntax};
        }
    }
}

/** This is the 'standard syntax' table. */
const standardSyntax = {};

/** Add a range of characters to a standard syntax type */
function charSyntaxRange(start, end, type) {
    start = start.charCodeAt(0);
    end = end.charCodeAt(0);
    if(end < start)
        [start, end] = [end, start];

        for(let i=start; i<=end; i++)
            standardSyntax[String.fromCharCode(i)] = type;
}

/** Set a range of characters to a standard syntax type */
function charSyntaxSet(str, type) {
    for(let i=0; i<str.length; i++)
        standardSyntax[str[i]] = type;
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
    return lispInstance.READTABLE.syntax[x] || "invalid";
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
                    return Number(num); // fixnum -- TODO: make a specific FixNum class...
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
export function setMacroCharacter(char, newFunction, nonTerminating = false, readtable = lispInstance.READTABLE) {
    if(!characterp(char))
        throw "char Type error";
    if(!readtablep(readtable))
        throw "readtable Type error";
    if(newFunction === NIL) {
        if(readtable.syntax[char.value] instanceof MacroChar)
            delete readtable.syntax[char.value];
    } else if(newFunction instanceof Function)
        readtable.syntax[char.value] = new MacroChar(!nonTerminating, newFunction);
    else
        throw "new-function Type error";
}

// get-macro-character
export function getMacroCharacter(char, readtable = lispInstance.READTABLE) {
    if(!characterp(char))
        throw "Type error, char not a character";
    let f = readtable.syntax[char.value];
    if(f instanceof MacroChar) {
        lispInstance.values = lispInstance.wantMV > 1 ? [!f.terminating] : [];
        return f.fn;
    }
    if(lispInstance.wantMV > 1)
        lispInstance.values = [];
    return null;
}

// set-syntax-from-char
export function setSyntaxFromChar(toChar, fromChar, toReadtable = lispInstance.READTABLE, fromReadtable = lispInstance.READTABLE) {
    if(!characterp(toChar))
        throw "to-char Type error";
    if(!characterp(fromChar))
        throw "from-char Type error";
    if(!readtablep(toReadtable))
        throw "to-readtable Type error";
    if(!readtablep(fromReadtable))
        throw "from-readtable Type error";
    toReadtable.syntax[toChar.value] = fromReadtable.syntax[fromChar.value];
}