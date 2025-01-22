import { AbstractMutation } from './abstract/mutation.abstract.ts';
import { MutationType } from './enums/mutation-type.enum.ts';
import { PositionReference } from './interfaces/position-reference.interface.ts';
import { isTextNode } from '../../utils';
import TextInsertionMutation from './text-insertion.mutation.ts';

export default class TextDeletionMutation extends AbstractMutation {
    readonly type = MutationType.TEXT_DELETION;
    removedText: string = '';

    constructor(public endOffset: number, positionReference: PositionReference) {
        super(positionReference);
    }

    execute(): TextDeletionMutation {
        if (!isTextNode(this.positionReference.node))
            throw new TypeError('Node is not a text node');

        const { node: textNode, position: startOffset } = this.positionReference as { node: Text; position: number };

        if (startOffset < 0 || this.endOffset > textNode.length)
            throw new RangeError('Offset is out of bounds');

        this.removedText = textNode.data.slice(startOffset, this.endOffset);
        (textNode as Text).deleteData(startOffset, this.endOffset - startOffset);
        return this;
    }

    undo(): void {
        new TextInsertionMutation(this.removedText, this.positionReference).execute();
    }
}