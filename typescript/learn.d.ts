// ts工具类型学习
// 源码解析
type myPick<T, K extends keyof T> = {
    [P in K]: T[P];
};
type myPartial<T> = {
    [P in keyof T]?: T[P];
};
type myRecord<T, K> = {
    [P in keyof T]: k;
};
type myReadonly<T> = {
    readonly [p in keyof T]: T[p];
};
type myExclude<T, K> = T extends K ? never : T;
type myExtract<T, K> = T extends K ? T : never;
type myOmit<T, K> = myPick<T, myExclude<keyof T, K>>
type myParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type myReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer P ? P : any;
type myConstructor<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;

type A = {
    a: string;
    b: string;

}
type B = {
    b: string;
}
type c = myOmit<A, 'b'>
type d = Omit<A, 'b'>
type fnt = (b: string, c: number) => any;
function fn(b: string, c: number) {

}
class aClass {
    constructor(d: number, e: string) {

    }
}
type e = myParameters<fnt>;
type e1 = Parameters<fn>;