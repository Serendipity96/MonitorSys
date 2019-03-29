
var http = require('http');
var mysql  = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    port: '3306',
    database: 'test'
});
connection.connect();

http.createServer(function (req, res) {
    if(req.method === 'POST'){
        req.on('data', chunk => {
            // console.log(`DATA: ${chunk}`);

            //处理数据
            let data = JSON.parse(chunk)
            let host = data["host"]

            let  addSql = 'INSERT INTO hostData(timestamp,cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive,hostId) VALUES(0,?,?,?,?,?,?,?)';
            let  addSqlParams = [host.allCpu,host.usedmem,1,1,1,1,1];
            connection.query(addSql,addSqlParams,function (err, result) {
                if(err){
                    console.log('[INSERT ERROR] - ',err.message);
                    return;
                }
                console.log('success')
            });

        });


        req.on('end', () => {
            res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end();
        });
    }

}).listen(8081);






