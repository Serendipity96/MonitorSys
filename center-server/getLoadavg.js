let {SQL} = require('./sql');


function getLoadavg() {
    let sql = new SQL()
    sql.connect()

    let promise = new Promise(resolve => {
        let endTime = new Date().getTime() / 1000
        let startTime = endTime - 86400

        let data = {}
        let selectLoadavg = 'select loadavg from monitor_data where timestamp<=' + endTime + 'and timestamp >=' + startTime
        sql.query(selectLoadavg, function (result) {
            data['loadavgArr'] = result
            let sum = 0
            let max = 0
            for (let i = 0; i < result.length; i++) {
                sum += result[i].loadavg
                if (result[i] > max) {
                    max = result[i]
                }
            }
            data['loadAverage'] = Math.round(100 * sum / result.length) / 100
            data['loadMax'] = max
            resolve(data)
        })

    })
    return promise
}

module.exports = getLoadavg