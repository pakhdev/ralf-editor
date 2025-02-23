import { describe, it, expect } from 'vitest';
import { NodeConfigHandler }
    from '../../../../../../src/core/utils/decorators/define-nodes/helpers';

describe('NodeConfigHandler - extractCustomAttributes()', () => {
    it('extracts only attributes defined in the template', () => {
        const template = { id: '', class: 'optional' };
        const input = {
            id: 'element-1',
            class: 'btn-primary',
            extra: 'should-be-ignored',
        };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.extractCustomAttributes();

        expect(result).toEqual({
            id: 'element-1',
            class: 'btn-primary',
        });
        expect('extra' in result).toBe(false);
    });

    it('does not throw if optional attribute is missing', () => {
        const template = { id: 'optional', style: 'optional' };
        const input = {};
        const handler = new NodeConfigHandler(input, template);
        expect(() => handler.extractCustomAttributes()).not.toThrow();
    });

    it('extracts attributes from nested array objects (styles)', () => {
        const template = {
            styles: [{ backgroundColor: 'optional' }],
        };
        const input = {
            styles: [{ backgroundColor: 'blue', fontSize: '16px' }],
        };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.extractCustomAttributes();

        expect(result.styles).toEqual([{ backgroundColor: 'blue' }]);
        // @ts-ignore
        expect(result.styles[0].fontSize).toBeUndefined();
    });

    it('extracts required nested attributes from arrays', () => {
        const template = {
            styles: [{ backgroundColor: '' }],
        };
        const input = {
            styles: [{ backgroundColor: 'red' }],
        };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.extractCustomAttributes();

        expect(result.styles).toEqual([{ backgroundColor: 'red' }]);
    });

    it('ignores extra properties inside nested arrays', () => {
        const template = {
            styles: [{ backgroundColor: 'optional' }],
        };
        const input = {
            styles: [
                { backgroundColor: 'green', border: '1px solid red' },
                { border: 'none' },
            ],
        };

        // @ts-ignore
        const handler = new NodeConfigHandler(input, template);
        const result = handler.extractCustomAttributes();

        expect(result.styles).toEqual([
            { backgroundColor: 'green' },
        ]);
    });
});

describe('NodeConfigHandler - populateConfig()', () => {
    it('does not throw if optional field is missing (id: "optional")', () => {
        const template = { id: 'optional' };
        const input = {};
        const handler = new NodeConfigHandler(input, template);
        expect(() => handler.populateConfig()).not.toThrow();
    });

    it('includes optional field if provided (id: "optional")', () => {
        const template = { id: 'optional' };
        const input = { id: 'my-id' };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.populateConfig();
        expect(result.id).toBe('my-id');
    });

    it('throws if required field is missing (id: "")', () => {
        const template = { id: '' };
        const input = {};
        const handler = new NodeConfigHandler(input, template);
        expect(() => handler.populateConfig()).toThrow('Missing required attribute: id');
    });

    it('includes required field if provided (id: "")', () => {
        const template = { id: '' };
        const input = { id: 'my-id' };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.populateConfig();
        expect(result.id).toBe('my-id');
    });

    it('does not throw if optional array field is missing (styles: [{ backgroundColor: "optional" }])', () => {
        const template = { styles: [{ backgroundColor: 'optional' }] };
        const input = { styles: [{}] };
        const handler = new NodeConfigHandler(input, template);
        expect(() => handler.populateConfig()).not.toThrow();
    });

    it('includes optional array field if provided (styles: [{ backgroundColor: "optional" }])', () => {
        const template = { styles: [{ backgroundColor: 'optional' }] };
        const input = { styles: [{ backgroundColor: 'blue' }] };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.populateConfig();
        expect(result.styles?.[0]?.backgroundColor).toBe('blue');
    });

    it('throws if required array field is missing (styles: [{ backgroundColor: "" }])', () => {
        const template = { styles: [{ backgroundColor: '' }] };
        const input = { styles: [{}] };
        const handler = new NodeConfigHandler(input, template);
        expect(() => handler.populateConfig()).toThrow('Missing required attribute: backgroundColor');
    });

    it('includes required array field if provided (styles: [{ backgroundColor: "" }])', () => {
        const template = { styles: [{ backgroundColor: '' }] };
        const input = { styles: [{ backgroundColor: 'red' }] };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.populateConfig();
        expect(result.styles?.[0]?.backgroundColor).toBe('red');
    });

    it('ignores extra attributes not defined in template', () => {
        const template = { id: '' };
        const input = { id: 'abc', customAttr: 'should-not-appear' };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.populateConfig();
        expect(result.id).toBe('abc');
        expect('customAttr' in result).toBe(false);
    });

    it('includes all predefined attributes from the template after population', () => {
        const template = {
            id: 'test',
            text: '',
            type: 'optional',
            styles: [{ backgroundColor: 'optional' }],
        };
        const input = {
            text: 'Hello',
            type: 'input',
            styles: [{ backgroundColor: 'green' }],
        };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.populateConfig();
        expect(result).toEqual({
            id: 'test',
            text: 'Hello',
            type: 'input',
            styles: [{ backgroundColor: 'green' }],
        });
    });

    it('does not rewrite existing values in the template', () => {
        const template = {
            id: 'test',
        };
        const input = {
            id: 'other',
        };
        const handler = new NodeConfigHandler(input, template);
        const result = handler.populateConfig();
        expect(result).toEqual({
            id: 'test',
        });
    });
});

describe('NodeConfigHandler - isMatch()', () => {
    it('returns false if required primitive value is missing (text: "")', () => {
        const template = { text: '' };
        const input = {};
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(false);
    });

    it('returns true if required primitive value is present (text: "")', () => {
        const template = { text: '' };
        const input = { text: 'Hello' };
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(true);
    });

    it('returns false if required event handler is missing (onmousedown: "")', () => {
        const template = { onmousedown: '' };
        const input = {};
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(false);
    });

    it('returns true if required event handler is present (onmousedown: "")', () => {
        const template = { onmousedown: '' };
        const input = { onmousedown: () => {} };
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(true);
    });

    it('returns true if optional field is missing (id: "optional")', () => {
        const template = { id: 'optional' };
        const input = {};
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(true);
    });

    it('V1 returns false if required field inside array is missing (styles: [{ backgroundColor: "" }])', () => {
        const template = { styles: [{ backgroundColor: '' }] };
        const input = { styles: [{}] };
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(false);
    });

    it('V2 returns false if required field inside array is missing (styles: [{ backgroundColor: "" }])', () => {
        const template = { styles: [{ backgroundColor: '' }] };
        const input = {};
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(false);
    });

    it('returns true if required field inside array is present (styles: [{ backgroundColor: "" }])', () => {
        const template = { styles: [{ backgroundColor: '' }] };
        const input = { styles: [{ backgroundColor: 'red' }] };
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(true);
    });

    it('V1 returns true if optional field inside array is missing (styles: [{ backgroundColor: "optional" }])', () => {
        const template = { styles: [{ backgroundColor: 'optional' }] };
        const input = { styles: [{}] };
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(true);
    });

    it('V2 returns true if optional field inside array is missing (styles: [{ backgroundColor: "optional" }])', () => {
        const template = { styles: [{ backgroundColor: 'optional' }] };
        const input = {};
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(true);
    });

    it('ignores extra attributes not defined in template', () => {
        const template = { text: '' };
        const input = { text: 'Hello', extra: 'should be ignored' };
        const handler = new NodeConfigHandler(input, template);
        expect(handler.isMatch()).toBe(true);
    });
});

