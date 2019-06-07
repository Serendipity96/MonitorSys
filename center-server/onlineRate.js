let {SQL} = require('./sql')


function onlineRate() {
    let sql = new SQL()
    sql.connect()
    let p = new Promise(resolve => {
        let data = {}
        let selectSql = 'select \n' +
            '       m.timestamp,\n' +
            '       c.id\n' +
            'from (select id, max(timestamp) as timestamp from monitor_data group by id) as c\n' +
            '       inner join server as s on c.id = s.id\n' +
            '       inner join monitor_data as m on c.id = m.id and c.timestamp = m.timestamp;'
        sql.query(selectSql, function (result) {
            let sum = 0
            let time = new Date().getTime() / 1000
            for (let i = 0; i < result.length; i++) {
                if (result[i].timestamp + 60 > time) {
                    sum += 1
                }
            }
            data['onlineRate'] = Math.round(100* sum / result.length) /100 *100
            resolve(data)
        })
    })
    return p
}

module.exports = onlineRate
