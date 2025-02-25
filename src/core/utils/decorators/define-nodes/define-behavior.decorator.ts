import { EditableNode, NodeBehaviorConfig } from './interfaces';

const defaultBehaviorConfig: Partial<NodeBehaviorConfig> = {
    allowEmpty: false,         // Can the container be empty
    isBlock: false,            // Is this a block-level element
    isContent: false,          // Indicates this is content, not formatting
    keepIndent: false,         // Preserve indentation within the container
    mergeAdjacent: true,       // Merge adjacent similar elements
    mergeOnDelete: false,      // Merge similar elements when deleting
    persistent: false,         // Element remains empty and is not removed if
                               //   not all elements of this type within its parent
                               //   were selected before deletion
    textContentOnly: false,    // Allows only text content inside
};

/**
 * The `DefineBehavior` decorator assigns behavior configuration to a specified class property.
 *
 * It is used to define how an HTML-like node behaves within an editor or rendering environment.
 * The provided `config` is merged with a predefined `defaultBehaviorConfig`, ensuring all defaults are preserved
 * unless explicitly overridden.
 *
 * If the target property does not exist, it will be initialized as an empty object.
 *
 * @param {NodeBehaviorConfig} config - The behavior configuration object. It defines how the node behaves,
 * such as whether it allows only text content, whether adjacent elements should be merged, and more.
 *
 * @returns {(target: any, propertyKey: string) => void} - A decorator function applied to a class property.
 *
 * @example
 * "class MyNodes {  @DefineBehavior({ textContentOnly: true, isContent: true })  paragraph: any; }"
 *
 * Note: If the configuration contains function values, they are wrapped into property getters.
 * This ensures lazy evaluation of the value, which is especially useful when referencing properties
 * that may not yet be fully initialized at the time of decoration.
 */
export function DefineBehavior(config: NodeBehaviorConfig): (target: any, propertyKey: string) => void {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = target[propertyKey] || {} as EditableNode;

        const behaviorConfig = { ...defaultBehaviorConfig, ...config };

        for (const key of Object.keys(behaviorConfig) as Array<keyof NodeBehaviorConfig>) {
            const value = behaviorConfig[key];
            if (typeof value === 'function') {
                Object.defineProperty(behaviorConfig, key, {
                    get: value,
                    enumerable: true,
                    configurable: true,
                });
            }
        }

        target[propertyKey].behavior = behaviorConfig;
    };
}
