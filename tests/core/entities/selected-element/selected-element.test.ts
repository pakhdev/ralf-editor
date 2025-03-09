import { describe, it, expect, beforeEach } from 'vitest';
import { SelectedElement } from '../../../../src/core/entities/selected-element/selected-element.entity';

describe('Selected Element constructor', () => {
    it('constructor should set offset if position is a number', () => {
        const selected = new SelectedElement(document.createTextNode(''), 5);
        expect(selected.offset).toBe(5);
        expect(selected.position).toBe('exact');
    });

    it('constructor should set position if position is a string', () => {
        const selected = new SelectedElement(document.createElement('div'), 'before');
        expect(selected.offset).toBe(0);
        expect(selected.position).toBe('before');
    });
});

describe('Selected Element isTextNode', () => {
    it('returns true if node is text node', () => {
        const selected = new SelectedElement(document.createTextNode(''));
        expect(selected.isTextNode).toBe(true);
    });

    it('returns false if node is not text node', () => {
        const selected = new SelectedElement(document.createElement('div'));
        expect(selected.isTextNode).toBe(false);
    });
});

describe('Selected Element isContentNode', () => {
    it('returns true if node is content node', () => {
        const selected = new SelectedElement(document.createTextNode(''));
        expect(selected.isContentNode).toBe(true);
    });

    it('returns false if node is not content node', () => {
        const selected = new SelectedElement(document.createElement('div'));
        expect(selected.isContentNode).toBe(false);
    });
});

describe('Selected Element isFirstElement', () => {
    let editableDiv: HTMLDivElement;
    let targetTextNode: Text;
    beforeEach(() => {
        editableDiv = document.createElement('div');
        editableDiv.setAttribute('editable', 'true');
        targetTextNode = document.createTextNode('');
        editableDiv.appendChild(targetTextNode);
    });

    it('returns true if no previous content node', () => {
        const selected = new SelectedElement(targetTextNode);
        expect(selected.isFirstElement).toBe(true);
    });

    it('returns false if there is previous content node', () => {
        editableDiv.prepend(document.createTextNode(''));
        const selected = new SelectedElement(targetTextNode);
        expect(selected.isFirstElement).toBe(false);
    });
});

describe('Selected Element isLastElement', () => {
    let editableDiv: HTMLDivElement;
    let targetTextNode: Text;
    beforeEach(() => {
        editableDiv = document.createElement('div');
        editableDiv.setAttribute('editable', 'true');
        targetTextNode = document.createTextNode('');
        editableDiv.appendChild(targetTextNode);
    });

    it('returns true if no next content node', () => {
        const selected = new SelectedElement(targetTextNode);
        expect(selected.isLastElement).toBe(true);
    });

    it('returns false if there is next content node', () => {
        editableDiv.appendChild(document.createTextNode(''));
        const selected = new SelectedElement(targetTextNode);
        expect(selected.isLastElement).toBe(false);
    });
});

describe('Selected Element isCaretAtStart', () => {
    const textNode = document.createTextNode('Text');
    const divNode = document.createElement('div');

    it('returns true for text node at offset 0', () => {
        const selected = new SelectedElement(textNode, 0);
        expect(selected.isCaretAtStart).toBe(true);
    });

    it('returns true for non-text node at position "before"', () => {
        const selected = new SelectedElement(divNode, 'before');
        expect(selected.isCaretAtStart).toBe(true);
    });

    it('returns false for text node not at offset 0', () => {
        const selected = new SelectedElement(textNode, 5);
        expect(selected.isCaretAtStart).toBe(false);
    });

    it('returns false for non-text node at position "after"', () => {
        const selected = new SelectedElement(divNode, 'after');
        expect(selected.isCaretAtStart).toBe(false);
    });
});

describe('Selected Element isCaretAtEnd', () => {
    const textNode = document.createTextNode('Text');
    const divNode = document.createElement('div');

    it('returns true for text node at end offset', () => {
        const selected = new SelectedElement(textNode, 4);
        expect(selected.isCaretAtEnd).toBe(true);
    });

    it('returns true for non-text node at position "after"', () => {
        const selected = new SelectedElement(divNode, 'after');
        expect(selected.isCaretAtEnd).toBe(true);
    });

    it('returns false for text node not at end offset', () => {
        const selected = new SelectedElement(textNode, 2);
        expect(selected.isCaretAtEnd).toBe(false);
    });

    it('returns false for non-text node at position "before"', () => {
        const selected = new SelectedElement(divNode, 'before');
        expect(selected.isCaretAtEnd).toBe(false);
    });
});