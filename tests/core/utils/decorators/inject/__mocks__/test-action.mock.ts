export class TestActionMock {
    ralf: any;

    constructor(ralf: any) {
        this.ralf = ralf;
    }

    onInit(): void {}

    get someGetter(): string {
        return 'getterValue';
    }

    regularMethod(): string {
        return 'regularMethodCalled';
    }

    static staticMethod(): string {
        return 'staticMethodCalled';
    }
}
