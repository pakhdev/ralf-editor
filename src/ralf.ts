import { Inject } from './core/utils/decorators/inject/inject.decorator.ts';
import { NormalizationActions } from './core/actions/normalization/normalization.actions.ts';
import { HybridClassType } from './core/utils/types/hybrid-class.type.ts';

export interface RalfOptions {
    editableDiv: HTMLDivElement;
}

export interface Ralf extends HybridClassType<[typeof NormalizationActions]> {}

@Inject({
    actions: [NormalizationActions],
    forRoot: true,
})
export class Ralf {
    readonly editableDiv: HTMLDivElement;

    constructor(options: RalfOptions) {
        this.editableDiv = options.editableDiv;
        this
            .ensureCodeConsistency(this.editableDiv)
            .ensurePlaceholders(this.editableDiv);
    }

    public static setup(editableDiv: HTMLDivElement): Ralf {
        return new Ralf({ editableDiv });
    }
}
