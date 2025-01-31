import { Ralf } from '../../../../ralf.ts';
import { InjectOptions } from './interfaces/inject-options.interface.ts';
import { getStaticMethodNames } from '../../classes/inspection.utils.ts';
import { bindInstances } from '../../classes/binding.utils.ts';

export function Inject<T extends { new(...args: any[]): any }>(options: InjectOptions) {
    return function (target: T): T {
        class EnhancedClass extends target {
            public decoratedClass: T = target;

            constructor(...args: any[]) {
                super(...args);
                const ralfInstance: Ralf = options.forRoot ? this : args[0];
                const restArgs = options.forRoot ? args : args.slice(1);

                const actions = options.actions?.map((Action) => new Action(ralfInstance, ...restArgs)) || [];
                bindInstances(actions, this);

                [...actions].forEach((instance) => {
                    if (typeof instance.onInit === 'function') {
                        instance.onInit();
                    }
                });
            }
        }

        (options.actions || []).forEach((ActionClass) => {
            getStaticMethodNames(ActionClass).forEach((methodName) => {
                (EnhancedClass.prototype as Record<string, any>)[methodName] = function (...args: any[]) {
                    return (ActionClass as Record<string, any>)[methodName].apply(ActionClass, args);
                };
            });
        });

        return EnhancedClass;
    };
}
