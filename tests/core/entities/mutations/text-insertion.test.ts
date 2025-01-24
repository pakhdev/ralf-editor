import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextInsertionMutation from '../../../../src/core/entities/mutations/text-insertion.mutation';

import TextDeletionMutation from '../../../../src/core/entities/mutations/text-deletion.mutation';

vi.mock('../../../../src/core/entities/mutations/text-deletion.mutation', () => {
    const TextDeletionMutation = vi.fn();
    TextDeletionMutation.apply = vi.fn();
    return { default: TextDeletionMutation };
});

describe('TextInsertionMutation', () => {
    let textNode: Text;
    let positionReference: { node: Text; position: number };

    beforeEach(() => {
        textNode = document.createTextNode('Hello, world!');
        positionReference = { node: textNode, position: 0 };
    });

    it('should throw TypeError for non-text node', () => {
        expect(() => {
            TextInsertionMutation.apply('Hello, world!', document.createElement('div'), 0);
        }).toThrow(TypeError);
    });

    it('should throw RangeError for out of bounds offset: negative position', () => {
        expect(() => {
            TextInsertionMutation.apply('Hello, world!', textNode, -2);
        }).toThrow(RangeError);
    });

    it('should throw RangeError for out of bounds offset: non-existent position', () => {
        expect(() => {
            TextInsertionMutation.apply('Hello, world!', textNode, 100);
        }).toThrow(RangeError);
    });

    it('should insert text correctly at start', () => {
        const insertionMutation = TextInsertionMutation.apply('Text ', textNode, 0);

        expect(insertionMutation.insertedText).toBe('Text ');
        expect(insertionMutation.positionReference).toEqual(positionReference);
        expect(textNode.textContent).toBe('Text Hello, world!');
    });

    it('should insert text in the middle correctly', () => {
        const insertionMutation = TextInsertionMutation.apply('beautiful ', textNode, 7);
        expect(insertionMutation.insertedText).toBe('beautiful ');
        expect(insertionMutation.positionReference).toEqual({ node: textNode, position: 7 });
        expect(textNode.textContent).toBe('Hello, beautiful world!');
    });

    it('should insert text correctly at end', () => {
        const insertionMutation = TextInsertionMutation.apply('!', textNode, 13);
        expect(insertionMutation.insertedText).toBe('!');
        expect(insertionMutation.positionReference).toEqual({ node: textNode, position: 13 });
        expect(textNode.textContent).toBe('Hello, world!!');
    });

    it('undo should call TextDeletionMutation with correct parameters', () => {
        const insertionMutation = TextInsertionMutation.apply('beautiful ', textNode, 7);
        insertionMutation.undo();
        expect(TextDeletionMutation.apply).toHaveBeenCalledWith(
            insertionMutation.positionReference.node,
            insertionMutation.positionReference.position,
            insertionMutation.positionReference.position + insertionMutation.insertedText.length,
        );
    });
});