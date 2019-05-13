let {SQL} = require('./sql');

function getRulesList() {
    let sql = new SQL()
    sql.connect()
    let selectSql = 'select * from alarm_rules'


    let p = new Promise((resolve) => {

        sql.query(selectSql, result => {
            resolve(result)
        })


    })
    return p


}

module.exports = getRulesList;

