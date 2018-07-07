const Module = require('../core/Module');

module.exports = class TaskManager extends Module {

    connect () {
        this[ Module.host ].subscribe('instruction')
            .filter(event => event.details.type === 'task')
            .forEach(event => this.execute(...event.details));
    }

    execute (message) {
        const { task, id } = message;

        if (task) {
            this.emit(task.name, [ task.details, id ]);
        }
    }
}
