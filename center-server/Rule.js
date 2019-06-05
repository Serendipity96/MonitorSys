class Rule{
    constructor(id,rule){
        this.machine_id = id;
        this.typ=rule.typ;
        this.op=rule.op;
        this.value=rule.value;
        this.rule=rule;
    }
    getTypeValue(data){
        let host = data['host']
        let sqlData = data['sql']
            switch (this.typ) {
                case "cpu":
                    return host.allCpu;
                case "mem":
                    return host.usedmem;
                case "ioRead":
                    return host.loRead;
                case "ioWrite":
                    return host.loWrite;
                case "netSend":
                    return host.loSend;
                case "netReceive":
                    return host.loReceive;
                case "loadavg":
                    return host.loadavg
                case "connection":
                    return sqlData.Connections;
                case "tps":
                    return sqlData.tps;
                case "tableLocks":
                    return sqlData.tableLocks
                case "keyBufferRead":
                    return sqlData.keyBufferRead
                case "keyBufferWrite":
                    return sqlData.keyBufferWrite
                case "cacheHit":
                    return sqlData.threadCacheHit
            }
    }

    checkRule(data){
        switch (this.op) {
            case ">":
                return this.getTypeValue(data)>this.value;
            case "<":
                return this.getTypeValue(data)<this.value;
            case "=":
                return this.getTypeValue(data)===this.value;
        }
    }

    stringType(){
        switch (this.typ) {
            case "cpu":
                return "CPU使用率"
            case "mem":
                return "内存使用率"
            case "loadavg":
                return "服务器负载"
            case "connection":
                return "数据库连接数";
            case "tableLocks":
                return "数据库锁阻塞率"
            case "keyBufferRead":
                return "keyBuffer读穿透率"
            case "keyBufferWrite":
                return "keyBuffer写穿透率"
            case "cacheHit":
                return "数据库缓存命中率"
        }
    }

    toString(){
        return this.stringType() +" "+ this.op +" "+this.value+"%";
    }
}
exports.Rule = Rule;