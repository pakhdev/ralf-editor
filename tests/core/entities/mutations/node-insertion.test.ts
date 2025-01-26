import { beforeEach, describe, expect, it, vi } from 'vitest';

import NodeInsertionMutation from '../../../../src/core/entities/mutations/node-insertion.mutation';
import NodeDeletionMutation from '../../../../src/core/entities/mutations/node-deletion.mutation';

vi.mock('../../../../src/core/entities/mutations/node-deletion.mutation', () => {
    const NodeDeletionMutation = vi.fn();
    NodeDeletionMutation.apply = vi.fn();
    return { default: NodeDeletionMutation };
});

describe('NodeInsertionMutation', () => {
    let parent: HTMLDivElement;

    beforeEach(() => {
        parent = document.createElement('div');
    });

    it('should create an instance of NodeInsertionMutation', () => {
        const insertedNode = document.createTextNode('Inserted node');
        const insertionMutation = NodeInsertionMutation.fromObserved(insertedNode, parent, 0);
        
        expect(insertionMutation).toBeInstanceOf(NodeInsertionMutation);
        expect(insertionMutation.insertedNode).toBe(insertedNode);
        expect(insertionMutation.positionReference).toEqual({ node: parent, position: 0 });
    });

    it('should throw a Range error when the position is incorrect (negative)', () => {
        expect(() => {
            NodeInsertionMutation.apply(document.createTextNode('Insert this'), parent, -1);
        }).toThrow(RangeError);
    });

    it('should throw a Range error when the position is incorrect', () => {
        expect(() => {
            NodeInsertionMutation.apply(document.createTextNode('Insert this'), parent, 1);
        }).toThrow(RangeError);
    });

    it('should allow inserting a node at the end', () => {
        expect(() => {
            NodeInsertionMutation.apply(document.createTextNode('Insert this'), parent, 0);
        }).not.toThrow(RangeError);
    });

    it('should insert the node correctly', () => {
        const nodeToInsert = document.createTextNode('Insert this');
        const insertionMutation = NodeInsertionMutation.apply(nodeToInsert, parent, 0);

        expect(insertionMutation.insertedNode).toBe(nodeToInsert);
        expect(insertionMutation.positionReference).toEqual({ node: parent, position: 0 });

        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes[0].textContent).toBe('Insert this');
        expect(nodeToInsert.parentNode).toBe(parent);
    });

    it('undo should call NodeDeletionMutation with correct parameters', () => {
        const insertedNode = document.createTextNode('Inserted node');
        const insertionMutation = new NodeInsertionMutation(insertedNode, { node: parent, position: 0 });
        insertionMutation.undo();
        expect(NodeDeletionMutation.apply).toHaveBeenCalledWith(insertedNode);
    });
});