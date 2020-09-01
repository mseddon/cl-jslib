export const EQUAL = Symbol("equal");
export const EQUALP = Symbol("equalp");

export const eq=(x, y) => x === y;
export const eql=(x, y) => x === y;
export const equal=(x,y) => (x && x[EQUAL] && x[EQUAL](y)) || eql(x, y);
export const equalp=(x,y) => (x && x[EQUALP] && x[EQUALP](y)) || equal(x, y);