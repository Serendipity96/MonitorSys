var http = require('http');
let url = require('url')

http.createServer(function (req, res) {
    console.log("req.url:"+req.url)
    let u = url.parse(req.url).query
    if(req.url === '/nnn'){
        res.write("123");

    }else if(req.url === '/mmm'){
        res.write("321");
    }else {
        console.log("u:"+u)
        let p = u.split("&")
        p.forEach((i)=>{
            console.log("i:"+i)
            let arr = i.split("=")
            console.log("arr:"+arr)
            res.write(arr[0])
        })
    }
    res.end();

}).listen(8081);