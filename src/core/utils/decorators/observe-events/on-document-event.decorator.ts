import { EventListenerMetadata, EventListenersClass, ShortcutOptions } from './interfaces';
import { parseShortcutCombination } from './utils/parse-shortcut-combination.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Declares that a method should listen to a specific DOM event on the `document` object.
 * Stores metadata that can later be processed by the `ObserveEvents` decorator.
 *
 * @param eventType - The type of the DOM event to listen for (e.g., `'keydown'`, `'click'`).
 * @param options - Optional configuration, including shortcut combinations and event options like `ctrlKey`, `altKey`, `prevent`, etc.
 *
 * @example
 * ```ts
 * @OnDocumentEvent('keydown', { combination: 'Ctrl+Z', target: document.body })
 * handleUndoShortcut(event: KeyboardEvent) {
 *   // ...
 * }
 * ```
 */
export function OnDocumentEvent(
    eventType: string,
    options?: ShortcutOptions,
): MethodDecorator {
    return function (target: EventListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const handler = descriptor.value as (event: Event) => void;
        const metadata: EventListenerMetadata = {
            eventType,
            propertyKey,
            selector: 'document',
            options: options?.combination ? { ...options, ...parseShortcutCombination(options.combination) } : options,
            handler,
        };
        addDecoratorMetadata(target, propertyKey, '__documentEvents', metadata);
    };
}
