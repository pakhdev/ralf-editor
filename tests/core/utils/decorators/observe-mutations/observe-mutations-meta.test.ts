import { describe, expect, it } from 'vitest';
import {
    OnNodeDeletion, OnNodeInsertion,
    OnTextDeletion, OnTextInsertion, OnTextMerging, OnTextSplitting,
} from '../../../../../src/core/utils/decorators/observe-mutations';
import { MutationType } from '../../../../../src/core/entities/mutations/enums/mutation-type.enum';

describe('Observe mutations meta', () => {
    it('should add metadata for OnNodeDeletion', () => {
        class Test {
            @OnNodeDeletion()
            testHandler() {}
        }

        const metadata = (Test as any).prototype.__mutationListeners;
        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            mutationType: MutationType.NODE_DELETION,
            handler: Test.prototype.testHandler,
        });
    });

    it('should add metadata for OnNodeInsertion', () => {
        class Test {
            @OnNodeInsertion()
            testHandler() {}
        }

        const metadata = (Test as any).prototype.__mutationListeners;
        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            mutationType: MutationType.NODE_INSERTION,
            handler: Test.prototype.testHandler,
        });
    });

    it('should add metadata for OnTextDeletion', () => {
        class Test {
            @OnTextDeletion()
            testHandler() {}
        }

        const metadata = (Test as any).prototype.__mutationListeners;
        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            mutationType: MutationType.TEXT_DELETION,
            handler: Test.prototype.testHandler,
        });
    });

    it('should add metadata for OnTextInsertion', () => {
        class Test {
            @OnTextInsertion()
            testHandler() {}
        }

        const metadata = (Test as any).prototype.__mutationListeners;
        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            mutationType: MutationType.TEXT_INSERTION,
            handler: Test.prototype.testHandler,
        });
    });

    it('should add metadata for OnTextMerging', () => {
        class Test {
            @OnTextMerging()
            testHandler() {}
        }

        const metadata = (Test as any).prototype.__mutationListeners;
        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            mutationType: MutationType.TEXT_MERGING,
            handler: Test.prototype.testHandler,
        });
    });

    it('should add metadata for OnTextSplitting', () => {
        class Test {
            @OnTextSplitting()
            testHandler() {}
        }

        const metadata = (Test as any).prototype.__mutationListeners;
        expect(metadata).toHaveLength(1);
        expect(metadata[0]).toMatchObject({
            mutationType: MutationType.TEXT_SPLITTING,
            handler: Test.prototype.testHandler,
        });
    });
});
