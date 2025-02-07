import { Inject } from './core/utils/decorators/inject/inject.decorator.ts';

export interface RalfOptions {
    editableDiv: HTMLDivElement;
}

@Inject({
    forRoot: true,
})
export class Ralf {
    readonly editableDiv: HTMLDivElement;

    constructor(options: RalfOptions) {
        this.editableDiv = options.editableDiv;
    }

    public static setup(editableDiv: HTMLDivElement): Ralf {
        return new Ralf({ editableDiv });
    }
}
