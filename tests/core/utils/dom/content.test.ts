import { describe, it, expect } from 'vitest';
import {
    findContentNode,
    findFirstContentNodeOf,
    findLastContentNodeOf,
    getNextNode,
    findChildContentNode,
} from '../../../../src/core/utils';

function createContentEditableDiv(children: Node[] = []): HTMLElement {
    const contentEditable = document.createElement('div');
    contentEditable.setAttribute('contenteditable', 'true');
    if (children.length) {
        children.forEach(child => contentEditable.appendChild(child));
    }
    return contentEditable;
}

describe('Content Node Utilities', () => {

    describe('findContentNode', () => {
        it('should return the starting node if checkStartElement is true and it is a content node', () => {
            const node = document.createTextNode('test');
            const result = findContentNode(node, 'forward', true);
            expect(result).toBe(node);
        });

        it('should find the next content node in the forward direction', () => {
            const text1 = document.createTextNode('text1');
            const text2 = document.createTextNode('text2');
            createContentEditableDiv([text1, text2]);
            const result = findContentNode(text1, 'forward');
            expect(result).toBe(text2);
        });

        it('should find the next content node in the forward direction in other container', () => {
            const text1 = document.createTextNode('text1');
            const text2 = document.createTextNode('text2');

            const divContainer = document.createElement('div');
            divContainer.appendChild(text2);

            createContentEditableDiv([text1, divContainer]);

            const result = findContentNode(text1, 'forward');
            expect(result).toBe(text2);
        });

        it('should find the next content node in the backward direction', () => {
            const text1 = document.createTextNode('text1');
            const text2 = document.createTextNode('text2');
            createContentEditableDiv([text1, text2]);
            const result = findContentNode(text2, 'backward');
            expect(result).toBe(text1);
        });

        it('should find the next content node in the backward direction in other container', () => {
            const text1 = document.createTextNode('text1');
            const text2 = document.createTextNode('text2');

            const divContainer = document.createElement('div');
            divContainer.appendChild(text2);

            createContentEditableDiv([text1, divContainer]);

            const result = findContentNode(text2, 'backward');
            expect(result).toBe(text1);
        });

        it('should return null if no content node is found', () => {
            const text1 = document.createTextNode('text1');
            const text2 = document.createTextNode('text2');
            createContentEditableDiv([text1, text2]);
            const result = findContentNode(text2, 'backward');
            expect(result).toBe(text1);
        });
    });

    describe('findFirstContentNodeOf', () => {
        it('should find the first content node among the children', () => {
            const text1 = document.createTextNode('text1');
            const text2 = document.createTextNode('text2');
            const editableDiv = createContentEditableDiv([text1, text2]);
            expect(findFirstContentNodeOf(editableDiv)).toBe(text1);
        });

        it('should not find any content outside the container', () => {
            const text1 = document.createTextNode('text1');
            const divContainer = document.createElement('div');
            createContentEditableDiv([text1, divContainer]);
            expect(findFirstContentNodeOf(divContainer)).toBe(null);
        });
    });

    describe('findLastContentNodeOf', () => {
        it('should return the node itself if it is a content node', () => {
            const text = document.createTextNode('text1');
            expect(findLastContentNodeOf(text)).toBe(text);
        });

        it('should not find any content outside the container', () => {
            const text = document.createTextNode('text1');
            const divContainer = document.createElement('div');
            createContentEditableDiv([text, divContainer]);
            expect(findLastContentNodeOf(divContainer)).toBe(null);
        });

        it('should return the last content node among the children', () => {
            const text1 = document.createTextNode('text1');
            const text2 = document.createTextNode('text2');
            const editableDiv = createContentEditableDiv([text1, text2]);
            expect(findLastContentNodeOf(editableDiv)).toBe(text2);
        });

        it('should return null if there are no content nodes', () => {
            const editableDiv = createContentEditableDiv();
            expect(findLastContentNodeOf(editableDiv)).toBeNull();
        });
    });

    describe('getNextNode', () => {
        it('should return the next sibling if exists', () => {
            const div1 = document.createElement('div');
            const div2 = document.createElement('div');
            createContentEditableDiv([div1, div2]);
            expect(getNextNode(div1, 'forward')).toBe(div2);
        });

        it('should return the next node located in other container', () => {
            // <divContentEditable><div1>Text</div1><div2></div2></divContentEditable>
            const div1 = document.createElement('div');
            const textNode = document.createTextNode('text');
            div1.appendChild(textNode);
            const div2 = document.createElement('div');
            createContentEditableDiv([div1, div2]);
            expect(getNextNode(textNode, 'forward')).toBe(div2);
        });

        it('should return null if no next sibling and parent is not contenteditable', () => {
            const node = document.createElement('div');
            expect(getNextNode(node, 'forward')).toBeNull();
        });
    });

    describe('findChildContentNode', () => {
        it('should find content node among direct children', () => {
            const div = document.createElement('div');
            const textNode = document.createTextNode('text');
            const editableDiv = createContentEditableDiv([div, textNode]);
            expect(findChildContentNode(editableDiv, 'forward')).toBe(textNode);
        });

        it('should return null if no content node found', () => {
            const editableDiv = createContentEditableDiv();
            expect(findChildContentNode(editableDiv, 'forward')).toBeNull();
        });
    });
});
