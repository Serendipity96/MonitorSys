let mysql = require('mysql')

class SqlReceiver {
    constructor() {
        this.receiverName = 'sql'
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'test'
        });
        this.selectSql = "show  global  status  where variable_name in ('Questions','Com_commit','Com_rollback','Key_reads','Key_read_requests',\n" +
            "                                              'Key_writes','Key_write_requests','innodb_buffer_pool_reads','innodb_buffer_pool_read_requests',\n" +
            "                                              'Qcache_hits','Qcache_inserts','open_tables','opend_tables','Threads_created','Connections',\n" +
            " 'Table_locks_waited','Table_locks_immediate')";

        this.connection.connect();
    }


    receive() {

        let _this = this;
        let output = {};
        let timeStamp = (Math.round(new Date().getTime()/1000))
        output["timeStamp"] = timeStamp
        let p = new Promise(function (resolve) {
            _this.connection.query(_this.selectSql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    let r = result[i];
                    output[r.Variable_name] = r.Value
                }

                resolve(output)
            });
        });
        return p
    }

    end(){
        this.connection.end()
    }
}

exports.SqlReceiver = SqlReceiver;


