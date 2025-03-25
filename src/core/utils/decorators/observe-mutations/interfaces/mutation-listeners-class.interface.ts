import { MutationListenerMetadata } from './mutation-listener-metadata.interface.ts';

export interface MutationListenersClass {
    __mutationListeners?: MutationListenerMetadata[];
}