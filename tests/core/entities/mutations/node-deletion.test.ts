import { beforeEach, describe, expect, it, vi } from 'vitest';
import NodeDeletionMutation from '../../../../src/core/entities/mutations/node-deletion.mutation';

import NodeInsertionMutation from '../../../../src/core/entities/mutations/node-insertion.mutation';

vi.mock('../../../../src/core/entities/mutations/node-insertion.mutation', () => {
    const NodeInsertionMutation = vi.fn();
    NodeInsertionMutation.apply = vi.fn();
    return { default: NodeInsertionMutation };
});

describe('NodeDeletionMutation', () => {
    let parent: HTMLDivElement;

    beforeEach(() => {
        parent = document.createElement('div');
    });

    it('should create an instance of NodeDeletionMutation', () => {
        const deletedNode = document.createTextNode('Deleted node');
        const deletionMutation = NodeDeletionMutation.fromObserved(deletedNode, parent, 0);

        expect(deletionMutation).toBeInstanceOf(NodeDeletionMutation);
        expect(deletionMutation.deletedNode).toBe(deletedNode);
        expect(deletionMutation.positionReference).toEqual({ node: parent, position: 0 });
    });

    it('should throw an error when the node has no parent', () => {
        const nodeWithoutParent = document.createTextNode('No parent');
        expect(() => {
            NodeDeletionMutation.apply(nodeWithoutParent);
        }).toThrowError;
    });

    it('should delete the correct node', () => {
        const nodeBefore = document.createTextNode('Node before');
        const nodeToDelete = document.createTextNode('Delete this');
        const nodeAfter = document.createTextNode('Node after');
        parent.append(nodeBefore, nodeToDelete, nodeAfter);

        NodeDeletionMutation.apply(nodeToDelete);

        expect(parent.childNodes.length).toBe(2);
        expect(parent.childNodes[0].textContent).toBe('Node before');
        expect(parent.childNodes[1].textContent).toBe('Node after');
        expect(nodeToDelete.parentNode).toBe(null);
    });

    it('Undo: calls NodeInsertionMutation with correct parameters', () => {
        const deletedNode = document.createTextNode('Deleted node');
        parent.append(deletedNode);

        const deletionMutation = NodeDeletionMutation.apply(deletedNode);
        deletionMutation.undo();

        expect(NodeInsertionMutation.apply).toHaveBeenCalledWith(deletedNode, parent, 0);
    });
});