import { getGetterNames, getObjectMethodNames } from './inspection.utils.ts';

export function bindMethods(instance: any, methods: string[], target: any): void {
    methods.forEach((methodName) => {
        if (['onInit'].includes(methodName)) return;
        if (target[methodName]) {
            console.warn(`Method ${ methodName } already exists on ${ target.name }. Skipping.`);
            return;
        }

        target[methodName] = function (...args: any[]) {
            return instance[methodName].apply(instance, args); // ← теперь возвращает результат
        };
    });
}

export function bindGetters(instance: any, getterNames: string[], target: any): void {
    const instancePrototype = Object.getPrototypeOf(instance);
    getterNames.forEach((getterName) => {
        if (target[getterName]) {
            console.warn(`Getter ${ getterName } already exists on ${ target.name }. Skipping.`);
            return;
        }
        const descriptor = Object.getOwnPropertyDescriptor(instancePrototype, getterName);
        if (!descriptor) return;
        Object.defineProperty(target, getterName, {
            get() {
                return descriptor.get!.call(instance);
            },
            configurable: true,
            enumerable: true,
        });
    });
}

export function bindInstances(instances: any[], target: any): void {
    instances.forEach((instance) => {
        bindMethods(instance, getObjectMethodNames(instance), target);
        bindGetters(instance, getGetterNames(instance), target);
    });
}
