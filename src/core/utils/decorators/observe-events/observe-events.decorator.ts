import { Ralf } from '../../../../ralf.ts';
import { EventListenerMetadata } from './interfaces';

/**
 * A class decorator that observes and attaches event listeners defined via metadata decorators
 * like `@OnEditorEvent`, `@OnDocumentEvent`, and `@OnShortCut`.
 *
 * This decorator is applied to classes that contain methods decorated with the aforementioned
 * decorators. It automatically sets up the corresponding event listeners on either the editor's
 * contenteditable element (`ralf.editableDiv`) or the global `document`, depending on the target
 * specified in the metadata.
 *
 * The decorator supports activation control through an `options.activate` array, which can limit
 * which decorated methods are actually bound as listeners.
 *
 * It also observes DOM changes to automatically unsubscribe event listeners when the editor node
 * is removed from the DOM, preventing potential memory leaks.
 *
 * ### Requirements:
 * - The class must have a `ralf` property that includes `editableDiv` (a `HTMLElement`) and optionally `options`.
 * - The class may include methods decorated with:
 *   - `@OnEditorEvent` — attaches events to `ralf.editableDiv`
 *   - `@OnDocumentEvent` — attaches events to `document`
 *   - `@OnShortCut` — attaches shortcut-triggered events to `ralf.editableDiv`
 *
 * @template T - The class type which extends a constructor with a `ralf` property.
 * @param constructor - The target class constructor to enhance with observed event listeners.
 * @returns A new class that extends the original class and sets up event observation.
 */

export function ObserveEvents<T extends {
    new(...args: any[]): { ralf: () => Ralf, options?: any };
}>(constructor: T) {
    return class extends constructor {

        private domChangeObserver: MutationObserver | null = null;
        private eventListeners: (() => void)[] = [];

        constructor(...args: any[]) {
            super(...args);
            this.#setupEditorListeners();
            this.#setupDomChangeObserver();
            this.#setupDocumentListeners();
        }

        #setupEditorListeners() {
            const editorEvents: EventListenerMetadata[] = (this as any).__editorEvents || [];
            this.#setupListeners(
                editorEvents,
                this.ralf().editableDiv.addEventListener.bind(this.ralf().editableDiv),
                this.ralf().editableDiv.removeEventListener.bind(this.ralf().editableDiv),
                this,
            );
        }

        #setupDocumentListeners() {
            const documentEvents: EventListenerMetadata[] = (this as any).__documentEvents || [];
            this.#setupListeners(
                documentEvents,
                document.addEventListener.bind(document),
                document.removeEventListener.bind(document),
                this,
            );
        }

        /**
         * Attaches event listeners based on the provided metadata.
         *
         * This method processes an array of `EventListenerMetadata` objects (collected via decorators)
         * and attaches corresponding event listeners to the target (`editor` or `document`). It wraps
         * each handler with logic that checks optional shortcut or filter conditions, such as modifier keys,
         * input type, or a specific target node.
         *
         * If an `options.activate` array is present on the instance, only handlers whose `propertyKey` is
         * included will be attached.
         *
         * Wrapped handlers are stored for future cleanup and are automatically removed when the editor node
         * is removed from the DOM.
         *
         * @param events - An array of metadata entries describing event handlers.
         * @param addListener - The `addEventListener` function from the target node.
         * @param removeListener - The `removeEventListener` function from the target node.
         * @param context - The context (`this`) in which handlers should be called.
         */
        #setupListeners(
            events: EventListenerMetadata[],
            addListener: (eventType: string, handler: EventListener, options?: AddEventListenerOptions) => void,
            removeListener: (eventType: string, handler: EventListener, options?: AddEventListenerOptions) => void,
            context: any,
        ) {
            events.forEach(({ eventType, handler, options, propertyKey }) => {
                if (propertyKey && this.options?.activate && !this.options.activate.includes(propertyKey as string)) return;

                const wrappedHandler = options
                    ? (event: Event) => {
                        if (event instanceof KeyboardEvent) {
                            if (options.ctrlKey !== undefined && options.ctrlKey !== event.ctrlKey) return;
                            if (options.altKey !== undefined && options.altKey !== event.altKey) return;
                            if (options.shiftKey !== undefined && options.shiftKey !== event.shiftKey) return;
                            if (options.key && event.key.toLowerCase() !== options.key?.toLowerCase()) return;
                        }

                        if (options.target && event.target !== options.target) return;
                        if (options.inputType && (event as InputEvent).inputType !== options.inputType) return;
                        if (options.prevent !== false) event.preventDefault();
                        handler.call(context, event);
                    }
                    : (event: Event) => {
                        event.preventDefault();
                        handler.call(context, event);
                    };

                addListener(eventType, wrappedHandler);
                this.eventListeners.push(() => removeListener(eventType, wrappedHandler));
            });
        }

        #setupDomChangeObserver() {
            this.domChangeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (
                        mutation.type === 'childList' &&
                        Array.from(mutation.removedNodes).includes(this.ralf().editableDiv)
                    ) {
                        this.#unsubscribeAll();
                    }
                });
            });
            this.domChangeObserver.observe(this.ralf().editableDiv.parentNode!, { childList: true });
        }

        #unsubscribeAll() {
            this.eventListeners.forEach((unsubscribe) => unsubscribe());
            this.eventListeners = [];
            this.domChangeObserver?.disconnect();
        }
    };
}
