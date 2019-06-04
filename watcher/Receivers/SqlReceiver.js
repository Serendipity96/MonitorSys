const watcherConfig = require('../watcherConfig')

let mysql = require('mysql')

class SqlReceiver {
    constructor() {
        this.receiverName = 'sql'
        this.connection = mysql.createConnection({
            host: watcherConfig.sqlReceiverHost,
            user: watcherConfig.sqlReceiverUser,
            password: watcherConfig.sqlReceiverPwd,
            database: watcherConfig.sqlReceiverDatabase
        });
        this.selectSql = "show  global  status  where variable_name in " +
            "('Connections','Com_commit','Com_rollback'," +
            "'Table_locks_immediate','Table_locks_waited'," +
            "'key_reads','key_read_requests','key_writes','key_write_requests','Threads_created')";
        this.connection.connect();
    }


    receive() {

        let _this = this;
        let output = {};
        let timeStamp = (Math.round(new Date().getTime() / 1000))
        output["timeStamp"] = timeStamp
        let p = new Promise(function (resolve) {
            _this.connection.query(_this.selectSql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }

                for (let i = 0; i < result.length; i++) {
                    let r = result[i];
                    output[r.Variable_name] = Number(r.Value)
                }

                output["tps"] = output["Com_commit"] + output["Com_rollback"]
                if (output['Table_locks_waited'] !== 0) {

                    output['tableLocks'] = Math.floor(100*output['Table_locks_immediate'] / output['Table_locks_waited'])/100
                } else {
                    output['tableLocks'] = output['Table_locks_waited']
                }

                if (output['Key_read_requests'] !== 0) {
                    output['keyBufferRead'] = Math.floor(100*output['Key_reads'] / output['Key_read_requests'])/100
                } else {
                    output['keyBufferRead'] = output['Key_reads']
                }
                if (output['Key_write_requests'] !== 0) {
                    output['keyBufferWrite'] = Math.floor(100*output['Key_writes'] / output['Key_write_requests'])/100
                } else {
                    output['keyBufferWrite'] = output['Key_writes']
                }
                if (output['Connections'] !== 0) {
                    output['threadCacheHit'] = Math.floor(100*(1 - (output['Threads_created'] / output['Connections'])))/100
                } else {
                    output['threadCacheHit'] = 1
                }
                resolve(output)
            });
        });
        return p
    }

    end() {
        this.connection.end()
    }
}

exports.SqlReceiver = SqlReceiver;


