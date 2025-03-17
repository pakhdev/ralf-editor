import { SelectionListenerMetadata } from './interfaces/selection-listener-metadata.interface.ts';
import { SelectionListenersClass } from './interfaces/selection-listeners-class.interface.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Method decorator to register an event handler for the `selectionchange` event.
 * This decorator adds the method as a handler for the `selectionchange` event.
 * The decorated method should accept a single argument: an `Event` object.
 *
 * @example
 * ```typescript
 * class MyClass {
 *   @OnSelectionChange()
 *   handleSelectionChange(event: Event): void {
 *     console.log('Selection changed', event);
 *   }
 * }
 * ```
 * In this example, the `handleSelectionChange` method will be called when the `selectionchange` event occurs.
 */
export function OnSelectionChange(): MethodDecorator {
    return function (target: SelectionListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const handler = descriptor.value as (event: Event) => void;
        const metadata: SelectionListenerMetadata = { handler };
        addDecoratorMetadata(target, propertyKey, '__selectionListeners', metadata);
    };
}