let {HostReceiver} = require('./Receivers/HostReceiver');
let {SqlReceiver} = require('./Receivers/SqlReceiver');
let {IdReceiver} = require('./Receivers/IdReceiver');
let PostDataToCenter = require('./PostData');

class ReceiverTicker {
    constructor() {
        this.receivers = []
        this.open = true
    }

    addReceiver(rec) {
        this.receivers.push(rec)
    }

    tick(time) {
        let _this = this

        let a = setInterval(function () {
            const output = {};
            const promises = [];
            _this.receivers.forEach(function (receiver) {
                promises.push(
                    receiver.receive().then(result => {
                        return {
                            name: receiver.receiverName,
                            result: result
                        }
                    })
                )
            })
            Promise.all(promises).then((result) => {
                result.forEach(v => {
                    output[v.name] = v.result
                })
            }).then(()=>{
                PostDataToCenter(output)
            })


            // 关闭数据库
            if (!_this.open) {
                clearInterval(a)
                // sql end

            }
        }, time)


    }
}

let h = new HostReceiver()
let s = new SqlReceiver()
let i = new IdReceiver()
let r = new ReceiverTicker()
r.addReceiver(h)
r.addReceiver(s)
r.addReceiver(i)
r.tick(1000)
