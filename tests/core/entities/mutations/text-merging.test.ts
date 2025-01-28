import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextMergingMutation from '../../../../src/core/entities/mutations/text-merging.mutation';
import TextDeletionMutation from '../../../../src/core/entities/mutations/text-deletion.mutation';
import NodeInsertionMutation from '../../../../src/core/entities/mutations/node-insertion.mutation';

vi.mock('../../../../src/core/entities/mutations/text-deletion.mutation', () => {
    const TextDeletionMutation = vi.fn();
    TextDeletionMutation.apply = vi.fn();
    return { default: TextDeletionMutation };
});

vi.mock('../../../../src/core/entities/mutations/node-insertion.mutation', () => {
    const NodeInsertionMutation = vi.fn();
    NodeInsertionMutation.apply = vi.fn();
    return { default: NodeInsertionMutation };
});

describe('TextMergingMutation', () => {
    let parentNode: HTMLDivElement;
    let leftTextNode: Text;
    let rightTextNode: Text;

    beforeEach(() => {
        parentNode = document.createElement('div');
        leftTextNode = document.createTextNode('Hello, ');
        rightTextNode = document.createTextNode('world!');
    });

    it('should create an instance of TextMergingMutation', () => {
        leftTextNode.appendData(rightTextNode.data);
        const mergingMutation = TextMergingMutation.fromObserved(leftTextNode, rightTextNode, 7);

        expect(mergingMutation).toBeInstanceOf(TextMergingMutation);
        expect(mergingMutation.appendedText).toBe('world!');
        expect(mergingMutation.positionReference).toEqual({ node: leftTextNode, position: 7 });
        expect(mergingMutation.removedNode).toBe(rightTextNode);
    });

    it('should throw TypeError for non-text node (right text node)', () => {
        expect(() => {
            TextMergingMutation.apply(leftTextNode, parentNode);
        }).toThrow(TypeError);
    });

    it('should throw TypeError for non-text node (left text node)', () => {
        expect(() => {
            TextMergingMutation.apply(parentNode, rightTextNode);
        }).toThrow(TypeError);
    });

    it('should merge text nodes correctly', () => {
        parentNode.append(leftTextNode, rightTextNode);
        const mergingMutation = TextMergingMutation.apply(leftTextNode, rightTextNode);

        expect(mergingMutation.appendedText).toBe('world!');
        expect(mergingMutation.positionReference).toEqual({ node: leftTextNode, position: 7 });
        expect(mergingMutation.removedNode).toBe(rightTextNode);

        expect(parentNode.childNodes.length).toBe(1);
        expect(leftTextNode.textContent).toBe('Hello, world!');
        expect(rightTextNode.parentNode).toBeNull();
    });

    it('undo() should call TextDeletionMutation and NodeInsertionMutation', () => {
        parentNode.append(leftTextNode, rightTextNode);
        const mergingMutation = TextMergingMutation.apply(leftTextNode, rightTextNode);
        mergingMutation.undo();

        expect(TextDeletionMutation.apply).toHaveBeenCalledWith(leftTextNode, 7, 13);
        expect(NodeInsertionMutation.apply).toHaveBeenCalledWith(rightTextNode, parentNode, 1);
    });
});
