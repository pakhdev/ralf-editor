import { beforeEach, describe, expect, it, vi } from 'vitest';

import NodeInsertionMutation from '../../../../src/core/entities/mutations/node-insertion.mutation';
import NodeDeletionMutation from '../../../../src/core/entities/mutations/node-deletion.mutation';

vi.mock('../../../../src/core/entities/mutations/node-deletion.mutation', () => {
    const NodeDeletionMutation = vi.fn();
    NodeDeletionMutation.prototype.execute = vi.fn();
    return { default: NodeDeletionMutation };
});

describe('NodeInsertionMutation', () => {
    let parent: HTMLDivElement;

    beforeEach(() => {
        parent = document.createElement('div');
    });

    it('Execute: inserts the correct node', () => {
        const nodeToInsert = document.createTextNode('Insert this');
        const insertionMutation = new NodeInsertionMutation(nodeToInsert, { node: parent, position: 0 });
        insertionMutation.execute();

        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes[0].textContent).toBe('Insert this');
        expect(nodeToInsert.parentNode).toBe(parent);
    });

    it('Execute: throws error for incorrect position', () => {
        const nodeToInsert = document.createTextNode('Insert this');
        expect(() => new NodeInsertionMutation(nodeToInsert, { node: parent, position: 2 }).execute()).toThrowError();
    });

    it('Undo: calls NodeDeletionMutation with correct parameters', () => {
        const insertedNode = document.createTextNode('Inserted node');
        const insertionMutation = new NodeInsertionMutation(insertedNode, { node: parent, position: 0 });
        insertionMutation.undo();
        expect(NodeDeletionMutation).toHaveBeenCalledWith(insertedNode, { node: parent, position: 0 });
        expect(NodeDeletionMutation.prototype.execute).toHaveBeenCalled();
    });
});