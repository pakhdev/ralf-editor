import { EditableNodes } from '../../../entities/editable-nodes/editable-nodes.entity.ts';
import { NodeConfigHandler } from './helpers';
import { BlueprintWithConfig, EditableNode, NodeCreationConfig } from './interfaces';
import { getElementProperties } from '../../dom/properties.utils.ts';

/**
 * The `DefineNodes` decorator registers a set of editable/ui nodes inside a static class
 *
 * It automatically enhances each defined node (class property) by injecting standard methods:
 * - `matches` — checks if a DOM node corresponds to the node's configuration
 * - `extractCustomAttributes` — extracts custom user-defined attributes
 * - `canContain` — checks if a node can contain a given child node, based on behavior rules
 *
 * It also attaches utility methods to the class itself:
 * - `identify(node)` — find all matching editable nodes for a given DOM node
 * - `isContentNode(node)` — check if a given DOM node represents a content node
 * - `identifyContentNodes(node, fillEmpty)` — recursively collect all content nodes within a subtree
 *
 * This decorator simplifies node management and lookup during editing, rendering, and serialization.
 *
 * @example
 * ```ts
 * @DefineNodes
 * export class MyEditableNodes {
 *   @DefineCreation({ tagName: 'p' })
 *   @DefineBehavior({ isContent: true, isBlock: true })
 *   static paragraph: EditableNode;
 * }
 * ```
 */
export function DefineNodes(target: any) {
    Object.getOwnPropertyNames(target).forEach(key => {
        if (['length', 'name', 'prototype'].includes(key)) return;
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

/**
 * Enhances a node (class property) with helper methods for recognition and behavior control
 *
 * @param target - The class containing the node definitions
 * @param key - The name of the property representing a node
 */
function setupNodePropertyMethods(target: any, key: string): void {
    const property = target[key];
    if (property?.__creationMeta) {
        property.matches = (nodeProperties: NodeCreationConfig): boolean =>
            new NodeConfigHandler(nodeProperties, property.__creationMeta).isMatch();

        property.extractCustomAttributes = (nodeProperties: NodeCreationConfig): NodeCreationConfig =>
            new NodeConfigHandler(nodeProperties, property.__creationMeta).extractCustomAttributes();

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

/**
 * Identifies all matching node definitions for a given DOM node
 *
 * @param target - The class containing node definitions
 * @param node - The DOM node to identify
 * @returns A list of matching editable node blueprints with their extracted configuration
 */
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

/**
 * Checks whether a given DOM node matches any editable node that is marked as content
 *
 * @param target - The class containing node definitions
 * @param node - The DOM node to check
 * @returns `true` if the node represents content; otherwise, `false`
 */
function isContentNode(target: any, node: Node): boolean {
    return target.identify(node)?.some(({ blueprint }: BlueprintWithConfig) => blueprint.behavior.isContent) || false;
}

/**
 * Recursively finds all content nodes within the subtree rooted at the given node
 *
 * If no content nodes are found and `fillEmpty` is true, a text node will be inserted and returned
 *
 * @param target - The class containing node definitions
 * @param node - The root DOM node to search under
 * @param fillEmpty - Whether to create a default empty text node if none found
 * @returns A flat array of content nodes found
 */
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
