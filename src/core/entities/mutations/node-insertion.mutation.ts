import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import NodeDeletionMutation from './node-deletion.mutation.ts';
import { getPosition } from '../../utils';

export default class NodeInsertionMutation extends AbstractMutation {
    readonly type = MutationType.NODE_INSERTION;

    constructor(public insertedNode: Node, positionReference?: PositionReference) {
        if (!positionReference)
            positionReference = getPosition(insertedNode);

        super(positionReference);
    }

    execute(): NodeInsertionMutation {
        const { node: parentNode, position } = this.positionReference;
        const referenceNode = parentNode.childNodes[position];

        if (!referenceNode && position !== 0 && parentNode.childNodes.length < position)
            throw new Error('Position out of bounds');

        parentNode.insertBefore(this.insertedNode, referenceNode);
        return this;
    }

    undo(): void {
        new NodeDeletionMutation(this.insertedNode, this.positionReference).execute();
    }
}