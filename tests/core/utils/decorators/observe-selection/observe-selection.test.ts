import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ObserveSelection } from '../../../../../src/core/utils/decorators/observe-selection';

class MockRalf {
    editableDiv: HTMLElement;

    constructor(editableDiv: HTMLElement) {
        this.editableDiv = editableDiv;
        document.body.appendChild(this.editableDiv);
    }
}

@ObserveSelection
class SelectionHandler {
    testMethod = vi.fn();
    __selectionListeners = [{ handler: this.testMethod }];

    constructor(public ralf: any) {}
}

describe('ObserveSelection decorator', () => {

    let instance: SelectionHandler;
    const editableDiv = document.createElement('div');
    editableDiv.setAttribute('contenteditable', 'true');

    beforeEach(() => {
        instance = new SelectionHandler(new MockRalf(editableDiv));
        (instance as any).__selectionListeners = [{ handler: instance.testMethod }];
    });

    function triggerEvent(eventName: string, event?: Event) {
        const methodName = {
            'mousedown': 'onMouseDown',
            'focus': 'onFocus',
            'selectionchange': 'onSelectionChange',
            'mouseup': 'onMouseUp',
            'keyup': 'onArrowKey',
        }[eventName];

        if (!methodName) throw new Error(`Unknown event: ${ eventName }`);

        if (!event) {
            if (eventName === 'keyup') {
                event = new KeyboardEvent('keyup', { code: 'ArrowRight' });
            } else if (eventName === 'mousedown') {
                event = new MouseEvent('mousedown', { button: 0 });
            } else {
                event = new Event(eventName);
            }
        }

        (instance as any)[methodName](event);
    }

    it('Focusing with a click: mousedown -> focus -> selectionchange -> mouseup', () => {
        triggerEvent('mousedown');
        triggerEvent('focus');
        triggerEvent('selectionchange');
        triggerEvent('mouseup');
        expect(instance.testMethod).toHaveBeenCalledTimes(1);
    });

    it('Focusing with Tab key: focus -> selectionchange', () => {
        triggerEvent('focus');
        triggerEvent('selectionchange');
        expect(instance.testMethod).toHaveBeenCalledTimes(1);
    });

    it('Moving with arrow keys: selectionchange -> keyup', () => {
        triggerEvent('selectionchange');
        triggerEvent('keyup', new KeyboardEvent('keyup', { code: 'ArrowRight' }));
        expect(instance.testMethod).toHaveBeenCalledTimes(1);
    });

    it('Moving with a right click: mousedown -> selectionchange -> mouseup', () => {
        triggerEvent('mousedown', new MouseEvent('mousedown', { button: 2 }));
        triggerEvent('selectionchange');
        triggerEvent('mouseup');
        expect(instance.testMethod).toHaveBeenCalledTimes(1);
    });

    it('Moving with a left click: mousedown -> selectionchange -> mouseup', () => {
        triggerEvent('mousedown', new MouseEvent('mousedown', { button: 0 }));
        triggerEvent('selectionchange');
        triggerEvent('mouseup');
        expect(instance.testMethod).toHaveBeenCalledTimes(1);
    });
});
