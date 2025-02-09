import { EventListenerMetadata } from './';

export interface EventListenersClass {
    __editorEvents?: EventListenerMetadata[];
    __documentEvents?: EventListenerMetadata[];
}
