let {HostReceiver} = require('./HostReceiver');

class ReceiverTicker {
    constructor() {
        this.receivers = []
        this.output = {}
    }

    addReceiver(rec) {
        this.receivers.push(rec)
    }

    tick(time) {
        let _this = this
        setInterval(function () {
            _this.receivers.forEach(function (value) {
                _this.output[value.receiverName] = value.receive()
                console.log(_this.output)
            })
        }, time)
    }
}

let h = new HostReceiver()
let r = new ReceiverTicker()
r.addReceiver(h)
r.tick(3000)
