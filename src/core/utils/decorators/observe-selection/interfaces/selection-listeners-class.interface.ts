import { SelectionListenerMetadata } from './selection-listener-metadata.interface.ts';

export interface SelectionListenersClass {
    __selectionListeners?: SelectionListenerMetadata[];
}
