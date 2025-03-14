import { EditableNodes } from '../../entities/editable-nodes/editable-nodes.entity.ts';
import { BlueprintWithConfig } from '../../utils/decorators/define-nodes/interfaces';
import { isTextNode } from '../../utils';

export class NormalizationActions {

    static ensurePlaceholders(parentNode: Node): void {
        const childNodes = parentNode.childNodes;
        childNodes.forEach((childNode: Node) => {
            if (childNode.hasChildNodes())
                this.ensurePlaceholders(childNode);
            else if (EditableNodes.identify(childNode)?.some((e) => e.blueprint.behavior.allowEmpty))
                childNode.appendChild(document.createTextNode(''));
        });
    }

    static ensureCodeConsistency(editableDiv: HTMLDivElement): typeof NormalizationActions {
        let innerHTML = editableDiv.innerHTML;
        if (this.#isCodeNormalized(innerHTML)) return this;

        editableDiv.innerHTML = innerHTML
            .replace(/\n/g, '')
            .replace(/\s{2,}/g, ' ');
        this.#normalizeSpaces(editableDiv);
        return this;
    }

    static #isCodeNormalized(code: string): boolean {
        const regex = / {2,}|\n/;
        return !regex.test(code);
    }

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
