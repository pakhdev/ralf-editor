import { Ralf } from '../../../ralf.ts';
import { EditorMutation } from '../mutations/interfaces/editor-mutation.interface.ts';
import { FindMutationOptions } from './interfaces/find-mutation-options.interface.ts';

/**
 * Manages a sequence of editor mutations within a transactional context.
 * Used to track changes (mutations) for features like undo/redo or computed selection.
 */
export default class Transaction {
    #mutations: EditorMutation[] = [];

    constructor(private readonly ralf: Ralf) {}

    /**
     * Checks whether the transaction currently contains any mutations.
     *
     * @returns `true` if there are mutations recorded, otherwise `false`.
     */
    hasMutations(): boolean {
        return this.#mutations.length > 0;
    }

    /**
     * Adds a new mutation to the transaction.
     *
     * @param mutation - The mutation to be recorded.
     */
    addMutation(mutation: EditorMutation): void {
        this.#mutations.push(mutation);
    }

    /**
     * Finds a mutation in the transaction history based on the provided criteria.
     * If no criteria are given, returns the first mutation by default.
     *
     * @param terms - Search options:
     *  - `type`: A single mutation type or an array of types to match against.
     *  - `direction`: Whether to search from the 'first' (default) or 'last' mutation.
     *
     * @returns The matched mutation or `null` if no match is found.
     */
    findMutation(terms: FindMutationOptions): EditorMutation | null {
        const matchTypes = terms.type ? Array.isArray(terms.type) ? terms.type : [terms.type] : [];
        const mutations = terms.direction === 'last' ? [...this.#mutations].reverse() : this.#mutations;
        return mutations.find(mutation => !matchTypes.length || matchTypes.includes(mutation.type)) || null;
    }
}
