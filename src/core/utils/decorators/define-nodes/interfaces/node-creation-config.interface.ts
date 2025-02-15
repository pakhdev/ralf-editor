import { NodeAttributes } from './node-attributes.interface.ts';

export interface NodeCreationConfig extends NodeAttributes {
    tagName?: string;
    nodeType?: Node['nodeType'];
}
