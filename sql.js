let mysql = require('mysql')
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '******',
    database: 'test'
});

connection.connect();

let selectSql =  "show  global  status  where variable_name in ('Questions','Com_commit','Com_rollback','Key_reads','Key_read_requests',\n" +
    "                                              'Key_writes','Key_write_requests','innodb_buffer_pool_reads','innodb_buffer_pool_read_requests',\n" +
    "                                              'Qcache_hits','Qcache_inserts','open_tables','opend_tables','Threads_created','Connections',\n" +
    "                                              'Table_locks_waited','Table_locks_immediate')";
connection.query(selectSql, function (err, result) {
    if (err) {
        console.log('[SELECT ERROR] - ', err.message);
        return;
    }
    console.log(result)
});

connection.end();

// QPS(每秒Query量)

// TPS(每秒事务量)
// TPS = (Com_commit + Com_rollback) / seconds

// key Buffer 命中率
// key_buffer_read_hits = (1-key_reads /key_read_requests) * 100%
// key_buffer_write_hits = (1-key_writes /key_write_requests) * 100%

// InnoDB Buffer命中率
// innodb_buffer_read_hits = (1 -innodb_buffer_pool_reads / innodb_buffer_pool_read_requests) * 100%

// Query Cache命中率
// Query_cache_hits = (Qcahce_hits /(Qcache_hits + Qcache_inserts )) * 100%;

// Table Cache状态量
// 比较 open_tables  与opend_tables 值

// Thread Cache 命中率
// Thread_cache_hits = (1 - Threads_created /connections ) * 100%

// 锁定状态
// Table_locks_waited/Table_locks_immediate=0.3%  如果这个比值比较大的话，说明表锁造成的阻塞比较严重
// Innodb_row_lock_waits innodb行锁，太大可能是间隙锁造成的

//  Binlog Cache 使用状况
// 如果Binlog_cache_disk_use值不为0 ，可能需要调大 binlog_cache_size大小
