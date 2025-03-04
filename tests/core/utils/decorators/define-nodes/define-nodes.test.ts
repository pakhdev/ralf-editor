import { describe, it, expect } from 'vitest';
import { EditableNodes } from '../../../../../src/core/entities/editable-nodes/editable-nodes.entity';

describe('DefineNodes - general', () => {
    it('should add matches, extractCustomAttributes and canContain methods to each node', () => {
        expect(typeof EditableNodes.ul.matches).toBe('function');
        expect(typeof EditableNodes.ul.extractCustomAttributes).toBe('function');
        expect(typeof EditableNodes.ul.matches).toBe('function');
    });

    it('should identify node type correctly using identify()', () => {
        const element = document.createElement('strong');
        const identified = EditableNodes.identify(element);
        expect(identified.length).toBe(1);
        expect(identified[0].blueprint).toBe(EditableNodes.strong);
    });

    it('should correctly detect content nodes with isContentNode()', () => {
        const element = document.createTextNode('');
        const isContent = EditableNodes.isContentNode(element);
        expect(isContent).toBe(true);
    });

    it('should find all content nodes with identifyContentNodes()', () => {
        const container = document.createElement('div');
        const text1 = document.createTextNode('1');
        const text2 = document.createTextNode('2');
        container.appendChild(text1);
        container.appendChild(text2);

        const contentNodes = EditableNodes.identifyContentNodes(container);
        expect(contentNodes.length).toBe(2);
        expect(contentNodes).toContain(text1);
        expect(contentNodes).toContain(text2);
    });

    it('should insert empty text node if no content nodes found and fillEmpty is true', () => {
        const container = document.createElement('div');
        const contentNodes = EditableNodes.identifyContentNodes(container, true);
        expect(contentNodes.length).toBe(1);
        expect(contentNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(container.contains(contentNodes[0])).toBe(true);
    });

    it('should NOT insert empty text node if content nodes exist even when fillEmpty is true', () => {
        const container = document.createElement('div');
        const text = document.createTextNode('');
        container.appendChild(text);

        const contentNodes = EditableNodes.identifyContentNodes(container, true);
        expect(contentNodes.length).toBe(1);
        expect(contentNodes[0]).toBe(text);
        expect(container.childNodes.length).toBe(1);
    });
});

describe('DefineNodes - canContain', () => {
    it('Formatting with child formatting: can contain his child formatting', () => {
        expect(EditableNodes.ul.canContain(EditableNodes.li)).toBe(true);
        expect(EditableNodes.ol.canContain(EditableNodes.li)).toBe(true);
        expect(EditableNodes.table.canContain(EditableNodes.tr)).toBe(true);
        expect(EditableNodes.tr.canContain(EditableNodes.td)).toBe(true);
    });

    it('Formatting with child formatting: can not contain his parent formatting', () => {
        expect(EditableNodes.li.canContain(EditableNodes.ul)).toBe(false);
        expect(EditableNodes.li.canContain(EditableNodes.ol)).toBe(false);
        expect(EditableNodes.td.canContain(EditableNodes.tr)).toBe(false);
        expect(EditableNodes.tr.canContain(EditableNodes.table)).toBe(false);
    });

    it('Formatting with child formatting: can not contain another type of formatting', () => {
        expect(EditableNodes.ul.canContain(EditableNodes.td)).toBe(false);
        expect(EditableNodes.ul.canContain(EditableNodes.tr)).toBe(false);
        expect(EditableNodes.li.canContain(EditableNodes.table)).toBe(false);
        expect(EditableNodes.li.canContain(EditableNodes.tr)).toBe(false);
        expect(EditableNodes.table.canContain(EditableNodes.strong)).toBe(false);
        expect(EditableNodes.table.canContain(EditableNodes.align)).toBe(false);
        expect(EditableNodes.table.canContain(EditableNodes.code)).toBe(false);
    });

    it('Formatting without child formatting: can not contain formatting with parent formatting', () => {
        expect(EditableNodes.code.canContain(EditableNodes.tr)).toBe(false);
        expect(EditableNodes.align.canContain(EditableNodes.td)).toBe(false);
        expect(EditableNodes.code.canContain(EditableNodes.li)).toBe(false);
        expect(EditableNodes.strong.canContain(EditableNodes.tr)).toBe(false);
        expect(EditableNodes.strong.canContain(EditableNodes.td)).toBe(false);
        expect(EditableNodes.strong.canContain(EditableNodes.li)).toBe(false);
    });

    it('Block formatting: can contain inline formatting', () => {
        expect(EditableNodes.code.canContain(EditableNodes.strong)).toBe(true);
        expect(EditableNodes.align.canContain(EditableNodes.underline)).toBe(true);
        expect(EditableNodes.align.canContain(EditableNodes.textBackgroundColor)).toBe(true);
    });

    it('Block formatting: can contain formatting with child formattings, but without parent formattings', () => {
        expect(EditableNodes.align.canContain(EditableNodes.ul)).toBe(true);
        expect(EditableNodes.align.canContain(EditableNodes.table)).toBe(true);
    });

    it('Block formatting: can contain another block formatting', () => {
        expect(EditableNodes.align.canContain(EditableNodes.code)).toBe(true);
        expect(EditableNodes.code.canContain(EditableNodes.align)).toBe(true);
    });

    it('Block formatting: can contain any kind of content', () => {
        expect(EditableNodes.align.canContain(EditableNodes.text)).toBe(true);
        expect(EditableNodes.td.canContain(EditableNodes.text)).toBe(true);
        expect(EditableNodes.align.canContain(EditableNodes.br)).toBe(true);
        expect(EditableNodes.td.canContain(EditableNodes.br)).toBe(true);
        expect(EditableNodes.align.canContain(EditableNodes.image)).toBe(true);
        expect(EditableNodes.td.canContain(EditableNodes.image)).toBe(true);
    });

    it('Inline formatting: can contain inline formatting', () => {
        expect(EditableNodes.strong.canContain(EditableNodes.strong)).toBe(true);
        expect(EditableNodes.strong.canContain(EditableNodes.underline)).toBe(true);
        expect(EditableNodes.strong.canContain(EditableNodes.textBackgroundColor)).toBe(true);
    });

    it('Inline formatting: can not contain block formatting', () => {
        expect(EditableNodes.strong.canContain(EditableNodes.align)).toBe(false);
        expect(EditableNodes.li.canContain(EditableNodes.align)).toBe(false);
        expect(EditableNodes.underline.canContain(EditableNodes.code)).toBe(false);
    });

    it('Inline formatting: can not contain block content', () => {
        expect(EditableNodes.strong.canContain(EditableNodes.image)).toBe(false);
        expect(EditableNodes.li.canContain(EditableNodes.image)).toBe(false);
    });

    it('Inline formatting: can contain inline content', () => {
        expect(EditableNodes.strong.canContain(EditableNodes.text)).toBe(true);
        expect(EditableNodes.strong.canContain(EditableNodes.br)).toBe(true);
    });

    it('Inline formatting with textContentOnly property: can contain only text', () => {
        expect(EditableNodes.li.canContain(EditableNodes.text)).toBe(true);
        expect(EditableNodes.link.canContain(EditableNodes.text)).toBe(true);
        expect(EditableNodes.li.canContain(EditableNodes.br)).toBe(false);
        expect(EditableNodes.link.canContain(EditableNodes.br)).toBe(false);
    });
});