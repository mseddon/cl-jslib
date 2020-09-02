import * as sequences from "./sequences.mjs"
import { EQUAL, eql, equal } from "./equal.mjs";

export class Nil {
    toString() { return "NIL" }
}

export const NIL = new Nil();

export class Cons {
    constructor(car, cdr) {
        this.car = car;
        this.cdr = cdr;
    }

    [EQUAL](y) {
        if(consp(y) && equal(car(this), car(this)) && equal(cdr(this), cdr(y)))
            return true; // TODO: silly stack usage- make iterative later.
        return false;
    }

    toString() {
        let out = "(";
        let e = this;
        do {
            out += e.car;
            e = cdr(e);
            if(!nullp(e))
                out += " ";
        } while(consp(e));

        if(!consp(e) && !nullp(e)) {
            out += ". ";
            out += e;
        }
        return out+")";
    }
}

// cons
export function cons(a, b) {
    return new Cons(a, b);
}

// consp
export function consp(a) {
    return a instanceof Cons;
}

// atom
export function atom(a) {
    return !consp(a); 
}

// car
export function car(x) {
    if(nullp(x)) return x;
    if(consp(x)) return x.car;
    throw new Error("Type error");
}

// cdr
export function cdr(x) {
    if(nullp(x)) return NIL;
    if(consp(x)) return x.cdr;
    throw new Error("Type error");
}

// caar
export const caar = x => car(car(x));

// cadr
export const cadr = x => car(cdr(x));

// cdar
export const cdar = x => cdr(car(x));

// cddr
export const cddr = x => cdr(cdr(x));

// caaar
export const caaar = x => car(car(car(x)));

// caadr
export const caadr = x => car(car(cdr(x)));

// cadar
export const cadar = x => car(cdr(car(x)));

// caddr
export const caddr = x => car(cdr(cdr(x)));

// cdaar
export const cdaar = x => cdr(car(car(x)));

// cdadr
export const cdadr = x => cdr(car(cdr(x)));

// cddar
export const cddar = x => cdr(cdr(car(x)));

// cdddr
export const cdddr = x => cdr(cdr(cdr(x)));

// caaaar
export const caaaar = x => car(car(car(car(x))));

// caaadr
export const caaadr = x => car(car(car(cdr(x))));

// caadar
export const caadar = x => car(car(cdr(car(x))));

// caaddr
export const caaddr = x => car(car(cdr(cdr(x))));

// cadaar
export const cadaar = x => car(cdr(car(car(x))));

// cadadr
export const cadadr = x => car(cdr(car(cdr(x))));

// caddar
export const caddar = x => car(cdr(cdr(car(x))));

// cadddr
export const cadddr = x => car(cdr(cdr(cdr(x))));

// cdaaar
export const cdaaar = x => cdr(car(car(car(x))));

// cdaadr
export const cdaadr = x => cdr(car(car(cdr(x))));

// cdadar
export const cdadar = x => cdr(car(cdr(car(x))));

// cdaddr
export const cdaddr = x => cdr(car(cdr(cdr(x))));

// cddaar
export const cddaar = x => cdr(cdr(car(car(x))));

// cddadr
export const cddadr = x => cdr(cdr(car(cdr(x))));

// cdddar
export const cdddar = x => cdr(cdr(cdr(car(x))));

// cddddr
export const cddddr = x => cdr(cdr(cdr(cdr(x))));

// rplaca
export function rplaca(x, v) {
    if(!consp(x))
        throw "Type Error";
    x.car = v;
    return x;
}

// rplacd
export function rplacd(x, v) {
    if(!consp(x))
        throw "Type Error";
    x.cdr = v;
    return x;
}

// copy-tree
export function copyTree(x) {
    if(consp(x)) {
        let sentinel = list(NIL);
        let last = sentinel;
        while(consp(x)) {
            last = last.cdr = cons(copyTree(car(x)), NIL);
            x = cdr(x);
        }
        return sentinel.cdr;
    }
    return x;
}

// sublis
export function sublis(alist, tree) {
    // TODO: &key key test test-not
    if(consp(tree))
        return cons(sublis(alist, car(tree)), sublis(alist, cdr(tree))); // TODO: Please iterate this. It's embarassing.
    let res = assoc(tree, alist);
    if(!nullp(res))
        return cdr(res);
    return tree;
}

// nsublis
export function nsublis(alist, tree) {
    // TODO: &key key test test-not
    if(consp(tree)) {
        tree.car = sublis(alist, car(tree));
        tree.cdr = sublis(alist, cdr(tree));
        return tree;
    }
    let res = assoc(tree, alist);
    if(!nullp(res))
        return cdr(res);
    return tree;
}

// subst
export const subst = (newObj, oldObj, tree) => {
    // TODO: &key key test test-not
    if(consp(tree))
        return cons(subst(newObj, oldObj, car(tree)), subst(newObj, oldObj, cdr(tree))); // TODO: Please iterate this. It's embarassing.
    if(eql(tree, oldObj))
        return newObj;
    return tree;
}
// subst-if
// subst-if-not

// nsubst
export const nsubst = (newObj, oldObj, tree) => {
    // TODO: &key key test test-not
    if(consp(tree)) {
        tree.car = nsubst(newObj, oldObj, car(tree));
        tree.cdr = nsubst(newObj, oldObj, cdr(tree)); // TODO: Please iterate this. It's embarassing.
    }
    if(eql(tree, oldObj))
        return newObj;
    return tree;
}
// nsubst-if
// nsubst-if-not

// tree-equal

// copy-list
export const copyList = x => list.apply(null, x);

// list
export function list(...x) {
    let head = NIL;
    for(let i=x.length-1; i>=0; i--) {
        head = cons(x[i], head);
    }
    return head;
}

// list*
export function listX(...x) {
    let head = x[x.length-1];
    for(let i=x.length-2; i>=0; i--)
        head = cons(x[i], head);
    return head;
}

// list-length
export function listLength(list) {
    if(consp(list)) {
        let slow = list;
        let fast = cdr(list);
        let length = 1;

        for(;;) {
            if(slow === fast)
                return NIL; // circular list.
            if(consp(fast)) {
                fast = cdr(fast);
                if(consp(fast)) {
                    fast = cdr(fast);
                    slow = cdr(slow);
                    length += 2;
                } else if(nullp(fast))
                    return 1+length;
                throw "Not a proper or circular list";
            } else if(nullp(fast))
                return length;
            else
                throw "Not a proper or circular list";
        }
    } else if(nullp(list))
        return 0;
    else
        throw "Not a proper or circular list";
}

// listp
export const listp = x => x === NIL || x instanceof Cons;

// make-list
export function makeList(size, initialElement = NIL) {
    let head = NIL;
    while(size-- >= 0)
        head = cons(initialElement, head);
    return head;
}

// first
export const first = x => car(x);

// second
export const second = x => cadr(x);

// third
export const third = x => caddr(x);

// fourth
export const fourth = x => cadddr(x);

// fifth
export const fifth = x => car(cddddr(x));

// sixth
export const sixth = x => cadr(cddddr(x));

// seventh
export const seventh = x => caddr(cddddr(x));

// eighth
export const eighth = x => cadddr(cddddr(x));

// ninth
export const ninth = x => car(cddddr(cddddr(x)));

// tenth
export const tenth = x => cadr(cddddr(cddddr(x)));

// nthcdr
export function nthcdr(n, list) {
    if(typeof n !== "number" || n < 0)
        throw "Must be non-negative integer";
    while(n !== 0 && !atom(list)) {
        list = cdr(list);
        n--;
    }
    if(!listp(list))
        throw "Must be a list";
    return list;
}

// nth
export const nth = (n, list) => car(nthcdr(n, list));

// endp
export function endp(x) {
    if(!listp(x))
        throw "Type Error";
    return nullp(x);
}

// null
export function nullp(x) { return x === NIL; }

// nconc
export function nconc(...lists) {
    if(!lists.length)
        return NIL;
    let sentinel = list(NIL);
    let last = sentinel;
    for(let i=0; i<lists.length-1; i++) {
        let lst = lists[i];
        for(;;) {
            if(consp(lst)) {
                last.cdr = lst;
                last = lst;
                lst = cdr(lst);
                while(consp(lst)) {
                    last = lst;
                    lst = cdr(lst);
                }
                continue;
            } else if(nullp(lst))
                break;
            throw "Error - must be proper list"
        }
    }
    last.cdr = lists[lists.length-1];
    return sentinel.cdr;
}

// append
export function append(...lists) {
    if(!lists.length)
        return NIL;
    let sentinel = list(NIL);
    let last = sentinel;
    for(let i=0; i<lists.length-1; i++) {
        let lst = lists[i];
        for(;;) {
            if(consp(lst)) {
                last.cdr = list(car(lst));
                last = last.cdr;
                lst  = cdr(lst);
                continue;
            } else if(nullp(lst))
                break;
            throw "Error - must be proper list"
        }
    }
    last.cdr = lists[lists.length-1];
    return sentinel.cdr;
}

// butlast
export function butlast(lst, n = 1) {
    let tail = lst;
    while(n-- > 0)
        tail = cdr(tail);

    let fast = cdr(lst);
    let sentinel = list(NIL);
    let last = sentinel;
    while(consp(tail)) {
        if(fast === list)
            throw "Cyclic list";
        last = last.cdr = cons(car(lst), NIL);

        lst = cdr(lst);
        tail = cdr(tail);
    }
    return sentinel.cdr;
}

// nbutlast
export function nbutlast(lst, n = 1) {
    let head = lst;
    let tail = lst;
    while(n-- > 0)
        tail = cdr(tail);

    let fast = cdr(lst);
    while(consp(tail) && consp(cdr(tail))) {
        if(fast === list)
            throw "Cyclic list";

        lst = cdr(lst);
        tail = cdr(tail);
    }
    rplacd(lst, NIL);
    return head;
}

// last
export function last(x) {
    while(x instanceof Cons)
        x = cdr(x);
    return car(x);
}


// ldiff
export function ldiff(list, object) {
    if(eql(list, object) || atom(list))
        return NIL;
    let result = list(car(list));
    let current = result;
    let remaining = cdr(list);
    while(!(eql(remaining, object) || atom(remaining))) {
        current.cdr = list(car(remaining));
        current = cdr(current);
        remaining = cdr(remaining);
    }
    if(eql(remaining, object))
        return result;
    current.cdr = remaining;
    return result;
}

// tailp
export function tailp(list, object) {
    for(let rest = list; !atom(rest); rest = cdr(rest))
        if(eql(object, rest))
            return true;
    return equal(object, rest);
}

// rest
export function rest(x) { return cdr(x); }

// member
export function member(item, list) {
    // &key key test test-not
    let fast;
    if(consp(list))
        fast = cdr(list);
    while(consp(list)) {
        if(fast === list)
            throw "Cyclic list";
        if(eql(item, car(list)))
            return list;
        list = cdr(list);
        fast = cddr(fast);
    }
    if(!nullp(list))
        throw "Not a proper list";
    return false;
}
// member-if
// member-if-not

// mapc
export function mapc(fn, ...lists) {
    let list1 = lists[0];
    let fasts = lists.map(cdr);
    let args = Array(lists.length);
    
    while(lists.every(consp)) {
        for(let i=0; i<lists.length; i++) {
            if(lists[i] === fasts[i])
                throw "Cyclic list"

            args[i] = car(lists[i]);
            fasts[i] = cddr(fasts[i]);
            lists[i] = cdr(lists[i]);
        }

        fn.apply(null, args);
    }

    return list1;
}

// mapcar
export function mapcar(fn, ...lists) {
    let fasts = lists.map(cdr);

    let args = Array(lists.length);
    
    let sentinel = list(NIL);
    let last = sentinel;
    while(lists.every(consp)) {
        for(let i=0; i<lists.length; i++) {
            if(lists[i] === fasts[i])
                throw "Cyclic list"

            args[i] = car(lists[i]);
            fasts[i] = cddr(fasts[i]);
            lists[i] = cdr(lists[i]);
        }

        last = last.cdr = cons(fn.apply(null, args), NIL);
    }

    return sentinel.cdr;
}

// mapcan
export function mapcan(fn, ...lists) {
    let fasts = lists.map(cdr);

    let args = Array(lists.length);
    
    let sentinel = list(NIL);
    let last = sentinel;
    while(lists.every(consp)) {
        for(let i=0; i<lists.length; i++) {
            if(lists[i] === fasts[i])
                throw "Cyclic list"

            args[i] = car(lists[i]);
            fasts[i] = cddr(fasts[i]);
            lists[i] = cdr(lists[i]);
        }

        let res = fn.apply(null, args);
        while(consp(res)) {
            last = last.cdr = cons(car(res), NIL);
            res = cdr(res);
        }
    }

    return sentinel.cdr;
}
// mapl
// maplist
// mapcon

// acons
export const acons = (a,b,c) => cons(cons(a, b), c);

// assoc
export const assoc = (item, alist) => {
    // &key key test test-not
    while(consp(alist)) {
        if(!consp(car(alist)))
            throw "Not an alist";
        if(eql(caar(alist), item))
            return car(alist);
        alist = cdr(alist);
    }
    return false;
}
// assoc-if
// assoc-if-not

// copy-alist
export function copyAlist(alist) {
    let sentinel = list(NIL);
    let last = sentinel;
    while(consp(alist)) {
        last = last.cdr = cons(copyList(car(alist)), NIL);
        alist = cdr(alist);
    }
    return sentinel.cdr;
}

// pairlis
export function pairlis(keys, data, alist = NIL) {
    if(nullp(keys) || nullp(data))
        return alist;
    let sentinel = list(NIL)
    let last = sentinel;
    let fastKeys = cdr(keys);
    let fastData = cdr(data);

    while(consp(keys) && consp(data)) {
        if(fastData == data || fastKeys == keys)
            throw "Cyclic list";        
        if(nullp(keys) || nullp(data))
            break;
        last.cdr = list(cons(car(keys), car(data)));
        last = last.cdr;

        fastData = cddr(fastData);
        fastKeys = cddr(fastKeys);
        keys = cdr(keys);
        data = cdr(data);
    }
    if(!nullp(keys) || !nullp(data))
        throw "Not a proper list";
    last.cdr = alist;
    return cdr(sentinel);
}

// rassoc
export const rassoc = (item, alist) => {
    // TODO: &key key test test-not
    while(consp(alist)) {
        if(!consp(car(alist)))
            throw "Not an alist";
        if(eql(cdar(alist), item))
            return car(alist);
        alist = cdr(alist);
    }
    return false;
}
// rassoc-if
// rassoc-if-not

// get-properties
// getf
// remf

// intersection
export function intersection(list1, list2) {
    // &key key test test-not
    let sentinel = list(NIL);
    let last = sentinel;
    for(let e = list1; consp(e); e = cdr(e))
        if(member(car(e), list2))
            last = last.cdr = cons(car(e), NIL);
    return sentinel.cdr;
}
// nintersection

// set-difference
export function setDifference(list1, list2) {
    // &key key test test-not
    let sentinel = list(NIL);
    let last = sentinel;
    for(let e = list1; consp(e); e = cdr(e))
        if(!member(car(e), list2))
            last = last.cdr = cons(car(e), NIL);
    return sentinel.cdr;
}
// nset-difference

// set-exclusive-or
// nset-exclusive-or

// union
export function union(list1, list2) {
    // &key key test test-not
    let sentinel = list(NIL);
    let last = sentinel;
    for(let e = list1; consp(e); e = cdr(e))
        if(!member(car(e), cdr(sentinel)))
            last = last.cdr = cons(car(e), NIL);
    for(let e = list2; consp(e); e = cdr(e))
        if(!member(car(e), cdr(sentinel)))
            last = last.cdr = cons(car(e), NIL);
    return sentinel.cdr;
}
// nunion

// subsetp

/** SEQUENCE IMPLEMENTATIONS */

// copy-seq
Cons.prototype[sequences.COPY_SEQ] = Nil.prototype[sequences.COPY_SEQ] = copyList;

// elt
Cons.prototype[sequences.ELT] = Nil.prototype[sequences.ELT] = nth;

// length
Cons.prototype[sequences.LENGTH] = Nil.prototype[sequences.LENGTH] = x => {
    let res = listLength(x);
    if(res === NIL)
        throw "Cyclic list";
}
Nil.prototype[sequences.LENGTH] = x => 0;

// reverse
Cons.prototype[sequences.REVERSE] = Nil.prototype[sequences.REVERSE] = x => {
    if(nullp(x))
        return x;
    if(consp(x)) {
        let head = cons(car(x), NIL);
        x = cdr(x);
        while(consp(x)) {
            head = cons(car(x), head);
            x = cdr(x);
        }
        if(x !== NIL)
            throw "Not a proper list";
        return head;
    }
    throw "Type error";
}