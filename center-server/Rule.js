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
                case "connection":
                    return sqlData.Connections;
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
        }
    }

    toString(){
        return this.stringType() +" "+ this.op +" "+this.value+"%";
    }
}
exports.Rule = Rule;