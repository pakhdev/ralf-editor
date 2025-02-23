import { NodeBehaviorConfig, NodeCreationConfig } from './';

export interface EditableNode {
    __creationMeta: NodeCreationConfig;
    create: (config?: Partial<NodeCreationConfig>) => HTMLElement;
    matches: (node: Node) => boolean;
    extractCustomAttributes: (node: Node) => NodeCreationConfig;
    canContain: (editableNode: EditableNode) => boolean;
    behavior?: NodeBehaviorConfig;
}
