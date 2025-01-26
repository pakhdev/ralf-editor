import NodeDeletionMutation from './node-deletion.mutation.ts';
import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';

/**
 * A mutation that inserts a node into the DOM at a specific position within a container node.
 *
 * Properties:
 * - `insertedNode`: The node that was inserted.
 * - `positionReference`: An object describing where the node is inserted:
 *     - `node`: The container node into which the child is inserted.
 *     - `position`: The index in the container’s childNodes list.
 * - `type`: MutationType.NODE_INSERTION — used to categorize the mutation.
 *
 * Static Methods:
 * - `apply(node, container, insertionPosition)`:
 *     Creates and immediately executes a mutation that inserts the given node at the specified position.
 *
 * - `fromObserved(insertedNode, container, position)`:
 *     Reconstructs a mutation based on a previously observed node insertion.
 *
 * Instance Methods:
 * - `execute()` — Inserts the node into the container at the stored position.
 * - `undo()` — Reverts the mutation by removing the inserted node.
 */
export default class NodeInsertionMutation extends AbstractMutation {
    readonly type = MutationType.NODE_INSERTION;

    /**
     * Applies a mutation that inserts a node into a container at a given position.
     * This method both creates and immediately executes the mutation.
     *
     * @param node - The DOM node to be inserted.
     * @param container - The parent node into which the new node will be inserted.
     * @param insertionPosition - The index at which to insert the node within the container’s child nodes.
     * @returns The executed `NodeInsertionMutation` instance.
     */
    static apply(node: Node, container: Node, insertionPosition: number): NodeInsertionMutation {
        const containerChildrenCount: number = container.childNodes.length;
        if (insertionPosition < 0 || insertionPosition > containerChildrenCount)
            throw new RangeError(`Insertion position is out of bounds`);

        return new NodeInsertionMutation(node, {
            node: container,
            position: insertionPosition,
        }).execute();
    }

    /**
     * Reconstructs a mutation based on a previously observed node insertion.
     * This method is typically used when tracking DOM changes.
     * The mutation is not executed — only instantiated with the known position data.
     *
     * @param insertedNode - The node that was inserted.
     * @param container - The parent node into which the node was inserted.
     * @param position - The index in the container’s child nodes where the node was inserted.
     * @returns A `NodeInsertionMutation` ready for further processing or undo.
     */
    static fromObserved(insertedNode: Node, container: Node, position: number): NodeInsertionMutation {
        return new NodeInsertionMutation(insertedNode, {
            node: container,
            position,
        });
    }

    constructor(public insertedNode: Node, positionReference: PositionReference) {
        super(positionReference);
    }

    execute(): NodeInsertionMutation {
        const { node: parentNode, position } = this.positionReference;
        const referenceNode = parentNode.childNodes[position];
        parentNode.insertBefore(this.insertedNode, referenceNode);
        return this;
    }

    undo(): void {
        NodeDeletionMutation.apply(this.insertedNode);
    }
}
