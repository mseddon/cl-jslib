import { consp, cons, car, cdr, list, listp, copyList, NIL} from "./conses.mjs";
import { lispInstance } from "./lisp-instance.mjs"

/** PACKAGES */
export class Package {
    constructor(name, nicknames = []) {
        this.name = name;
        if(lispInstance.packageNames.has(name))
            throw "Package name in use "+name;
        lispInstance.packageNames.set(name, this);
        for(let i=0; i<nicknames.length; i++) {
            if(lispInstance.packageNames.has(nicknames[i]))
                throw "Package name in use "+nicknames[i];
                lispInstance.packageNames.set(nicknames[i], this);
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

// export
export function $export(symbols, pckage = lispInstance.PACKAGE) {
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
export function findSymbol(string, pckage = lispInstance.PACKAGE) {
    if(string instanceof Sym)
        string = string.name; // symbol->string
    
    let res = pckage.externalSymbols[string];
    if(res) {
        if(lispInstance.wantMV > 1)
            lispInstance.values = [lispInstance.KEYWORD_PACKAGE.intern("EXTERNAL")];
        return res;
    }

    res = pckage.internalSymbols[string];
    if(res) {
        if(lispInstance.wantMV > 1)
            lispInstance.values = [lispInstance.KEYWORD_PACKAGE.intern("INTERNAL")];
        return res;
    }

    for(let x of pckage.useList)
        if(x.externalSymbols[string]) {
            if(lispInstance.wantMV > 1)
                lispInstance.values = [lispInstance.KEYWORD_PACKAGE.intern("INHERIT")];
            return x.externalSymbols[string];
        }
}

// find-package
export function findPackage(name) {
    return lispInstance.packageNames.get(name);
}

// find-all-symbols
// import

// list-all-packages
export function listAllPackages() {
    let head = NIL;
    for(let p of new Set(lispInstance.packageNames.values()))
        head = cons(p, head);
    return head;
}

// rename-package
// shadowing-import
// delete-package
// make-package

// unexport
export function unexport(symbols, pckage = lispInstance.PACKAGE) {
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
export function unintern(symbols, pckage = lispInstance.PACKAGE) {
    if(!listp(symbols))
        symbols = list(symbols);
    
    for(let x = symbols; consp(x); x = cdr(x)) {
        let s = findSymbol(car(x), pckage);
        if(s) {
            delete this.internalSymbols[s.name];
            delete this.externalSymbols[s.name];
            if(s.pckage === pckage) {
                s.pckage = null;
                delete s.kw;
            }
        }
    }
}

// unuse-package
export function unusePackage(packagesToUnuse, pckage = lispInstance.PACKAGE) {
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
export function usePackage(packagesToUse, pckage = lispInstance.PACKAGE) {
    if(!listp(packagesToUse))
        packagesToUse = list(packagesToUse);
    
    for(let x = packagesToUse; consp(x); x = cdr(x)) {
        let s = car(x);
        if(s instanceof Sym)
            s = s.name;
        if(typeof s === "string")
            s = findPackage(s);
        if(s instanceof Package) {
            // TODO: ensure we aren't stupid.
            pckage.useList.push(s);
            s.usedByList.push(pckage);
        } else
            throw "Not a package "+car(x);
    }
}

// intern
export function intern(str, pckage=lispInstance.PACKAGE) {
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

// package-error
// package-error-package

/** SYMBOLS */
export class Sym {
    constructor(name, pckage) {
        this.name = name;
        this.pckage = pckage;
        if(this.pckage && this.pckage.name === "KEYWORD")
            this.kw = true;
        
        this.plist = null;
    }

    toString() {
        if(!this.pckage)
            return "#:"+this.name;

        if(keywordp(this))
            return ":"+this.name;

        if(this.pckage === lispInstance.PACKAGE)
            return this.name;

        if(this.pckage && this.pckage.externalSymbols[this.name])
            return this.pckage.name+":"+this.name;
        return this.pckage.name+"::"+this.name;
    }
}

// symbolp
export function symbolp(x) {
    return x instanceof Sym;
}

// keywordp
export function keywordp(x) {
    return symbolp(x) && x.kw;
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
export function gentemp(prefix = "T", pckage = lispInstance.PACKAGE) {
    return new intern(prefix+(gensymCounter++), pckage);
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