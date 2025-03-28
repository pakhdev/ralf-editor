import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ObserveMutations,
} from '../../../../../src/core/utils/decorators/observe-mutations/observe-mutations.decorator';
import { Ralf } from '../../../../../src/ralf';
import {
    OnNodeDeletion,
    OnNodeInsertion, OnTextDeletion,
    OnTextInsertion, OnTextMerging, OnTextSplitting,
} from '../../../../../src/core/utils/decorators/observe-mutations';
import * as editorMutationInterface
    from '../../../../../src/core/entities/mutations/interfaces/editor-mutation.interface';
import { MutationType } from '../../../../../src/core/entities/mutations/enums/mutation-type.enum';
import { StoredSelection } from '../../../../../src/core/entities/stored-selection/stored-selection.entity';
import { SelectedElement } from '../../../../../src/core/entities/selected-element/selected-element.entity';
import TextMergingMutation from '../../../../../src/core/entities/mutations/text-merging.mutation';
import TextSplittingMutation from '../../../../../src/core/entities/mutations/text-splitting.mutation';

describe('ObserveMutations Decorator', () => {
    let editableDiv: HTMLDivElement;
    let textChild: Text;
    let brChild: HTMLBRElement;

    beforeEach(() => {
        editableDiv = document.createElement('div');
        editableDiv.setAttribute('contenteditable', 'true');
        textChild = document.createTextNode('Hello, world!');
        brChild = document.createElement('br');
        editableDiv.append(textChild, brChild);
    });

    describe('NodeMap', () => {
        const createTestObserver = () => {
            @ObserveMutations
            class TestObserver {
                constructor(public ralf: () => Ralf) {}
            }

            return new TestObserver(() => new RalfMock(editableDiv) as Ralf) as any;
        };

        it('should initialize correctly', () => {
            const nodeMap = createTestObserver().nodeMap;
            expect(nodeMap.size).toBe(2);
            expect(nodeMap.get(textChild)).toEqual({ parent: editableDiv, position: 0 });
            expect(nodeMap.get(brChild)).toEqual({ parent: editableDiv, position: 1 });
        });

        it('should update correctly when a node is added', async () => {
            const testObserver = createTestObserver();
            const newBr = document.createElement('br');
            editableDiv.prepend(newBr);
            await new Promise<void>(resolve => queueMicrotask(resolve));

            const nodeMap = testObserver.nodeMap;
            expect(nodeMap.size).toBe(3);
            expect(nodeMap.get(newBr)).toEqual({ parent: editableDiv, position: 0 });
            expect(nodeMap.get(textChild)).toEqual({ parent: editableDiv, position: 1 });
            expect(nodeMap.get(brChild)).toEqual({ parent: editableDiv, position: 2 });
        });

        it('NodeMap should update correctly when a node is removed', async () => {
            const testObserver = createTestObserver();
            editableDiv.removeChild(textChild);
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            const nodeMap = (testObserver as any).nodeMap;
            expect(nodeMap.size).toBe(1);
            expect(nodeMap.get(brChild)).toEqual({ parent: editableDiv, position: 0 });
        });

        it('NodeMap should update correctly with removing and adding nodes in the same mutation', async () => {
            const testObserver = createTestObserver();
            const newBr = document.createElement('br');
            editableDiv.removeChild(textChild);
            editableDiv.prepend(newBr);
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            const nodeMap = (testObserver as any).nodeMap;
            expect(nodeMap.size).toBe(2);
            expect(nodeMap.get(newBr)).toEqual({ parent: editableDiv, position: 0 });
            expect(nodeMap.get(brChild)).toEqual({ parent: editableDiv, position: 1 });
        });

        it('NodeMap should update correctly when two nodes are added', async () => {
            const testObserver = createTestObserver();
            const newBr = document.createElement('br');
            const newBr2 = document.createElement('br');
            editableDiv.prepend(newBr);
            editableDiv.prepend(newBr2);
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            const nodeMap = (testObserver as any).nodeMap;
            expect(nodeMap.size).toBe(4);
            expect(nodeMap.get(newBr)).toEqual({ parent: editableDiv, position: 1 });
            expect(nodeMap.get(newBr2)).toEqual({ parent: editableDiv, position: 0 });
            expect(nodeMap.get(textChild)).toEqual({ parent: editableDiv, position: 2 });
            expect(nodeMap.get(brChild)).toEqual({ parent: editableDiv, position: 3 });
        });
    });

    describe('Mutation capturing', () => {
        @ObserveMutations
        class TestObserver {
            public handlerSpy = vi.fn();

            constructor(public ralf: () => Ralf) {
                this.handler = vi.fn();
            }

            @OnTextSplitting()
            @OnTextMerging()
            @OnTextDeletion()
            @OnTextInsertion()
            @OnNodeInsertion()
            @OnNodeDeletion()
            handler(mutation: editorMutationInterface.EditorMutation) {
                this.handlerSpy(mutation);
            }
        }

        it('OnNodeDeletion', async () => {
            const testClass = new TestObserver(() => new RalfMock(editableDiv) as Ralf);
            editableDiv.removeChild(brChild);
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            expect(testClass.handlerSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: MutationType.NODE_DELETION,
                deletedNode: brChild,
                positionReference: { node: editableDiv, position: 1 },
            }));
        });

        it('OnNodeInsertion', async () => {
            const testClass = new TestObserver(() => new RalfMock(editableDiv) as Ralf);
            const newBr = document.createElement('br');
            editableDiv.appendChild(newBr);
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            expect(testClass.handlerSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: MutationType.NODE_INSERTION,
                insertedNode: newBr,
                positionReference: { node: editableDiv, position: 2 },
            }));
        });

        it('OnTextInsertion', async () => {
            const ralfMock = new RalfMock(editableDiv) as Ralf;
            const testClass = new TestObserver(() => ralfMock);
            mockSelections(ralfMock, new StoredSelection(
                editableDiv,
                new SelectedElement(textChild, 6),
                new SelectedElement(textChild, 6),
                true,
            ));
            textChild.textContent = 'Hello, my dream world!';
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            expect(testClass.handlerSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: MutationType.TEXT_INSERTION,
                insertedText: ' my dream',
                positionReference: { node: textChild, position: 6 },
            }));
        });

        it('OnTextDeletion (current selection', async () => {
            const ralfMock = new RalfMock(editableDiv) as Ralf;
            const testClass = new TestObserver(() => ralfMock);
            mockSelections(ralfMock, new StoredSelection(
                editableDiv,
                new SelectedElement(textChild, 0),
                new SelectedElement(textChild, 5),
                false,
            ));
            textChild.deleteData(0, 5);
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            expect(testClass.handlerSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: MutationType.TEXT_DELETION,
                deletedText: 'Hello',
                endOffset: 5,
                positionReference: { node: textChild, position: 0 },
            }));
        });

        it('OnTextDeletion (previous selection)', async () => {
            const ralfMock = new RalfMock(editableDiv) as Ralf;
            const testClass = new TestObserver(() => ralfMock);
            mockSelections(
                ralfMock,
                new StoredSelection(
                    editableDiv,
                    new SelectedElement(textChild, 0),
                    new SelectedElement(textChild, 0),
                    true,
                ),
                new StoredSelection(
                    editableDiv,
                    new SelectedElement(textChild, 0),
                    new SelectedElement(textChild, 5),
                    false,
                ),
            );
            textChild.deleteData(0, 5);
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            expect(testClass.handlerSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: MutationType.TEXT_DELETION,
                deletedText: 'Hello',
                endOffset: 5,
                positionReference: { node: textChild, position: 0 },
            }));
        });

        it('OnTextMerging', async () => {
            const ralfMock = new RalfMock(editableDiv) as Ralf;
            const testClass = new TestObserver(() => ralfMock);
            const textChild2 = document.createTextNode('Appended text');
            textChild.after(textChild2);
            TextMergingMutation.apply(textChild, textChild2);
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            expect(testClass.handlerSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: MutationType.TEXT_MERGING,
                removedNode: textChild2,
                appendedText: 'Appended text',
                positionReference: { node: textChild, position: 13 },
            }));
        });

        it('OnTextSplitting (new node placed before)', async () => {
            const ralfMock = new RalfMock(editableDiv) as Ralf;
            const testClass = new TestObserver(() => ralfMock);
            TextSplittingMutation.apply(textChild, 6, 'before');
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
            expect(textChild.textContent).toBe(' world!');
            expect(textChild.previousSibling).not.toBeNull();
            expect(textChild.previousSibling?.nodeType).toBe(Node.TEXT_NODE);
            expect(textChild.previousSibling?.textContent).toBe('Hello,');
            expect(testClass.handlerSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: MutationType.TEXT_SPLITTING,
                newNodePlacement: 'before',
                newNode: textChild.previousSibling,
                positionReference: { node: textChild, position: 6 },
            }));
        });

        it('OnTextSplitting (new node placed after)', async () => {
            const ralfMock = new RalfMock(editableDiv) as Ralf;
            const testClass = new TestObserver(() => ralfMock);
            TextSplittingMutation.apply(textChild, 6, 'after');
            await new Promise<void>((resolve) => queueMicrotask(() => resolve()));

            expect(textChild.textContent).toBe('Hello,');
            expect(textChild.nextSibling).not.toBeNull();
            expect(textChild.nextSibling?.nodeType).toBe(Node.TEXT_NODE);
            expect(textChild.nextSibling?.textContent).toBe(' world!');
            expect(testClass.handlerSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: MutationType.TEXT_SPLITTING,
                newNodePlacement: 'after',
                newNode: textChild.nextSibling,
                positionReference: { node: textChild, position: 6 },
            }));
        });
    });

});

class RalfMock {
    constructor(public editableDiv: HTMLDivElement) {}
}

function mockSelections(ralfMock: Ralf, current: StoredSelection, previous?: StoredSelection) {
    Object.defineProperty(ralfMock, 'currentSelection', {
        get: vi.fn().mockReturnValue(current),
        configurable: true,
    });

    if (previous)
        Object.defineProperty(ralfMock, 'previousSelection', {
            get: vi.fn().mockReturnValue(previous),
            configurable: true,
        });
}