type ExtractPublicMethods<ClassType> = {
    [PropertyKey in keyof ClassType as ClassType[PropertyKey] extends (...args: any[]) => any
        ? (PropertyKey extends string ? PropertyKey : never)
        : never]: ClassType[PropertyKey];
};

type ExtractStaticMethods<ClassType> = {
    [PropertyKey in keyof ClassType as ClassType[PropertyKey] extends (...args: any[]) => any ? PropertyKey : never]: ClassType[PropertyKey];
};

type ExtractGetters<ClassType> = {
    [PropertyKey in keyof ClassType as ClassType[PropertyKey] extends Function ? never : PropertyKey]: ClassType[PropertyKey];
};

/**
 * Combines multiple class types into a single hybrid type that includes:
 * - Public instance methods from each class's prototype
 * - Getters (non-function properties) from each class's prototype
 * - Static methods from each class constructor
 *
 * This utility type recursively merges these elements from an array of classes,
 * producing a unified type that reflects the combined capabilities of all provided classes.
 *
 * @template T - A tuple of class constructors to extract methods and properties from.
 *
 * @example
 * ```ts
 * class A {
 *   static staticA() {}
 *   get getterA() { return 'a'; }
 *   methodA() {}
 * }
 * class B {
 *   static staticB() {}
 *   get getterB() { return 'b'; }
 *   methodB() {}
 * }
 *
 * type Combined = HybridClassType<[typeof A, typeof B]>;
 *
 * const obj: Combined = {
 *   methodA: () => {},
 *   methodB: () => {},
 *   getterA: 'a',
 *   getterB: 'b',
 *   staticA: () => {},
 *   staticB: () => {},
 * };
 * ```
 */
export type HybridClassType<T extends any[]> = T extends [infer First extends abstract new (...args: any) => any, ...infer Rest extends any[]]
    ?
    HybridClassType<Rest>
    & ExtractPublicMethods<First extends { prototype: any } ? First['prototype'] : never>
    & ExtractGetters<First extends { prototype: any } ? First['prototype'] : never>
    & ExtractStaticMethods<First>
    : {};