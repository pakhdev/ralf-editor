import AbstractNodeDefinitions from '../../utils/decorators/define-nodes/abstract/node-definitions.abstract.ts';
import { DefineBehavior, DefineCreation } from '../../utils/decorators/define-nodes';
import { DefineNodes } from '../../utils/decorators/define-nodes/define-nodes.decorator.ts';
import type { EditableNode } from '../../utils/decorators/define-nodes/interfaces';

@DefineNodes
export class EditableNodes extends AbstractNodeDefinitions {

    @DefineCreation({ nodeType: Node.TEXT_NODE })
    @DefineBehavior({ isContent: true })
    static text: EditableNode;

    @DefineCreation({ tagName: 'br' })
    @DefineBehavior({ isContent: true })
    static br: EditableNode;

    @DefineCreation({ tagName: 'img', src: '', largeImage: 'optional' })
    @DefineBehavior({ isContent: true, isBlock: true })
    static image: EditableNode;

    @DefineCreation({ tagName: 'div', styles: [{ textAlign: '' }] })
    @DefineBehavior({ isBlock: true, allowEmpty: true })
    static align: EditableNode;

    @DefineCreation({ tagName: 'strong' })
    @DefineBehavior()
    static strong: EditableNode;

    @DefineCreation({ tagName: 'u' })
    @DefineBehavior()
    static underline: EditableNode;

    @DefineCreation({ tagName: 'i' })
    @DefineBehavior()
    static italic: EditableNode;

    @DefineCreation({ tagName: 'a', href: '' })
    @DefineBehavior({ textContentOnly: true })
    static link: EditableNode;

    @DefineCreation({ tagName: 'span', styles: [{ color: '' }] })
    @DefineBehavior()
    static textColor: EditableNode;

    @DefineCreation({ tagName: 'span', styles: [{ backgroundColor: '' }] })
    @DefineBehavior()
    static textBackgroundColor: EditableNode;

    @DefineCreation({ tagName: 'span', classes: ['hidden-text'] })
    @DefineBehavior()
    static hiddenText: EditableNode;

    @DefineCreation({ tagName: 'div', classes: ['code-text'] })
    @DefineBehavior({ isBlock: true, mergeAdjacent: false, mergeOnDelete: false, keepIndent: true, allowEmpty: true })
    static code: EditableNode;

    @DefineCreation({ tagName: 'ul' })
    @DefineBehavior({ child: () => EditableNodes.li, isBlock: true })
    static ul: EditableNode;

    @DefineCreation({ tagName: 'ol' })
    @DefineBehavior({ child: () => EditableNodes.li, isBlock: true })
    static ol: EditableNode;

    @DefineCreation({ tagName: 'li' })
    @DefineBehavior({
        parents: [EditableNodes.ol, EditableNodes.ul],
        textContentOnly: true,
        mergeAdjacent: false,
        mergeOnDelete: true,
        allowEmpty: true,
    })
    static li: EditableNode;

    @DefineCreation({ tagName: 'table' })
    @DefineBehavior({ child: () => EditableNodes.tr, isBlock: true, persistent: true })
    static table: EditableNode;

    @DefineCreation({ tagName: 'tr' })
    @DefineBehavior({
        parents: [EditableNodes.table],
        child: () => EditableNodes.td,
        isBlock: true,
        persistent: true,
    })
    static tr: EditableNode;

    @DefineCreation({ tagName: 'td' })
    @DefineBehavior({ parents: [EditableNodes.tr], isBlock: true, persistent: true, allowEmpty: true })
    static td: EditableNode;
}
