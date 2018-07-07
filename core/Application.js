const Event = require('./core/Event');

const Settings = require('../modules/Settings');

class Application extends Event.Emitter {

    constructor (name, extensions = [ ]) {
        super();

        this.plugins = plugins;

        for (const module of Object.keys(Application.modules)) {
            this[ module ] = new Application.modules[ module ](module, this);
        }

        const exclude = [ 'plugins' ];
        const modules = Object.keys(this).filter(key => !exclude.includes(key));

        for (const mod of modules.map(mod => this[ mod ])) {
            mod.connect(this);
        }

        this.refresh();
    }

    refresh (hard) {
        for (const plugin of this.plugins) if (hard || !plugin.applied) {
            plugin.patch(this);
        }
    }

    start () {
        this.emit('run', [ ]);
    }
}

Application.modules = {
    settings: Settings
};

module.exports = Application;
