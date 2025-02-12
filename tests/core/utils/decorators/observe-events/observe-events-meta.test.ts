import { describe, it, expect } from 'vitest';
import { OnDocumentEvent, OnEditorEvent, OnShortCut } from '../../../../../src/core/utils/decorators/observe-events';

describe('Event Decorators', () => {
    it('should add metadata for OnEditorEvent', () => {
        class Test {
            @OnEditorEvent('keydown', { combination: 'Ctrl+Z' })
            handleKey() {}
        }

        const metadata = (Test as any).prototype.__editorEvents;

        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            eventType: 'keydown',
            propertyKey: 'handleKey',
            selector: 'editor',
            options: expect.objectContaining({ combination: 'Ctrl+Z', ctrlKey: true, key: 'Z' }),
        });
    });

    it('should add metadata for OnDocumentEvent', () => {
        class Test {
            @OnDocumentEvent('keydown', { combination: 'Ctrl+Y', target: document.body })
            handleDocKey() {}
        }

        const metadata = (Test as any).prototype.__documentEvents;

        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            eventType: 'keydown',
            propertyKey: 'handleDocKey',
            selector: 'document',
            options: expect.objectContaining({ combination: 'Ctrl+Y', ctrlKey: true, key: 'Y' }),
        });
    });

    it('should add metadata for OnShortCut', () => {
        class Test {
            @OnShortCut('keydown', 'Ctrl+S')
            handleSave() {}
        }

        const metadata = (Test as any).prototype.__editorEvents;

        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            eventType: 'keydown',
            propertyKey: 'handleSave',
            selector: 'editor',
            options: expect.objectContaining({ ctrlKey: true, key: 'S' }),
            shortcut: 'Ctrl+S',
        });
    });
});
