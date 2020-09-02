import { consp, cons, car, cdr, list, listp, copyList, NIL} from "./conses.mjs";

/** PACKAGES */
const packageNames = new Map();

export class Package {
    constructor(name, nicknames = []) {
        this.name = name;
        if(packageNames.has(name))
            throw "Package name in use "+name;
        packageNames.set(name, this);
        for(let i=0; i<nicknames.length; i++) {
            if(packageNames.has(nicknames[i]))
                throw "Package name in use "+nicknames[i];
            packageNames.set(nicknames[i], this);
        }

        this.nicknames = nicknames;
        this.internalSymbols = {};
        this.externalSymbols = {};
        this.useList = [];
        this.usedByList = [];
        this.shadowingSymbols = new Set();
    }

    toString() {
        return "#<PACKAGE "+this.name+">";
    }
}

// This is dumb. Make this swappable later for multi environment.
export const CL_PACKAGE = new Package("COMMON-LISP", ["CL"]);
export const KEYWORD_PACKAGE = new Package("KEYWORD", []);

// export
export function $export(symbols, pckage = CURRENT_PACKAGE) {
    if(!listp(symbols))
        symbols = list(symbols);
    
    for(let x = symbols; consp(x); x = cdr(x)) {
        let s = findSymbol(car(x), pckage);
        if(!s)
            throw "Symbol "+car(x)+" Not accessible";
        pckage.externalSymbols[s.name] = s;
    }
}

// find-symbol
export function findSymbol(string, pckage = CURRENT_PACKAGE) {
    // TODO coerce to js string.
    // TODO return 2nd return value :INTERNAL or :EXTERNAL

    let res = pckage.externalSymbols[string];
    if(res)
        return res; // :EXTERNAL

    res = pckage.internalSymbols[string];
    if(res)
        return res; // :INTERNAL

    for(let x of pckage.useList)
        if(x.externalSymbols[string])
            return x.externalSymbols[string];
}

// find-package
export function findPackage(name) {
    return packageNames.get(name);
}

// find-all-symbols
// import

// list-all-packages
export function listAllPackages() {
    let head = NIL;
    for(let p of new Set(packageNames.values()))
        head = cons(p, head);
    return head;
}

// rename-package
// shadowing-import
// delete-package
// make-package

// unexport
export function unexport(symbols, pckage = CURRENT_PACKAGE) {
    if(!listp(symbols))
        symbols = list(symbols);
    
    for(let x = symbols; consp(x); x = cdr(x)) {
        let s = findSymbol(car(x), pckage);
        if(!s)
            throw "Symbol "+car(x)+" Not accessible";
        delete this.externalSymbols[s.name];
    }
}

// unintern
export function unintern(symbols, pckage = CURRENT_PACKAGE) {
    if(!listp(symbols))
        symbols = list(symbols);
    
    for(let x = symbols; consp(x); x = cdr(x)) {
        let s = findSymbol(car(x), pckage);
        if(s) {
            delete this.internalSymbols[s.name];
            delete this.externalSymbols[s.name];
            if(s.pckage === pckage)
                s.pckage = null;
        }
    }
}

// unuse-package
export function unusePackage(packagesToUnuse, pckage = CURRENT_PACKAGE) {
    if(!listp(packagesToUnuse))
        packagesToUnuse = list(packagesToUnuse);
    
    for(let x = packagesToUnuse; consp(x); x = cdr(x)) {
        let s = car(x);
        if(s instanceof Symbol)
            s = s.name;
        s = findPackage(s);
        if(s) {
            pckage.useList.splice(pckage.useList.indexOf(s) >>> 0, 1);
            s.usedByList.splice(s.usedByList.indexOf(s)  >>> 0, 1);
        }
    }
}

// use-package
export function usePackage(packagesToUse, pckage = CURRENT_PACKAGE) {
    if(!listp(packagesToUse))
        packagesToUse = list(packagesToUse);
    
    for(let x = packagesToUse; consp(x); x = cdr(x)) {
        let s = car(x);
        if(s instanceof Symbol)
            s = s.name;
        s = findPackage(s);
        if(s) {
            // TODO: ensure we aren't stupid.
            pckage.useList.push(s);
            s.usedByList.push(pckage);
        } else
            throw "Not a package "+car(x);
    }
}

// intern
export function intern(str, pckage=CURRENT_PACKAGE) {
    if(typeof str == "string") {
        let sym = findSymbol(str, pckage);
        if(!sym)
            return pckage.internalSymbols[str] = new Sym(str, pckage);
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
export function packageShadowingSymbols(pckage) {
    return list.apply(null, Array.from(pckage.shadowingSymbols));
}

// package-use-list
export function packageUseList(pckage) {
    if(!packagep(pckage))
        throw "Type Error";
    return list.apply(null, pckage.packageUseList);    
}

// package-used-by-list
export function packageUsedByList(pckage) {
    if(!packagep(pckage))
        throw "Type Error";
    return list.apply(null, pckage.packageUsedByList);
}

// packagep
export function packagep(x) {
    return x instanceof Package;
}

// *package*
export let CURRENT_PACKAGE = new Package("COMMON-LISP-USER", ["CL-USER"]);


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

// symbol-function
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