let {SQL} = require('./sql')

function queryMem() {
    let sql = new SQL()
    sql.connect()
    let p = new Promise((resolve => {
        let data = {}
        let selectSql = 'select m.memoryUsed,m.memoryTotal\n' +
            'from (select id,max(timestamp) as timestamp from monitor_data group by id) as n\n' +
            '       inner join monitor_data as m on n.timestamp = m.timestamp;'
        sql.query(selectSql, function (result) {
            let sumTotal = 0
            let sumUsed = 0
            for (let i = 0; i < result.length; i++) {
                sumTotal += result[i].memoryTotal
                sumUsed += result[i].memoryUsed
            }
            data['memTotal'] = Math.round(10 * sumTotal) / 10
            data['memUsed'] = Math.round(10 * sumUsed) / 10
            resolve(data)
        })
    }))

    return p
}

module.exports = queryMem