export const PRINT_OBJECT = Symbol("print-object");

export function printObject(object, outputStream) {
    if(object !== undefined && object !== null && object[PRINT_OBJECT])
        return object[PRINT_OBJECT](object, outputStream);
    throw "No applicable method for print-object";
}