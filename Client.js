const http = require('http')

function clientPostData(data) {
    const options = {
        hostname: 'localhost',
        port: 8081,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    const postData = JSON.stringify(data)//格式化数据
    const req = http.request(options, (res) => {
        console.log(`状态码: ${res.statusCode}`);
        res.setEncoding('utf8')
    });

    req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`);
    });

    req.write(postData);
    req.end();

}
module.exports = clientPostData;