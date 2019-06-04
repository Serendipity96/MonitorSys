let {SQL} = require('./sql');

let sql = new SQL()
sql.connect()

function queryRecord() {
    let records = {}
    let p = new Promise(resolve => {
        let selectSql = 'select count(*) as count from alarm_record '
        sql.query(selectSql, function (res) {
            records["allCount"] = res[0].count
        })
        let selectSql2 = 'select count(*) as count from alarm_record where is_solved = 0'
        sql.query(selectSql2, function (res) {
            records["notSolved"] = res[0].count
        })
        let selectSql3 = 'select count(*) as count from alarm_record where is_solved = 1'
        sql.query(selectSql3, function (res) {
            records["isSolved"] = res[0].count
        })
        let selectSql4 = 'select count(*) as count from alarm_record where type = 0'
        sql.query(selectSql4, function (res) {
            records["host"] = res[0].count
        })
        let selectSql5 = 'select count(*) as count from alarm_record where type = 1'
        sql.query(selectSql5, function (res) {
            records["sql"] = res[0].count
        })
        let selectSql6 = 'select count(*) as count from alarm_record where level = "urgent"'
        sql.query(selectSql6, function (res) {
            records["urgent"] = res[0].count
            resolve(records)
        })
    })
    return p
}

module.exports = queryRecord

