const Event = require('./Event');

const modules = new Map();

const Module = new Proxy(Event.Emitter, {

    construct (parent, [ host ], child) {
        const module = Reflect.construct(parent, [ host ], child);

        Object.defineProperty(module, Module.host, {
            get () {
                return host;
            }
        });

        return new Proxy(module, {

            get (module, property, proxy) {
                const subscriptions = Reflect.get(Event.Emitter, Event.Emitter.subscriptions);

                if (subscriptions && subscriptions.has(property)) {

                    if (modules.has(module) && modules.get(module).has(property)) {
                        return modules.get(module).get(property);
                    }

                    const method = new Proxy(Reflect.get(module, property), {

                        apply (method, context, args) {
                            const result = Reflect.apply(method, context, args);
                            const emit = Reflect.get(module, 'emit');

                            Reflect.apply(emit, proxy, [ property, args ]);

                            return result;
                        }
                    });

                    if (modules.has(module)) {
                        modules.get(module).set(property, method);
                    }
                    else {
                        modules.set(module, new Map([ [ property, method ] ]));
                    }

                    return modules.get(module).get(property);
                }

                return Reflect.get(module, property);
            }
        });
    }
});

Module.host = Symbol('host');

module.exports = Module;
