import { NIL } from "./conses.mjs";
import { LispChar, characterp } from "./characters.mjs";

export const INPUT_STREAM = Symbol("input-stream");
export const OUTPUT_STREAM = Symbol("output-stream");
export const IS_OPEN = Symbol("is-open?");

export const READ_CHAR = Symbol("read-char");
export const PEEK_CHAR = Symbol("peek-char");
export const UNREAD_CHAR = Symbol("unread-char");

export const WRITE_CHAR = Symbol("write-char");
export const FRESH_LINE = Symbol("fresh-line");

export class Stream {}

export class StringInputStream extends Stream {
    constructor(input) {
        super();
        this._input = input;
        this._position = 0;
    }

    unread = null;

    [INPUT_STREAM] = this;

    [READ_CHAR](eofErrorP = true, eofValue = NIL, recursiveP = false) {
        if(this.unread) {
            let res = this.unread;
            this.unread = null;
            return res;
        }
        if(this._position === this._input.length) {
            if(eofErrorP)
                throw "End of file";
            return eofValue;
        }
        return new LispChar(this._input[this._position++]);
    }

    [PEEK_CHAR](eofErrorP = true, eofValue = NIL, recursiveP = false) {
        if(this._position === this._input.length) {
            if(eofErrorP)
                throw "End of file";
            return eofValue;
        }
        return new LispChar(this._input[this._position]);
    }

    [UNREAD_CHAR](character) {   
        if(this.unread)
            throw "Already unread a character";
        if(character.value !== this._input[this._position-1])
            throw "Unread character "+character.value+", but previous read character was "+this._input[this._position-1];
        this.unread = character;
    }
}

export class StringOutputStream extends Stream {
    constructor() {
        super();
    }

    outputString = "";

    [OUTPUT_STREAM] = this;
    [WRITE_CHAR](character) {
        if(characterp(character))
            this.outputString += character.value;
        else if(typeof character === "string")
            this.outputString += character[0];
    }
    [FRESH_LINE]() {
        if(this.outputString[this.outputString.length-1] === '\n')
            return;
        writeChar("\n", this);
    }
}

// input-stream-p
export function inputStreamP(s) {
    if(!streamp(s))
        throw "Type Error"
    return !!s[INPUT_STREAM];
};

// output-stream-p
export function outputStreamP(s) {
    if(!streamp(s))
        throw "Type Error"
    return !!s[OUTPUT_STREAM];
}

// interactive-stream-p

// streamp
export function streamp(s) {
    return s instanceof Stream;
};

// open-stream-p
export function openStreamP(stream) {
    if(!streamp(stream))
        throw "Type Error"
    return stream[IS_OPEN];
}

// stream-element-type stream

// read-byte stream &optional eof-error-p eof-value
// write-byte byte stream

// peek-char &optional peek-type input-stream eof-error-p eof-value recursive-p
export function peekChar(inputStream, eofErrorP = true, eofValue = NIL, recursiveP = false) {
    return inputStream[PEEK_CHAR](eofErrorP, eofValue, recursiveP);
}

// read-char &optional input-stream eof-error-p eof-value recursive-p
export function readChar(inputStream, eofErrorP = true, eofValue = NIL, recursiveP = false) {
    return inputStream[READ_CHAR](eofErrorP, eofValue, recursiveP);
}

// read-char-no-hang &optional input-stream eof-error-p eof-value recursive-p

// terpri &optional output-stream
export function terpri(outputStream) {
    return writeChar(new LispChar("\n"), outputStream);
}

// fresh-line &optional output-stream
export function freshLine(outputStream) {
    return outputStream[FRESH_LINE]();
}

// unread-char character &optional input-stream
export function unreadChar(character, inputStream) {
    return inputStream[UNREAD_CHAR](character);
}

// write-char character &optional output-stream
export function writeChar(character, outputStream) {
    return outputStream[WRITE_CHAR](character);
}

// read-line &optional input-stream eof-error-p eof-value recursive-p
export function readLine(inputStream, eofErrorP = true, eofValue = NIL, recursiveP = false) {
    let str = "";
    for(;;) {
        let ch = readChar(inputStream, eofErrorP, eofValue, recursiveP);
        if(ch === eofValue)
            return str;
        if(ch instanceof LispChar) {
            if(ch.value === '\n')
                return str;
            str += ch.value;
            continue;
        }
        return str;
    }
}

// write-string string &optional output-stream &key start end
export function writeString(string, outputStream) {
    if(typeof string === "string") {
        for(let i=0; i<string.length; i++)
            writeChar(string[i], outputStream);
    } else
        throw "Type error";
}

// write-line string &optional output-stream &key start end
export function writeLine(string, outputStream) {
    writeString(string, outputStream);
    terpri(string);
}

// read-sequence
// write-sequence

// file-length
// file-position
// file-string-length

// open
// stream-external-format
// close
// listen

// clear-input
// finish-output
// force-output
// clear-output

// y-or-n-p
// yes-or-no-p

// make-synonym-stream
// synonym-stream-symbol

// broadcast-stream-streams
// make-broadcast-stream

// make-two-way-stream
// two-way-stream-input-stream
// two-way-stream-output-stream

// echo-stream-input-stream
// echo-stream-output-stream
// make-echo-stream

// concatenated-stream-streams
// make-concatenated-stream

// get-output-stream-string
export function getOutputStreamString(stream) {
    if(!(stream instanceof StringOutputStream))
        throw "Type error";
    return stream.outputString;
}

// make-string-input-stream
export function makeStringInputStream(string, start = 0, end = string.length) {
    return new StringInputStream(string.substring(start, end));
}

// make-string-output-stream &optional element-type
export function makeStringOutputStream(elementType = "character") {
    // TODO: &optional element-type
    return new StringOutputStream;
}

// stream-error-stream

// *debug-io*
// *error-output*
// *query-io*
// *standard-input*
// *standard-output*
// *trace-output*
// *terminal-io*
