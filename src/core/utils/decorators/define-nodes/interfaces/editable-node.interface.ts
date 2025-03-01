import { NodeBehaviorConfig, NodeCreationConfig } from './';

export interface EditableNode {
    __creationMeta: NodeCreationConfig;
    create: (config?: Partial<NodeCreationConfig>) => HTMLElement;
    matches: (nodeProperties: NodeCreationConfig) => boolean;
    extractCustomAttributes: (nodeProperties: NodeCreationConfig) => NodeCreationConfig;
    canContain: (editableNode: EditableNode) => boolean;
    behavior: NodeBehaviorConfig;
}
