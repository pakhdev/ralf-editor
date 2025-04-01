import { EditorMutation } from '../../../entities/mutations/interfaces/editor-mutation.interface.ts';
import { MutationListenerMetadata, MutationListenersClass } from './interfaces';
import { MutationType } from '../../../entities/mutations/enums/mutation-type.enum.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Declares that a method should handle `TextSplitting` editor mutations.
 * Stores metadata that can later be processed by the `ObserveMutations` decorator.
 *
 * This mutation is triggered when a text node is split into two separate nodes.
 *
 * @example
 * ```ts
 * @OnTextSplitting()
 * handleTextSplit(mutation: TextSplittingMutation) {
 *   // e.g., create a new paragraph element
 * }
 * ```
 */
export function OnTextSplitting(): MethodDecorator {
    return function (target: MutationListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const handler = descriptor.value as (mutation: EditorMutation) => void;
        const metadata: MutationListenerMetadata = {
            mutationType: MutationType.TEXT_SPLITTING,
            propertyKey,
            handler,
        };
        addDecoratorMetadata(target, propertyKey, '__mutationListeners', metadata);
    };
}
