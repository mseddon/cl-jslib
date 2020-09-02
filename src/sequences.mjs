// copy-seq
export const COPY_SEQ = Symbol("copy-seq");
export function copySeq(sequence) {
    if(sequence && sequence[COPY_SEQ])
        return sequence[COPY_SEQ](sequence);
    throw "Type error";
}

// elt
export const ELT = Symbol("elt");
export function elt(sequence, index) {
    if(sequence && sequence[ELT])
        return sequence[ELT](sequence, index);
    throw "Type error";
}

// fill
// make-sequence

// subseq
// map
// map-into
// reduce

// count
// count-if
// count-if-not

// length
export const LENGTH = Symbol("length");
export function length(sequence) {
    if(sequence && sequence[LENGTH])
        return sequence[LENGTH](sequence);
    throw "Type error"
}

// reverse
export const REVERSE = Symbol("reverse");
export function reverse(sequence) {
    if(sequence && sequence[REVERSE])
        return sequence[REVERSE](sequence);
    throw "Type error"
}

// nreverse
// sort
// stable-sort
// find
// find-if
// find-if-not
// position
// position-if
// position-if-not
// search
// mismatch
// replace
// substitute
// substitute-if
// substitute-if-not
// nsubstitute
// nsubstitute-if
// nsubstitute-if-not
// concatenate
// merge
// remove
// remove-if
// remove-if-not
// delete
// delete-if
// delete-if-not
// remove-duplicates
// delete-duplicates
