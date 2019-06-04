const os = require('os')
const netStat = require('net-stat');
const diskStat = require('disk-stat');
const fs = require('fs');

class HostReceiver {

    constructor() {
        this.output = {}
        this.netRawOld = netStat.raw()
        this.netKeys = Object.keys(this.netRawOld)
        this.diskRawOld = diskStat.raw();
        this.diskKeys = Object.keys(this.diskRawOld)
        this.cpusOld = os.cpus()
        this.timeStampOld = Date.now()
        this.receiverName = 'host'
    }

    receive() {
        let timeStamp = (Math.round(new Date().getTime() / 1000))
        this.output["timeStamp"] = timeStamp
        // 服务器1分钟平均负载
        this.output["loadavg"] = Math.floor(os.loadavg()[0] * 100) / 100
        // 计算机内存使用
        let totalmem = os.totalmem() / (1024 * 1024 * 1024)
        let freemem = os.freemem() / (1024 * 1024 * 1024)
        let usedmem = totalmem - freemem
        // 单位 GB
        // this.output["totalmem"] = totalmem.toFixed(1)
        // this.output["freemem"] = freemem.toFixed(1)
        this.output["usedmem"] = usedmem.toFixed(1)

        let second = Date.now() - this.timeStampOld
        // 网络带宽
        // 单位 B/s
        let netRawNew = netStat.raw()
        for (let i = 0; i < this.netKeys.length; i++) {
            let kR = this.netKeys[i] + "Receive"
            let kS = this.netKeys[i] + "Send"
            this.output[kR] = ((netRawNew[this.netKeys[i]].bytes.receive - this.netRawOld[this.netKeys[i]].bytes.receive) / second).toFixed(2)
            this.output[kS] = ((netRawNew[this.netKeys[i]].bytes.transmit - this.netRawOld[this.netKeys[i]].bytes.transmit) / second).toFixed(2)
        }
        // 磁盘IO
        // 单位 次/秒
        let diskRawNew = diskStat.raw();
        for (let i = 0; i < this.diskKeys.length; i++) {
            let kR = this.netKeys[i] + "Read"
            let kS = this.netKeys[i] + "Write"
            this.output[kR] = ((diskRawNew[this.diskKeys[i]].readsCompleted - this.diskRawOld[this.diskKeys[i]].readsCompleted) / second).toFixed(2)
            this.output[kS] = ((diskRawNew[this.diskKeys[i]].writesCompleted - this.diskRawOld[this.diskKeys[i]].writesCompleted) / second).toFixed(2)
        }
        // CPU使用率
        // 单位 %
        let cpusNew = os.cpus()
        let userAmount = 0
        let sysAmount = 0
        let cpusLen = cpusNew.length
        for (let i = 0; i < cpusLen; i++) {
            let amountOld = this.cpusOld[i].times.user + this.cpusOld[i].times.nice + this.cpusOld[i].times.sys + this.cpusOld[i].times.idle + this.cpusOld[i].times.irq
            let amountNew = cpusNew[i].times.user + cpusNew[i].times.nice + cpusNew[i].times.sys + cpusNew[i].times.idle + cpusNew[i].times.irq
            let user_pass = cpusNew[i].times.user - this.cpusOld[i].times.user
            let system_pass = cpusNew[i].times.sys - this.cpusOld[i].times.sys
            userAmount += (user_pass / (amountNew - amountOld))
            sysAmount += (system_pass / (amountNew - amountOld))
        }
        // this.output["userCpu"] = (userAmount / cpusLen * 100).toFixed(2)
        // this.output["coreCpu"] = (sysAmount / cpusLen * 100).toFixed(2)
        this.output["allCpu"] = ((userAmount / cpusLen + sysAmount / cpusLen) * 100).toFixed(2)

        this.netRawOld = netRawNew
        this.diskRawOld = diskRawNew
        this.cpusOld = cpusNew
        const time = fs.readFileSync('/proc/uptime').toString().split(' ')
        this.output["runtime"] = Number(time[0])

        return Promise.resolve(this.output)
    }
}

exports.HostReceiver = HostReceiver;
