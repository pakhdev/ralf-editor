import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextDeletionMutation from '../../../../src/core/entities/mutations/text-deletion.mutation';

import TextInsertionMutation from '../../../../src/core/entities/mutations/text-insertion.mutation';

vi.mock('../../../../src/core/entities/mutations/text-insertion.mutation', () => {
    const TextInsertionMutation = vi.fn();
    TextInsertionMutation.prototype.execute = vi.fn();
    return { default: TextInsertionMutation };
});

describe('TextDeletionMutation', () => {
    let textNode: Text;

    beforeEach(() => {
        textNode = document.createTextNode('Hello, world!');
    });

    it('should delete text correctly at start', () => {
        const deletionMutation = new TextDeletionMutation(6, { node: textNode, position: 0 });
        deletionMutation.execute();

        expect(deletionMutation.removedText).toBe('Hello,');
        expect(deletionMutation.positionReference.position).toBe(0);
        expect(deletionMutation.positionReference.node).toBe(textNode);
        expect(deletionMutation.endOffset).toBe(6);
        expect(textNode.textContent).toBe(' world!');
    });

    it('should delete text correctly at end', () => {
        const deletionMutation = new TextDeletionMutation(13, { node: textNode, position: 6 });
        deletionMutation.execute();

        expect(deletionMutation.removedText).toBe(' world!');
        expect(deletionMutation.positionReference.position).toBe(6);
        expect(deletionMutation.positionReference.node).toBe(textNode);
        expect(deletionMutation.endOffset).toBe(13);
        expect(textNode.textContent).toBe('Hello,');
    });

    it('should throw RangeError for out of bounds offset: negative start', () => {
        const deletionMutation = new TextDeletionMutation(20, { node: textNode, position: -2 });
        expect(() => deletionMutation.execute()).toThrow(RangeError);
    });

    it('should throw RangeError for out of bounds offset: incorrect end', () => {
        const deletionMutation = new TextDeletionMutation(20, { node: textNode, position: 0 });
        expect(() => deletionMutation.execute()).toThrow(RangeError);
    });

    it('should throw TypeError for non-text node', () => {
        const deletionMutation = new TextDeletionMutation(6, { node: document.createElement('div'), position: 0 });
        expect(() => deletionMutation.execute()).toThrow(TypeError);
    });

    it('should call TextInsertionMutation on undo with correct parameters', () => {
        const deletionMutation = new TextDeletionMutation(6, { node: textNode, position: 1 });
        deletionMutation.execute();
        deletionMutation.undo();

        expect(TextInsertionMutation).toHaveBeenCalledWith(deletionMutation.removedText, deletionMutation.positionReference);
        expect(TextInsertionMutation.prototype.execute).toHaveBeenCalled();
    });

});