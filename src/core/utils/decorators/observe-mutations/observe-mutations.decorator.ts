import NodeDeletionMutation from '../../../entities/mutations/node-deletion.mutation.ts';
import NodeInsertionMutation from '../../../entities/mutations/node-insertion.mutation.ts';
import TextDeletionMutation from '../../../entities/mutations/text-deletion.mutation.ts';
import TextInsertionMutation from '../../../entities/mutations/text-insertion.mutation.ts';
import TextMergingMutation from '../../../entities/mutations/text-merging.mutation.ts';
import TextSplittingMutation from '../../../entities/mutations/text-splitting.mutation.ts';
import { EditorMutation } from '../../../entities/mutations/interfaces/editor-mutation.interface.ts';
import { MutationListenerMetadata, TextMutationRecord } from './interfaces';
import { MutationType } from '../../../entities/mutations/enums/mutation-type.enum.ts';
import { Ralf } from '../../../../ralf.ts';
import { StoredSelection } from '../../../entities/stored-selection/stored-selection.entity.ts';
import { isTextNode } from '../../dom/type-checks.utils.ts';

/**
 * A class decorator that enables DOM mutation observation for rich text editing components.
 *
 * When applied, this decorator:
 * - Initializes a live DOM node map (`nodeMap`) that tracks each node's parent and position.
 *   This allows the system to reconstruct where a removed node was located in the document structure.
 * - Starts a `MutationObserver` on the node returned by `ralf().editableDiv`.
 * - Collects and batches native `MutationRecord`s via microtasks for efficient processing.
 * - Transforms raw mutations into semantic editor mutations:
 *   `NodeInsertion`, `NodeDeletion`, `TextInsertion`, `TextDeletion`, `TextMerging`, and `TextSplitting`.
 * - Dispatches these semantic mutations to registered handler functions.
 *
 * The target class must implement a `ralf(): Ralf` method, returning an object with:
 * - `editableDiv: Node` — the root DOM node being observed,
 * - `currentSelection` and `previousSelection` — selection state snapshots of type `StoredSelection`.
 *
 * Mutation listener metadata (`__mutationListeners`) must be registered using auxiliary decorators.
 * These decorators specify which handlers are triggered for specific semantic mutation types.
 *
 * @template T A class constructor that includes a `ralf(): Ralf` method.
 * @param constructor The class constructor being decorated.
 * @returns A new class extending the original, with automatic mutation tracking capabilities.
 */
export function ObserveMutations<T extends {
    new(...args: any[]): { ralf: () => Ralf };
}>(constructor: T) {
    return class extends constructor {

        readonly #mutationListeners: MutationListenerMetadata[];
        #mutationObserver: MutationObserver | null = null;
        #processingScheduled: boolean = false;
        #pendingMutations: MutationRecord[] = [];
        nodeMap = new Map<Node, { parent: Node, position: number }>();

        constructor(...args: any[]) {
            super(...args);
            this.#mutationListeners = (this as any).__mutationListeners || [];
            this.#initializeNodeMap(this.ralf().editableDiv);
            this.#startMutationObserver();
        }

        #initializeNodeMap(root: Node): void {
            const traverse = (node: Node) => {
                Array.from(node.childNodes).forEach((child, position) => {
                    this.nodeMap.set(child, { position, parent: node });
                    traverse(child);
                });
            };
            traverse(root);
        }

        #addToMap(node: Node, parent: Node, previousSibling: Node | null): void {
            let position = 0;
            if (previousSibling)
                position = this.#getNodePosition(previousSibling).position + 1;
            this.nodeMap.forEach((info, child) => {
                if (info.parent === parent && info.position >= position) {
                    this.nodeMap.set(child, { parent, position: info.position + 1 });
                }
            });
            this.nodeMap.set(node, { parent, position });
        }

        #removeFromMap(node: Node): void {
            const { parent, position } = this.#getNodePosition(node);

            this.nodeMap.delete(node);
            if (node.hasChildNodes())
                node.childNodes.forEach((child) => this.nodeMap.delete(child));

            this.nodeMap.forEach((info, child) => {
                if (info.parent === parent && info.position > position) {
                    this.nodeMap.set(child, { parent, position: info.position - 1 });
                }
            });
        }

        #getNodePosition(node: Node): { parent: Node, position: number } {
            const position = this.nodeMap.get(node);
            if (!position) throw new Error('Node not found in map');
            return position;
        }

        #startMutationObserver() {
            this.#mutationObserver = new MutationObserver((mutations) => {
                this.#pendingMutations.push(...mutations);
                if (!this.#processingScheduled) {
                    this.#processingScheduled = true;
                    queueMicrotask(() => this.#processPendingMutations());
                }
            });

            this.#mutationObserver.observe(this.ralf().editableDiv, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeOldValue: true,
                characterData: true,
                characterDataOldValue: true,
            });
        }

        #processPendingMutations(): void {
            this.#processingScheduled = false;

            const mutationsToProcess = [...this.#pendingMutations];
            const mutations: EditorMutation[] = [];
            this.#pendingMutations.length = 0;

            mutationsToProcess.forEach((mutation) => {
                const lastMutation = mutations[mutations.length - 1] || null;
                switch (mutation.type) {
                    case 'characterData':
                        const recognizedMutation = this.#processTextMutation(mutation as TextMutationRecord, lastMutation);
                        if (['textMerging', 'textSplitting'].includes(recognizedMutation.type))
                            mutations.pop();
                        mutations.push(recognizedMutation);
                        break;
                    case 'childList':
                        mutations.push(...this.#processNodeMutation(mutation));
                        break;
                    case 'attributes':
                        break;
                }
            });

            this.#callHandlers(mutations);
        }

        #processNodeMutation(mutation: MutationRecord): EditorMutation[] {
            const mutations: EditorMutation[] = [];
            mutation.addedNodes.forEach((insertedNode) => {
                this.#addToMap(
                    insertedNode,
                    mutation.target,
                    mutation.previousSibling,
                );
                const { parent, position } = this.#getNodePosition(insertedNode);
                mutations.push(NodeInsertionMutation.fromObserved(insertedNode, parent, position));
            });

            mutation.removedNodes.forEach((removedNode) => {
                const { parent, position } = this.#getNodePosition(removedNode);
                this.#removeFromMap(removedNode);
                mutations.push(NodeDeletionMutation.fromObserved(removedNode, parent, position));
            });
            return mutations;
        }

        #processTextMutation(textMutation: TextMutationRecord, lastMutation: EditorMutation): EditorMutation {
            const oldValue = textMutation.oldValue ?? '';
            const newValue = textMutation.target.nodeValue ?? '';
            const lengthDelta = newValue.length - oldValue.length;
            const textNodeLocation = this.#getNodePosition(textMutation.target);

            if (lengthDelta < 0) {
                if (
                    lastMutation && lastMutation.type === 'nodeInsertion'
                    && this.#isTextNodeInsertionMatchingDelta(lastMutation, textNodeLocation.parent, lengthDelta)
                ) {
                    if (this.#isTextSplittingBefore(lastMutation, textNodeLocation.position, oldValue, newValue)) {
                        return TextSplittingMutation.fromObserved(
                            textMutation.target,
                            oldValue.length - newValue.length,
                            lastMutation.insertedNode,
                            'before',
                        );
                    }

                    if (this.#isTextSplittingAfter(lastMutation, textNodeLocation.position, oldValue, newValue)) {
                        return TextSplittingMutation.fromObserved(
                            textMutation.target,
                            oldValue.length - newValue.length - 1,
                            lastMutation.insertedNode,
                            'after',
                        );
                    }
                }

                const offset = this.#pickNonCollapsedSelection().findTextNodeOffsets(textMutation.target);
                return TextDeletionMutation.fromObserved(textMutation.target, offset.start, oldValue.slice(offset.start, offset.end));
            } else {
                if (lastMutation && lastMutation.type === 'nodeDeletion'
                    && this.#matchesTextMergingPattern(lastMutation, textNodeLocation.position, newValue, lengthDelta)
                ) {
                    return TextMergingMutation.fromObserved(textMutation.target, lastMutation.deletedNode, newValue.length - lengthDelta);
                }

                const startOffset = this.ralf().currentSelection.startElement.offset;
                const offset = { start: startOffset, end: lengthDelta + startOffset };
                return TextInsertionMutation.fromObserved(textMutation.target, offset.start, offset.end);
            }
        }

        #callHandlers(mutations: EditorMutation[]): void {
            mutations.forEach(mutation => {
                this.#mutationListeners
                    .filter((listener) => listener.mutationType === mutation.type)
                    .forEach(({ handler }) => handler.call(this, mutation));
            });
        }

        #matchesTextMergingPattern(lastMutation: NodeDeletionMutation, textNodePosition: number, newValue: string, lengthDelta: number): boolean {
            return isTextNode(lastMutation.deletedNode)
                && lastMutation.positionReference.position === textNodePosition + 1
                && newValue.endsWith(lastMutation.deletedNode.textContent!)
                && lastMutation.deletedNode.textContent!.length - lengthDelta === 0;
        }

        #pickNonCollapsedSelection(): StoredSelection {
            const { previousSelection, currentSelection } = this.ralf();
            return currentSelection.isCollapsed ? previousSelection : currentSelection;
        }

        #isTextNodeInsertionMatchingDelta(
            lastMutation: EditorMutation,
            textNodeParent: Node,
            lengthDelta: number,
        ): boolean {
            return lastMutation.type === MutationType.NODE_INSERTION
                && lastMutation.positionReference.node === textNodeParent
                && isTextNode(lastMutation.insertedNode)
                && lengthDelta + lastMutation.insertedNode.textContent!.length === 0;
        }

        #isTextTrimmed(
            oldValue: string,
            newValue: string,
            checkPosition: 'start' | 'end',
            text: string,
        ): boolean {
            return oldValue === (checkPosition === 'start' ? text + newValue : newValue + text);
        }

        #isTextSplittingBefore(
            lastMutation: NodeInsertionMutation,
            textNodePosition: number,
            oldValue: string,
            newValue: string,
        ): boolean {
            return lastMutation.positionReference.position === textNodePosition - 1
                && this.#isTextTrimmed(oldValue, newValue, 'start', lastMutation.insertedNode.textContent!);
        }

        #isTextSplittingAfter(
            lastMutation: NodeInsertionMutation,
            textNodePosition: number,
            oldValue: string,
            newValue: string,
        ): boolean {
            return lastMutation.positionReference.position === textNodePosition + 1
                && this.#isTextTrimmed(oldValue, newValue, 'end', lastMutation.insertedNode.textContent!);
        }
    };
}