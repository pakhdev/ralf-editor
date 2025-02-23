import { HtmlElementBuilder, NodeConfigHandler } from './helpers';
import { NodeCreationConfig } from './interfaces';

export function DefineCreation(config: NodeCreationConfig) {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = {
            ...target[propertyKey],
            __creationMeta: config,
            create: (overrideConfig?: Partial<NodeCreationConfig>) => {
                const finalConfig = new NodeConfigHandler(overrideConfig, config).populateConfig();

                if (finalConfig.tagName)
                    return HtmlElementBuilder.createElement(finalConfig);

                else if (finalConfig.nodeType)
                    return document.createTextNode(typeof finalConfig.text === 'string' ? finalConfig.text : '');

                else throw new Error(`NodeCreation: Invalid configuration for ${ propertyKey }`);
            },
        };
    };
}
