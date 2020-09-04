import { readChar, unreadChar } from "./streams.mjs"
import { lispInstance } from "./lisp-instance.mjs";
import { intern } from "./symbols.mjs";
import { LispString } from "./strings.mjs";
import { LispChar, digitChar, characterp, digitCharP, nameChar } from "./characters.mjs";
import { NIL, list, consp, cons, car, cdr, listLength, listToJSArray } from "./conses.mjs"
import { peekChar } from "./streams.mjs";
import { vector, LispArray } from "./arrays.mjs"
import { nullp } from "./conses.mjs";

export class Readtable {
    constructor(r = null) {
        if(r) {
            this.syntax = {...r.syntax};
            this.case = r.case;
        } else {
            this.syntax = {};
            this.case = "UPCASE";
        }
    }
}

/** This is the standard readtable. */
export const standardReadtable = new Readtable();

/** Add a range of characters to a standard syntax type */
function charSyntaxRange(start, end, type) {
    start = start.charCodeAt(0);
    end = end.charCodeAt(0);
    if(end < start)
        [start, end] = [end, start];

    for(let i=start; i<=end; i++)
        standardReadtable.syntax[String.fromCharCode(i)] = type;
}

/** Set a range of characters to a standard syntax type */
function charSyntaxSet(str, type) {
    for(let i=0; i<str.length; i++)
        standardReadtable.syntax[str[i]] = type;
}

export class MacroChar {
    constructor(nonterminating = true, fn) {
        this.nonterminating = nonterminating;
        this.fn = fn;
    };
}

export class DispatchMacro extends MacroChar {
    dispatchMacros = {};    
    constructor(nonterminating = true) {
        super(nonterminating, (inputStream, dispChar) => {
            let num = 0;
            let ch;
            for(;;) {
                ch = readChar(inputStream, true);
                if(digitCharP(ch, lispInstance.READ_BASE))
                    num = num*10 + digitChar(ch, lispInstance.READ_BASE);
                else
                    break;
            }
            if(syntaxType(ch.value) === "whitespace")
                throw "Syntax Error";
            
            let uch = ch.value.toUpperCase()

            if(this.dispatchMacros[uch])
                return this.dispatchMacros[uch](inputStream, ch, num);
            throw dispChar.value+uch+" is not a dispatch macro.";
        })
    }
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

// copy-readtable
export function copyReadtable(x) {
    if(!readtablep(x))
        throw "Type error";
    return new Readtable(x);
}

// make-dispatch-macro-character
export function makeDispatchMacroCharacter(char, nonterminating = false, readtable = lispInstance.READTABLE) {
    readtable.syntax[char] = new DispatchMacro(nonterminating);
}

// This totally doesn't work yet.
export function read(inputStream, eofErrorP = true, eofValue = null, recursiveP = null) {
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
        outer: for(;;) {
            let ch = readChar(inputStream, false, null, recursiveP);
            if(ch === null) {
                if(inEscape)
                    throw "Unterminated multiple escape";
                break; // eof terminates this token.
            }
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
                    if(res instanceof MacroChar && !res.nonterminating) {
                        unreadChar(ch, inputStream);
                        break outer;
                    } else {
                        potentialNumber = false;
                        token += ch.value;
                    }
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
        if(token === ".")
            throw ". may not appear outside of a list";
        return intern(token);
    }
}

// read-preserving-whitespace

// read-delimited-list
export function readDelimitedList(char, inputStream, recursiveP) {
    if(characterp(char))
        char = char.value;

    if(typeof char !== "string")
        throw "Type error";
    
    let sentinel = list(NIL);
    let last = sentinel;

    for(;;) {
        skipWhitespace(inputStream);
        let ch = readChar(inputStream, false, null, true);
        if(ch) {
            if(ch.value == char)
                return sentinel.cdr;
        }
        unreadChar(ch, inputStream);
        last = last.cdr = cons(read(inputStream, false, null, recursiveP), NIL);
    }
}

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
export function setDispatchMacroCharacter(dispChar, subChar, newFunction, readtable = lispInstance.READTABLE) {
    if(characterp(dispChar))
        dispChar = dispChar.value;
    if(characterp(subChar))
        subChar = subChar.value;

    let out = readtable.syntax[dispChar];
    if(!(out instanceof DispatchMacro))
        throw dispChar.value+" is not a dispatch macro";
    out.dispatchMacros[subChar.toUpperCase()] = newFunction;
}

// get-dispatch-macro-character
export function getDispatchMacroCharacter(dispChar, subChar, readtable = lispInstance.READTABLE) {
    if(characterp(dispChar))
        dispChar = dispChar.value;
    if(characterp(subChar))
        subChar = subChar.value;

    let out = readtable.syntax[dispChar];
    if(!(out instanceof DispatchMacro))
        throw dispChar.value+" is not a dispatch macro";
    return out.dispatchMacros[subChar.toUpperCase()]
}

// set-macro-character
export function setMacroCharacter(char, newFunction, nonTerminating = false, readtable = lispInstance.READTABLE) {
    if(typeof char === "string")
        char = new LispChar(char);
    if(!characterp(char))
        throw "char Type error";
    if(!readtablep(readtable))
        throw "readtable Type error";
    if(newFunction === NIL) {
        if(readtable.syntax[char.value] instanceof MacroChar)
            delete readtable.syntax[char.value];
    } else if(newFunction instanceof Function)
        readtable.syntax[char.value] = new MacroChar(nonTerminating, newFunction);
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

function isDelimiter(ch, readtable = lispInstance.READTABLE) {
    let syntax = readtable.syntax[ch];
    return syntax === "whitespace" || (syntax instanceof MacroChar && !syntax.nonTerminating);
}

function readToEndOfToken(inputStream) {
    let tk = ""
    for(;;) {
        let ch = readChar(inputStream, false, null, true);
        if(ch === null)
            return tk;

        if(!isDelimiter(ch.value))
            tk += ch.value;
        else
            return tk;
    }
}

function skipWhitespace(inputStream) {
    for(;;) {
        let ch = readChar(inputStream, false, null, true);
        if(ch === null)
            return;
        if(lispInstance.READTABLE.syntax[ch.value] !== "whitespace") {
            unreadChar(ch, inputStream);
            return;
        }
    }
}

const syntaxErrorMacro = (inputStream, c) => {
    throw c.value+" is not valid syntax";
}

setMacroCharacter('(', (inputStream, char) => {
    if(characterp(char))
        char = char.value;

    if(typeof char !== "string")
        throw "Type error";
    
    let sentinel = list(NIL);
    let last = sentinel;

    for(;;) {
        skipWhitespace(inputStream);
        let ch = readChar(inputStream, false, null, true);
        if(ch) {
            if(ch.value == ")")
                return sentinel.cdr;
            if(ch.value == ".") {
                let ch2 = syntaxType(peekChar(inputStream, true).value);
                if(ch2 instanceof MacroChar && ch2.terminating || ch2 == "whitespace") {
                    last.cdr = read(inputStream, true, null, true);
                    skipWhitespace(inputStream);
                    ch = readChar(inputStream, true, null, true);
                    if(ch.value !== ")")
                        throw ") expected";
                    return sentinel.cdr;
                }
            }
        }
        unreadChar(ch, inputStream);
        last = last.cdr = cons(read(inputStream, true, null, true), NIL);
    }
}, false, standardReadtable);


// )
setMacroCharacter(')', syntaxErrorMacro, false, standardReadtable);

// '
setMacroCharacter("'", (inputStream, ch) => {
    return list(lispInstance.CL_PACKAGE.QUOTE, read(inputStream, true, null, true));
}, false, standardReadtable)

// ;
setMacroCharacter(";", (inputStream, ch) => {
    for(;;) {
        let ch = readChar(inputStream, false, null);
        if(!ch || ch.value === '\n')
            return;
    }
}, false, standardReadtable)

// "
setMacroCharacter('"', (inputStream, ch) => {
    let string = "";
    for(;;) {
        let ch = readChar(inputStream, true);
        if(ch.value == '"')
            return new LispString(string);
        if(ch.value == "\\")
            ch = readChar(inputStream, true);
        string += ch.value;
    }
}, false, standardReadtable)

// `
setMacroCharacter("`", (inputStream, ch) => {
    return list(lispInstance.CL_PACKAGE.BACKQUOTE, read(inputStream, true, null, true));
}, false, standardReadtable)

// ,
setMacroCharacter(",", (inputStream, ch) => {
    ch = readChar(inputStream, false);
    if(ch && ch.value === "@")
        return list(lispInstance.CL_PACKAGE.UNQUOTE_SPLICING, read(inputStream, true, null, true));
    unreadChar(ch, inputStream);
    return list(lispInstance.CL_PACKAGE.UNQUOTE, read(inputStream, true, null, true));
}, false, standardReadtable)


// #
makeDispatchMacroCharacter("#", false, standardReadtable);

// #\
setDispatchMacroCharacter("#", "\\", (inputStream, c, n) => {
    let tk = readToEndOfToken(inputStream);
    
    if(tk.length == 1)
        return new LispChar(tk);
    return nameChar(tk);
}, standardReadtable)

// #'
setDispatchMacroCharacter("#", "'", (inputStream, c, n) => {
    return list(lispInstance.CL_PACKAGE.FUNCTION, read(inputStream, true, null, true));
}, standardReadtable)

// #(
setDispatchMacroCharacter("#", "(", (inputStream, c, n) => {
   let lst = readDelimitedList(")", inputStream, true);
   return vector.apply(null, listToJSArray(lst));
}, standardReadtable)
    
// #*
// #.

// #B
setDispatchMacroCharacter("#", "B", (inputStream, c, n) => {
    let tk = readToEndOfToken(inputStream);
    return parseInt(tk, 2);
}, standardReadtable)

// #O
setDispatchMacroCharacter("#", "O", (inputStream, c, n) => {
    let tk = readToEndOfToken(inputStream);
    return parseInt(tk, 8);
}, standardReadtable)

// #X
setDispatchMacroCharacter("#", "X", (inputStream, c, n) => {
    let tk = readToEndOfToken(inputStream);
    return parseInt(tk, 16);
}, standardReadtable)

// #R
setDispatchMacroCharacter("#", "R", (inputStream, c, n) => {
    let tk = readToEndOfToken(inputStream);
    return parseInt(tk, n);
}, standardReadtable)

// #C

// #A
setDispatchMacroCharacter("#", "A", (inputStream, c, n) => {
    if(n === 1) {
        if(readChar(inputStream, true).value != "(")
            throw "( expected";
        return vector.apply(null, listToJSArray(readDelimitedList(")", inputStream, true)));
    }
        
    function flattenToJSArray(dimensions, initial, accum = []) {
        if(nullp(dimensions)) {
            accum.push(initial);
            return accum;
        }

        let dimension = car(dimensions);
        for(let i=0; i<dimension; i++) {
            if(!consp(initial))
                throw "Not enough elements in array";
            flattenToJSArray(cdr(dimensions), car(initial), accum);
            initial = cdr(initial);
        }
        if(!nullp(initial))
            throw "Too many elements in array";
        return accum;
    }


    let arrayLit = read(inputStream, true, null, true);

    let pointer = arrayLit;

    let dimensions = list(NIL);
    let lastDimensions = dimensions;

    for(let d=0; d<n; d++) {
        if(!consp(pointer))
            throw "( expected"
        lastDimensions = lastDimensions.cdr = cons(listLength(pointer), NIL);
        
        pointer = car(pointer);
    }

    dimensions = dimensions.cdr;
    return new LispArray(listToJSArray(dimensions), flattenToJSArray(dimensions, arrayLit));
}, standardReadtable)

// #S
// #P

// #=
// ##

// #+
// #-

const syntaxErrorDispatchMacro = (inputStream, c, n) => {
    throw "#"+c.value+" is not valid syntax";
}

// #|
setDispatchMacroCharacter("#", "|", (inputStream, c, n) => {
    for(;;) {
        let ch = readChar(inputStream, true);
        if(ch.value == '|') {
            ch = readChar(inputStream, true);
            if(ch.value == '#')
                return;
        }
    }
}, standardReadtable)

setDispatchMacroCharacter("#", ")",  syntaxErrorDispatchMacro, standardReadtable)

// #<
setDispatchMacroCharacter("#", "<",  syntaxErrorDispatchMacro, standardReadtable)

// #)
setDispatchMacroCharacter("#", ")",  syntaxErrorDispatchMacro, standardReadtable)
