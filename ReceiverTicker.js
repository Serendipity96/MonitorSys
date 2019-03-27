let {HostReceiver} = require('./HostReceiver');
const http = require('http')

const options = {
    hostname: 'localhost',
    port: 8081,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
};

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
                // console.log(_this.output)

                const postData = JSON.stringify(_this.output)
                const req = http.request(options, (res) => {
                    console.log(`状态码: ${res.statusCode}`);
                    res.setEncoding('utf8')
                });

                req.on('error', (e) => {
                    console.error(`请求遇到问题: ${e.message}`);
                });

                req.write(postData);
                req.end();
            })
        }, time)
    }
}

let h = new HostReceiver()
let r = new ReceiverTicker()
r.addReceiver(h)
r.tick(3000)





