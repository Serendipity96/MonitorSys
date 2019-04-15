let {SQL} = require('./sql');

function getHostParam(timeStart, timeEnd, timeGran, hostId) {
    let sql = new SQL()
    sql.connect()
    let selectSql = 'select cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive\n' +
        'from hostData\n' +
        'where hostId =' + hostId + ' and timeStamp >=' + timeStart +
        '  and timeStamp <=' + timeEnd

    let cpu = []
    let memory = []
    let ioRead = []
    let ioWrite = []
    let netSend = []
    let netReceive = []
    let data = {}

    let countSql = 'select count(*) from hostData where timeStamp>=' + timeStart + ' and timeStamp<=' + timeEnd

    let p = new Promise((resolve) => {

        let promise = new Promise(resolve => {
            sql.query(countSql, result => {
                resolve(result)
            })
        })

        promise.then((data) => {

            sql.query(selectSql, result => {
                result.forEach((i) => {
                    cpu.push(i.cpuUsed)
                    memory.push(i.memoryUsed)
                    ioRead.push(i.ioRead)
                    ioWrite.push(i.ioWrite)
                    netSend.push(i.netSend)
                    netReceive.push(i.netReceive)
                })
                let calCpu = []
                let calMemory = []
                let calIoRead = []
                let calIoWrite = []
                let calNetSend = []
                let calNetReceive = []

                let count = Math.floor(data[0]['count(*)'] / 10)
                for (let i = 0; i < count; i++) {
                    let sumCpu = 0
                    let sumMemory = 0
                    let sumIoRead = 0
                    let sumIoWrite = 0
                    let sumNetSend = 0
                    let sumNetReceive = 0
                    for (let k = i * timeGran; k < (1 + i) * timeGran; k++) {
                        sumCpu += cpu[k]
                        sumMemory += memory[k]
                        sumIoRead += ioRead[k]
                        sumIoWrite += ioWrite[k]
                        sumNetSend += netSend[k]
                        sumNetReceive += netReceive[k]
                    }
                    calCpu.push(Number((sumCpu / timeGran).toFixed(2)))
                    calMemory.push(Number((sumMemory / timeGran).toFixed(2)))
                    calIoRead.push(Number((sumIoRead / timeGran).toFixed(2)))
                    calIoWrite.push(Number((sumIoWrite / timeGran).toFixed(2)))
                    calNetSend.push(Number((sumNetSend / timeGran).toFixed(2)))
                    calNetReceive.push(Number((sumNetReceive / timeGran).toFixed(2)))
                }

                data = {
                    "cpu": calCpu,
                    "memory": calMemory,
                    "ioRead": calIoRead,
                    "ioWrite": calIoWrite,
                    "netSend": calNetSend,
                    "netReceive": calNetReceive
                }
                let obj = {}
                obj[hostId] = data;

                let j = {
                    data: obj
                }
                resolve(j)
            })

            sql.end()
        })

    })
    return p


}

module.exports = getHostParam;

