let {SQL} = require('./sql');
let {Rule} = require('./Rule')
let sendemail = require('./sendEmail')
let formatTime = require('./formatTime')

function checkSendEmail() {
    let sql = new SQL()
    sql.connect()
    // 五分钟发一次新的报警数据
    setInterval(function () {
        new Promise((resolve => {
            let selectSql = 'select a.timestamp,a.rule_id,a.machine_id,r.level,r.rule\n' +
                'from(select timestamp,rule_id,machine_id from alarm_record where is_send_email = 0 and is_solved = 0 )\n' +
                'as a inner join alarm_rules as r on r.rule_id = a.rule_id;'
            sql.query(selectSql, function (result) {
                for (let i = 0; i < result.length; i++) {
                    result[i]['time'] = formatTime(result[i].timestamp)
                    let r = new Rule(result[i].machine_id, JSON.parse(result[i].rule))
                    result[i]['reason'] = r.toString()
                }
                resolve(result)
            })
        })).then((records) => {
            let selectSql = 'select level,email_receiver from notie_strategy'
            sql.query(selectSql, function (result) {
                let urgentRecords = []
                let normalRecords = []
                // 告警记录分组
                for (let i = 0; i < records.length; i++) {
                    if (records[i].level === 'urgent') {
                        urgentRecords.push(records[i])
                    }
                    if (records[i].level === 'normal') {
                        normalRecords.push(records[i])
                    }
                }
                // 根据告警级别设置，把不同分组发给不同的人
                for (let i = 0; i < result.length; i++) {
                    if (result[i].level === 'urgent') {
                        if (urgentRecords.length > 0) {
                            sendemail(urgentRecords, result[i].email_receiver)
                        }

                    } else if (result[i].level === 'normal') {
                        if (normalRecords.length > 0) {
                            sendemail(normalRecords, result[i].email_receiver)
                        }
                    }
                }
            })
            // 设置发送过的标志
            let updateSql = 'UPDATE alarm_record SET is_send_email=? WHERE is_solved = 0'
            let updateParams = [1];
            sql.update(updateSql, updateParams)
        })
    }, 86400000)
    // 每天早上10点发一次未解决的旧报警数据汇总,每小时核对一下当前时间
    setInterval(function () {
        let refreshHours = new Date().getHours();
        if (refreshHours === 10) {
            new Promise((resolve => {
                let selectSql = 'select a.timestamp,a.rule_id,a.machine_id,r.level,r.rule\n' +
                    'from (select timestamp,rule_id,machine_id from alarm_record where is_send_email = 1 and is_solved = 0)\n' +
                    '       as a\n' +
                    '       inner join alarm_rules as r on r.rule_id = a.rule_id;'
                sql.query(selectSql, function (result) {
                    for (let i = 0; i < result.length; i++) {
                        result[i]['time'] = formatTime(result[i].timestamp)
                        let r = new Rule(result[i].machine_id, JSON.parse(result[i].rule))
                        result[i]['reason'] = r.toString()
                    }
                    resolve(result)
                }).then((records)=>{
                    let selectSql = 'select level,email_receiver from notie_strategy'
                    sql.query(selectSql, function (result) {
                        let urgentRecords = []
                        let normalRecords = []
                        // 告警记录分组
                        for (let i = 0; i < records.length; i++) {
                            if (records[i].level === 'urgent') {
                                urgentRecords.push(records[i])
                            }
                            if (records[i].level === 'normal') {
                                normalRecords.push(records[i])
                            }
                        }
                        // 根据告警级别设置，把不同分组发给不同的人
                        for (let i = 0; i < result.length; i++) {
                            if (result[i].level === 'urgent') {
                                if (urgentRecords.length > 0) {
                                    sendemail(urgentRecords, result[i].email_receiver)
                                }

                            } else if (result[i].level === 'normal') {
                                if (normalRecords.length > 0) {
                                    sendemail(normalRecords, result[i].email_receiver)
                                }

                            }

                        }
                    })

                })
            }))
        }
    }, 3600000)
}

module.exports = checkSendEmail