import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import { isTextNode } from '../../utils';
import TextDeletionMutation from './text-deletion.mutation.ts';

export default class TextInsertionMutation extends AbstractMutation {
    readonly type = MutationType.TEXT_INSERTION;

    constructor(public insertedText: string, positionReference: PositionReference) {
        super(positionReference);
    }

    execute(): TextInsertionMutation {
        if (!isTextNode(this.positionReference.node))
            throw new TypeError('Node is not a text node');

        const { node: textNode, position: offset } = this.positionReference as { node: Text; position: number };

        if (offset < 0 || offset > textNode.length)
            throw new RangeError('Offset is out of bounds');

        textNode.insertData(offset, this.insertedText);
        return this;
    }

    undo(): void {
        const endOffset = this.positionReference.position + this.insertedText.length;
        new TextDeletionMutation(endOffset, this.positionReference).execute();
    }
}