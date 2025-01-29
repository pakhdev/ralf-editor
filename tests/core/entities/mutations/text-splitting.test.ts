import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextSplittingMutation from '../../../../src/core/entities/mutations/text-splitting.mutation';
import TextInsertionMutation from '../../../../src/core/entities/mutations/text-insertion.mutation';
import NodeDeletionMutation from '../../../../src/core/entities/mutations/node-deletion.mutation';

vi.mock('../../../../src/core/entities/mutations/text-insertion.mutation', () => {
    const TextInsertionMutation = vi.fn();
    TextInsertionMutation.apply = vi.fn();
    return { default: TextInsertionMutation };
});

vi.mock('../../../../src/core/entities/mutations/node-deletion.mutation', () => {
    const NodeDeletionMutation = vi.fn();
    NodeDeletionMutation.apply = vi.fn();
    return { default: NodeDeletionMutation };
});

describe('TextSplittingMutation', () => {
    let parentNode: HTMLDivElement;
    let textNode: Text;

    beforeEach(() => {
        parentNode = document.createElement('div');
        textNode = document.createTextNode('Hello, world!');
        parentNode.appendChild(textNode);
    });

    it('should create an instance of TextSplittingMutation', () => {
        const newNode = document.createTextNode('world!');
        const splittingMutation = TextSplittingMutation.fromObserved(textNode, 7, newNode, 'after');

        expect(splittingMutation).toBeInstanceOf(TextSplittingMutation);
        expect(splittingMutation.newNodePlacement).toBe('after');
        expect(splittingMutation.newNode).toBe(newNode);
        expect(splittingMutation.positionReference).toEqual({ node: textNode, position: 7 });
    });

    it('should throw TypeError for non-text node', () => {
        expect(() => {
            TextSplittingMutation.apply(parentNode, 5, 'after');
        }).toThrow(TypeError);
    });

    it('should throw RangeError for incorrect splitting offset', () => {
        expect(() => {
            TextSplittingMutation.apply(textNode, 0, 'after');
        }).toThrow(RangeError);

        expect(() => {
            TextSplittingMutation.apply(textNode, 20, 'after');
        }).toThrow(RangeError);
    });

    it('should split the text node correctly - new node before', () => {
        const splittingMutation = TextSplittingMutation.apply(textNode, 7, 'after');

        expect((splittingMutation.newNode as Text).data).toBe('world!');
        expect(textNode.data).toBe('Hello, ');
        expect(parentNode.childNodes.length).toBe(2);
    });

    it('should split the text node correctly - new node after', () => {
        const splittingMutation = TextSplittingMutation.apply(textNode, 7, 'before');

        expect((splittingMutation.newNode as Text).data).toBe('Hello, ');
        expect(textNode.data).toBe('world!');
        expect(parentNode.childNodes.length).toBe(2);
    });

    it('undo should restore the original text node and delete the split node placed after the original', () => {
        const splittingMutation = TextSplittingMutation.apply(textNode, 7, 'after');
        splittingMutation.undo();

        expect(TextInsertionMutation.apply).toHaveBeenCalledWith('world!', textNode, 7);
        expect(NodeDeletionMutation.apply).toHaveBeenCalledWith(splittingMutation.newNode);
    });

    it('undo should restore the original text node and delete the split node placed before the original', () => {
        const splittingMutation = TextSplittingMutation.apply(textNode, 7, 'before');
        splittingMutation.undo();

        expect(TextInsertionMutation.apply).toHaveBeenCalledWith('Hello, ', textNode, 0);
        expect(NodeDeletionMutation.apply).toHaveBeenCalledWith(splittingMutation.newNode);
    });
});
