// 实用工具类型

/**
 * @desc 示例类型
 */
type TypeA = {
    a: string;
    b: string;
}

type TypeB = {
    b: string;
    c: string;
}

/**
 * @desc 获取没有同时存在于T和U内联合string字面量类型。
 */
type SymmetricDifferenceByKey<T extends string, U extends string> = Exclude<T | U, T & U>

/**
 * @example type SN = "1" | "4"
 */
type SN = SymmetricDifferenceByKey<'1' | '2' | '3', '2' | '3' | '4'>

/**
 * @desc 获取没有同时存在于T和U内的类型。
 */
type mySymmetricDifference<T, U> = {
    [P in (Exclude<keyof T | keyof U, keyof T & keyof U>)]: P extends keyof T ? T[P] : U[P]
}
/**
 * @example 
 * type mSD = {
    a: string;
    c: string;
}
 */
type mSD = mySymmetricDifference<TypeA, TypeB>

// ========================================
/**
 * @desc NonUndefined判断T是否为undefined
 */
type NonUndefined<T> = T extends undefined ? never : T;
/**
 * @desc 获取T中所有类型为函数的key组成的联合类型。
 * 
 */
type FunctionKeys<T extends object> = {
    [P in keyof T]: NonUndefined<T[P]> extends Function ? P : never;
}[keyof T]

type AType = {
    a: () => void;
    b: string;
    c: number;
    d: Function
}
/**
 * @desc type mFK = "a" | "d"
 * 如果没有FunctionKeys最后的[keyof T]拿到的是
 * type mFK = {
    a: "a";
    b: never;
    c: never;
    d: "d";
}通过[keyof T]循环遍历获取到value
 */
type mFK = FunctionKeys<AType>

type Primitive =
    | string
    | number
    | bigint
    | boolean
    | symbol
    | null
    | undefined;

/**
 * @desc 用于创建获取指定类型工具的类型工厂
 * @param T 待提取的类型
 * @param P 要创建的类型
 * @param IsCheckNon 是否要进行null和undefined检查
 */
type KeysFactory<T, P extends Primitive | Function | object, IsCheckNon extends boolean> = {
    [K in keyof T]: IsCheckNon extends true
    ? (NonUndefined<T[K]> extends P ? K : never)
    : (T[K] extends P ? K : never);
}[keyof T];

/**
 * @example
 * 例如上述KeysFactory就可以通过工厂类型进行创建了
 */
type FunctionKeys<T> = KeysFactory<T, Function, true>;
type StringKeys<T> = KeysFactory<T, string, true>;
type NumberKeys<T> = KeysFactory<T, string, true>;

// ========================================
/**
 * @desc 查找T所有非只读类型的key组成的联合类型。
 */
type MutableKeys<T extends Object> = {
    [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];
/**
 * @desc 一个辅助类型，判断X和Y是否类型相同，
 * Ts编译器会认为如果两个类型（比如这里的X和Y）
 * 仅被用于约束两个相同的泛型函数则是相同的
 * ---
 * 最最重要的诀窍,是因为TS的类型系统里readonly修饰符并不影响assignability。
 * 所以一般的 conditional type不能判断是不是有readonly存在。
 * 唯一一个后门是conditional type在有变量没被resolve时，extends部分必须完全一致才算相等。
 * 利用这个后门可以获得readonly
 * 作者：曹之忽
 * 链接：https://www.zhihu.com/question/367327849/answer/988803437
 * @returns 是则返回A，否则返回B
 */
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
    ? A
    : B;
// =======================================
/**
 * @desc 提取T中所有可选类型的key组成的联合类型。
 */
type OptionalKeys<T> = {
    [P in keyof T]: {} extends Pick<T, P> ? P : never;
}[keyof T];
/**
 * @example type Eg = "key1" | undefined
 */
type Eg = OptionalKeys<{ key1?: string, key2: number }>
// =======================================
// 辅助函数，用于获取T中类型不为never的类型组成的联合类型
type TypeKeys<T> = T[keyof T];
/**
 * @desc 提取指定值的类型
 */
type PickByValue<T, V> = Pick<T,
    TypeKeys<{ [P in keyof T]: T[P] extends V ? P : never }>
>;
/**
 * @example
 *  type Eg = {
 *    key1: number;
 *  }
 */
type Eg = PickByValue<{ key1: number, key2: string, key3: number | undefined }, number>;
// ======================================= 
/**
 * @desc 精准的提取指定值的类型(包括联合类型)
 * PickByValueExact的核心实现主要有三点：
 * 一是利用Pick提取我们需要的key对应的类型
 * 二是利用给泛型套一层元组规避extends的分发式联合类型的特性
 * 三是利用两个类型互相兼容的方式判断是否相同。
 */
type PickByValueExact<T, V> = Pick<T,
    TypeKeys<{ [P in keyof T]: [T[P]] extends [V]
        ? ([V] extends [T[P]] ? P : never)
        : never;
    }>
>

// type Eg1 = { b: number };
type Eg1 = PickByValueExact<{ a: string, b: number }, number>
// type Eg2 = { b: number; c: number | undefined }
type Eg2 = PickByValueExact<{ a: string, b: number, c: number | undefined }, number>

// ======================================= 
/**
 * @desc 从T中提取存在于U中的key和对应的类型。（注意，最终是从T中提取key和类型）
 * 约束T和U都是object，然后利用Pick提取指定的key组成的类型
 * 通过Extract<keyof T, keyof U>提取同时存在于T和U中的key，Extract<keyof U, keyof T>也是同样的操作
 * 那么为什么要做2次Extract然后再交叉类型呢？
 * 原因还是在于处理类型的兼容推导问题，还记得string可分配给string | number的兼容吧:
 */
type Intersection<T extends object, U extends object> = Pick<T, Extract<keyof T, keyof U> & Extract<keyof U, keyof T>>;
/**
 * @example
 *  type Eg = {
 *    key1: number;
 *  }
 */
type Eg = Intersection<{ key1: string, key3: number }, { key1: string, key2: number }>
// ======================================= 
/**
 * @desc 从T中排除存在于U中的key和类型。
 */
type Diff<T extends object, U extends object> = Pick<
    T,
    Exclude<keyof T, keyof U>
>;
// ======================================= 

/**
 * Overwrite实现
 * 获取前者独有的key和类型，再取两者共有的key和该key在后者中的类型，最后合并。
 */
 type Overwrite<
 T extends object,
 U extends object,
 I = Diff<T, U> & Intersection<U, T>
> = Pick<I, keyof I>;

/**
 * @example
 * type Eg1 = { key1: number; }
 */
 type Eg1 = Overwrite<{key1: string}, {key1: number, other: boolean}>
// ======================================= 

 /**
  * @desc Assign<T, U>,类似于Object.assign()用于合并
  */
type Assign<
T extends object,
U extends object,
I = Diff<T, U> & U
> = Pick<I, keyof I>;

/**
* @example
* type Eg = {
*   name: string;
*   age: string;
*   other: string;
* }
*/
type Eg = Assign<
{ name: string; age: number; },
{ age: string; other: string; }
>;
// ======================================= 
/**
 * @desc 将联合类型转变成交叉类型。
 */
type UnionToIntersection<T> = (T extends any
    ? (arg: T) => void
    : never
  ) extends (arg: infer U) => void ? U : never
  type Eg = UnionToIntersection<{ key1: string } | { key2: number }>
  