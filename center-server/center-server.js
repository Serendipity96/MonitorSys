let http = require('http');
const url = require('url');
const sendEmail = require('./sendEmail');
let getHostParam = require('./getHostParam');
let getRulesList = require('./getRulesList');
let {SQL} = require('./sql');
let {Rule} = require('./Rule');

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
                console.log(host.allCpu)
                let id = data.id
                let addSql = 'INSERT INTO monitor_data(timestamp,cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive,id,sqlConnections,Com_commit,Com_rollback) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
                let addSqlParams = [host.timeStamp, host.allCpu, host.usedmem, host.loRead, host.loWrite, host.loSend, host.loReceive, id, sqlData.Connections, sqlData.Com_commit, sqlData.Com_rollback];
                sql.add(addSql, addSqlParams)
                let p = new Promise(resolve => {
                    let querySql = 'select * from alarm_rules where machine_id=' + id
                    sql.query(querySql, function (res) {
                        resolve(res)
                    })
                })
                p.then((res)=>{
                    // 检测指标是否异常
                    for (let i = 0; i < res.length; i++) {
                        let r = new Rule(id,JSON.parse(res[i].rule))
                        if(r.checkRule(host)){
                            let addSql = 'INSERT INTO alarm_record(timestamp,rule_id,machine_id) VALUES(?,?,?)';
                            let addSqlParams = [host.timeStamp, res[i].rule_id, id];
                            sql.add(addSql, addSqlParams)
                            sendEmail(host.timeStamp,res[i].rule_id,id,r.toString())
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
                console.log(data)
                for (let i = 0; i < data.rules.length; i++) {
                    let addSql = 'INSERT INTO alarm_rules(machine_id,rule) VALUES(?,?)';
                    const ruleStr = JSON.stringify(data.rules[i])
                    let addSqlParams = [data.id, ruleStr];
                    sql.add(addSql, addSqlParams)
                }
            })
            req.on('end', () => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            })
        }
    } else if (url.parse(req.url).path === '/getRulesList') {
        if (req.method === "GET") {
            req.on('data', function () {
            });
            req.on('end', function () {
                getRulesList()
                    .then((result) => {
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.write(JSON.stringify(result))
                        res.end()
                    })
            })
        }
    } else if (url.parse(req.url).path === '/deleteRule') {
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
    } else if (url.parse(req.url).path === '/getMachineList') {
        // 获取机器列表
        let data = ''
        let p = new Promise(resolve => {
            let getMachineList = 'select * from server'
            sql.query(getMachineList, function (result) {
                resolve(result)
            })
        })
        // 探究nodejs数据流原理，如何优雅使用req.on('data',callback)
        req.on('data', () => {
        })
        req.on('end', () => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            p.then((result) => {
                data = JSON.stringify(result)
                res.write(data)
                res.end()
            })
        })

    }


}).listen(8081, "0.0.0.0");







