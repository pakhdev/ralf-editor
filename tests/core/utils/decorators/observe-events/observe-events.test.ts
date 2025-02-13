import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObserveEvents, OnDocumentEvent, OnEditorEvent } from '../../../../../src/core/utils/decorators/observe-events';

class MockRalf {
    editableDiv: HTMLElement;

    constructor() {
        this.editableDiv = document.createElement('div');
        document.body.appendChild(this.editableDiv);
    }
}

@ObserveEvents
class TestClass {
    public ralf: any;
    public options?: any;
    public handlerSpy = vi.fn();
    public docSpy = vi.fn();

    constructor(ralf: any, options?: any) {
        this.ralf = ralf;
        this.options = options;
    }

    @OnEditorEvent('keydown', { combination: 'Ctrl+Z' })
    onUndo(e: KeyboardEvent) {
        this.handlerSpy(e);
    }

    @OnDocumentEvent('keydown', { combination: 'Ctrl+Y', target: document.body })
    onRedo(e: KeyboardEvent) {
        this.docSpy(e);
    }

    @OnDocumentEvent('keydown', { combination: 'Ctrl+B', target: document.body, prevent: false })
    onRedoNotPrevent(e: KeyboardEvent) {
        this.docSpy(e);
    }
}

describe('ObserveEvents', () => {
    let ralf: MockRalf;
    let instance: TestClass;

    beforeEach(() => {
        ralf = new MockRalf();
        instance = new TestClass(ralf);
    });

    it('should bind editor event with modifiers', () => {
        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' });
        ralf.editableDiv.dispatchEvent(event);
        expect(instance.handlerSpy).toHaveBeenCalledWith(event);
    });

    it('should bind document event to specific target', () => {
        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'y', bubbles: true });
        document.body.dispatchEvent(event);
        expect(instance.docSpy).toHaveBeenCalledWith(event);
    });

    it('should prevent default behavior by default', () => {
        const preventDefault = vi.fn();
        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' });
        Object.defineProperty(event, 'preventDefault', {
            value: preventDefault,
        });
        ralf.editableDiv.dispatchEvent(event);
        expect(preventDefault).toHaveBeenCalled();
    });

    it('should not prevent default behavior when prevent is false', () => {
        const preventDefault = vi.fn();
        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'b' });
        Object.defineProperty(event, 'preventDefault', {
            value: preventDefault,
        });
        ralf.editableDiv.dispatchEvent(event);
        expect(preventDefault).not.toHaveBeenCalled();
    });

    it('should unsubscribe events when editableDiv is removed', async () => {
        ralf.editableDiv.remove();
        await new Promise((resolve) => setTimeout(resolve, 50));

        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' });
        ralf.editableDiv.dispatchEvent(event);
        expect(instance.handlerSpy).not.toHaveBeenCalled();
    });
});