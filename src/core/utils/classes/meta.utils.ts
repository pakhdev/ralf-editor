export function addDecoratorMetadata<T>(
    target: any,
    _propertyKey: string | symbol,
    metadataKey: string,
    metadata: T,
) {
    if (!target.hasOwnProperty(metadataKey)) {
        Object.defineProperty(target, metadataKey, {
            value: [],
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }

    (target[metadataKey] as T[]).push(metadata);
}
