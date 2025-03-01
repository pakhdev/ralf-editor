import { kebabToCamelCase } from '../string/string.utils.ts';
import { NodeCreationConfig, Style } from '../decorators/define-nodes/interfaces';

export function getElementProperty(element: HTMLElement, property: string): any {
    if (element.nodeType !== Node.ELEMENT_NODE && property !== 'nodeType')
        return undefined;
    switch (property) {
        case 'nodeType':
            return element.nodeType;
        case 'tagName':
            return element.tagName.toLowerCase();
        case 'classes':
            if (!element.classList?.length) return;
            return Array.from(element.classList);
        case 'styles':
            if (!element.style) return;
            return Array.from(element.style).map(propName => {
                const propertyName = kebabToCamelCase(propName);
                const propertyValue = element.style.getPropertyValue(propName);
                return { [propertyName]: propertyValue } as Style;
            });
        default:
            return element.getAttribute(property);
    }
}

export function getElementProperties(element: HTMLElement): NodeCreationConfig {
    const config = {
        nodeType: getElementProperty(element, 'nodeType'),
        tagName: getElementProperty(element, 'tagName'),
        classes: getElementProperty(element, 'classes'),
        styles: getElementProperty(element, 'styles'),
    } as NodeCreationConfig;

    Array.from(element.attributes || []).forEach(attr => {
        config[attr.name] = attr.value;
    });

    return config;
}
