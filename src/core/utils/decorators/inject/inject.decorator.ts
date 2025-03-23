import { Ralf } from '../../../../ralf.ts';
import { InjectOptions } from './interfaces/inject-options.interface.ts';
import { getStaticMethodNames } from '../../classes/inspection.utils.ts';
import { bindInstances } from '../../classes/binding.utils.ts';

/**
 * A class decorator for injecting dependencies (actions or handlers) into a target class.
 *
 * This decorator allows injecting classes into the decorated class, providing seamless access to:
 * - Instance methods and getters from injected classes
 * - Static methods from injected classes (as proxy methods on the decorated class)
 * - Automatic `onInit` lifecycle hook execution if defined in injected classes
 *
 * Injected instances are created automatically and bound to the decorated class.
 * If `forRoot` is set to `true`, the decorated class is considered to be the root `Ralf` class.
 * In this case, the decorated class itself is passed as the context (`this`) to injected classes.
 * If `forRoot` is `false`, the first argument of the decorated class's constructor is expected
 * to be an instance of `Ralf`, which will be passed to the injected classes.
 *
 * The decorated class retains all its own instance and static members.
 *
 * @template T - The type of the decorated class constructor.
 * @param {Object} options - Configuration for the injection behavior.
 * @param {boolean} options.forRoot - Indicates whether the decorated class is the root `Ralf` class.
 * @param {Array<Function>} [options.actions] - An array of injectable classes (with static methods allowed).
 * @param {Array<Function>} [options.handlers] - An array of injectable classes (static methods ignored, `onInit` allowed).
 *
 * @returns {Function} A new class that extends the original class and includes injected functionality.
 *
 * @example
 *
 * ```ts
 * @Inject({
 *   actions: [Logger, Metrics],
 *   forRoot: true,
 * })
 * class Ralf {}
 *
 * const app = new Ralf();
 * app.log("Hello"); // from Logger
 * app.track("Event"); // from Metrics
 * ```
 *
 * NOTE:
 * - To correctly extract getters (non-method properties) into the hybrid Ralf type,
 *   you must mark all intended getters in injected classes with the `isGetter` type:
 *
 * ```ts
 * class Example {
 *   get someValue(): number & isGetter {
 *     return 42;
 *   }
 * }
 * ```
 *
 * Without marking with `isGetter`, TypeScript will not treat the property as a getter
 * in hybrid type construction.
 *
 * ...
 */
export function Inject<T extends { new(...args: any[]): any }>(options: InjectOptions): Function {
    return function (target: T): T {
        class EnhancedClass extends target {
            public decoratedClass: T = target;

            constructor(...args: any[]) {
                super(...args);
                const ralfInstance: Ralf = options.forRoot ? () => this : args[0];
                const restArgs = options.forRoot ? args : args.slice(1);

                const handlers = options.handlers?.map((Handler) => new Handler(ralfInstance, ...restArgs)) || [];
                bindInstances(handlers, this);

                const actions = options.actions?.map((Action) => new Action(ralfInstance, ...restArgs)) || [];
                bindInstances(actions, this);

                [...handlers, ...actions].forEach((instance) => {
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
