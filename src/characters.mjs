const chars = {};
const codes = {};
const charNames = {
    " ": "Space",
    "\n": "Newline",
    "\t": "Tab",
    "\v": "Page",
    "\r": "Linefeed",
    "\b": "Backspace",
    "\x7f": "Rubout",
}

function invertBijection(x) {
    let out = {};
    for(let key in x)
        out[x[key]] = key;
    return out;
}

const nameChars = invertBijection(charNames);

export class LispChar {
    constructor(ch) {
        if(chars[ch])
            return chars[ch]; // don't actually allocate a new character, re-use the cached one.
        this.value = ch;
        this.charCode = ch.charCodeAt(0);
        chars[ch] = this;
        codes[this.charCode] = this;
    }

    toString() {
        return "#\\"+charName(this);
    }
}

// char=
export function charEq(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value;
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(chars[i].value !== value)
            return false;
    }
    return true;
}

// char/=
export function charNe(...chars) {
    if(chars.length === 0)
        return false;
    const seen = new Set();
    for(let i=0; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(seen.has(chars[i].value))
            return false;
        seen.add(chars[i].value);
    }
    return true;
}

// char<
export function charLt(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value;
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(chars[i].value >= value)
            return false;
        value = chars[i].value;
    }
    return true;
}

// char>
export function charGt(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value;
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(chars[i].value <= value)
            return false;
        value = chars[i].value;
    }
    return true;
}

// char<=
export function charLte(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value;
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(chars[i].value > value)
            return false;
        value = chars[i].value;
    }
    return true;
}

// char>=
export function charGte(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value;
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(chars[i].value < value)
            return false;
        value = chars[i].value;
    }
    return true;
}

// char-equal
export function charEqual(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value.toLowerCase();
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(chars[i].value.toLowerCase() !== value)
            return false;
    }
    return true;
}

// char-not-equal
export function charNotEqual(...chars) {
    if(chars.length === 0)
        return false;
    const seen = new Set();
    for(let i=0; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(seen.has(chars[i].value.toLowerCase()))
            return false;
        seen.add(chars[i].value.toLowerCase());
    }
    return true;
}

// char-lessp
export function charLessP(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value.toLowerCase();
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        let v2 = chars[i].value.toLowerCase();
        if(v2 >= value)
            return false;
        value = v2;
    }
    return true;
}

// char-greaterp
export function charGreaterP(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value.toLowerCase();
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        let v2 = chars[i].value.toLowerCase();
        if(v2 <= value)
            return false;
        value = v2;
    }
    return true;
}

// char-not-greaterp
export function charNotGreaterP(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value.toLowerCase();
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(chars[i].value <= value)
            return false;
        value = chars[i].value.toLowerCase();
    }
    return true;
}

// char-not-lessp
export function charNotLessP(...chars) {
    if(chars.length === 0)
        return false;
    if(!characterp(chars[0]))
        throw "Type error";
    const value = chars[0].value;
    for(let i=1; i<chars.length; i++) {
        if(!characterp(chars[i]))
            throw "Type error";
        if(chars[i].value >= value)
            return false;
        value = chars[i].value;
    }
    return true;
}

// character
export function character(character) {
    if(character instanceof LispChar)
        return character;
    if(typeof character === "number")
        return codeChar(character);
    if(typeof character === "string")
        return new LispChar(character[0]);
    throw "Not a character designator";
}

// characterp
export function characterp(x) {
    return x instanceof LispChar;
}

// alpha-char-p
export function alphaCharP(x) {
    if(!characterp(x))
        throw "Type Error"
    if(x.value >= 'A' && x.value <= 'Z' || x.value >= 'a' && x.value <= 'z')
        return true;
    return false;
}

// alphanumericp
export function alphanumericp(ch) {
    return !!(alphaCharP(ch) || digitCharP(ch));
}

// digit-char
export function digitChar(x, radix = 10) {
    if(!characterp(x))
        throw "Type Error"
    if(x.value >= '0' && x.value <= '9')
        return x.value.charCodeAt(0) - '0'.charCodeAt(0)
    return false;
}

// digit-char-p
export function digitCharP(x, radix = 10) { // TODO: Base
    return !!digitChar(x, radix);
}

// graphic-char-p
export function graphicCharP(ch) {
    if(ch == ' ')
        return false;
    return standardCharP(ch);
}

// standard-char-p
export function standardCharP(ch) {
    if(!characterp(ch))
        throw "Type Error";
    return !!ch.value.match(/[a-zA-Z0-9!$"'(),_\-./:;?+<=>#%&*@[\\\]{|}`^~]/);
}

// char-upcase
export function charUpcase(ch) {
    if(!characterp(ch))
        throw "Type Error"
    return new LispChar(ch.value.toUpperCase())
}

// char-downcase
export function charDowncase(ch) {
    if(!characterp(ch))
        throw "Type Error"
    return new LispChar(ch.value.toLowerCase())
}

// upper-case-p
export function upperCaseP(ch) {
    if(!characterp(ch))
        throw "Type Error"
    return ch.value.toUpperCase() == ch.value && ch.value.toLowerCase() !== ch.value;
}

// lower-case-p
export function lowerCaseP(ch) {
    if(!characterp(ch))
        throw "Type Error"
    return ch.value.toLowerCase() == ch.value && ch.value.toUpperCase() !== ch.value;
}

// both-case-p
export function bothCaseP(ch) {
    if(!characterp(ch))
        throw "Type Error"
    return ch.value.toLowerCase() == ch.value.toUpperCase();
}

// char-code
export function charCode(ch) {
    if(!characterp(ch))
        throw "Type Error"
    return ch.charCode;
}

// char-int
export const charInt = charCode;

// code-char
export function codeChar(code) {
    if(codes[code])
        return codes[code];
    return new LispChar(String.fromCharCode(code));
}

// char-code-limit
export const charCodeLimit = 65535;

// char-name
export function charName(ch) {
    if(!characterp(ch))
        throw "Type Error"
    return charNames[ch.value] || ch.value;
}

// name-char
export function nameChar(name) {
    if(typeof name !== "string")
        throw "Type Error"
    if(nameChars[name])
        return nameChars[name];
    throw "Not a valid character name: "+name;
}
