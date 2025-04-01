import { EditorMutation } from '../../../entities/mutations/interfaces/editor-mutation.interface.ts';
import { MutationListenerMetadata, MutationListenersClass } from './interfaces';
import { MutationType } from '../../../entities/mutations/enums/mutation-type.enum.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Declares that a method should handle `NodeDeletion` editor mutations.
 * Stores metadata that can later be processed by the `ObserveMutations` decorator.
 *
 * This mutation is triggered when a DOM node is removed from the observed editable area.
 *
 * @example
 * ```ts
 * @OnNodeDeletion()
 * handleNodeRemove(mutation: NodeDeletionMutation) {
 *   // e.g., clean up references or update model
 * }
 * ```
 */
export function OnNodeDeletion(): MethodDecorator {
    return function (target: MutationListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const handler = descriptor.value as (mutation: EditorMutation) => void;
        const metadata: MutationListenerMetadata = {
            mutationType: MutationType.NODE_DELETION,
            propertyKey,
            handler,
        };
        addDecoratorMetadata(target, propertyKey, '__mutationListeners', metadata);
    };
}
