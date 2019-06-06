create schema monitorsys collate utf8mb4_0900_ai_ci;

create table alarm_record
(
	id int auto_increment
		primary key,
	timestamp int(32) not null,
	rule_id int not null,
	machine_id int not null,
	value double not null,
	is_solved tinyint(1) default 0 not null,
	type int not null,
	level varchar(32) not null,
	is_send_email tinyint(1) not null
);

create table alarm_rules
(
	rule_id int(32) auto_increment
		primary key,
	machine_id int not null,
	rule varchar(100) not null,
	level varchar(32) not null,
	type int not null
);

create table monitor_data
(
	timestamp int(32) not null
		primary key,
	cpuUsed float not null,
	memoryUsed float not null,
	memoryTotal float not null,
	ioWrite float not null,
	netSend float not null,
	ioRead float not null,
	id int not null,
	runtime double not null,
	loadavg float not null,
	connections int not null,
	keyBufferRead float not null,
	keyBufferWrite float not null,
	threadCacheHit float not null,
	tps int not null,
	tableLocks float not null,
	netReceive float not null
);

create table notie_strategy
(
	id int auto_increment
		primary key,
	level varchar(32) not null,
	email_receiver varchar(32) not null
);

create table server
(
	id int auto_increment
		primary key,
	ip_address varchar(15) not null
);

