let {SQL} = require('./sql');
let sql = new SQL()
sql.connect()

function getLoadavg() {
    let promise = new Promise(resolve => {
        let endTime = new Date().getTime() / 1000
        let startTime = endTime - 86400

        let selectLoadavg = 'select loadavg from monitor_data where timestamp<=' + endTime + 'and timestamp >=' + startTime
        sql.query(selectLoadavg, function (result) {
            resolve(result)
        })

    })
    return promise
}

module.exports = getLoadavg