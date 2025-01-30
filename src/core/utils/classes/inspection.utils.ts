export function getObjectMethodNames(obj: any): string[] {
    return Object.getOwnPropertyNames(obj.decoratedClass
        ? obj.decoratedClass.prototype
        : Object.getPrototypeOf(obj),
    ).filter((prop) => prop !== 'constructor' && typeof obj[prop] === 'function' && !prop.startsWith('_'));
}

export function getStaticMethodNames(obj: any): string[] {
    return Object.getOwnPropertyNames(obj)
        .filter((prop) => !['prototype', 'length', 'name'].includes(prop));
}

export function getGetterNames(obj: any): string[] {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
        .filter((prop) => {
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), prop);
            return descriptor?.get;
        });
}
