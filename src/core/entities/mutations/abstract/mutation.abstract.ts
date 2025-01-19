import { MutationType } from '../enums/mutation-type.enum.ts';
import { PositionReference } from '../interfaces/position-reference.interface.ts';
import { EditorMutation } from '../interfaces/editor-mutation.interface.ts';

export abstract class AbstractMutation {
    abstract readonly type: MutationType;
    positionReference: PositionReference;

    protected constructor(positionReference: PositionReference) {
        this.positionReference = positionReference;
    }

    abstract execute(): EditorMutation;

    abstract undo(): void;
}
