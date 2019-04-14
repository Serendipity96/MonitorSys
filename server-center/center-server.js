let http = require('http');
const url = require('url');
let getHostParam = require('../getHostParam');
let {SQL} = require('../sql');

let sql = new SQL()
sql.connect()


http.createServer(function (req, res) {
    if(req.method === 'POST'){
        req.on('data', chunk => {
            //处理数据
            let data = JSON.parse(chunk)
            // console.log(data);
            let host = data["host"]

            let hostId = 1
            let  addSql = 'INSERT INTO hostData(timestamp,cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive,hostId) VALUES(?,?,?,?,?,?,?,?)';
            let  addSqlParams = [host.timeStamp,host.allCpu,host.usedmem,host.loRead,host.loWrite,host.loSend,host.loReceive,hostId];
            sql.add(addSql,addSqlParams)
        });
        req.on('end', () => {
            res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end();
        });
    }
    if(url.parse(req.url).path === '/getHostParam'){
        // 时间粒度60  1min = 60s
        getHostParam(1554964655, 1555228961, 60, 1).then((j)=>{
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.write(JSON.stringify(j))
            console.log(JSON.stringify(j))
            res.end()
        })
    }

}).listen(8081);







