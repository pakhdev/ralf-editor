import { HtmlElementBuilder, NodeConfigHandler } from './helpers';
import { NodeCreationConfig } from './interfaces';

/**
 * The `DefineCreation` decorator registers creation metadata and a dynamic `create()` method for editor nodes.
 *
 * This decorator is intended for use within editable node definitions or interface components of the editor.
 * It allows nodes—either part of the editable content zone or UI elements—to define how they should be instantiated.
 * The metadata is stored as `__creationMeta` and can be used to identify node types and control their construction.
 *
 * When the `.create()` method is called, it uses the stored metadata (optionally overridden at runtime) to generate:
 * - An HTML element (if `tagName` is defined)
 * - A text node (if `nodeType` is defined)
 *
 * This mechanism is also used internally to recognize and recreate nodes in the content area based on metadata.
 *
 * @param {NodeCreationConfig} config - Configuration object describing how the node should be constructed.
 *
 * @returns {(target: any, propertyKey: string) => void} - A property decorator that enhances the node definition.
 *
 * @example
 * "class MyNodes { @DefineCreation({ tagName: 'div', text: 'Quote here...' }) quoteBlock: EditableNode; }"
 *
 * const nodes = new MyNodes();
 * const block = nodes.quoteBlock.create(); // → <div>Quote here...</div>
 */
export function DefineCreation(config: NodeCreationConfig): (target: any, propertyKey: string) => void {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = {
            ...target[propertyKey],
            __creationMeta: config,
            create: (overrideConfig?: Partial<NodeCreationConfig>) => {
                const finalConfig = new NodeConfigHandler(overrideConfig, config).populateConfig();

                if (finalConfig.tagName)
                    return HtmlElementBuilder.createElement(finalConfig);

                else if (finalConfig.nodeType)
                    return document.createTextNode(typeof finalConfig.text === 'string' ? finalConfig.text : '');

                else throw new Error(`NodeCreation: Invalid configuration for ${ propertyKey }`);
            },
        };
    };
}
