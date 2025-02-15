import { Classes } from './classes.interface.ts';
import { NodeCreationConfig } from './node-creation-config.interface.ts';
import { Style } from './style.interface.ts';

export interface NodeAttributes {
    classes?: Classes;
    styles?: Style[];
    children?: NodeCreationConfig[];

    [key: string]: string | Node['nodeType'] | Classes | Style[] | NodeCreationConfig[] | EventListenerOrEventListenerObject | undefined;
}
