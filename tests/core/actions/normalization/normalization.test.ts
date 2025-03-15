import { describe, it, expect, beforeEach } from 'vitest';
import { EditableNodes } from '../../../../src/core/entities/editable-nodes/editable-nodes.entity';
import { NormalizationActions } from '../../../../src/core/actions/normalization/normalization.actions';

describe('NormalizationActions', () => {
    const editableDiv = document.createElement('div');
    editableDiv.setAttribute('editable', 'true');

    beforeEach(() => {
        editableDiv.innerHTML = '';
    });

    describe('ensurePlaceholders', () => {
        it('should add an empty text node to child nodes that allow empty content', () => {
            const alignCenterDiv = EditableNodes.align.create({ styles: [{ textAlign: 'center' }] });
            editableDiv.appendChild(alignCenterDiv);
            NormalizationActions.ensurePlaceholders(editableDiv);
            expect(alignCenterDiv.childNodes.length).toBe(1);
            expect(alignCenterDiv.firstChild?.nodeType).toBe(Node.TEXT_NODE);
            expect(alignCenterDiv.firstChild?.nodeValue).toBe('');
        });

        it('should not add a text node if child node does not allow empty content', () => {
            const textColorSpan = EditableNodes.textColor.create({ styles: [{ color: 'red' }] });
            editableDiv.appendChild(textColorSpan);
            NormalizationActions.ensurePlaceholders(editableDiv);
            expect(textColorSpan.childNodes.length).toBe(0);
        });
    });

    describe('ensureCodeConsistency', () => {
        it('should remove unnecessary spaces and newlines from innerHTML', () => {
            editableDiv.innerHTML = '  Hello   World \n   \n  !';
            NormalizationActions.ensureCodeConsistency(editableDiv);
            expect(editableDiv.innerHTML).toBe('Hello World !');
        });

        it('should not modify innerHTML if the code is already normalized', () => {
            const editableDiv = document.createElement('div');
            editableDiv.innerHTML = 'Hello World!';
            const result = NormalizationActions.ensureCodeConsistency(editableDiv);
            expect(result).toBe(NormalizationActions);
            expect(editableDiv.innerHTML).toBe('Hello World!');
        });

        it('text nodes are completely removed (if parent blueprint forbids text between children)', () => {
            editableDiv.innerHTML = `
                <ul>
                    <li>Item 1</li>
                </ul>
            `;
            NormalizationActions.ensureCodeConsistency(editableDiv);
            expect(editableDiv.childNodes.length).toBe(1);
            const ul = editableDiv.firstChild as HTMLUListElement;
            expect(ul.childNodes.length).toBe(1);
        });
    });
});
