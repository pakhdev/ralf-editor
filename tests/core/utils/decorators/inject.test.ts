import { describe, it, expect, vi } from 'vitest';
import { Inject } from '../../../../src/core/utils/decorators/inject/inject.decorator';
import { TestActionMock } from './__mocks__/test-action.mock';
import { RalfMock } from './__mocks__/ralf.mock';

describe('Inject Decorator on root(Ralf) class', () => {
    @Inject({
        actions: [TestActionMock],
        forRoot: true,
    })
    class Ralf extends RalfMock {}

    const spyOnInit = vi.spyOn(TestActionMock.prototype, 'onInit');
    const ralfInstance = new Ralf();

    it('should add getters from instances of injected class', () => {
        expect((ralfInstance as any).someGetter).toBe('getterValue');
    });

    it('should add methods from instances of injected class', () => {
        expect((ralfInstance as any).regularMethod()).toBe('regularMethodCalled');
    });

    it('should add static methods from injected class', () => {
        expect((ralfInstance as any).staticMethod()).toBe('staticMethodCalled');
    });

    it('should call onInit if defined in actions', () => {
        expect(spyOnInit).toHaveBeenCalled();
    });

    it('should have access to original methods', () => {
        expect(ralfInstance.ralfGetter).toBe('ralfGetterValue');
        expect(ralfInstance.ralfMethod()).toBe('ralfMethodCalled');
        expect(ralfInstance.textNode.textContent).toBe('RalfTextNode');
    });
});

describe('Inject Decorator on not root class', () => {
    @Inject({
        actions: [TestActionMock],
        forRoot: false,
    })
    class DecoratedClass {
        constructor(private readonly ralf: any) {}

        get ralfGetter(): string {
            return this.ralf.ralfGetter;
        }

        getTextNodeValue(): string {
            return this.ralf.textNode.textContent;
        }

        ralfMethod(): string {
            return this.ralf.ralfMethod();
        }
    }

    const spyOnInit = vi.spyOn(TestActionMock.prototype, 'onInit');
    const instance = new DecoratedClass(new RalfMock());

    it('should add getters from instances of injected class', () => {
        expect((instance as any).someGetter).toBe('getterValue');
    });

    it('should add methods from instances of injected class', () => {
        expect((instance as any).regularMethod()).toBe('regularMethodCalled');
    });

    it('should add static methods from injected class', () => {
        expect((instance as any).staticMethod()).toBe('staticMethodCalled');
    });

    it('should call onInit if defined in actions', () => {
        expect(spyOnInit).toHaveBeenCalled();
    });

    it('should receive Ralf as the first constructor argument when forRoot: false', () => {
        expect(instance.ralfGetter).toBe('ralfGetterValue');
        expect(instance.ralfMethod()).toBe('ralfMethodCalled');
        expect(instance.getTextNodeValue()).toBe('RalfTextNode');
    });
});
