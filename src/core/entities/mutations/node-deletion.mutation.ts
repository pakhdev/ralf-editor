import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import NodeInsertionMutation from './node-insertion.mutation.ts';
import { getPosition } from '../../utils';

export default class NodeDeletionMutation extends AbstractMutation {
    readonly type = MutationType.NODE_DELETION;

    constructor(public deletedNode: Node, positionReference?: PositionReference) {
        if (!positionReference)
            positionReference = getPosition(deletedNode);

        super(positionReference);
    }

    execute(): NodeDeletionMutation {
        this.positionReference.node.removeChild(this.deletedNode);
        return this;
    }

    undo(): void {
        new NodeInsertionMutation(this.deletedNode, this.positionReference).execute();
    }
}
