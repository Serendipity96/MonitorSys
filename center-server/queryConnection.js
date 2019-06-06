let {SQL} = require('./sql')

function queryConnection() {
    let sql = new SQL()
    sql.connect()
    let data = {}
    let p = new Promise(resolve => {
        let seletSql = 'select max(connections) as connection from monitor_data group by id'
        sql.query(seletSql, function (result) {
            let sum = 0
            for (let i = 0; i < result.length; i++) {
                sum += result[i].connection
            }
            data['connection'] = sum
        })
        let seletSql2 = 'select max(connections) as connection from monitor_data'
        sql.query(seletSql2, function (result) {
            data['maxConnection'] = result.connection
            resolve(data)
        })

    })
    return p
}

module.exports = queryConnection;