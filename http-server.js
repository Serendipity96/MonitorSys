// 创建一个server + 接口
// watcher 访问这个接口 post 数据
// server 输出 watcher 传来的数据

var http = require('http');
var url = require('url');
var util = require('util');

http.createServer(function (req, res) {
    if(req.method === 'POST'){
        let data = '';
        req.on('data', chunk => {
            data += chunk.toString();
        });
        req.on('end', () => {
            console.log(data);
            res.end('ok');
        });
    }
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end(util.inspect(url.parse(req.url, true)));
}).listen(8081);






