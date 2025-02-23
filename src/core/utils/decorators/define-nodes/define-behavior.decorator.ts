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

export function DefineBehavior(config: NodeBehaviorConfig) {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = target[propertyKey] || {} as EditableNode;
        target[propertyKey].behavior = { ...defaultBehaviorConfig, ...config };
    };
}
