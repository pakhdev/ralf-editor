import { EditorMutation } from '../../../entities/mutations/interfaces/editor-mutation.interface.ts';
import { MutationListenerMetadata, TextMutationRecord } from './interfaces';
import { PositionReference } from '../../../entities/mutations/interfaces/position-reference.interface.ts';
import { Ralf } from '../../../../ralf.ts';
import { StoredSelection } from '../../../entities/stored-selection/stored-selection.entity.ts';
import { isTextNode } from '../../dom/type-checks.utils.ts';
import NodeDeletionMutation from '../../../entities/mutations/node-deletion.mutation.ts';
import NodeInsertionMutation from '../../../entities/mutations/node-insertion.mutation.ts';
import TextDeletionMutation from '../../../entities/mutations/text-deletion.mutation.ts';
import TextMergingMutation from '../../../entities/mutations/text-merging.mutation.ts';
import TextInsertionMutation from '../../../entities/mutations/text-insertion.mutation.ts';

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
                const offset = this.#pickNonCollapsedSelection().findTextNodeOffsets(textMutation.target);
                return TextDeletionMutation.fromObserved(textMutation.target, offset.start, oldValue.slice(offset.start, offset.end));
            } else {
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

        #pickNonCollapsedSelection(): StoredSelection {
            const { previousSelection, currentSelection } = this.ralf();
            return currentSelection.isCollapsed ? previousSelection : currentSelection;
        }
    };
}