let {SQL} = require('./sql');
let {Rule} = require('./Rule')
let sendemail= require('./sendEmail')
let formatTime= require('./formatTime')

function checkSendEmail() {
    let sql = new SQL()
    sql.connect()
    setInterval(function () {
        new Promise((resolve => {
            let selectSql = 'select a.timestamp,a.rule_id,a.machine_id,r.level,r.rule\n' +
                'from(select timestamp,rule_id,machine_id from alarm_record where is_send_email = 0 and is_solved = 0 )\n' +
                'as a inner join alarm_rules as r on r.rule_id = a.rule_id;'
            sql.query(selectSql,function (result) {
                for (let i = 0; i < result.length; i++) {
                    result[i]['time'] = formatTime(result[i].timestamp)
                    let r = new Rule(result[i].machine_id,JSON.parse(result[i].rule))
                    result[i]['reason'] = r.toString()
                }
                resolve(result)
                // console.log(result)
            })
        })).then((records)=>{
            // console.log(records)
            let selectSql = 'select level,email_receiver from notie_strategy'
            sql.query(selectSql,function (result) {
                let urgentRecords = []
                let normalRecords = []
                // 告警记录分组
                for (let i = 0; i < records.length; i++) {
                    if(records[i].level ==='urgent'){
                        urgentRecords.push(records[i])
                    }
                    if(records[i].level ==='normal'){
                        normalRecords.push(records[i])
                    }
                }
                // 根据告警级别设置，把不同分组发给不同的人
                for (let i = 0; i < result.length; i++) {
                    if(result[i].level === 'urgent'){
                        sendemail(urgentRecords,result[i].email_receiver)
                    }else if(result[i].level === 'normal'){
                        sendemail(normalRecords,result[i].email_receiver)
                    }

                }
            })


        })
    }, 10000)
}

module.exports = checkSendEmail