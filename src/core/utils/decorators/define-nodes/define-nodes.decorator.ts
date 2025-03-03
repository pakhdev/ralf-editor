import { EditableNodes } from '../../../entities/editable-nodes/editable-nodes.entity.ts';
import { NodeConfigHandler } from './helpers';
import { BlueprintWithConfig, EditableNode, NodeCreationConfig } from './interfaces';
import { getElementProperties } from '../../dom/properties.utils.ts';

export function DefineNodes(target: any) {
    Object.getOwnPropertyNames(target).forEach(key => {
        setupNodePropertyMethods(target, key);
    });

    target.identify = function (node: Node): BlueprintWithConfig[] {
        return identifyNode(this, node);
    };

    target.isContentNode = function (node: Node): boolean {
        return isContentNode(this, node);
    };

    target.identifyContentNodes = function (node: Node, fillEmpty: boolean = false): Node[] {
        return identifyContentNodes(this, node, fillEmpty);
    };
}

function setupNodePropertyMethods(target: any, key: string): void {
    const property = target[key];
    if (property?.__nodeMeta) {
        property.matches = (nodeProperties: NodeCreationConfig): boolean =>
            new NodeConfigHandler(nodeProperties, property.__nodeMeta).isMatch();

        property.extractCustomAttributes = (nodeProperties: NodeCreationConfig): NodeCreationConfig =>
            new NodeConfigHandler(nodeProperties, property.__nodeMeta).extractCustomAttributes();

        property.canContain = function (child: EditableNode): boolean {
            const parent = property;
            if (parent.behavior.child)
                return child === parent.behavior.child;

            if (child.behavior.parents)
                return child.behavior.parents.includes(parent);

            if (parent.behavior.textContentOnly && child.behavior.isContent)
                return child === EditableNodes.text;

            if (!parent.behavior.isBlock)
                return !child.behavior.isBlock;

            return true;
        };
    }
}

function identifyNode(target: any, node: Node): BlueprintWithConfig[] {
    const elementProperties = getElementProperties(node as HTMLElement);
    return Object.getOwnPropertyNames(target)
        .map(key => {
            const typeDefinition = target[key] as EditableNode;
            return typeDefinition.__creationMeta && typeDefinition.matches(elementProperties)
                ? {
                    blueprint: typeDefinition,
                    config: typeDefinition.extractCustomAttributes(elementProperties),
                } as BlueprintWithConfig
                : null;
        }).filter((item): item is BlueprintWithConfig => item !== null);
}

function isContentNode(target: any, node: Node): boolean {
    return target.identify(node)?.some(({ blueprint }: BlueprintWithConfig) => blueprint.behavior.isContent) || false;
}

function identifyContentNodes(target: any, node: Node, fillEmpty: boolean = false): Node[] {
    if (target.isContentNode(node)) return [node];

    const contentElements: Node[] = [];
    for (const child of node.childNodes) {
        if (target.isContentNode(child))
            contentElements.push(child);
        if (child.hasChildNodes())
            contentElements.push(...target.identifyContentNodes(child));
    }
    if (!contentElements.length && fillEmpty) {
        const textNode = document.createTextNode('');
        node.appendChild(textNode);
        contentElements.push(textNode);
    }
    return contentElements;
}
