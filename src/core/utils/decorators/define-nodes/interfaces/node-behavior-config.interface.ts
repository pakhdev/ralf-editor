import { EditableNode } from './';

export interface NodeBehaviorConfig {
    allowEmpty?: boolean;
    child?: EditableNode | (() => EditableNode);
    isBlock?: boolean;
    isContent?: boolean;
    keepIndent?: boolean;
    mergeAdjacent?: boolean;
    mergeOnDelete?: boolean;
    parents?: EditableNode[] | (() => EditableNode[]);
    persistent?: boolean;
    textContentOnly?: boolean;
}
