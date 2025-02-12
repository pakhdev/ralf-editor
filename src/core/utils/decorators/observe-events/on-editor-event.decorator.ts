import { EventListenerMetadata, EventListenersClass, ShortcutOptions } from './interfaces';
import { parseShortcutCombination } from './utils/parse-shortcut-combination.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Declares that a method should listen to a specific DOM event on the editor root element.
 * Stores metadata that can later be processed by the `ObserveEvents` decorator.
 *
 * @param eventType - The type of the DOM event to listen for (e.g., `'keydown'`, `'input'`, `'paste'`).
 * @param options - Optional configuration, including shortcut combinations and behavior modifiers.
 *
 * @example
 * ```ts
 * @OnEditorEvent('keydown', { combination: 'Backspace' })
 * handleBackspace(event: KeyboardEvent) {
 *   // ...
 * }
 * ```
 */
export function OnEditorEvent(
    eventType: string,
    options?: ShortcutOptions,
): MethodDecorator {
    return function (target: EventListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
        const handler = descriptor.value as (event: Event) => void;
        const metadata: EventListenerMetadata = {
            eventType,
            propertyKey,
            selector: 'editor',
            options: options?.combination ? { ...options, ...parseShortcutCombination(options.combination) } : options,
            handler,
        };

        addDecoratorMetadata(target, propertyKey, '__editorEvents', metadata);
    };
}

