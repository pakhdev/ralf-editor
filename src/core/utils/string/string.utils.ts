export function kebabToCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function camelToKebabCase(str: string): string {
    return str.replace(/[A-Z]/g, match => `-${ match.toLowerCase() }`);
}
