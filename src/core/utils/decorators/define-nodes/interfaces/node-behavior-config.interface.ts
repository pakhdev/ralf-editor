import { EditableNode } from './';

export interface NodeBehaviorConfig {
    allowEmpty?: boolean;
    child?: EditableNode;
    isBlock?: boolean;
    isContent?: boolean;
    keepIndent?: boolean;
    mergeAdjacent?: boolean;
    mergeOnDelete?: boolean;
    parents?: EditableNode[];
    persistent?: boolean;
    textContentOnly?: boolean;
}
