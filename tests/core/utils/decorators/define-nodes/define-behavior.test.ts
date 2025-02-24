import { describe, it, expect } from 'vitest';
import { DefineBehavior } from '../../../../../src/core/utils/decorators/define-nodes';

describe('DefineBehavior', () => {
    it('applies default and custom behavior config to target property', () => {
        class TestNode {
            @DefineBehavior({ allowEmpty: true, isBlock: true })
            node: any;
        }

        const instance = new TestNode();

        expect(instance.node).toBeDefined();
        expect(instance.node.behavior).toEqual({
            allowEmpty: true,
            isBlock: true,
            isContent: false,
            keepIndent: false,
            mergeAdjacent: true,
            mergeOnDelete: false,
            persistent: false,
            textContentOnly: false,
        });
    });

    it('does not override unspecified default values', () => {
        class TestNode {
            @DefineBehavior({ isContent: true })
            node: any;
        }

        const instance = new TestNode();

        expect(instance.node.behavior.allowEmpty).toBe(false);
        expect(instance.node.behavior.isContent).toBe(true);
    });

    it('initializes property if it does not exist', () => {
        class TestNode {
            @DefineBehavior({ textContentOnly: true })
            node: any;
        }

        const instance = new TestNode();

        expect(instance.node).toBeDefined();
        expect(instance.node.behavior.textContentOnly).toBe(true);
    });
});
