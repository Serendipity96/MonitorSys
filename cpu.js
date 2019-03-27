function getComputerData(time,callback){
    const os = require('os')
    const netStat = require('net-stat');
    const diskStat = require('disk-stat');

    let output = {}
    let netRaw1 = netStat.raw()
    let netKeys = Object.keys(netRaw1)
    let diskRaw1 = diskStat.raw();
    let diskKeys = Object.keys(diskRaw1)
    let cpus1 = getCPUS()
    setInterval(function () {
        // 计算机内存使用率
        let totalmem = os.totalmem() / (1024 * 1024 * 1024)
        let freemem = os.freemem() / (1024 * 1024 * 1024)
        let usedmem = totalmem - freemem
        output["totalmem"] = totalmem.toFixed(1) + " GB"
        output["freemem"] = freemem.toFixed(1) + " GB"
        output["usedmem"] = usedmem.toFixed(1) + " GB"
        // 网络带宽
        let netRaw2 = netStat.raw()
        for (let i = 0; i < netKeys.length; i++) {
            output[netKeys[i]+" receive"] = (netRaw2[netKeys[i]].bytes.receive - netRaw1[netKeys[i]].bytes.receive).toFixed(2) + " B/s"
            output[netKeys[i]+" send"]= (netRaw2[netKeys[i]].bytes.transmit - netRaw1[netKeys[i]].bytes.transmit).toFixed(2) + " B/s"
        }
        // 磁盘IO
        let diskRaw2 = diskStat.raw();
        for (let i = 0; i < diskKeys.length; i++) {
            output[diskKeys[i] + " 读 "] = (diskRaw2[diskKeys[i]].readsCompleted - diskRaw1[diskKeys[i]].readsCompleted).toFixed(2)+ " 次/秒"
            output[diskKeys[i] + " 写 "] = (diskRaw2[diskKeys[i]].writesCompleted - diskRaw1[diskKeys[i]].writesCompleted).toFixed(2) + " 次/秒"
        }
        // CPU使用率
        let cpus2 = getCPUS()
        let userAmount = 0
        let sysAmount = 0
        let cpusLen = cpus2.length
        for (let i = 0; i < cpusLen; i++) {
            let amount1 = cpus1[i].times.user + cpus1[i].times.nice + cpus1[i].times.sys + cpus1[i].times.idle + cpus1[i].times.irq
            let amount2 = cpus2[i].times.user + cpus2[i].times.nice + cpus2[i].times.sys + cpus2[i].times.idle + cpus2[i].times.irq
            let user_pass = cpus2[i].times.user - cpus1[i].times.user
            let system_pass = cpus2[i].times.sys - cpus1[i].times.sys
            userAmount += (user_pass / (amount2 - amount1))
            sysAmount += (system_pass / (amount2 - amount1))
        }
        output["用户cpu利用率"] = (userAmount / cpusLen * 100).toFixed(2) + "%"
        output["内核cpu利用率"] = (sysAmount / cpusLen * 100).toFixed(2) + "%"
        output["总的cpu利用率"] = ((userAmount / cpusLen + sysAmount / cpusLen) * 100).toFixed(2) + "%"

        callback(output)

        output = {}
        netRaw1 = netRaw2
        diskRaw1 = diskRaw2
        cpus1 = cpus2
    }, time)

    function getCPUS() {
        let cpus = os.cpus()
        return cpus
    }

}

getComputerData(1000,function (info) {
    console.log("output " + JSON.stringify(info))
    console.log()
})









