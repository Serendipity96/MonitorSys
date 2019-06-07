let {SQL} = require('./sql');

function getHostParam(timeStart, timeEnd, timeGran, hostId) {

    let sql = new SQL()
    sql.connect()
    let selectSql = 'select timeStamp,cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive,connections,tps, \n' +
        'tableLocks,keyBufferRead,keyBufferWrite,threadCacheHit \n' +
        'from monitor_data\n' +
        'where id =' + hostId + ' and timeStamp >=' + timeStart +
        '  and timeStamp <=' + timeEnd

    let timeStp = []
    let cpu = []
    let memory = []
    let ioRead = []
    let ioWrite = []
    let netSend = []
    let netReceive = []
    let sqlConnections = []
    let sqlTPS = []
    let tableLocks = []
    let keyBufferRead = []
    let keyBufferWrite = []
    let threadCacheHit = []


    let p = new Promise((resolve) => {

        sql.query(selectSql, result => {
            console.log(result.length)
            let count = result.length
            result.forEach((i) => {
                timeStp.push(i.timeStamp)
                cpu.push(i.cpuUsed)
                memory.push(i.memoryUsed)
                ioRead.push(i.ioRead)
                ioWrite.push(i.ioWrite)
                netSend.push(i.netSend)
                netReceive.push(i.netReceive)
                sqlConnections.push(i.connections)
                sqlTPS.push(i.tps)
                tableLocks.push(i.tableLocks)
                keyBufferRead.push(i.keyBufferRead)
                keyBufferWrite.push(i.keyBufferWrite)
                threadCacheHit.push(i.threadCacheHit)
            })

            let calTimeStamp = []
            let calCpu = []
            let calMemory = []
            let calIoRead = []
            let calIoWrite = []
            let calNetSend = []
            let calNetReceive = []
            let calSqlConnections = []
            let calSqlTps = []
            let calTableLocks = []
            let calKeyBufferReadNothits = []
            let calKeyBufferWriteNothits = []
            let calThreadCacheHit = []

            for (let i = 0; i < count; i++) {
                let sumCalTimeStamp = 0
                let sumCpu = 0
                let sumMemory = 0
                let sumIoRead = 0
                let sumIoWrite = 0
                let sumNetSend = 0
                let sumNetReceive = 0
                let sumSqlConnections = 0
                let sumSqlTps = 0
                let sumTableLocks = 0
                let sumKeyBufferReadNothits = 0
                let sumKeyBufferWriteNothits = 0
                let sumThreadCacheHit = 0
                for (let k = i * timeGran; k < (1 + i) * timeGran; k++) {
                    sumCalTimeStamp += timeStp[k]
                    sumCpu += cpu[k]
                    sumMemory += memory[k]
                    sumIoRead += ioRead[k]
                    sumIoWrite += ioWrite[k]
                    sumNetSend += netSend[k]
                    sumNetReceive += netReceive[k]
                    sumSqlConnections += sqlConnections[k]
                    sumSqlTps += sqlTPS[k]
                    sumTableLocks += tableLocks[k]
                    sumKeyBufferReadNothits += keyBufferRead[k]
                    sumKeyBufferWriteNothits += keyBufferWrite[k]
                    sumThreadCacheHit += threadCacheHit[k]
                }


                calTimeStamp.push(Number((sumCalTimeStamp / timeGran).toFixed(2)))
                calCpu.push(Number((sumCpu / timeGran).toFixed(2)))
                calMemory.push(Number((sumMemory / timeGran).toFixed(2)))
                calIoRead.push(Number((sumIoRead / timeGran).toFixed(2)))
                calIoWrite.push(Number((sumIoWrite / timeGran).toFixed(2)))
                calNetSend.push(Number((sumNetSend / timeGran).toFixed(2)))
                calNetReceive.push(Number((sumNetReceive / timeGran).toFixed(2)))
                calSqlConnections.push(Number((sumSqlConnections / timeGran).toFixed(2)))
                calSqlTps.push(Number((sumSqlTps / timeGran).toFixed(2)))
                calTableLocks.push(Number((sumTableLocks / timeGran).toFixed(2)))
                calKeyBufferReadNothits.push(Number((sumKeyBufferReadNothits / timeGran).toFixed(2)))
                calKeyBufferWriteNothits.push(Number((sumKeyBufferWriteNothits / timeGran).toFixed(2)))
                calThreadCacheHit.push(Number((sumThreadCacheHit / timeGran).toFixed(2)))

            }

            data = {
                "timeStamp": calTimeStamp,
                "cpu": calCpu,
                "memory": calMemory,
                "ioRead": calIoRead,
                "ioWrite": calIoWrite,
                "netSend": calNetSend,
                "netReceive": calNetReceive,
                "sqlConnections": calSqlConnections,
                "sqlTPS": calSqlTps,
                "tableLocks": calTableLocks,
                "keyBufferRead": calKeyBufferReadNothits,
                "keyBufferWrite": calKeyBufferWriteNothits,
                "threadCacheHit": calThreadCacheHit
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

return p


}

module.exports = getHostParam;

