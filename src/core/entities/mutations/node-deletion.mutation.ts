import NodeInsertionMutation from './node-insertion.mutation.ts';
import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import { getPosition } from '../../utils';

/**
 * A mutation that removes a single node from the DOM.
 *
 * Properties:
 * - `deletedNode`: The DOM node that is removed.
 * - `positionReference`: An object that specifies where the node was located before deletion:
 *     - `node`: The parent node from which the deletion occurs.
 *     - `position`: The index in the parent's childNodes list where the node was located.
 * - `type`: MutationType.NODE_DELETION — categorizes this mutation type.
 *
 * Static Methods:
 * - `apply(node)`:
 *     Creates and immediately executes a mutation that removes the given node from its parent.
 *
 * - `fromObserved(deletedNode, parent, position)`:
 *     Reconstructs a mutation instance using information from an observed deletion. Does not execute the mutation.
 *
 * Instance Methods:
 * - `execute()` — Removes the node from its parent in the DOM.
 * - `undo()` — Restores the deleted node to its original position using `NodeInsertionMutation`.
 */
export default class NodeDeletionMutation extends AbstractMutation {
    readonly type = MutationType.NODE_DELETION;

    /**
     * Applies a mutation that removes a node from its parent in the DOM.
     * Creates a `NodeDeletionMutation` and immediately executes it.
     *
     * @param node - The DOM node to be removed.
     * @returns The executed `NodeDeletionMutation` instance.
     */
    static apply(node: Node): NodeDeletionMutation {
        if (!node.parentNode)
            throw new Error('Node has no parent');

        const positionReference = getPosition(node);
        return new NodeDeletionMutation(node, positionReference).execute();
    }

    /**
     * Reconstructs a mutation based on a previously observed node deletion.
     * This method is typically used when tracking DOM changes.
     * The method does not execute the mutation — it only creates an instance using the known parent and position.
     *
     * @param deletedNode - The node that was removed.
     * @param container - The node from which the child was removed.
     * @param position - The original index of the removed node in the parent's child nodes.
     * @returns A `NodeDeletionMutation` instance ready for further processing or undo.
     */
    static fromObserved(deletedNode: Node, container: Node, position: number): NodeDeletionMutation {
        return new NodeDeletionMutation(deletedNode, { node: container, position });
    }

    constructor(public deletedNode: Node, positionReference: PositionReference) {
        super(positionReference);
    }

    execute(): NodeDeletionMutation {
        this.positionReference.node.removeChild(this.deletedNode);
        return this;
    }

    undo(): void {
        NodeInsertionMutation.apply(this.deletedNode, this.positionReference.node, this.positionReference.position);
    }
}
