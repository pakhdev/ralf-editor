import { describe, it, expect, vi } from 'vitest';
import { DefineCreation } from '../../../../../src/core/utils/decorators/define-nodes';
import { NodeConfigHandler } from '../../../../../src/core/utils/decorators/define-nodes/helpers';

const { mockPopulateConfig, mockCreateElement } = vi.hoisted(() => {
    return {
        mockPopulateConfig: vi.fn(),
        mockCreateElement: vi.fn(),
    };
});

vi.mock('../../../../../src/core/utils/decorators/define-nodes/helpers', () => {
    return {
        NodeConfigHandler: vi.fn().mockImplementation(() => {
            return {
                populateConfig: mockPopulateConfig,
            };
        }),
        HtmlElementBuilder: {
            createElement: mockCreateElement,
        },
    };
});

describe('DefineCreation', () => {

    it('should call HtmlElementBuilder.createElement with correct parameters', () => {
        const mockElement = document.createElement('div');
        mockPopulateConfig.mockReturnValue({ tagName: 'div' });
        mockCreateElement.mockReturnValue(mockElement);

        class TestClass {
            @DefineCreation({ tagName: 'div' })
            node: any;
        }

        const instance = new TestClass();
        const result = instance.node.create();

        expect(mockCreateElement).toHaveBeenCalledWith({ tagName: 'div' });
        expect(result).toBe(mockElement);
    });

    it('should keep existing properties', () => {
        class TestClass {
            @DefineCreation({ tagName: 'div' })
            node: any = { existingProperty: 'existingValue' };
        }

        const instance = new TestClass();

        expect(instance.node.existingProperty).toBe('existingValue');
    });

    it('should attach __creationMeta and create method', () => {
        class TestClass {
            @DefineCreation({ tagName: 'div', text: '' })
            node: any;
        }

        const instance = new TestClass();

        expect(instance.node.__creationMeta).toEqual({ tagName: 'div', text: '' });
        expect(typeof instance.node.create).toBe('function');
    });

    it('should create text node if nodeType is "text"', () => {
        mockPopulateConfig.mockReturnValue({ nodeType: 'text', text: 'hello' });

        class TestClass {
            @DefineCreation({ nodeType: 3, text: '' })
            node: any;
        }

        const instance = new TestClass();
        const result = instance.node.create();

        expect(result.nodeType).toBe(Node.TEXT_NODE);
        expect(result.textContent).toBe('hello');
    });

    it('should create empty text node if text is not provided', () => {
        mockPopulateConfig.mockReturnValue({ nodeType: 'text' });

        class TestClass {
            @DefineCreation({ nodeType: 3 })
            node: any;
        }

        const instance = new TestClass();
        const result = instance.node.create();

        expect(result.nodeType).toBe(Node.TEXT_NODE);
        expect(result.textContent).toBe('');
    });

    it('throws error if neither tagName nor nodeType is provided', () => {
        mockPopulateConfig.mockReturnValue({});

        class TestClass {
            @DefineCreation({})
            node: any;
        }

        const instance = new TestClass();

        expect(() => instance.node.create()).toThrowError(
            'NodeCreation: Invalid configuration for node',
        );
    });

    it('passes overrideConfig to NodeConfigHandler', () => {
        const base = { tagName: 'span', text: '' };
        const override = { text: 'overridden' };

        mockPopulateConfig.mockReturnValue({ ...base, ...override });

        class TestClass {
            @DefineCreation(base)
            node: any;
        }

        const instance = new TestClass();
        instance.node.create(override);

        expect(NodeConfigHandler).toHaveBeenCalledWith(override, base);
    });
});
