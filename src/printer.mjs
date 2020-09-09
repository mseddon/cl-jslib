import { svref } from "./arrays.mjs"
import { lispInstance } from "./lisp-instance.mjs";
import { writeChar } from "./streams.mjs";
import { charName } from "./characters.mjs";
import { Cons, Nil, consp, car, cdr, nullp } from "./conses.mjs";
import { eql } from "./equal.mjs"
import { symbolp, Sym, Package } from "./symbols.mjs"
import { LispString } from "./strings.mjs";
import { PRINT_OBJECT } from "./print-object.mjs";
import { makeStringOutputStream } from "./streams.mjs";
import { getOutputStreamString } from "./streams.mjs";
import { LispArray } from "./arrays.mjs";
import { LispVector } from "./arrays.mjs";
import { stringp } from "./strings.mjs";
import { arrayHasFillPointer } from "./arrays.mjs";
import { freshLine } from "./streams.mjs";
export { PRINT_OBJECT } from "./print-object.mjs";

export function printObject(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    if(object !== undefined && object !== null && object[PRINT_OBJECT])
        return object[PRINT_OBJECT](object, outputStream);
    return printNotReadableObject(object, outputStream);
}

const FAKE_ADDRESS = Symbol("address");

function padChar(char, str, n) {
    str = ""+str;
    while(str.length < n)
        str = char+str;
    return str;
}

export function mkId(object) {
    if(object[FAKE_ADDRESS] !== undefined)
        return object[FAKE_ADDRESS];
    return object[FAKE_ADDRESS] = Math.round(Math.random()*0xFFFFFFFF);
}

export function printNotReadableObject(object, outputStream) {
    object = Object(object);
    princ("#<"+object.constructor.name.toUpperCase()+" {"+padChar("0", mkId(object).toString(16), 8).toUpperCase()+"}>", outputStream);
}

export class PrettyPrintDispatchTable {
    constructor(oldTable) {
        if(oldTable) {
            this.conses = new Map(oldTable.conses);
            this.entries = [...oldTable.entries];
        }
    }

    // Maps symbols onto printer functions when they are the car of a list.
    //   (cons (member let flet)) for example would create an entry for LET and FLET in this map.
    conses = new Map();

    // More complex types that require more complex type discrimination.
    entries = []
}

// copy-pprint-dispatch &optional (table *print-pprint-dispatch*)
export function copyPPrintDispatch(table = lispInstance.PRINT_PPRINT_DISPATCH) {
    return new PrettyPrintDispatchTable(table);
}

// set-pprint-dispatch type-specifier function &optional (priority 0) (table *print-pprint-dispatch*)

// pprint-dispatch object &optional (table *print-pprint-dispatch*)
export function pprintDispatch(object, table = lispInstance.PRINT_PPRINT_DISPATCH) {
    if(consp(object) && symbolp(car(object))) {
        // TODO: spoilers, we can't use a JS Map here for eql in the general case because maps are eq hashtables only.
        //       we will need to replace this with a proper LispHashtable once implemented.
        let sym = car(object);
        let dispatch = table.conses.get(sym);
        if(dispatch) {
            lispInstance.values = [true];
            return dispatch;
        }
    }
    // okay, we want to just walk the entries then, picking the highest priority one that matches.

    // return print-object
}

// pprint-fill stream object &optional (colon-p t) at-sign-p
// pprint-linear stream object &optional (colon-p t) at-sign-p
// pprint-tabular stream object &optional (colon-p t) at-sign-p (tabsize 16)
// pprint-indent relative-to n &optional stream
// pprint-newline kind &optional stream
// pprint-tab kind column colinc &optional stream

// print-object object stream -- defined in print-object as symbol for js method

// write object &key (array *print-array*) (base *print-base*) (circle *print-circle*) (escape *print-escape*) (gensym *print-gensym*) (length *print-length*) (level *print-level*) (lines *print-lines*) (miser-width *print-miser-width*) (*print-pprint-dispatch* pprint-dispatch) (pretty *print-pretty*) (radix *print-radix*) (readably *print-readably*) (right-margin *print-right-margin*) (stream *standard-output*)
export function write(object) {
    printObject(object);
}

// prin1 &optional output-stream
export function prin1(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    let oPRINT_ESCAPE = lispInstance.PRINT_ESCAPE;
    let oSTANDARD_OUTPUT = lispInstance.STANDARD_OUTPUT;
    try {
        lispInstance.PRINT_ESCAPE = true;
        lispInstance.STANDARD_OUTPUT = outputStream;
        write(object, outputStream);
    } finally {
        lispInstance.PRINT_ESCAPE = oPRINT_ESCAPE;
        lispInstance.STANDARD_OUTPUT = oSTANDARD_OUTPUT;
    }
}

// princ &optional output-stream
export function princ(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    let oPRINT_ESCAPE = lispInstance.PRINT_ESCAPE;
    let oPRINT_READABLY = lispInstance.PRINT_READABLY;
    let oSTANDARD_OUTPUT = lispInstance.STANDARD_OUTPUT;
    try {
        lispInstance.PRINT_ESCAPE = false;
        lispInstance.PRINT_READABLY = false;
        lispInstance.STANDARD_OUTPUT = outputStream;
        write(object, outputStream);
    } finally {
        lispInstance.PRINT_ESCAPE = oPRINT_ESCAPE;
        lispInstance.PRINT_READABLY = oPRINT_READABLY;
        lispInstance.STANDARD_OUTPUT = oSTANDARD_OUTPUT;
    }
}

// print &optional output-stream
export function print(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    writeChar("\n");
    prin1(object, outputStream);
    writeChar(" ");
}

// pprint &optional output-stream
export function pprint(object, outputStream = lispInstance.STANDARD_OUTPUT) {
    let oPRINT_PRETTY = lispInstance.PRINT_PRETTY;
    let oSTANDARD_OUTPUT = lispInstance.STANDARD_OUTPUT;
    try {
        lispInstance.PRINT_PRETTY = true;
        lispInstance.STANDARD_OUTPUT = outputStream;
        writeChar("\n");
        prin1(object, outputStream);
        writeChar(" ");
    } finally {
        lispInstance.PRINT_PRETTY = oPRINT_PRETTY;
        lispInstance.STANDARD_OUTPUT = oSTANDARD_OUTPUT;
    }
}

// write-to-string write object &key (array *print-array*) (base *print-base*) (circle *print-circle*) (escape *print-escape*) (gensym *print-gensym*) (length *print-length*) (level *print-level*) (lines *print-lines*) (miser-width *print-miser-width*) (*print-pprint-dispatch* pprint-dispatch) (pretty *print-pretty*) (radix *print-radix*) (readably *print-readably*) (right-margin *print-right-margin*)

// prin1-to-string object
export function prin1ToString(object) {
    let str = makeStringOutputStream();
    prin1(object, str);
    return getOutputStreamString(str);
}

// princ-to-string object
export function princToString(object) {
    let str = makeStringOutputStream();
    princ(object, str);
    return getOutputStreamString(str);
}

// print-not-readable-object // defined in print-object

// format
export const formatDirectives = {};

function addDirective(char, fn) {
    formatDirectives[char] = fn;
}

addDirective('C', (stream, args, colonSign, atSign, formatArgs) => {
    if(args.length)
        throw "Too many arguments to ~C directive";
    if(colonSign && atSign)
        princ(charName(formatArgs.shift()), stream);
    else if(atSign)
        prin1(formatArgs.shift(), stream);
    else if(colonSign)
        princ(charName(formatArgs.shift()), stream);
    else
        princ(formatArgs.shift(), stream);
});

addDirective('%', (stream, args, colonSign, atSign, formatArgs) => {
    let n = 1;
        if(args.length == 1) {
            if(typeof args[i] !== "number")
                throw "Number expected";
            
        } else if(args.length !== 0)
            throw "Too many arguments to ~% directive";
        while(n-- > 0)
            writeChar('\n', stream);
});

addDirective('&', (stream, args, colonSign, atSign, formatArgs) => {
    let n = 1;
    if(args.length == 1) {
        if(typeof args[i] !== "number")
            throw "Number expected";
    } else if(args.length !== 0)
        throw "Too many arguments to ~% directive";
    if(n > 0)
        freshLine(stream);
    while(n-- > 0)
        writeChar('\n', stream);
});

addDirective('~', (stream, args, colonSign, atSign, formatArgs) => {
    let n = 1;
    if(args.length == 1) {
        if(typeof args[i] !== "number")
            throw "Number expected";      
    } else if(args.length !== 0)
        throw "Too many arguments to ~% directive";
    while(n-- > 0)
        writeChar('~', stream);
});

addDirective('|', (stream, args, colonSign, atSign, formatArgs) => {
    let n = 1;
    if(args.length == 1) {
        if(typeof args[i] !== "number")
            throw "Number expected";      
    } else if(args.length !== 0)
        throw "Too many arguments to ~% directive";
    while(n-- > 0)
        writeChar('\v', stream);
});

const ROMAN_BASES = [["I", 1], ["IV", 4], ["V", 5], ["IX", 9], ["X", 10], ["XL", 40], ["L", 50], ["XC", 90], ["C", 100], ["CD", 400], ["D", 500], ["CM", 900], ["M", 1000]];
const OLD_ROMAN_BASES = [["I", 1], ["V", 5], ["X", 10], ["L", 50], ["C", 100], ["D", 500], ["M", 1000]];


const ENGLISH_ATOMIC = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
];

const ENGLISH_ATOMIC_ORD = [
    "zeroth",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth"
];

const ENGLISH_TENS = [
    "ten",
    "twenty",
    "thirty",
    "fourty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
];

const ENGLISH_TENS_ORD = [
    "tenth",
    "twentieth",
    "thirtieth",
    "fourtieth",
    "fiftieth",
    "sixtieth",
    "seventieth",
    "eightieth",
    "ninetieth",
];

const ENGLISH_THOUSANDS = [
    "thousand",
    "million",
    "billion",
    "trillion",
    "quadrillion",
    "quintillion",
    "sextillion",
    "septillion",
    "octillion",
    "nonillion",
    "decillion",
    "undecillion",
    "duodecillion",
    "tredecillion",
    "quattuordecillion",
    "quindecillion",
    "sexdecillion",
    "septendecillion",
    "octodecillion",
    "novemdecillion",
    "vigintillion"
]

function toEnglish(number, ord = false) {
    let out = "";
    if(number < 0n) {
        number = -number;
        out += "negative";
    }

    number = BigInt(number);
    if(number <= 20n) {
        return out + (ord ? ENGLISH_ATOMIC_ORD : ENGLISH_ATOMIC)[number];
    }
    if(number < 100n) {
        let rem = (number % 10n);
        let quot = (number / 10n)-1n;

        if(rem > 0n)
            return out + ENGLISH_TENS[quot]+"-"+(ord ? ENGLISH_ATOMIC_ORD : ENGLISH_ATOMIC)[rem];
        return out + ENGLISH_TENS[quot];
    }

    if(number < 1000n) {
        let rem = (number % 100n);
        let quot = (number / 100n);

        number = rem;
        if(number > 0)
            return toEnglish(quot)+" hundred "+toEnglish(number, ord);
        if(ord)
            return toEnglish(quot)+" hundredth";
        return toEnglish(quot)+" hundred";
    }

    let index = ENGLISH_THOUSANDS.length-1
    let n = 1000000000000000000000000000000000000000000000000000000000000000n;

    while(index > 0) {
        if(out)
            out += " ";
        while(index > 0 && n > number) {
            n /= 1000n;
            index--;
        }

        if(index >= 0) {
            let base = n;

            let div = (number / base)|0n;

            number = number % base;
            if(div !== 0n)
                out += toEnglish(div)+" "+ENGLISH_THOUSANDS[index];
            else
                out += ENGLISH_THOUSANDS[index];   
        }
    }
    return out + (number !== 0n ? " "+toEnglish(number,ord) : "");
}

function toRomanNumeral(number, BASES = ROMAN_BASES) {
    let index = BASES.length-1;
    if(number < 0)
        throw "Can only print non-negative roman numerals."
    if(number > 3999)
        throw "Number too large to print as a roman numeral."
    let out = "";
    while(index > 0) {
        while(index > 0 && BASES[index][1] > number)
            index--;
        if(index >= 0) {
            let symbol = BASES[index][0];
            let base = BASES[index][1];

            let div = (number / base)|0;

            number = number % base
            for(let i=0; i<div; i++)
                out += symbol;
        }
    }
    return out;
}

const R_DIRECTIVE = (stream, args, colonSign, atSign, formatArgs) => {
    let oPRINT_ESCAPE = lispInstance.PRINT_ESCAPE;
    let oPRINT_RADIX = lispInstance.PRINT_RADIX;
    let oPRINT_BASE = lispInstance.PRINT_BASE;
    let oPRINT_READABLY = lispInstance.PRINT_READABLY;

    try {
        if(!args.length) {
            // special radix mode.
            if(atSign && colonSign)
                return princ(toRomanNumeral(formatArgs.shift(), OLD_ROMAN_BASES));
            if(atSign)
                return princ(toRomanNumeral(formatArgs.shift()));
            return princ(toEnglish(formatArgs.shift(), colonSign));
        }
        let radix = 10;
        let mincol = 0;
        let padchar = ' ';
        let commachar = ',';
        let commaInterval = 3;
        if(args.length) {
            radix = args[0];
            if(args.length >= 2) mincol = args[1];
            if(args.length >= 3) padchar = args[2];
            if(args.length >= 4) commachar = args[3];
            if(args.length >= 5) commaInterval = args[4];
        }
        let arg = formatArgs.shift()
        let prefix = "";
        
        if(atSign && arg >= 0)
            prefix = "+";
        
        lispInstance.PRINT_BASE = radix;
        let number = princToString(arg);
        if(number[0] == "-") {
            prefix = "-";
            number = number.substring(1);
        }
        if(typeof arg === "number" && colonSign && commaInterval > 0) {
            // now interspersed commas.
            let s = "";

            if(number.length > commaInterval) {
                for(let i=number.length; i>=commaInterval; i-=commaInterval) {
                    s = number.substr(i-commaInterval, commaInterval) + s;
                    if(i-commaInterval >= commaInterval)
                        s = commachar + s;
                    else {
                        if(i-commaInterval)
                            s = commachar+s;
                        s = number.substr(0, i-commaInterval) + s;
                    }
                }
                number = s;
            }
        }
        princ(padChar(padchar, prefix+number, mincol), stream);
    } finally {
        lispInstance.PRINT_ESCAPE = oPRINT_ESCAPE;
        lispInstance.PRINT_RADIX = oPRINT_RADIX;
        lispInstance.PRINT_BASE = oPRINT_BASE;
        lispInstance.PRINT_READABLY = oPRINT_READABLY;
    }
}
addDirective('D', (stream, args, colonSign, atSign, formatArgs) => {
    args.unshift(10);
    return R_DIRECTIVE(stream, args, colonSign, atSign, formatArgs);
});
addDirective('B', (stream, args, colonSign, atSign, formatArgs) => {
    args.unshift(2);
    return R_DIRECTIVE(stream, args, colonSign, atSign, formatArgs);
});
addDirective('O', (stream, args, colonSign, atSign, formatArgs) => {
    args.unshift(7);
    return R_DIRECTIVE(stream, args, colonSign, atSign, formatArgs);
});
addDirective('X', (stream, args, colonSign, atSign, formatArgs) => {
    args.unshift(16);
    return R_DIRECTIVE(stream, args, colonSign, atSign, formatArgs);
});
addDirective('R', R_DIRECTIVE);

export function format(designator, controlString, ...args) {
    let stream;
    if(nullp(designator))
        stream = makeStringOutputStream();
    else if(designator === true)
        stream = lispInstance.STANDARD_OUTPUT;
    else if(stringp(designator) && arrayHasFillPointer(designator)) {
        throw "NYI";
    } else {
        throw "designator: Not a stream, string, nil or t";
    }

    if(typeof controlString !== "string")
        throw "Control string not a string, and that's all I do atm."
    let rp = 0;
    do {
        let ch = controlString[rp++];
        if(ch === '~') {
            let csArgs = [];
            for(;;) {
                ch = controlString[rp++];
                if(ch == '@' || ch == ':') {
                    rp--;
                    break;
                }
                if(ch == ",") {
                    csArgs.push(undefined);
                    continue;
                } else if(ch == "'") {
                    csArgs.push(controlString[rp++]);
                } else if(ch == '+' || ch == '-' || (ch >= '0' && ch <= '9')){
                    // this is a numeric arg
                    let int = "";
                    let sign = "";
                    if(ch == "+" || ch == "-")
                        sign = ch;
                    else int = ch;
                    while(rp < controlString.length && controlString[rp] >= '0' && controlString[rp] <= '9') {
                        int += controlString[rp++];
                    }
                    if(!int.length)
                        throw "Integer parameter expected";
                    csArgs.push(parseInt(sign+int));
                }
                if(controlString[rp] == ',') {
                    rp++;
                    continue;
                } else {
                    rp--;
                    break;
                }
            }

            let atSign = false, colonSign = false;

            while(rp < controlString.length) {
                if(controlString[rp] == '@') {
                    rp++;
                    if(atSign)
                        throw "@ already appeared in this directive";
                    atSign = true;
                } else if(controlString[rp] == ':') {
                    rp++;
                    if(colonSign)
                        throw ": already appeared in this directive";
                    colonSign = true;
                } else
                    break;
            }

            let directive = controlString[rp++].toUpperCase();
            if(!formatDirectives[directive])
                throw "Invalid format directive ~"+directive;
            formatDirectives[directive](stream, csArgs, colonSign, atSign, args)
        } else {
            writeChar(ch, stream);
        }
    } while(rp < controlString.length)
}

/**** Print Object implementations ****/
function toStringPrintInternal() {
    return prin1ToString(this);
}

LispString.prototype[PRINT_OBJECT] = (object, stream) => {
    if(lispInstance.PRINT_READABLY || lispInstance.PRINT_ESCAPE) {
        writeChar('"', stream);
        let end = object.fillPointer === undefined ? object._data.length : object.fillPointer;
        for(let i=0; i<end; i++) {
            let ch = svref(object, i);
            if(ch.value === '"' || ch.value === '\\')
                writeChar("\\", stream);
            writeChar(ch, stream);
        }
        writeChar('"', stream);
    } else {
        let end = object.fillPointer === undefined ? object._data.length : object.fillPointer;
        for(let i=0; i<end; i++) {
            let ch = svref(object, i);
            writeChar(ch, stream);
        }
    }
}

LispString.prototype.toString = toStringPrintInternal;

Cons.prototype[PRINT_OBJECT] = (object, stream) => {
    writeChar('(', stream);
    let e = object;
    do {
        printObject(e.car, stream);
        e = cdr(e);
        if(!nullp(e))
            writeChar(' ', stream);
    } while(consp(e));

    if(!consp(e) && !nullp(e)) {
        princ(' .', stream);
        printObject(e, stream);
    }
    writeChar(')', stream);
}

Cons.prototype.toString = toStringPrintInternal;

Nil.prototype[PRINT_OBJECT] = (object, stream) => {
    princ('NIL');
}

Nil.prototype.toString = toStringPrintInternal;

String.prototype[PRINT_OBJECT] = (object, stream) => {
    if(lispInstance.PRINT_READABLY || lispInstance.PRINT_ESCAPE) {
        writeChar('"', stream);
        for(let i=0; i<object.length; i++) {
            if(object[i] === '"' || object[i] === '\\')
                writeChar("\\", stream);
            writeChar(object[i], stream);
        }
        writeChar('"', stream);
    } else {
        for(let i=0; i<object.length; i++)
            writeChar(object[i], stream);
    }
}

Number.prototype[PRINT_OBJECT] = (object, stream) => {
    princ(object.toString(lispInstance.PRINT_BASE).toUpperCase(), stream);
}

LispArray.prototype[PRINT_OBJECT] = (object, stream) => {
    if(lispInstance.PRINT_ARRAY) {
        let index = 0;

        const arrayToString = n => {
            if(n >= object.dimensions.length) {
                printObject(object._data[object.displacement+index++], stream);
                return;
            }
            writeChar("(", stream);
            const sz = object.dimensions[n];
            for(let i=0; i<sz; i++) {
                arrayToString(n+1);
                if(i + 1 < sz)
                    writeChar(" ", stream);
            }
            writeChar(")", stream);
        }
        
        writeChar("#", stream);
        princ(object.dimensions.length);
        writeChar("A", stream);
        arrayToString(0);
    } else {
        princ("#<(SIMPLE-ARRAY T ("+object.dimensions.join(' ')+") {"+padChar('0', mkId(object).toString(16).toUpperCase(), 8)+"}>")        
    }
}

LispArray.prototype.toString = toStringPrintInternal;

LispVector.prototype[PRINT_OBJECT] = (object, stream) => {
    let end = object.fillPointer !== undefined ? object.fillPointer : object._data.length;
    if(lispInstance.PRINT_ARRAY) {
        princ("#(", stream);
        for(let i=0; i<end; i++) {
            printObject(object._data[i], stream);
            if(i+1 < end)
                writeChar(' ', stream);
        }
        writeChar(')', stream)
    } else {
        princ("#<(SIMPLE-VECTOR "+object.dimensions.join(' ')+" {"+padChar('0', mkId(object).toString(16).toUpperCase(), 8)+"}>")
    }
}

LispVector.prototype.toString = toStringPrintInternal;

Package.prototype[PRINT_OBJECT] = (object, stream) => {
    princ("#<PACKAGE ", stream);
    prin1(object.name, stream);
    writeChar(">", stream);
}