import { EditorMutation } from '../../../entities/mutations/interfaces/editor-mutation.interface.ts';
import { MutationListenerMetadata, MutationListenersClass } from './interfaces';
import { MutationType } from '../../../entities/mutations/enums/mutation-type.enum.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Declares that a method should handle `TextDeletion` editor mutations.
 * Stores metadata that can later be processed by the `ObserveMutations` decorator.
 *
 * This mutation is triggered when characters are removed from a text node.
 *
 * @example
 * ```ts
 * @OnTextDeletion()
 * handleTextDelete(mutation: TextDeletionMutation) {
 *   // e.g., log undo steps or update analytics
 * }
 * ```
 */

export function OnTextDeletion(): MethodDecorator {
    return function (target: MutationListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const handler = descriptor.value as (mutation: EditorMutation) => void;
        const metadata: MutationListenerMetadata = {
            mutationType: MutationType.TEXT_DELETION,
            propertyKey,
            handler,
        };
        addDecoratorMetadata(target, propertyKey, '__mutationListeners', metadata);
    };
}
