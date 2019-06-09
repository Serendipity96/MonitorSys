let http = require('http');
const os = require('os')
const url = require('url');
let getHostParam = require('./getHostParam');
let getLoadavg = require('./getLoadavg');
let queryConnection = require('./queryConnection');
let queryMem = require('./queryMem');
let checkSendEmail = require('./checkSendEmail');
let getRulesList = require('./getRulesList');
let onlineRate = require('./onlineRate');
let formatTime = require('./formatTime');
let formatLevel = require('./formatLevel');
let queryRecord = require('./queryRecord');
let {SQL} = require('./sql');
let {Rule} = require('./Rule');

let sql = new SQL()
sql.connect()

// checkSendEmail()

http.createServer(function (req, res) {
    if (url.parse(req.url).path === '/getHostParam') {
        if (req.method === "POST") {
            let data = {}
            req.on('data', function (chunk) {
                data = JSON.parse(chunk);
            });
            req.on('end', function () {
                console.log(data)
                getHostParam(data.timeStart, data.timeEnd, data.timeGran, data.hostId)
                    .then((j) => {
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.write(JSON.stringify(j))
                        res.end()
                    })
            })
        }
    } else if (url.parse(req.url).path === '/getHomepage') {
        console.log('getHomepageUrl')
        req.on('data', () => {
        })
        req.on('end', () => {
            let data = {}
            queryRecord().then((result) => {
                data['record'] = result
                return data
            }).then((data) => {
                getLoadavg().then((result) => {
                    data['loadavgArr'] = result.loadavgArr
                    data['loadAverage'] = result.loadAverage
                    data['loadMax'] = result.loadMax
                    return data

                }).then((data) => {
                    onlineRate().then((result) => {
                        data['onlineRate'] = result.onlineRate
                        return data
                    }).then((data) => {
                        queryConnection().then((result) => {
                            data['connection'] = result.connection
                            data['maxConnection'] = result.connection
                            return data
                        }).then((data) => {
                            queryMem().then((result) => {
                                data['memTotal'] = result.memTotal
                                data['memUsed'] = result.memUsed
                                res.setHeader("Access-Control-Allow-Origin", "*");
                                res.write(JSON.stringify(data))
                                res.end()
                            })
                        })

                    })
                })
            })

        })
    } else if (url.parse(req.url).path === '/postEmailReceiver') {
        if (req.method === 'POST') {
            let data = {}
            req.on('data', chunk => {
                data = JSON.parse(chunk);
                let addSql = 'insert into notie_strategy(level, email_receiver) values(?,?) '
                let addParams = [data.alarmLevel, data.emailReceiver]
                sql.add(addSql, addParams)
            });
            req.on('end', () => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            });
        }
    } else if (url.parse(req.url).path === '/getNoticeList') {
        req.on('data', () => {
        });
        req.on('end', () => {
            let selectSql = 'select * from notie_strategy'
            sql.query(selectSql, function (result) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.write(JSON.stringify(result))
                res.end()
            })
        })
    } else if (url.parse(req.url).path === '/postData') {
        if (req.method === 'POST') {
            req.on('data', chunk => {
                //处理数据
                let data = JSON.parse(chunk)
                let host = data["host"]
                let sqlData = data["sql"]
                let id = data.id
                let addSql = 'INSERT INTO monitor_data(timestamp,cpuUsed,memoryUsed,memoryTotal,ioRead,ioWrite,netSend,netReceive,id,runtime,loadavg,connections,tps,tableLocks,keyBufferRead,keyBufferWrite,threadCacheHit) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                let addSqlParams = [host.timeStamp, host.allCpu, host.usedmem, host.totalmem, host.loRead, host.loWrite, host.loSend, host.loReceive, id, host.runtime, host.loadavg, sqlData.Connections, sqlData.tps, sqlData.tableLocks, sqlData.keyBufferRead, sqlData.keyBufferWrite, sqlData.threadCacheHit];
                sql.add(addSql, addSqlParams)
                let p = new Promise(resolve => {
                    let querySql = 'select * from alarm_rules where machine_id=' + id
                    sql.query(querySql, function (res) {
                        resolve(res)
                    })
                })
                p.then((res) => {
                    // 检测指标是否异常
                    for (let i = 0; i < res.length; i++) {
                        let r = new Rule(id, JSON.parse(res[i].rule))
                        if (r.checkRule(data)) {
                            let addSql = 'INSERT INTO alarm_record(timestamp,rule_id,machine_id,value,type,level,is_send_email) VALUES(?,?,?,?,?,?,?)';
                            let value = r.getTypeValue(data)
                            let addSqlParams = [host.timeStamp, res[i].rule_id, id, value, res[i].type, res[i].level, 0];
                            sql.add(addSql, addSqlParams)

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
                for (let i = 0; i < data.rules.length; i++) {
                    let addSql = 'INSERT INTO alarm_rules(machine_id,rule,level,type) VALUES(?,?,?,?)';
                    const ruleStr = JSON.stringify(data.rules[i])
                    let addSqlParams = [data.id, ruleStr, data.levels[i], data.ruleTypes[i]];
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
                let deleteSql = 'delete from alarm_rules where rule_id=' + data;
                sql.delete(deleteSql)
            })
            req.on('end', () => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            })
        }
    } else if (url.parse(req.url).path === '/deleteEmailReceive') {
        if (req.method === "POST") {
            req.on('data', chunk => {
                let id = JSON.parse(chunk)
                let deleteSql = 'delete from notie_strategy where id=' + id;
                sql.delete(deleteSql)
            })
            req.on('end', () => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            })
        }
    } else if (url.parse(req.url).path === '/getAlarmRecordList') {
        if (req.method === 'GET') {
            let p = new Promise(resolve => {
                // 这里3个表连接查询
                let selectSql = 'select s.ip_address,r.id,r.timestamp,r.value,r.is_solved,a.rule,a.level,a.machine_id from alarm_record as r inner join server as s on r.machine_id = s.id inner join alarm_rules as a on r.rule_id=a.rule_id;';
                sql.query(selectSql, function (result) {
                    resolve(result)
                })
            })
            req.on('data', () => {

            })
            req.on('end', () => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                p.then((result) => {
                    for (let i = 0; i < result.length; i++) {
                        let r = new Rule(result[i].machine_id, JSON.parse(result[i].rule))
                        result[i].rule = r.toString()
                        result[i].timestamp = formatTime(result[i].timestamp)
                        result[i].level = formatLevel(result[i].level)
                    }
                    res.write(JSON.stringify(result))
                    res.end()
                })
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
    } else if (url.parse(req.url).path === '/getTableList') {
        let p = new Promise(resolve => {
            let getTableList = 'select\n' +
                '       s.ip_address,\n' +
                '       m.timestamp,\n' +
                '       m.id,\n' +
                '       m.runtime,\n' +
                '       m.netReceive,\n' +
                '       m.netSend,\n' +
                '       m.connections,\n' +
                '       m.tps\n' +
                'from (select id, max(timestamp) as timestamp from monitor_data group by id) as c\n' +
                '       inner join server as s on c.id = s.id\n' +
                '       inner join monitor_data as m on c.id = m.id and c.timestamp = m.timestamp;'
            sql.query(getTableList, function (result) {
                resolve(result)
            })
        })
        req.on('data', () => {
        })
        req.on('end', () => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            p.then((result) => {
                let timestamp = Math.floor(new Date().getTime() / 1000)
                for (let i = 0; i < result.length; i++) {
                    result[i]['runtime'] = Math.floor(result[i].runtime / 86400)
                    // 判断是否中断 5秒
                    if (result[i].timestamp + 60 < timestamp) {
                        result[i]['connectionFlag'] = '中断';
                    } else {
                        result[i]['connectionFlag'] = '成功';
                    }
                }
                res.write(JSON.stringify(result))
                res.end()
            })
        })
    } else if (url.parse(req.url).path === '/changeSolved') {
        if (req.method === "POST") {
            req.on('data', chunk => {
                let data = JSON.parse(chunk)
                let updateSql = 'update alarm_record set is_solved = ? where id=?';
                let updateParams = [data.isSolved, data.id];
                sql.update(updateSql, updateParams)
            })
            req.on('end', () => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            })
        }
    }


}).listen(8081, "0.0.0.0");







