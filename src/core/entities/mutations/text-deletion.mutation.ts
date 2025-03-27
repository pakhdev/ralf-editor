import TextInsertionMutation from './text-insertion.mutation.ts';
import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import { isTextNode } from '../../utils';

/**
 * A mutation that deletes a range of text from a specific text node.
 *
 * Properties:
 * - `deletedText`: The string that was removed from the text node.
 * - `endOffset`: The offset in the text node where the deletion ends (non-inclusive).
 * - `positionReference`: An object describing the deletion start:
 *     - `node`: The target text node.
 *     - `position`: The offset in the node where deletion begins.
 * - `type`: MutationType.TEXT_DELETION — used for categorizing the mutation.
 *
 * Static Methods:
 * - `apply(textNode, startOffset, endOffset)`:
 *     Creates and immediately executes a mutation that removes text between the specified offsets in the given text node.
 *
 * - `fromObserved(textNode, startOffset, endOffset)`:
 *     Reconstructs a mutation based on a previously observed text deletion.
 *
 * Instance Methods:
 * - `execute()` — Applies the mutation by removing the text from the DOM.
 * - `undo()` — Reverts the mutation by re-inserting the removed text at the original position.
 */
export default class TextDeletionMutation extends AbstractMutation {
    readonly type = MutationType.TEXT_DELETION;

    /**
     * Applies a mutation that deletes text from a given text node within a specified range.
     * Creates a new `TextDeletionMutation` instance and immediately executes it.
     *
     * @param textNode - The target text node where the deletion will occur.
     * @param startOffset - The position in the text node where the deletion starts.
     * @param endOffset - The position where the deletion ends (non-inclusive).
     * @returns The executed `TextDeletionMutation` instance.
     */
    static apply(textNode: Node, startOffset: number, endOffset: number): TextDeletionMutation {
        if (!isTextNode(textNode))
            throw new TypeError('Node is not a text node');

        if (startOffset < 0 || endOffset > (textNode as Text).length)
            throw new RangeError('Offset is out of bounds');

        const deletedText = (textNode as Text).data.slice(startOffset, endOffset);
        return new TextDeletionMutation(endOffset, deletedText, { node: textNode, position: startOffset }).execute();
    }

    /**
     * Reconstructs a mutation based on a previously observed text deletion.
     * This method is typically used when tracking DOM changes.
     * It does not execute the mutation — only creates an instance from known parameters.
     *
     * @param textNode - The text node from which the text was removed.
     * @param startOffset - The offset in the text node where the deletion began.
     * @param deletedText - The exact string that was removed.
     * @returns A `TextDeletionMutation` instance ready for further processing or undo.
     */
    static fromObserved(textNode: Node, startOffset: number, deletedText: string): TextDeletionMutation {
        const endOffset = startOffset + deletedText.length;
        return new TextDeletionMutation(endOffset, deletedText, { node: textNode, position: startOffset });
    }

    constructor(public endOffset: number, public readonly deletedText: string, positionReference: PositionReference) {
        super(positionReference);
    }

    execute(): TextDeletionMutation {
        const { node: textNode, position: startOffset } = this.positionReference as { node: Text; position: number };
        (textNode as Text).deleteData(startOffset, this.endOffset - startOffset);
        return this;
    }

    undo(): void {
        TextInsertionMutation.apply(this.deletedText, this.positionReference.node, this.positionReference.position);
    }
}
