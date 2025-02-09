import { EventListenerMetadata, EventListenersClass } from './interfaces';
import { parseShortcutCombination } from './utils/parse-shortcut-combination.ts';
import { addDecoratorMetadata } from '../../classes/meta.utils.ts';

/**
 * Shorthand decorator specifically for keyboard shortcuts.
 * Internally works like `OnEditorEvent`, but explicitly requires a key combination string.
 *
 * @param eventType - Typically `'keydown'`.
 * @param combination - The key combination to match (e.g., `'Ctrl+Z'`, `'Shift+Enter'`).
 *
 * @example
 * ```ts
 * @OnShortCut('keydown', 'Ctrl+S')
 * handleSave(event: KeyboardEvent) {
 *   // ...
 * }
 * ```
 */
export function OnShortCut(
    eventType: string,
    combination: string,
): MethodDecorator {
    return function (target: EventListenersClass, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const handler = descriptor.value as (event: Event) => void;
        const options = parseShortcutCombination(combination);
        const metadata: EventListenerMetadata = {
            eventType,
            propertyKey,
            selector: 'editor',
            options,
            handler,
            shortcut: combination,
        };
        addDecoratorMetadata(target, propertyKey, '__editorEvents', metadata);
    };
}
