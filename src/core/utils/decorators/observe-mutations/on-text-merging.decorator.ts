import { EditorMutation } from '../../../entities/mutations/interfaces/editor-mutation.interface.ts';
import { MutationListenerMetadata, MutationListenersClass } from './interfaces';
import { MutationType } from '../../../entities/mutations/enums/mutation-type.enum.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Declares that a method should handle `TextMerging` editor mutations.
 * Stores metadata that can later be processed by the `ObserveMutations` decorator.
 *
 * This mutation is triggered when two text nodes are merged into one.
 *
 * @example
 * ```ts
 * @OnTextMerging()
 * handleTextMerge(mutation: TextMergingMutation) {
 *   // e.g., normalize structure after deletion
 * }
 * ```
 */

export function OnTextMerging(): MethodDecorator {
    return function (target: MutationListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const handler = descriptor.value as (mutation: EditorMutation) => void;
        const metadata: MutationListenerMetadata = {
            mutationType: MutationType.TEXT_MERGING,
            propertyKey,
            handler,
        };
        addDecoratorMetadata(target, propertyKey, '__mutationListeners', metadata);
    };
}
