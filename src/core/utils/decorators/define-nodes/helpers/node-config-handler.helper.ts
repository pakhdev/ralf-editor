import { NodeCreationConfig } from '../interfaces';

/**
 * A utility class for validating, populating, and extracting values from node configuration objects
 * based on a reference template. It is designed to help identify, prepare, and process structured
 * configurations for dynamic element creation or manipulation.
 *
 * The class implements three core features:
 *
 * 1. **Node Identification via Validation (`isMatch`)**
 *    - Check if the input configuration matches a predefined template
 *    - Used to determine if a node corresponds to a specific type
 *    - Rules:
 *      - All keys in the template must exist in the input config
 *      - If a template value is `''`, the key is required and must be present
 *      - If a template value is `'optional'`, the key will be ignored during validation
 *
 * 2. **Node Configuration Preparation via Population (`populateConfig`)**
 *    - Prepares a configuration by filling in required values from `inputConfig` into `templateConfig`
 *    - Keys with `''` in the template are required and must exist in the input
 *    - Optional fields (`'optional'`) will be filled with the value from the input config if it exists
 *    - Extra attributes in `inputConfig` not defined in the template are ignored
 *    - Used to finalize settings before creating or rendering a node.
 *
 * 3. **Custom Attribute Extraction (`extractCustomAttributes`)**:
 *    - Extracts only user-defined keys (e.g., styles, classes, children) from `inputConfig`
 *      into the `templateConfig`
 *    - Any other keys not found in the original template are excluded
 *    - Useful for:
 *      - Displaying only editable/custom properties in the UI
 *      - Differentiating between structural and decorative settings of a node
 *      - Supporting UI tools for visual editing of configurable elements
 *
 * This class helps enforce configuration integrity and enables selective transfer of customizable settings
 */
export default class NodeConfigHandler {
    /**
     * The template configuration used as a reference for validation, population, and extraction
     */
    readonly #templateConfig: NodeCreationConfig;

    /**
     * Constructs a new instance of `NodeConfigHandler`.
     * @param inputConfig - The input configuration provided by the user
     * @param templateConfig - The template configuration used as a reference
     */
    constructor(
        private readonly inputConfig: NodeCreationConfig = {},
        templateConfig: NodeCreationConfig,
    ) {
        this.#templateConfig = JSON.parse(JSON.stringify(templateConfig));
    }

    /**
     * Validates if the input configuration matches the template configuration.
     * @returns `true` if the input configuration matches the template, otherwise `false`
     */
    isMatch(): boolean {
        return this.#handleObject(this.inputConfig, this.#templateConfig, 'validate');
    }

    /**
     * Populates the template configuration with values from the input configuration
     * @returns The populated template configuration
     */
    populateConfig(): NodeCreationConfig {
        this.#handleObject(this.inputConfig, this.#templateConfig, 'populate');
        return this.#templateConfig;
    }

    /**
     * Extracts custom attributes from the input configuration into the template configuration
     * @returns The template configuration with extracted custom attributes
     */
    extractCustomAttributes(): NodeCreationConfig {
        this.#handleObject(this.inputConfig, this.#templateConfig, 'extract');
        return this.#templateConfig;
    }

    /**
     * Handles the processing of objects for validation, population, or extraction
     * @param target - The target object to process
     * @param template - The template object to use as a reference
     * @param action - The action to perform: 'validate', 'populate', or 'extract'
     * @returns `true` if the operation is successful, otherwise `false`
     */
    #handleObject(
        target: Record<string, any> | undefined,
        template: Record<string, any>,
        action: 'validate' | 'populate' | 'extract',
    ): boolean {
        if (!target) return false;

        return Object.entries(template).every(([key, templateValue]) => {
            const targetValue = target[key];

            switch (typeof templateValue) {
                case 'string':
                case 'number':
                    return this.#handleValue(target, template, action, key);
                case 'object':
                    return Array.isArray(templateValue)
                        ? this.#handleArray(targetValue, templateValue, action)
                        : this.#handleObject(
                            targetValue as Record<string, unknown>,
                            templateValue as Record<string, unknown>,
                            action,
                        );
                case 'function':
                    return typeof targetValue === 'function';
                default:
                    throw new Error(`Unsupported template value type: ${ typeof templateValue }`);
            }
        });
    }

    /**
     * Handles the processing of arrays for validation, population, or extraction
     * @param target - The target array to process
     * @param template - The template array to use as a reference
     * @param action - The action to perform: 'validate', 'populate', or 'extract'
     * @returns `true` if the operation is successful, otherwise `false`
     */
    #handleArray(
        target: Array<string | object> | undefined,
        template: Array<string | any>,
        action: 'validate' | 'populate' | 'extract',
    ): boolean {
        if (action === 'validate') {
            if (!Array.isArray(target))
                return template.every((templateItem) => {
                    if (typeof templateItem === 'object' && templateItem !== null) {
                        return Object.values(templateItem).every(val => val === 'optional');
                    }
                    return false;
                });

            return template.every((templateItem) => {
                if (typeof templateItem === 'string')
                    return target.includes(templateItem);

                if (typeof templateItem === 'object' && templateItem !== null)
                    return target.some((targetItem) => this.#handleObject(targetItem as Record<string, any>, templateItem, action));

                throw new Error('Invalid template item');
            });
        }

        template.forEach((templateItem) => {
            if (typeof templateItem === 'object' && templateItem !== null)
                target?.forEach((targetItem) => this.#handleObject(targetItem as Record<string, any>, templateItem, action));
            else if (typeof templateItem !== 'string')
                throw new Error('Invalid template item');
        });
        return true;
    }

    /**
     * Handles the processing of individual values for validation, population, or extraction.
     * @param target - The target object containing the value.
     * @param template - The template object containing the reference value.
     * @param action - The action to perform: 'validate', 'populate', or 'extract'.
     * @param key - The key of the value to process.
     * @returns `true` if the operation is successful, otherwise `false`.
     */
    #handleValue(
        target: Record<string, unknown> | undefined,
        template: Record<string, any>,
        action: 'validate' | 'populate' | 'extract',
        key: string,
    ): boolean {
        const targetValue = target?.[key];
        const templateValue = template[key];

        if (action === 'validate') {
            if (templateValue === '') return !!targetValue;
            if (templateValue === 'optional') return true;
            return targetValue === templateValue;
        }

        if (['', 'optional'].includes(templateValue)) {
            if (targetValue === undefined) {
                if (templateValue === 'optional') {
                    template[key]?.remove?.();
                } else throw new Error(`Missing required attribute: ${ key }`);
            }
            template[key] = targetValue;
        } else if (action === 'extract') template[key]?.remove?.();

        return true;
    }

}
