let http = require('http');
const url = require('url');
let getHostParam = require('./getHostParam');
let getRulesList = require('./getRulesList');
let {SQL} = require('./sql');

let sql = new SQL()
sql.connect()


http.createServer(function (req, res) {
    if (url.parse(req.url).path === '/getHostParam') {
        if (req.method === "POST") {
            let data = {}
            req.on('data', function (chunk) {
                data = JSON.parse(chunk);
            });
            req.on('end', function () {
                getHostParam(data.timeStart, data.timeEnd, data.timeGran, data.hostId)
                    .then((j) => {
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.write(JSON.stringify(j))
                        console.log(JSON.stringify(j))
                        res.end()
                    })
            })
        }
    } else if (url.parse(req.url).path === '/postData') {
        if (req.method === 'POST') {
            req.on('data', chunk => {
                //处理数据
                let data = JSON.parse(chunk)
                let host = data["host"]
                let sqlData = data["sql"]
                let id = data.id
                let addSql = 'INSERT INTO monitor_data(timestamp,cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive,id,sqlConnections,Com_commit,Com_rollback) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
                let addSqlParams = [host.timeStamp, host.allCpu, host.usedmem, host.loRead, host.loWrite, host.loSend, host.loReceive, id, sqlData.Connections, sqlData.Com_commit, sqlData.Com_rollback];
                sql.add(addSql, addSqlParams)
                let querySql = 'select * from alarm_rules where machine_id=' + id
                sql.query(querySql, function (res) {
                    let rulesArr = []
                    let rulesId = []
                    for (let i = 0; i < res.length; i++) {
                        rulesId.push(res[i].rule_id)
                        rulesArr.push(JSON.parse(res[i].rule))
                    }
                    let rulesList = []
                    for (let i = 0; i < rulesArr.length; i++) {
                        let ruleStr = JSON.stringify(rulesArr[i])
                        let tmp = ruleStr.split(',')
                        if (tmp.length === 3) {
                            let strArr = tmp[0].split('')
                            let strArr2 = tmp[2].split('')
                            rulesList.push({id:rulesId[i],name: strArr[strArr.length - 1], rule: tmp[1], num: strArr2[0]})
                        } else {
                            for (let j = 0; j < tmp.length / 3; j++) {
                                let strArr = tmp[3 * j + 0].split('')
                                let strArr2 = tmp[3 * j + 2].split('')
                                rulesList.push({id:rulesId[i],name: strArr[strArr.length - 1], rule: tmp[3 * j + 1], num: strArr2[0]})
                            }
                        }
                    }
                    for (let i = 0; i < rulesList.length; i++) {
                        if (rulesList[i].name === '0') {
                            if (rulesList[i].rule === '0') {
                                if (host.allCpu > rulesList[i].num) {
                                    console.log('规则' + rulesList[i].id)
                                    console.log('cpu' + host.allCpu + '超出规定范围')
                                }
                            }
                        }
                        if (rulesList[i].name === '1') {
                            if (rulesList[i].rule === '0') {
                                if (host.usedmem > rulesList[i].num) {
                                    console.log('规则' + rulesList[i].id)
                                    console.log('内存' + host.usedmem + '超出规定范围')
                                }
                            }
                        }
                    }
                })
            });
            req.on('end', () => {
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            });
        }
    } else if (url.parse(req.url).path === '/postRules') {
        if (req.method === 'POST') {
            req.on('data', chunk => {
                let data = JSON.parse(chunk)
                let machineId = data[0]
                data.shift()
                let ruleStr = JSON.stringify(data)
                let addSql = 'INSERT INTO alarm_rules(machine_id,rule) VALUES(?,?)';
                let addSqlParams = [machineId, ruleStr];
                sql.add(addSql, addSqlParams)
            })
            req.on('end', () => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            })
        }
    } else if (url.parse(req.url).path === '/getRulesList') {
        if (req.method === "GET") {
            let data = {}
            req.on('data', function (chunk) {
                data = JSON.parse(chunk);
            });
            req.on('end', function () {
                getRulesList()
                    .then((j) => {
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.write(JSON.stringify(j))
                        res.end()
                    })
            })
        }
    } else if (url.parse(req.url).path === '/deletRule') {
        if (req.method === "POST") {
            req.on('data', chunk => {
                let data = JSON.parse(chunk)
                console.log(data)
                let deleteSql = 'delete from alarm_rules where rule_id=' + data;
                sql.delete(deleteSql)
            })
            req.on('end', () => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            })
        }
    }


}).listen(8081, "0.0.0.0");







