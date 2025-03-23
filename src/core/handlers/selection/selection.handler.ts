import { Ralf } from '../../../ralf.ts';
import { StoredSelection } from '../../entities/stored-selection/stored-selection.entity.ts';
import { SelectionGetter } from './helpers/selection-getter.helper.ts';
import { ObserveSelection, OnSelectionChange } from '../../utils/decorators/observe-selection';
import { isGetter } from '../../utils/types/hybrid-class.type.ts';

/**
 * Class that manages and tracks the selection state in a given editable div.
 * It stores the current and previous selections, and updates the state when the selection changes.
 * The class also provides getter methods to access the current and previous selections.
 *
 * @example
 * const handler = new SelectionHandler(ralfInstance);
 * console.log(handler.currentSelection); // Get current selection
 * console.log(handler.previousSelection); // Get previous selection
 */
@ObserveSelection
export class SelectionHandler {

    /**
     * Stores the previous and current selection states.
     * - `previous`: The selection state before the last change.
     * - `current`: The current selection state.
     * @type {{ previous: StoredSelection, current: StoredSelection }}
     */
    readonly state: { previous: StoredSelection, current: StoredSelection };

    /**
     * Creates an instance of `SelectionHandler` and initializes the selection state.
     * It grabs the current selection when the instance is created and sets it as both previous and current.
     *
     * @param {Ralf} ralf - The Ralf instance that holds the editable div.
     */
    constructor(readonly ralf: () => Ralf) {
        const selection = this.#getSelection();
        this.state = { previous: selection, current: selection };
    }

    get currentSelection(): StoredSelection & isGetter {
        return this.state.current;
    }

    get previousSelection(): StoredSelection & isGetter {
        return this.state.previous;
    }

    /**
     * Event handler for `selectionchange` event. Updates the previous and current selection states.
     * This method is triggered automatically when the selection changes in the editor.
     *
     * @returns {void}
     */
    @OnSelectionChange()
    storeSelection(): void {
        this.state.previous = this.state.current;
        this.state.current = this.#getSelection();
    }

    /**
     * Retrieves the current selection from the editable div managed by the `ralf` instance.
     * This private method is used internally to get the selection state.
     *
     * @returns {StoredSelection} The current selection state.
     */
    #getSelection(): StoredSelection {
        return SelectionGetter.get(this.ralf().editableDiv);
    }
}