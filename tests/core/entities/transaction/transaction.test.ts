import NodeInsertionMutation from '../../../../src/core/entities/mutations/node-insertion.mutation';
import TextDeletionMutation from '../../../../src/core/entities/mutations/text-deletion.mutation';
import TextInsertionMutation from '../../../../src/core/entities/mutations/text-insertion.mutation';
import Transaction from '../../../../src/core/entities/transaction/transaction.entity';
import { MutationType } from '../../../../src/core/entities/mutations/enums/mutation-type.enum';
import { describe, it, expect, beforeEach } from 'vitest';

class MockRalf {}

describe('Transaction', () => {
    let transaction: Transaction;
    let textNode: Text;

    beforeEach(() => {
        const ralf = new MockRalf();
        transaction = new Transaction(ralf as any);
        textNode = document.createTextNode('hello world');
    });

    it('should start with no mutations', () => {
        expect(transaction.hasMutations()).toBe(false);
    });

    it('should detect added mutations', () => {
        const mutation = TextDeletionMutation.fromObserved(textNode, 0, 'hello');
        transaction.addMutation(mutation);
        expect(transaction.hasMutations()).toBe(true);
    });

    it('should find the last mutation by type', () => {
        const mutation1 = TextDeletionMutation.fromObserved(textNode, 0, 'hello');
        const mutation2 = TextDeletionMutation.fromObserved(textNode, 6, 'world');
        const mutation3 = TextInsertionMutation.fromObserved(textNode, 1, 2);
        transaction.addMutation(mutation1);
        transaction.addMutation(mutation2);
        transaction.addMutation(mutation3);

        const found = transaction.findMutation({ type: MutationType.TEXT_DELETION, direction: 'last' });
        expect(found).toBe(mutation2);
    });

    it('should find the first mutation by type', () => {
        const mutation1 = TextInsertionMutation.fromObserved(textNode, 1, 2);
        const mutation2 = TextDeletionMutation.fromObserved(textNode, 0, 'hello');
        transaction.addMutation(mutation1);
        transaction.addMutation(mutation2);

        const found = transaction.findMutation({ type: MutationType.TEXT_DELETION, direction: 'first' });
        expect(found).toBe(mutation2);
    });

    it('should return null if no matching mutation found', () => {
        const found = transaction.findMutation({ type: MutationType.TEXT_DELETION, direction: 'first' });
        expect(found).toBeNull();
    });

    it('should support multiple types in search', () => {
        const mutation1 = NodeInsertionMutation.fromObserved(textNode, document.createElement('div'), 0);
        const mutation2 = TextDeletionMutation.fromObserved(textNode, 0, 'hello');
        const mutation3 = TextInsertionMutation.fromObserved(textNode, 1, 2);
        transaction.addMutation(mutation1);
        transaction.addMutation(mutation2);
        transaction.addMutation(mutation3);

        const found = transaction.findMutation({
            type: [MutationType.TEXT_INSERTION, MutationType.TEXT_DELETION],
            direction: 'first',
        });
        expect(found).toBe(mutation2);
    });

    it('should return the first mutation if no options are passed', () => {
        const mutation1 = TextDeletionMutation.fromObserved(textNode, 0, 'hello');
        const mutation2 = TextDeletionMutation.fromObserved(textNode, 6, 'world');
        transaction.addMutation(mutation1);
        transaction.addMutation(mutation2);

        const found = transaction.findMutation({});
        expect(found).toBe(mutation1);
    });

    it('should return the last mutation if direction is "last" and no type is specified', () => {
        const mutation1 = TextDeletionMutation.fromObserved(textNode, 0, 'hello');
        const mutation2 = TextDeletionMutation.fromObserved(textNode, 6, 'world');
        transaction.addMutation(mutation1);
        transaction.addMutation(mutation2);

        const found = transaction.findMutation({ direction: 'last' });
        expect(found).toBe(mutation2);
    });

});
