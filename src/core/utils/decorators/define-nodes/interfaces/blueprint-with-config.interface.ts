import { EditableNode, NodeCreationConfig } from './';

export interface BlueprintWithConfig {
    blueprint: EditableNode,
    config?: Partial<NodeCreationConfig>
}
