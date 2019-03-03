const os = require('os')

// 计算机内存使用率
let totalmem = os.totalmem() / (1024 * 1024 * 1024)
let freemem = os.freemem() / (1024 * 1024 * 1024)
let usedmem = totalmem - freemem
console.log('------------内存使用率--------------')
console.log('totalmem ' + totalmem.toFixed(1) + " GB")
console.log('freemem ' + freemem.toFixed(1) + " GB")
console.log('usedmem ' + usedmem.toFixed(1) + " GB")
console.log()

console.log('-------------网络流入流出带宽--------------')

// 网络带宽
let netStat = require('net-stat');
let raw1 = netStat.raw()
setTimeout(function () {
    let raw2 = netStat.raw()
    let keys = Object.keys(raw2)
    for (let i = 0; i < keys.length; i++) {
        console.log(keys[i] + " 接收 " + (raw2[keys[i]].bytes.receive - raw1[keys[i]].bytes.receive)+ " B/s");
        console.log(keys[i] + " 上传 " + (raw2[keys[i]].bytes.transmit - raw1[keys[i]].bytes.transmit )+ " B/s");
    }
},1000)

console.log()

console.log('-------------CPU使用率--------------')

// CPU使用率
function getCPUS() {
    let cpus = os.cpus()
    return cpus
}

let cpus1 = getCPUS()
setTimeout(function () {
    let cpus2 = getCPUS()
    let userAmount = 0
    let sysAmount = 0
    let totalAmount = 0
    let len = cpus2.length
    for (let i = 0; i < len; i++) {
        let amount1 = cpus1[i].times.user + cpus1[i].times.nice + cpus1[i].times.sys + cpus1[i].times.idle + cpus1[i].times.irq
        let amount2 = cpus2[i].times.user + cpus2[i].times.nice + cpus2[i].times.sys + cpus2[i].times.idle + cpus2[i].times.irq
        let user_pass = cpus2[i].times.user - cpus1[i].times.user
        let system_pass = cpus2[i].times.sys - cpus1[i].times.sys
        userAmount += (user_pass / (amount2 - amount1))
        sysAmount += (system_pass / (amount2 - amount1))
    }
    console.log("用户cpu利用率 " + (userAmount / len * 100).toFixed(2) + "%")
    console.log("内核cpu利用率 " + (sysAmount / len * 100).toFixed(2) + "%")
    console.log("总的cpu利用率 " + ((userAmount / len + sysAmount / len) * 100).toFixed(2) + "%")
}, 3000);






