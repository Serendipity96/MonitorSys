
let http = require('http');
let mysql  = require('mysql');
const url = require('url');
let getHostParam = require('../getHostParam');

let connection = mysql.createConnection({
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
            //处理数据
            let data = JSON.parse(chunk)
            // console.log(data);
            let host = data["host"]

            // hostiId 假设为1
            let timeStamp = (Math.round(new Date().getTime()/1000))
            let  addSql = 'INSERT INTO hostData(timestamp,cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive,hostId) VALUES(?,?,?,?,?,?,?,?)';
            let  addSqlParams = [timeStamp,host.allCpu,host.usedmem,host.loRead,host.loWrite,host.loSend,host.loReceive,1];
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
    if(url.parse(req.url).path === '/getHostParam'){
        getHostParam(1, 1, 1, 1).then((j)=>{
            console.log(j)
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.write(JSON.stringify(j))
        })
    }

}).listen(8081);







