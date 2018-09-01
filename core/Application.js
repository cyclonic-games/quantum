const Event = require('./Event');

const Settings = require('../modules/Settings');
const TaskManager = require('../modules/TaskManager');

class Application extends Event.Emitter {

    constructor (title, plugins = [ ]) {
        super();

        this.title = title;
        this.plugins = plugins;

        for (const module of Object.keys(this.constructor.modules)) {
            this[ module ] = new Application.modules[ module ](this);
        }

        const exclude = [ 'plugins' ];
        const modules = Object.keys(this).filter(key => !exclude.includes(key));

        for (const mod of modules.map(mod => this[ mod ])) if (mod.connect) {
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
        this.emit('start', [ ]);
    }
}

Application.modules = {
    settings: Settings,
    tasks: TaskManager
};

module.exports = Application;
