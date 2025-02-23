import { describe, it, expect, vi } from 'vitest';
import { HtmlElementBuilder }
    from '../../../../../../src/core/utils/decorators/define-nodes/helpers';

describe('HtmlElementBuilder', () => {
    it('should create an element with the specified tagName', () => {
        const config = { tagName: 'div' };
        const element = HtmlElementBuilder.createElement(config);
        expect(element.tagName.toLowerCase()).toBe('div');
    });

    it('should throw an error if tagName is not provided', () => {
        const config = {};
        expect(() => HtmlElementBuilder.createElement(config as any)).toThrow('tagName is required');
    });

    it('should set text content when "text" attribute is provided', () => {
        const config = { tagName: 'p', text: 'Hello World' };
        const element = HtmlElementBuilder.createElement(config);
        expect(element.textContent).toBe('Hello World');
    });

    it('should add one class to the element when "class" attribute is provided', () => {
        const config = { tagName: 'div', class: 'test-class' };
        const element = HtmlElementBuilder.createElement(config);
        expect(element.classList.contains('test-class')).toBe(true);
    });

    it('should add classes to the element when "classes" attribute is provided', () => {
        const config = { tagName: 'div', classes: ['class1', 'class2'] };
        const element = HtmlElementBuilder.createElement(config);
        expect(element.classList.contains('class1')).toBe(true);
        expect(element.classList.contains('class2')).toBe(true);
    });

    it('should apply one style to the element when "style" attribute as string is provided', () => {
        const config = { tagName: 'div', style: 'color: blue' };
        const element = HtmlElementBuilder.createElement(config);
        expect(element.style.color).toBe('blue');
    });

    it('should apply styles to the element when "styles" attribute is provided', () => {
        const config = { tagName: 'div', styles: [{ backgroundColor: 'red', fontSize: '16px' }] };
        const element = HtmlElementBuilder.createElement(config);
        expect(element.style.backgroundColor).toBe('red');
        expect(element.style.fontSize).toBe('16px');
    });

    it('should add event listeners when "on" attributes are provided', () => {
        const onClick = vi.fn();
        const config = { tagName: 'button', onClick };
        const element = HtmlElementBuilder.createElement(config);
        element.click();
        expect(onClick).toHaveBeenCalled();
    });

    it('should append child elements when "children" attribute is provided', () => {
        const config = {
            tagName: 'div',
            children: [{ tagName: 'span', text: 'Child 1' }, { tagName: 'span', text: 'Child 2' }],
        };
        const element = HtmlElementBuilder.createElement(config);
        expect(element.children.length).toBe(2);
        expect(element.children[0].textContent).toBe('Child 1');
        expect(element.children[1].textContent).toBe('Child 2');
    });

    it('should set attributes for the element when other attributes are provided', () => {
        const config = { tagName: 'input', type: 'text', placeholder: 'Enter text' };
        const element = HtmlElementBuilder.createElement(config);
        expect(element.getAttribute('type')).toBe('text');
        expect(element.getAttribute('placeholder')).toBe('Enter text');
    });

    it('should ignore null or undefined attributes', () => {
        const config = { tagName: 'div', id: null, title: undefined };
        // @ts-ignore
        const element = HtmlElementBuilder.createElement(config);
        expect(element.hasAttribute('id')).toBe(false);
        expect(element.hasAttribute('title')).toBe(false);
    });
});
