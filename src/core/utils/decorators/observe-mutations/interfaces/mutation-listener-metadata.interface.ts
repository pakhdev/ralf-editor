import { EditorMutation } from '../../../../entities/mutations/interfaces/editor-mutation.interface.ts';
import { MutationType } from '../../../../entities/mutations/enums/mutation-type.enum.ts';

export interface MutationListenerMetadata {
    mutationType: MutationType;
    handler: (mutation: EditorMutation) => void;
    propertyKey: string | symbol;
}
