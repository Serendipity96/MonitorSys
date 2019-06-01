let {SQL} = require('./sql');

let sql = new SQL()
sql.connect()

function idToIp(idMap) {
    let str = 'select * from server where id in('
    let promise = new Promise(resolve => {
        for (let key of idMap.keys()) {
            str += key + ','
        }
        let selectStr = str.substring(0, str.length - 1)
        selectStr += ');'
        sql.query(selectStr, res => {
            resolve(res)
        })
    })
    return promise
}

module.exports = idToIp;