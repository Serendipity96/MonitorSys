let {SQL} = require('./sql');

function getHostParam(timeStart, timeEnd, timeGran, hostId) {
    let sql = new SQL()
    sql.connect()
    let selectSql = 'select cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive\n' +
        'from hostData\n' +
        'where hostId = 1\n' +
        '  and timeStamp >= 1554964655\n' +
        '  and timeStamp <= 1554964657'

    let cpu = []
    let memory = []
    let ioRead = []
    let ioWrite = []
    let netSend = []
    let netReceive = []
    let data = {}

    let p = new Promise((resolve) => {
        sql.query(selectSql, result => {
            result.forEach((i) => {
                cpu.push(i.cpuUsed)
                memory.push(i.memoryUsed)
                ioRead.push(i.ioRead)
                ioWrite.push(i.ioWrite)
                netSend.push(i.netSend)
                netReceive.push(i.netReceive)
            })
            data = {
                "cpu": cpu,
                "memory": memory,
                "ioRead": ioRead,
                "ioWrite": ioWrite,
                "netSend": netSend,
                "netReceive": netReceive
            }
            let o = {}
            o[hostId] = data;

            let j = {
                data: o
            }
            resolve(j)
        })

        sql.end()
    })

    return p
}

module.exports = getHostParam;

