let {SQL} = require('./sql');

function getHostParam(timeStart, timeEnd, timeGran, hostId) {
    let sql = new SQL()
    sql.connect()
    let selectSql = 'select timeStamp,cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive,sqlConnections,Com_commit,Com_rollback, \n' +
        'table_locks_immediate,table_locks_waited,key_reads,key_read_requests,key_writes,key_write_requests,threads_created \n' +
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
    let keyBufferReadNothits = []
    let keyBufferWriteNothits = []
    let threadCacheHit = []


    let countSql = 'select count(*) from monitor_data where timeStamp>=' + timeStart + ' and timeStamp<=' + timeEnd

    let p = new Promise((resolve) => {

        let promise = new Promise(resolve => {
            sql.query(countSql, result => {
                resolve(result)
            })
        })

        promise.then((data) => {

            sql.query(selectSql, result => {

                result.forEach((i) => {

                    timeStp.push(i.timeStamp)
                    cpu.push(i.cpuUsed)
                    memory.push(i.memoryUsed)
                    ioRead.push(i.ioRead)
                    ioWrite.push(i.ioWrite)
                    netSend.push(i.netSend)
                    netReceive.push(i.netReceive)
                    sqlConnections.push(i.sqlConnections)
                    sqlTPS.push(i.Com_commit + i.Com_rollback)
                    if(i.table_locks_waited !== 0){
                        tableLocks.push(i.table_locks_immediate / i.table_locks_waited)
                    }else{
                        tableLocks.push(i.table_locks_immediate)
                    }
                    if(i.key_read_requests !== 0){
                        keyBufferReadNothits.push(i.key_reads / i.key_read_requests)
                    }else{
                        keyBufferReadNothits.push(i.key_reads)
                    }
                    if(i.key_write_requests !== 0){
                        keyBufferWriteNothits.push(i.key_writes / i.key_write_requests)
                    }else{
                        keyBufferWriteNothits.push(i.key_writes)
                    }
                    if(i.sqlConnections !== 0){
                        threadCacheHit.push(1 - (i.threads_created / i.sqlConnections))
                    }else{
                        threadCacheHit.push(i.threads_created)
                    }
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
                let count = Math.floor(data[0]['count(*)'] / 10)
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
                        sumKeyBufferReadNothits += keyBufferReadNothits[k]
                        sumKeyBufferWriteNothits += keyBufferWriteNothits[k]
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

    })
    return p


}

module.exports = getHostParam;

