const subscriptions = new WeakMap();
const subscriptionsSymbol = Symbol('subscriptions');

class Event {

    constructor (type, when, details, target) {
        this.type = type;
        this.when = when;
        this.details = details;
        this.target = target;
    }

    clone () {
        return Object.assign(new Event(), this);
    }
}

Event.Emitter = class EventEmitter {

    get [ subscriptionsSymbol ] () {
        return subscriptions.get(this);
    }

    constructor () {
        subscriptions.set(this, new Map());
    }

    emit (type, details) {
        const when = new Date();
        const event = new Event(type, when, details, this);

        if (subscriptions.get(this).has(type)) {
            subscriptions.get(this).get(type).forEach(observable => observable.pipe(event));
        }

        return event;
    }

    subscribe (type) {
        const observable = new Event.Observable();

        if (subscriptions.get(this).has(type)) {
            subscriptions.get(this).get(type).push(observable);
        }
        else {
            subscriptions.get(this).set(type, [ observable ]);
        }

        return observable;
    }

    unsubscribe (observable) {
        for (const [ , observables ] of subscriptions.get(this)) if (observables.includes(observable)) {
            return observables.splice(observables.indexOf(observable), 1)[ 0 ];
        }
    }
}

Event.Emitter.subscriptions = subscriptionsSymbol;

Event.Observable = class EventObservable {

    constructor () {
        this.actions = new Set();
        this.stream = new Set();
    }

    debounce (fn) {
        this.actions.add([ 'debounce', fn ])
        return this;
    }

    filter (fn) {
        this.actions.add([ 'filter', fn ])
        return this;
    }

    forEach (fn) {
        this.actions.add([ 'forEach', fn ])
        return this;
    }

    map (fn) {
        this.actions.add([ 'map', fn ])
        return this;
    }

    async pipe (event) {
        this.stream.add(event.clone());

        for (const [ action, fn ] of this.actions) switch (action) {
            case 'debounce': {
                console.error('debounce is not yet supported');
                continue;
                // need to pipe back in at current location in actions
                // return setTimeout(() => {
                //     const last = new Set([ Array.from(this.stream).pop() ];
                //
                //     this.stream.clear();
                //     this.pipe(last);
                // }, fn());
            }
            case 'filter': {
                this.stream = new Set(Array.from(this.stream).filter(fn));
                continue;
            }
            case 'map': {
                this.stream = new Set(Array.from(this.stream).map(fn));
                continue;
            }
            case 'forEach': {
                this.stream.forEach(fn);
                continue;
            }
        }

        this.stream.clear();
    }
}

module.exports = Event;
