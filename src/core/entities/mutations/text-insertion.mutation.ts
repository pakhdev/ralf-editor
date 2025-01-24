import TextDeletionMutation from './text-deletion.mutation.ts';
import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import { isTextNode } from '../../utils';

/**
 * A mutation that inserts a string into a specific position of a text node.
 *
 * Properties:
 * - `insertedText`: The string that will be inserted into the text node.
 * - `positionReference`: Object describing where to insert the text.
 *     Includes:
 *     - `node`: The target text node
 *     - `position`: Offset in the node where the insertion occurs
 * - `type`: MutationType.TEXT_INSERTION — used for categorizing the mutation
 *
 * Static Methods:
 * - `apply(text, textNode, insertionOffset)`:
 *     Creates and immediately executes a mutation to insert the given text into the textNode at the specified offset.
 *
 * - `fromObserved(textNode, startOffset, endOffset)`:
 *     Reconstructs a mutation from DOM-observed changes by comparing character offsets.
 *
 * Instance Methods:
 * - `execute()` — Applies the mutation to the DOM.
 * - `undo()` — Reverts the mutation from the DOM.
 */
export default class TextInsertionMutation extends AbstractMutation {
    readonly type = MutationType.TEXT_INSERTION;

    /**
     * Applies a mutation that inserts text into a given text node at a specified offset.
     * Creates a new `TextInsertionMutation` instance and immediately executes it.
     *
     * @param text - The string to be inserted.
     * @param textNode - The target text node where the insertion will occur.
     * @param insertionOffset - The position in the text node where the new text should be inserted.
     * @returns The executed `TextInsertionMutation` instance.
     */
    static apply(text: string, textNode: Node, insertionOffset: number): TextInsertionMutation {
        if (!isTextNode(textNode))
            throw new TypeError('Node is not a text node');

        if (insertionOffset < 0 || insertionOffset > (textNode as Text).length)
            throw new RangeError('Insertion offset is out of bounds');

        return new TextInsertionMutation(text, { node: textNode, position: insertionOffset }).execute();
    }

    /**
     * Reconstructs a mutation from an observed text insertion.
     * This method is typically used when tracking DOM changes.
     * It does not execute the mutation — only creates an instance from known parameters.
     *
     * @param textNode - The node where the text was inserted.
     * @param startOffset - The offset where the inserted text starts.
     * @param endOffset - The offset where the inserted text ends.
     * @returns A `TextInsertionMutation` instance ready for further processing or undo.
     */
    static fromObserved(textNode: Node, startOffset: number, endOffset: number): TextInsertionMutation {
        const insertedText = (textNode as Text).data.slice(startOffset, endOffset);
        return new TextInsertionMutation(insertedText, { node: textNode, position: startOffset });
    }

    constructor(public insertedText: string, positionReference: PositionReference) {
        super(positionReference);
    }

    execute(): TextInsertionMutation {
        const { node: textNode, position: offset } = this.positionReference as { node: Text; position: number };
        textNode.insertData(offset, this.insertedText);
        return this;
    }

    undo(): void {
        const endOffset = this.positionReference.position + this.insertedText.length;
        TextDeletionMutation.apply(this.positionReference.node, this.positionReference.position, endOffset);
    }
}