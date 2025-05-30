import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextDeletionMutation from '../../../../src/core/entities/mutations/text-deletion.mutation';

import TextInsertionMutation from '../../../../src/core/entities/mutations/text-insertion.mutation';

vi.mock('../../../../src/core/entities/mutations/text-insertion.mutation', () => {
    const TextInsertionMutation = vi.fn();
    TextInsertionMutation.apply = vi.fn();
    return { default: TextInsertionMutation };
});

describe('TextDeletionMutation', () => {
    let textNode: Text;

    beforeEach(() => {
        textNode = document.createTextNode('Hello, world!');
    });

    it('should create an instance of TextDeletionMutation', () => {
        const deletionMutation = TextDeletionMutation.fromObserved(textNode, 0, 'Hello');

        expect(deletionMutation).toBeInstanceOf(TextDeletionMutation);
        expect(deletionMutation.deletedText).toBe('Hello');
        expect(deletionMutation.positionReference).toEqual({ node: textNode, position: 0 });
        expect(deletionMutation.endOffset).toBe(5);
    });

    it('should throw RangeError for out of bounds offset: negative start', () => {
        expect(() => {
            TextDeletionMutation.apply(textNode, -2, 2);
        }).toThrow(RangeError);
    });

    it('should throw RangeError for out of bounds offset: incorrect end', () => {
        expect(() => {
            TextDeletionMutation.apply(textNode, 0, 100);
        }).toThrow(RangeError);
    });

    it('should throw TypeError for non-text node', () => {
        expect(() => {
            TextDeletionMutation.apply(document.createElement('div'), 0, 1);
        }).toThrow(TypeError);
    });

    it('should delete text correctly at start', () => {
        const deletionMutation = TextDeletionMutation.apply(textNode, 0, 6);

        expect(deletionMutation.deletedText).toBe('Hello,');
        expect(deletionMutation.positionReference.position).toBe(0);
        expect(deletionMutation.positionReference.node).toBe(textNode);
        expect(deletionMutation.endOffset).toBe(6);
        expect(textNode.textContent).toBe(' world!');
    });

    it('should delete text correctly at end', () => {
        const deletionMutation = TextDeletionMutation.apply(textNode, 6, 13);

        expect(deletionMutation.deletedText).toBe(' world!');
        expect(deletionMutation.positionReference.position).toBe(6);
        expect(deletionMutation.positionReference.node).toBe(textNode);
        expect(deletionMutation.endOffset).toBe(13);
        expect(textNode.textContent).toBe('Hello,');
    });

    it('should call TextInsertionMutation on undo with correct parameters', () => {
        const deletionMutation = TextDeletionMutation.apply(textNode, 1, 6);
        deletionMutation.execute();
        deletionMutation.undo();

        expect(TextInsertionMutation.apply).toHaveBeenCalledWith(
            deletionMutation.deletedText,
            deletionMutation.positionReference.node,
            deletionMutation.positionReference.position,
        );
    });

});