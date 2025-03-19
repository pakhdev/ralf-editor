import { Ralf } from '../../../../ralf.ts';
import { ObserveEvents, OnDocumentEvent, OnEditorEvent } from '../observe-events';
import { SelectionListenerMetadata } from './interfaces/selection-listener-metadata.interface.ts';

type Constructor<T = {}> = new (...args: any[]) => T;

export function ObserveSelectionMixin<TBase extends Constructor<{ ralf: Ralf; }>>(Base: TBase) {
    class SelectionObserver extends ObserveEvents(Base) {
        private selectionListeners: SelectionListenerMetadata[] = [];
        private mouseUpPending = false;
        private selectionChangePending = false;

        constructor(...args: any[]) {
            super(...args);
            this.selectionListeners = (this as any).__selectionListeners || [];
        }

        callSelectionListeners(event: Event): void {
            this.selectionListeners.forEach(({ handler }) => handler.call(this, event));
        }

        @OnEditorEvent('focus', { prevent: false })
        onFocus(): void {
            this.selectionChangePending = true;
        }

        @OnEditorEvent('keyup', { prevent: false })
        onArrowKey(event: KeyboardEvent): void {
            if (event.code.startsWith('Arrow'))
                this.callSelectionListeners(event);
        }

        @OnEditorEvent('mousedown', { prevent: false })
        onMouseDown(): void {
            this.mouseUpPending = true;
            this.selectionChangePending = true;
        }

        @OnDocumentEvent('mouseup', { prevent: false })
        onMouseUp(event: Event): void {
            if (this.mouseUpPending) {
                if (!this.selectionChangePending)
                    this.callSelectionListeners(event);
                this.mouseUpPending = false;
            }
        }

        @OnDocumentEvent('selectionchange', { prevent: false })
        onSelectionChange(event: Event): void {
            if (this.selectionChangePending) {
                if (!this.mouseUpPending)
                    this.callSelectionListeners(event);
                this.selectionChangePending = false;
            }
        }
    }

    return SelectionObserver;
}

export function ObserveSelection<TBase extends Constructor<{ ralf: Ralf; }>>(Base: TBase) {
    return ObserveSelectionMixin(Base);
}
