import { EditorMutation } from '../../../entities/mutations/interfaces/editor-mutation.interface.ts';
import { MutationListenerMetadata, MutationListenersClass } from './interfaces';
import { MutationType } from '../../../entities/mutations/enums/mutation-type.enum.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Declares that a method should handle `TextInsertion` editor mutations.
 * Stores metadata that can later be processed by the `ObserveMutations` decorator.
 *
 * This mutation is triggered when characters are added to a text node in the editable area.
 *
 * @example
 * ```ts
 * @OnTextInsertion()
 * handleTextInsert(mutation: TextInsertionMutation) {
 *   // e.g., sync model or suggest completions
 * }
 * ```
 */
export function OnTextInsertion(): MethodDecorator {
    return function (target: MutationListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const handler = descriptor.value as (mutation: EditorMutation) => void;
        const metadata: MutationListenerMetadata = {
            mutationType: MutationType.TEXT_INSERTION,
            propertyKey,
            handler,
        };
        addDecoratorMetadata(target, propertyKey, '__mutationListeners', metadata);
    };
}
