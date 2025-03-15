import { EditableNodes } from '../../entities/editable-nodes/editable-nodes.entity.ts';
import { BlueprintWithConfig } from '../../utils/decorators/define-nodes/interfaces';
import { isTextNode } from '../../utils';

/**
 * A utility class for normalizing the content of HTML elements, particularly for situations where the editable content was not created using the Ralf Editor
 * or has been modified after its creation. It ensures that the content behaves correctly by maintaining placeholder consistency,
 * ensuring code consistency (such as removing unnecessary spaces and newlines), and normalizing spaces in text nodes of HTML elements.
 *
 * This class helps ensure that the content can function as intended in the editor environment, even when it's been altered externally.
 * It operates recursively through child nodes of a given parent node to ensure proper formatting and consistent content structure.
 */
export class NormalizationActions {

    /**
     * Ensures that placeholders are added to child nodes of the parent node.
     * If a child node doesn't contain other nodes and allows empty content, a text node with empty content is appended.
     *
     * @param {Node} parentNode - The parent node in which the child nodes will be checked.
     */
    static ensurePlaceholders(parentNode: Node): void {
        const childNodes = parentNode.childNodes;
        childNodes.forEach((childNode: Node) => {
            if (childNode.hasChildNodes())
                this.ensurePlaceholders(childNode);
            else if (EditableNodes.identify(childNode)?.some((e) => e.blueprint.behavior.allowEmpty))
                childNode.appendChild(document.createTextNode(''));
        });
    }

    /**
     * Ensures the consistency of the code in the provided editable div.
     * Removes unnecessary spaces and newlines in the content if needed.
     *
     * @param {HTMLDivElement} editableDiv - The HTML element whose content will be normalized.
     * @returns {typeof NormalizationActions} - Returns the class itself for method chaining.
     */
    static ensureCodeConsistency(editableDiv: HTMLDivElement): typeof NormalizationActions {
        let innerHTML = editableDiv.innerHTML;
        if (this.#isCodeNormalized(innerHTML)) return this;

        editableDiv.innerHTML = innerHTML
            .replace(/\n/g, '')
            .replace(/\s{2,}/g, ' ');
        this.#normalizeSpaces(editableDiv);
        return this;
    }

    /**
     * Checks if the code is normalized (no extra spaces or newlines).
     *
     * @param {string} code - The code to check.
     * @returns {boolean} - Returns true if the code is normalized, false otherwise.
     */
    static #isCodeNormalized(code: string): boolean {
        const regex = / {2,}|\n/;
        return !regex.test(code);
    }

    /**
     * Normalizes spaces in a node and its child nodes.
     * Removes leading and trailing spaces in text nodes depending on the configuration.
     *
     * @param {Node} node - The node where space normalization will occur.
     * @param {BlueprintWithConfig[] | null} [parentBlueprints=null] - Additional configuration information for normalization.
     * @private
     */
    static #normalizeSpaces(node: Node, parentBlueprints: BlueprintWithConfig[] | null = null): void {
        const removeTextNodes = parentBlueprints?.some((e) => e.blueprint.behavior.child);
        let removeNextLeadingSpace = true;
        let previousNode: Node | null = null;

        Array.from(node.childNodes).forEach((childNode: Node) => {
            const currentBlueprints = EditableNodes.identify(childNode);

            if (isTextNode(childNode)) {
                if (removeTextNodes) {
                    (childNode as ChildNode).remove();
                    return;
                }
                if (removeNextLeadingSpace) {
                    this.#removeLeadingSpaces(childNode);
                    if (!childNode.textContent)
                        (childNode as ChildNode).remove();
                    else removeNextLeadingSpace = false;
                }

            } else {
                if (currentBlueprints.some((e) => e.blueprint.behavior.isBlock || e.blueprint.behavior.isContent)) {
                    if (previousNode && isTextNode(previousNode)) this.#removeTrailingSpaces(previousNode);
                    removeNextLeadingSpace = true;
                }

                if (childNode.hasChildNodes())
                    this.#normalizeSpaces(childNode, currentBlueprints);
            }

            previousNode = childNode;
        });

        if (previousNode && isTextNode(previousNode))
            this.#removeTrailingSpaces(previousNode);
    }

    static #removeLeadingSpaces(node: Node): void {
        node.textContent = node.textContent?.replace(/^\s+/g, '') || '';
    }

    static #removeTrailingSpaces(node: Node): void {
        node.textContent = node.textContent?.replace(/\s+$/g, '') || '';
    }
}
