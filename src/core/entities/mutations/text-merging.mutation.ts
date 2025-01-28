import NodeDeletionMutation from './node-deletion.mutation.ts';
import NodeInsertionMutation from './node-insertion.mutation.ts';
import TextDeletionMutation from './text-deletion.mutation.ts';
import TextInsertionMutation from './text-insertion.mutation.ts';
import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import { getPosition, isTextNode } from '../../utils';

/**
 * A mutation that merges two adjacent text nodes by appending the content of the second (right)
 * node into the first (left) node, and removing the second node from the DOM.
 *
 * This merge always happens from right to left — the text of the `removedNode` (right node)
 * is appended to the end of the node defined in `positionReference.node` (left node).
 *
 * Properties:
 * - `removedNode`: The right-side text node that will be removed after its content is merged.
 * - `appendedText`: The text data extracted from `removedNode`, used for insertion and undo.
 * - `positionReference`: Describes where in the left node (`node`) the right node's content will be inserted.
 * - `type`: MutationType.TEXT_MERGING — used to categorize the mutation.
 *
 * Static Methods:
 * - `apply(toNode, fromNode)`:
 *     Merges the `fromNode` (right) into the `toNode` (left) and immediately applies the mutation.
 *
 * - `fromObserved(toNode, fromNode, position)`:
 *     Reconstructs a mutation based on a previously observed text merge.
 *
 * Instance Methods:
 * - `execute()` — Performs the merge operation.
 * - `undo()` — Reverts the operation, restoring the original nodes and text positions.
 */
export default class TextMergingMutation extends AbstractMutation {
    readonly type = MutationType.TEXT_MERGING;
    readonly appendedText: string;

    /**
     * Creates and applies a mutation that merges two text nodes.
     * The content of the `fromNode` (right node) will be appended to the end of `toNode` (left node),
     * and then `fromNode` will be removed from the DOM.
     *
     * @param toNode - The left text node to which content will be appended.
     * @param fromNode - The right text node whose content will be appended and then removed.
     * @returns The executed `TextMergingMutation` instance.
     */
    static apply(toNode: Node, fromNode: Node): TextMergingMutation {
        if (!isTextNode(toNode) || !isTextNode(fromNode))
            throw new TypeError('One or both nodes are not text nodes');

        const insertionOffset = (toNode as Text).length;
        return new TextMergingMutation(fromNode, { node: toNode, position: insertionOffset }).execute();
    }

    /**
     * Reconstructs a previously observed merge of two text nodes (from right to left).
     * This method is typically used when tracking DOM changes.
     * It does not execute the mutation — only creates an instance from known parameters.
     *
     * @param toNode - The left text node that received the appended content.
     * @param fromNode - The right text node that was removed.
     * @param position - The position in `toNode` where `fromNode`'s content was inserted.
     * @returns A `TextMergingMutation` instance ready to be executed or undone.
     */
    static fromObserved(toNode: Node, fromNode: Node, position: number): TextMergingMutation {
        return new TextMergingMutation(fromNode, { node: toNode, position });
    }

    constructor(public removedNode: Node, positionReference: PositionReference) {
        super(positionReference);
        this.appendedText = (removedNode as Text).data;
    }

    execute(): TextMergingMutation {
        NodeDeletionMutation.apply(this.removedNode);
        TextInsertionMutation.apply(this.appendedText, this.positionReference.node, this.positionReference.position);
        return this;
    }

    undo(): void {
        const removedNodePlacement = getPosition(this.positionReference.node);
        removedNodePlacement.position++;
        const endOffset = this.positionReference.position + this.appendedText.length;
        TextDeletionMutation.apply(this.positionReference.node, this.positionReference.position, endOffset);
        NodeInsertionMutation.apply(this.removedNode, removedNodePlacement.node, removedNodePlacement.position);
    }
}
