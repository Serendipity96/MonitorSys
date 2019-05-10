let http = require('http');
const url = require('url');
let getHostParam = require('./getHostParam');
let {SQL} = require('./sql');

let sql = new SQL()
sql.connect()


http.createServer(function (req, res) {
    if (url.parse(req.url).path === '/getHostParam') {
        if (req.method === "POST") {
            let data = {}
            req.on( 'data', function (chunk) {
                data = JSON.parse(chunk);
            });
            req.on('end', function () {
                getHostParam(data.timeStart, data.timeEnd, data.timeGran, data.hostId)
                    .then((j) => {
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.write(JSON.stringify(j))
                        console.log(JSON.stringify(j))
                        res.end()
                    })
            })
        }
    } else if (url.parse(req.url).path === '/postData') {
        if (req.method === 'POST') {
            req.on('data', chunk => {
                //处理数据
                let data = JSON.parse(chunk)
                let host = data["host"]
                let sqlData = data["sql"]
                let id = data.id
                let addSql = 'INSERT INTO monitor_data(timestamp,cpuUsed,memoryUsed,ioRead,ioWrite,netSend,netReceive,id,sqlConnections,Com_commit,Com_rollback) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
                let addSqlParams = [host.timeStamp, host.allCpu, host.usedmem, host.loRead, host.loWrite, host.loSend, host.loReceive, id, sqlData.Connections,sqlData.Com_commit,sqlData.Com_rollback];
                sql.add(addSql, addSqlParams)
            });
            req.on('end', () => {
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            });
        }
    }else if(url.parse(req.url).path === '/postRules'){
        if(req.method === 'POST'){
            req.on('data',chunk =>{
                let data = JSON.parse(chunk)
                console.log(data)
            })
            req.on('end',()=>{
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end();
            })
        }
    }


}).listen(8081,"0.0.0.0");







