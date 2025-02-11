export class RalfMock {
    textNode: Text = document.createTextNode('RalfTextNode');

    get ralfGetter(): string {
        return 'ralfGetterValue';
    }

    ralfMethod(): string {
        return 'ralfMethodCalled';
    }
}
