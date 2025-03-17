import { describe, expect, it } from 'vitest';
import { OnSelectionChange } from '../../../../../src/core/utils/decorators/observe-selection';

describe('OnSelectionChange', () => {
    it('should add metadata for ObserveSelection decorator', () => {
        class Test {
            @OnSelectionChange()
            onSelectionChange(): void {}
        }

        const metadata = (Test as any).prototype.__selectionListeners;
        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({ handler: Test.prototype.onSelectionChange });
    });
});
