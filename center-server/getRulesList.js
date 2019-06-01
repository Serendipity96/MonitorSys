let {SQL} = require('./sql');
let {Rule} = require('./Rule');
let idToIp = require('./idToIp');

function getRulesList() {
    let sql = new SQL()
    sql.connect()

    let pro = new Promise((resolve) => {
        let selectSql = 'select * from alarm_rules'
        let p = new Promise((resolve) => {
            sql.query(selectSql, result => {
                resolve(result)
            })
        })
        p.then(result => {
            let idMap = new Map()
            for (let i = 0; i < result.length; i++) {
                idMap.set(result[i].machine_id, '')
            }
            let map = new Map()
            idToIp(idMap).then(res => {
                for (let i = 0; i < res.length; i++) {
                    map.set(res[i].id, res[i].ip_address)
                }
                for (let i = 0; i < result.length; i++) {
                    let r = new Rule(result[i].machine_id, JSON.parse(result[i].rule))
                    result[i].rule = r.toString()
                    result[i].ip = map.get(result[i].machine_id)
                }
                resolve(result)
            })


        })
    })

    return pro
}

module.exports = getRulesList;

