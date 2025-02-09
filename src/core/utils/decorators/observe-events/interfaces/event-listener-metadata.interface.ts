import { ShortcutOptions } from './';

export interface EventListenerMetadata {
    eventType: string;
    selector: string | null;
    options?: ShortcutOptions;
    handler: (event: Event) => void;
    propertyKey: string | symbol;
    shortcut?: string;
}
