import { beforeEach, describe, expect, it, vi } from 'vitest';
import NodeDeletionMutation from '../../../../src/core/entities/mutations/node-deletion.mutation';

import NodeInsertionMutation from '../../../../src/core/entities/mutations/node-insertion.mutation';

vi.mock('../../../../src/core/entities/mutations/node-insertion.mutation', () => {
    const NodeInsertionMutation = vi.fn();
    NodeInsertionMutation.prototype.execute = vi.fn();
    return { default: NodeInsertionMutation };
});

describe('NodeDeletionMutation', () => {
    let parent: HTMLDivElement;

    beforeEach(() => {
        parent = document.createElement('div');
    });

    it('Execute: deletes the correct node', () => {
        const nodeBefore = document.createTextNode('Node before');
        const nodeToDelete = document.createTextNode('Delete this');
        const nodeAfter = document.createTextNode('Node after');
        parent.append(nodeBefore, nodeToDelete, nodeAfter);
        new NodeDeletionMutation(nodeToDelete).execute();

        expect(parent.childNodes.length).toBe(2);
        expect(parent.childNodes[0].textContent).toBe('Node before');
        expect(parent.childNodes[1].textContent).toBe('Node after');
        expect(nodeToDelete.parentNode).toBe(null);
    });

    it('Undo: calls NodeInsertionMutation with correct parameters', () => {
        const deletedNode = document.createTextNode('Deleted node');
        const deletionMutation = new NodeDeletionMutation(deletedNode, { node: parent, position: 0 });
        deletionMutation.undo();
        expect(NodeInsertionMutation).toHaveBeenCalledWith(deletedNode, { node: parent, position: 0 });
        expect(NodeInsertionMutation.prototype.execute).toHaveBeenCalled();
    });
});