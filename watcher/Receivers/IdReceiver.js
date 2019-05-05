const watcherConfig = require('../watcherConfig')
class IdReceiver {
    constructor() {
        this.receiverName = 'id'
    }

    receive(){
        return Promise.resolve(watcherConfig.watcherId)
    }

}

exports.IdReceiver = IdReceiver