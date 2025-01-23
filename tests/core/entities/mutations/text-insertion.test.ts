import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextInsertionMutation from '../../../../src/core/entities/mutations/text-insertion.mutation';

import TextDeletionMutation from '../../../../src/core/entities/mutations/text-deletion.mutation';

vi.mock('../../../../src/core/entities/mutations/text-deletion.mutation', () => {
    const TextDeletionMutation = vi.fn();
    TextDeletionMutation.prototype.execute = vi.fn();
    return { default: TextDeletionMutation };
});

describe('TextInsertionMutation', () => {
    let textNode: Text;
    let positionReference: { node: Text; position: number };

    beforeEach(() => {
        textNode = document.createTextNode('Hello, world!');
        positionReference = { node: textNode, position: 0 };
    });

    it('should insert text correctly at start', () => {
        const insertionMutation = new TextInsertionMutation('Text ', positionReference);
        insertionMutation.execute();

        expect(insertionMutation.insertedText).toBe('Text ');
        expect(insertionMutation.positionReference).toEqual(positionReference);
        expect(textNode.textContent).toBe('Text Hello, world!');
    });

    it('should insert text in the middle correctly', () => {
        positionReference.position = 7; // Insert at "Hello, "
        const insertionMutation = new TextInsertionMutation('beautiful ', positionReference);
        insertionMutation.execute();

        expect(insertionMutation.insertedText).toBe('beautiful ');
        expect(insertionMutation.positionReference).toEqual(positionReference);
        expect(textNode.textContent).toBe('Hello, beautiful world!');
    });

    it('should insert text correctly at end', () => {
        positionReference.position = 13; // Insert at the end
        const insertionMutation = new TextInsertionMutation('!', positionReference);
        insertionMutation.execute();

        expect(insertionMutation.insertedText).toBe('!');
        expect(insertionMutation.positionReference).toEqual(positionReference);
        expect(textNode.textContent).toBe('Hello, world!!');
    });

    it('should throw TypeError for non-text node', () => {
        const insertionMutation = new TextInsertionMutation('beautiful ', {
            node: document.createElement('div'),
            position: 0,
        });
        expect(() => insertionMutation.execute()).toThrow(TypeError);
    });

    it('should throw RangeError for out of bounds offset: negative position', () => {
        const insertionMutation = new TextInsertionMutation('beautiful ', { node: textNode, position: -2 });
        expect(() => insertionMutation.execute()).toThrow(RangeError);
    });

    it('should throw RangeError for out of bounds offset: non-existent position', () => {
        const insertionMutation = new TextInsertionMutation('beautiful ', { node: textNode, position: 20 });
        expect(() => insertionMutation.execute()).toThrow(RangeError);
    });

    it('undo should call TextDeletionMutation with correct parameters', () => {
        positionReference.position = 7; // Insert at "Hello, "
        const insertionMutation = new TextInsertionMutation('beautiful ', positionReference);
        insertionMutation.undo();

        expect(TextDeletionMutation).toHaveBeenCalledWith(17, positionReference);
    });
});