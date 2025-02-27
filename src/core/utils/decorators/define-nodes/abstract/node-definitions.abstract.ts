import { EditableNode, NodeCreationConfig } from '../interfaces';

export default class AbstractNodeDefinitions {
    static identify(_node: Node): { blueprint: EditableNode, config?: Partial<NodeCreationConfig> }[] {
        throw new Error('Method \'identify\' must be implemented by the decorator.');
    }

    static identifyContentNodes(_node: Node, _fillEmpty: boolean = false, _deepScan: boolean = true): Node[] {
        throw new Error('Method \'identifyContentNodes\' must be implemented by the decorator.');
    }

    static isContentNode(_node: Node): boolean {
        throw new Error('Method \'isContentNode\' must be implemented by the decorator.');
    }
}
