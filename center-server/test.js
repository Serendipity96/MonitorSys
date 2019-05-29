class Rule{
    constructor(rule){
        this.machine_id = rule.machine_id;
        this.typ=rule.typ;
        this.op=rule.op;
        this.value=rule.value;
        this.rule={typ:this.typ,op:this.op,value:this.value};
    }

    getTypeValue(host){
        switch (this.typ) {
            case "cpu":
                return host.cpu;
            case "mem":
                return host.mem;
        }
    }

    jianzhe(host){
        switch (this.op) {
            case ">":
                return this.getTypeValue(host)>this.value;
            case "<":
                return this.getTypeValue(host)<this.value;
            case "=":
                return this.getTypeValue(host)===this.value;
        }
    }

    stringType(){
        switch (this.typ) {
            case "cpu":
                return "CPU占用率"
            case "mem":
                return "内存占用率"
        }
    }

    string(){
        return this.stringType() +" "+ this.op +" "+this.value;
    }

}

let r = {
    typ:"cpu",
    op:">",
    value:60
};

let rule = new Rule(r);
// 把rule.rule转换成json
rule.jianzhe(host)

//1 前端添加规则 {机器id:1,type:"cpu",op:">",value:60}
// insert 到数据库
//2 收到watcher包的时候检测告警
// 可从数据库里拿到一个r数组，通过r数组可以拿到Rule数组
// 遍历Rule数组调用jiance
// 向告警记录表insert`

//3 给前端返回列表
// 从数据库能拿到r数组
// {规则id:11,机器id:44,规则str:new Rule(r).string()}