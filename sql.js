let mysql = require('mysql');

class SQL{
    constructor(){
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            port: '3306',
            database: 'test'
        });

    }
    connect(){
        this.connection.connect();
    }
    add(addSql,addSqlParams){
        this.connection.query(addSql,addSqlParams,function (err) {
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
            }
            console.log('success')
        });
    }
    query(querySql,callback){
        this.connection.query(querySql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
            }
            callback(result);
        });
    }
    end(){
        this.connection.end()
    }
}

exports.SQL = SQL;