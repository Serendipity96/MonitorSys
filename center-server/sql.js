// const sqlConfig = require('./SQL_config')
let mysql = require('mysql');

class SQL{
    constructor(){
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            port: '3306',
            database: 'MonitorSys'
        });

    }
    connect(){
        this.connection.connect();
    }
    add(addSql,addSqlParams){
        this.connection.query(addSql,addSqlParams,function (err) {
            if(err){
                console.log('[add ERROR] - ',err.message);
                return;
            }
            console.log('success add')
        });
    }
    update(updateSql,updateParams){
        this.connection.query(updateSql,updateParams,function (err) {
            if(err){
                console.log('[update ERROR] - ',err.message);
                return;
            }
            console.log('success update')
        })
    }
    delete(deleteSql){
        this.connection.query(deleteSql,function (err) {
            if(err){
                console.log('[delete ERROR] - ',err.message);
                return;
            }
            console.log('success delete')
        });
    }
    query(querySql,callback){
        this.connection.query(querySql, function (err, result) {
            if (err) {
                console.log('[query ERROR] - ', err.message);
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