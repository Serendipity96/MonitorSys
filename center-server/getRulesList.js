let {SQL} = require('./sql');
let {Rule} = require('./Rule');

function getRulesList() {
    let sql = new SQL()
    sql.connect()
    let selectSql = 'select * from alarm_rules'
    let p = new Promise((resolve) => {
        sql.query(selectSql, result => {
            resolve(result)
        })
    })
    p.then(result=>{
        for (let i = 0; i < result.length; i++) {
            let r = new Rule(result[i].machine_id, JSON.parse(result[i].rule))
            result[i].rule = r.toString()
        }
    })
    return p
}

module.exports = getRulesList;

