class Plugin {

    constructor (name, fn) {
        this.applied = false;
        this.kind = name;
        this.fn = fn;
    }

    patch (host) {
        this.fn(host);
        this.applied = true;
    }
}

module.exports = Plugin;
