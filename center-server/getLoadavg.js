let {SQL} = require('./sql');


function getLoadavg() {
    let sql = new SQL()
    sql.connect()

    let promise = new Promise(resolve => {
        let machineCount = 0
        let selectCount = 'select count(*)as count from server '
        sql.query(selectCount,function (result) {
            machineCount = result[0].count
        })
        let endTime = new Date().getTime() / 1000
        let startTime = endTime - 600
        let data = {}
        let selectLoadavg = 'select loadavg from monitor_data where timestamp<=' + endTime + 'and timestamp >=' + startTime
        sql.query(selectLoadavg, function (result) {
            data['loadavgArr'] = result
            let sum = 0
            let max = 0
            for (let i = 0; i < result.length; i++) {
                sum += result[i].loadavg
                if (result[i].loadavg > max) {
                    max = result[i].loadavg
                }
            }
            console.log("平均负载数组长度")
            console.log(result.length)
            data['loadAverage'] = Math.round(100 * sum / machineCount) / 100
            data['loadMax'] = max
            resolve(data)
        })

    })
    return promise
}

module.exports = getLoadavg