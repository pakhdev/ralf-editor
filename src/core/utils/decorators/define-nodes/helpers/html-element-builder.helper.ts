import { Classes, NodeAttributes, NodeCreationConfig, Style } from '../interfaces/';

export default class HtmlElementBuilder {
    static createElement(config: NodeCreationConfig): HTMLElement {
        const { tagName, ...attributes } = config;
        if (!tagName)
            throw new Error('tagName is required');

        const element = document.createElement(tagName);
        this.#handleAttributes(element, attributes);
        return element;
    }

    static #getAttributeType(key: string, value: unknown): string {
        switch (true) {
            case key === 'classes':
                return 'classes';
            case key === 'styles':
                return 'styles';
            case key.startsWith('on') && typeof value === 'function':
                return 'event';
            case key === 'text':
                return 'text';
            case key === 'children':
                return 'children';
            default:
                return 'attribute';
        }
    }

    static #handleAttributes(element: HTMLElement, attributes: NodeAttributes): void {
        for (const key in attributes) {
            const value = attributes[key];
            const attrType = this.#getAttributeType(key, value);
            if (!value) continue;

            switch (attrType) {
                case 'classes':
                    this.#handleClasses(element, value as Classes);
                    break;

                case 'styles':
                    this.#handleStyles(element, value as Style[]);
                    break;

                case 'event':
                    this.#handleEvent(element, key, value as EventListenerOrEventListenerObject);
                    break;

                case 'text':
                    element.textContent = value.toString();
                    break;

                case 'children':
                    if (Array.isArray(value)) {
                        this.#handleChildren(element, value as NodeCreationConfig[]);
                    }
                    break;

                default:
                    element.setAttribute(key, value.toString());
                    break;
            }
        }
    }

    static #handleChildren(element: HTMLElement, children: NodeCreationConfig[]): void {
        children.forEach(childConfig => {
            const childElement = this.createElement(childConfig);
            element.appendChild(childElement);
        });
    }

    static #handleClasses(element: HTMLElement, value: Classes): void {
        element.classList.add(...value);
    }

    static #handleStyles(element: HTMLElement, value: Style[]): void {
        value.forEach(style => {
            for (let [styleKey, styleValue] of Object.entries(style)) {
                styleKey = styleKey.replace(/[A-Z]/g, match => `-${ match.toLowerCase() }`);
                element.style.setProperty(styleKey, styleValue);
            }
        });
    }

    static #handleEvent(element: HTMLElement, key: string, value: EventListenerOrEventListenerObject): void {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
    }
}
