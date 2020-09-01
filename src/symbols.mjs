import {consp, cdr, list, copyList} from "./conses.mjs";

/** PACKAGES */
const packageNames = new Map();

export class Package {
    constructor(name, nicknames = []) {
        this.name = name;
        if(packageNames.has(name))
            throw "Package name in use "+name;
        packageNames.set(name, this);
        for(let i=0; i<nicknames; i++) {
            if(packageNames.has(nicknames[i]))
                throw "Package name in use "+nicknames[i];
            packageNames.add(nicknames[i], this);
        }
        this.nicknames = nicknames;
        this.internalSymbols = {};
        this.externalSymbols = {};
    }
}

// This is dumb. Make this swappable later for multi environment.
export const CL_PACKAGE = new Package("COMMON-LISP", ["CL"]);
export const KEYWORD_PACKAGE = new Package("KEYWORD", []);

export let CURRENT_PACKAGE = new Package("COMMON-LISP-USER", ["CL-USER"]);

// export

// find-symbol
export function findSymbol(string, pckage = CURRENT_PACKAGE) {
    // TODO coerce to js string.
    // TODO return 2nd return value :INTERNAL or :EXTERNAL

    let res = pckage.internalSymbols[string];
    if(res)
        return res;
    res = pckage.externalSymbols[string];
    if(res)
        return res;
}

// find-package
export function findPackage(name) {
    return packageNames.get(name);
}

// find-all-symbols
// import
// list-all-packages
// rename-package
// shadowing-import
// delete-package
// make-package

// unexport
// unintern

// in-package

// unuse-package
// use-package

export function intern(str, pckage=CURRENT_PACKAGE) {
    if(typeof str == "string") {
        let sym = findSymbol(str, pckage);
        if(!sym) {
            return pckage.internalSymbols[sym.name] = new Sym(str, pckage);
        }
        return sym;
    } else
        throw "Not a symbol";
}

// package-name
export function packageName(x) {
    if(!(x instanceof Package))
        throw "Type Error!";
    return x.name;
}

// package-nicknames
export function packageNicknames(pckage) {
    if(!packagep(pckage))
        throw "Type Error";
    return list.apply(null, pckage.nicknames);
}

// package-shadowing-symbols
// package-use-list
// package-used-by-list

export function packagep(x) {
    return x instanceof Package;
}

// *package* (CURRENT_PACKAGE)

// package-error
// package-error-package


/** SYMBOLS */
export class Sym {
    constructor(name, pckage) {
        this.name = name;
        this.pckage = pckage;
        this.plist = null;
    }
}

// symbolp
export function symbolp(x) {
    return x instanceof Sym;
}

// keywordp
export function keywordp(x) {
    return x instanceof Sym && x.pckage === KEYWORD_PACKAGE;
}

// make-symbol
export function makeSymbol(name) {
    return new Sym(name, null);
}

// copy-symbol
export function copySymbol(symbol, copyProperties = false) {
    let out = new Sym(symbol.name);
    if(copyProperties)
        out.plist = copyList(symbol.plist);
}

// gensym
export function gensym(x = "G") {
    return makeSymbol(x+(gensymCounter++));
}

// *gensym-counter*
export let gensymCounter = 0;

// gentemp
export function gentemp(prefix = "T", pckage = CURRENT_PACKAGE) {
    return new pckage.intern(prefix+(gensymCounter++));
}

export function symbolFunction(x) {
    if(!symbolp(x))
        throw "Type Error";
    return x.value;
}

// symbol-name
export function symbolName(x) {
    if(!symbolp(x))
        throw "Type Error";
    return x.name; // TODO: as LispString
}

// symbol-package
export function symbolPackage(x) {
    if(!symbolp(x))
        throw "Type Error";
    return x.pckage;
}

// symbol-plist
export function symbolPlist(x) {
    if(!symbolp(x))
        throw "Type Error";
    return x.plist;
}

// symbol-value
export function symbolValue(x) {
    if(!symbolp(x))
        throw "Type Error";
    return x.value;
}

// get
// remprop
// boundp
// makunbound
// set