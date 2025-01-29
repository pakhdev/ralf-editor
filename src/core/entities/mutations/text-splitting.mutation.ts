import NodeDeletionMutation from './node-deletion.mutation.ts';
import NodeInsertionMutation from './node-insertion.mutation.ts';
import TextDeletionMutation from './text-deletion.mutation.ts';
import TextInsertionMutation from './text-insertion.mutation.ts';
import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import { getPosition, isTextNode } from '../../utils';

/**
 * A mutation that splits a single text node into two separate nodes at a specified offset.
 * The split creates a new `Text` node that contains either the left or right part of the original content,
 * depending on the specified placement ('before' or 'after').
 *
 * This mutation is typically used when text needs to be broken into two parts for further structural operations.
 *
 * Properties:
 * - `type`: MutationType.TEXT_SPLITTING — used to categorize the mutation.
 * - `newNodePlacement`: A string indicating whether the new node should be placed before or after the original.
 * - `positionReference`: The offset in the original node where the split occurs.
 * - `_newNode`: Internal reference to the newly created text node (accessible via `newNode` getter).
 *
 * Static Methods:
 * - `apply(splitNode, splittingOffset, newNodePlacement)`:
 *     Performs the split operation and applies the mutation.
 *
 * - `fromObserved(originalNode, splittingOffset, newNode, newNodePlacement)`:
 *     Reconstructs the mutation from a previously observed DOM state.
 *
 * Instance Methods:
 * - `execute()` — Performs the text split and updates the DOM.
 * - `undo()` — Merges the two parts back into the original text node and removes the newly created one.
 *
 * Notes:
 * - The split offset must be within the valid range (not at the edges of the node).
 * - The mutation supports both left and right splits via the `newNodePlacement` argument.
 */
export default class TextSplittingMutation extends AbstractMutation {
    readonly type = MutationType.TEXT_SPLITTING;
    private _newNode: Node | null = null;

    /**
     * Creates and applies a mutation that splits a text node into two parts at a given offset.
     *
     * Depending on `newNodePlacement`, the new node will contain either the left or right part of the original content.
     * The corresponding portion is removed from the original node after the new node is inserted into the DOM.
     *
     * @param splitNode - The text node to be split.
     * @param splittingOffset - The character offset at which the split occurs.
     * @param newNodePlacement - Determines whether the new node contains the left ('before') or right ('after') part.
     * @returns The executed `TextSplittingMutation` instance.
     */
    static apply(splitNode: Node, splittingOffset: number, newNodePlacement: 'before' | 'after'): TextSplittingMutation {
        if (!isTextNode(splitNode))
            throw new TypeError('Node is not a text node');

        if (splittingOffset <= 0 || splittingOffset >= (splitNode as Text).length)
            throw new RangeError('Incorrect splitting offset');

        return new TextSplittingMutation(newNodePlacement, { node: splitNode, position: splittingOffset }).execute();
    }

    /**
     * Reconstructs a text splitting mutation based on previously observed DOM changes.
     * This method does not execute the mutation — it creates a mutation instance for analysis or undo purposes.
     *
     * @param originalNode - The original text node that was split.
     * @param splittingOffset - The character offset where the split occurred.
     * @param newNode - The new text node that resulted from the split.
     * @param newNodePlacement - Indicates whether the new node was inserted before or after the original node.
     * @returns A `TextSplittingMutation` instance ready to be used or reverted.
     */
    static fromObserved(originalNode: Node, splittingOffset: number, newNode: Node, newNodePlacement: 'before' | 'after'): TextSplittingMutation {
        return new TextSplittingMutation(newNodePlacement, { node: originalNode, position: splittingOffset }, newNode);
    }

    constructor(
        readonly newNodePlacement: 'before' | 'after' = 'after',
        positionReference: PositionReference,
        newNode?: Node,
    ) {
        super(positionReference);
        if (newNode)
            this._newNode = newNode;
    }

    get newNode(): Node {
        if (!this._newNode)
            throw new Error('New node is not created yet. Call execute() method first');
        return this._newNode;
    }

    execute(): TextSplittingMutation {
        const { node: originalNode, position: splittingOffset } = this.positionReference;
        const originalText = (originalNode as Text).data;
        this._newNode = document.createTextNode(
            this.newNodePlacement === 'before' ? originalText.slice(0, splittingOffset) : originalText.slice(splittingOffset),
        );
        const newNodePosition = getPosition(this.positionReference.node);
        if (this.newNodePlacement === 'after')
            newNodePosition.position++;

        NodeInsertionMutation.apply(this.newNode, newNodePosition.node, newNodePosition.position);
        this.newNodePlacement === 'before'
            ? TextDeletionMutation.apply(originalNode, 0, splittingOffset)
            : TextDeletionMutation.apply(originalNode, splittingOffset, originalText.length);

        return this;
    }

    undo(): void {
        const newNodeText = (this.newNode as Text).data;
        const insertionOffset = this.newNodePlacement === 'before' ? 0 : this.positionReference.position;
        TextInsertionMutation.apply(newNodeText, this.positionReference.node, insertionOffset);
        NodeDeletionMutation.apply(this.newNode);
    }
}
