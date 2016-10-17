DROP SCHEMA 	IF EXISTS sys    CASCADE;
DROP SCHEMA 	IF EXISTS aaa    CASCADE;
DROP SCHEMA 	IF EXISTS global CASCADE;
DROP SCHEMA 	IF EXISTS locale CASCADE;

DROP TABLE 	IF EXISTS _timeDepence;
DROP TABLE 	IF EXISTS _history;



CREATE TABLE _history (
    changer     int NULL,
    changed	timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
 );

CREATE TABLE _timeDepence (
    start      timestamp NULL,
    ended      timestamp NULL 
)   INHERITS (_history);


---------------------------------------------------------------------------------

CREATE SCHEMA sys
  AUTHORIZATION postgres;

GRANT ALL ON SCHEMA sys TO postgres;
GRANT ALL ON SCHEMA sys TO public;
GRANT ALL ON SCHEMA sys TO http;

CREATE SEQUENCE sys.cmd_seq;
GRANT ALL ON SEQUENCE sys.cmd_seq TO http;
CREATE TABLE sys.cmd (
	id      bigint NOT NULL  DEFAULT nextval('sys.cmd_seq'),
	tpl 	character varying(64000) NOT NULL,
	role    varchar(200)  NOT NULL,
        name 	character varying(64)   NOT NULL,
	CONSTRAINT sys_cmd PRIMARY KEY (id)
) INHERITS (_history);
GRANT ALL ON TABLE sys.cmd TO http;

CREATE SEQUENCE sys.mapping_seq;
GRANT ALL ON SEQUENCE sys.mapping_seq TO http;

CREATE TABLE sys.mapping (
	id      bigint NOT NULL  DEFAULT nextval('sys.mapping_seq'),
	cmd     bigint NOT NULL,
	src 	character varying(64)   NOT NULL,
        dst 	character varying(64)   NOT NULL,
	CONSTRAINT sys_mapping_id PRIMARY KEY (id),
	CONSTRAINT sys_mapping_cmd_fkey 	FOREIGN KEY (cmd)
	   		REFERENCES sys.cmd  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION
) INHERITS (_history);
GRANT ALL ON TABLE sys.cmd TO http;


---------------------------------------------------------------------------------

CREATE SCHEMA aaa
  AUTHORIZATION postgres;

GRANT ALL ON SCHEMA aaa TO postgres;
GRANT ALL ON SCHEMA aaa TO public;
GRANT ALL ON SCHEMA aaa TO http;

CREATE SEQUENCE aaa.login_seq;
CREATE TABLE aaa.login (
	id          bigint NOT NULL  DEFAULT nextval('aaa.login_seq'),
	name        varchar(100)  NOT NULL ,
	pass        varchar(150)  NULL,
	man         bigint  NULL, 
	CONSTRAINT 	aaa_login_id PRIMARY KEY (id)
) INHERITS (_timeDepence);
GRANT ALL ON TABLE aaa.login TO http;

INSERT INTO aaa.login(name, pass)  VALUES ( 'admin',        'admin');
INSERT INTO aaa.login(name, pass)  VALUES ( 'Manager007', '123');


CREATE SEQUENCE aaa.roles_seq;
GRANT ALL ON SEQUENCE aaa.roles_seq TO http;

CREATE TABLE aaa.roles (
        id          bigint NOT NULL  DEFAULT nextval('aaa.roles_seq'),
	name        varchar(100)  NOT NULL, 
	role        varchar(200)  NOT NULL,
	parent      bigint NULL,
	CONSTRAINT 	aaa_roles_id PRIMARY KEY (id) 
) INHERITS (_timeDepence);
GRANT ALL ON TABLE aaa.roles TO http;

INSERT INTO aaa.roles(changer, changed,start, ended, name, role, parent)  VALUES ( 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,  NULL, 'Administrator',        'admin', NULL);
INSERT INTO aaa.roles(changer, changed,start, ended, name, role, parent)  VALUES ( 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,  NULL, 'Store Manager', 'storeManager', NULL);


CREATE SEQUENCE aaa.loginRole_seq;
CREATE TABLE aaa.loginRole (
        id          bigint NOT NULL  DEFAULT nextval('aaa.loginRole_seq'),
	login       bigint NOT NULL, 
	roles       bigint NOT NULL,
	values      varchar(200)  NOT NULL DEFAULT '1',
	priority    int NOT NULL DEFAULT 1,
	CONSTRAINT 	aaa_loginRole_id PRIMARY KEY (id),
	CONSTRAINT      aaa_loginRole_login_fkey 	FOREIGN KEY (login)
			REFERENCES aaa.login  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION, 
	CONSTRAINT      aaa_loginRole_roles_fkey 	FOREIGN KEY (roles)
			REFERENCES aaa.roles  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION 
) INHERITS (_timeDepence);

GRANT ALL ON TABLE aaa.loginrole TO http;

INSERT INTO aaa.loginrole( changer, changed, start, ended, login, roles, priority)
SELECT 
  l.changer, l.changed, r.start, r.ended, l.id AS login, r.id AS roles, 1 
  FROM aaa.login as l, aaa.roles as r
  WHERE (l.name = 'admin' AND r.name = 'Administrator' ) OR  (l.name = 'Manager007' AND r.name = 'Store Manager' ) ;


/*
CREATE SEQUENCE aaa.loginUser_seq;
CREATE TABLE aaa.loginUser (
        id          bigint NOT NULL  DEFAULT nextval('aaa.loginUser_seq'),
	login       bigint NOT NULL, 
	users       bigint NULL,
	CONSTRAINT 	aaa_loginUser_id PRIMARY KEY (id),
	CONSTRAINT      aaa_loginRole_login_fkey 	FOREIGN KEY (login)
			REFERENCES aaa.login  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION
) INHERITS (_timeDepence);
*/

CREATE SEQUENCE aaa.sessions_seq;
GRANT ALL ON SEQUENCE aaa.sessions_seq TO http;
CREATE TABLE aaa.sessions (
        id          varchar(200)  NOT NULL,
	login       bigint NOT NULL, 
	CONSTRAINT 	aaa_sessions_id PRIMARY KEY (id),
	CONSTRAINT      aaa_session_login_fkey 	FOREIGN KEY (login)
			REFERENCES aaa.login  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION
) INHERITS (_timeDepence);
GRANT ALL ON TABLE aaa.sessions TO http;

---------------------------------------------------------------------------------
CREATE SCHEMA global
  AUTHORIZATION postgres;

GRANT ALL ON SCHEMA global TO postgres;
GRANT ALL ON SCHEMA global TO public;


CREATE SEQUENCE global.man_seq;
GRANT ALL ON SEQUENCE global.man_seq TO http;

CREATE TABLE global.man (
	id  		bigint NOT NULL  DEFAULT nextval('global.man_seq'),
	name 		varchar(250)  NOT NULL ,
	last_name 	varchar(250)  NOT NULL ,
	middle_name 	varchar(250)  NOT NULL ,
	birthday 	timestamp NULL ,
	gender 		int NULL ,
	CONSTRAINT 	lib_man_id PRIMARY KEY (id) 
) INHERITS (_timeDepence);
GRANT ALL ON TABLE global.man TO http;

INSERT INTO global.man(changer, changed, start, ended,name,last_name, middle_name,birthday, gender)    VALUES (0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,NULL,'Админ',        'Кей',       'Рутович', null, 1);
INSERT INTO global.man(changer, changed, start, ended,name,last_name, middle_name,birthday, gender)    VALUES (0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,NULL,'Клавдия',      'Аникеева',  'Админовна', null, 0);
INSERT INTO global.man(changer, changed, start, ended,name,last_name, middle_name,birthday, gender)    VALUES (0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,NULL,'Александр',    'Дюма',      '', null, 0);
INSERT INTO global.man(changer, changed, start, ended,name,last_name, middle_name,birthday, gender)    VALUES (0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,NULL,'Даниель',      'Дефо',      '', null, 0);
INSERT INTO global.man(changer, changed, start, ended,name,last_name, middle_name,birthday, gender)    VALUES (0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,NULL,'Сергей',      'Лукьяненко', 'Васильевич', null, 0);
INSERT INTO global.man(changer, changed, start, ended,name,last_name, middle_name,birthday, gender)    VALUES (0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,NULL,'Степан',      'Вартанов',   'Сергеевич', null, 0);

UPDATE aaa.login AS l 
SET man = m.id
FROM global.man AS m
WHERE (m.name = 'Админ' AND l.name = 'admin')
OR (m.name = 'Клавдия' AND l.name = 'Manager007');


/*
ALTER TABLE aaa.loginUser
  ADD CONSTRAINT  aaa_loginRole_users_fkey FOREIGN KEY (users)
      REFERENCES global.man  (id) MATCH FULL
      ON UPDATE RESTRICT ON DELETE NO ACTION;
*/
---------------------------------------------------------------------------------
CREATE SCHEMA locale
  AUTHORIZATION postgres;

GRANT ALL ON SCHEMA locale TO postgres;
GRANT ALL ON SCHEMA locale TO public;
GRANT ALL ON SCHEMA locale TO http;

CREATE SEQUENCE locale.book_seq;
GRANT ALL ON SEQUENCE locale.book_seq TO http;

CREATE TABLE locale.book (
	id  		bigint NOT NULL  DEFAULT nextval('locale.book_seq'),
	name 		varchar(250)  NOT NULL ,
	edition		varchar(250)  NOT NULL ,
	publisher	varchar(250)  NOT NULL ,
	issue 		timestamp NULL ,
	circulation 	int NULL ,
	CONSTRAINT 	lib_book_id PRIMARY KEY (id) 
) INHERITS (_history);
GRANT ALL ON SCHEMA locale TO http;

INSERT INTO locale.book( name, edition, publisher, issue, circulation)  VALUES ( 'Город Трора', '', '', '1988-01-01 00:00:00', 100000);
INSERT INTO locale.book( name, edition, publisher, issue, circulation)  VALUES ( 'Короткая дорога', '', '', '1994-01-01 00:00:00', 20000);
INSERT INTO locale.book( name, edition, publisher, issue, circulation)  VALUES ( 'Лето', '', '', '2001-01-01 00:00:00', 120000);
INSERT INTO locale.book( name, edition, publisher, issue, circulation)  VALUES ( 'Экологический аспект', '', '', '1989-01-01 00:00:00', 120000);
INSERT INTO locale.book( name, edition, publisher, issue, circulation)  VALUES ( 'Диспетчер', '', '', '1989-01-01 00:00:00', 24000);
INSERT INTO locale.book( name, edition, publisher, issue, circulation)  VALUES ( 'Квартирант', '', '', '1990-01-01 00:00:00', 50000);




CREATE SEQUENCE locale.bookAutors_seq;
GRANT ALL ON TABLE locale.book TO http;

CREATE TABLE locale.bookAutors (
	id  		bigint NOT NULL  DEFAULT nextval('locale.bookAutors_seq'),
	book            bigint NOT NULL,
	man             bigint NOT NULL,
	CONSTRAINT 	locale_bookAutors_id 		PRIMARY KEY (id),
	CONSTRAINT      locale_bookAutors_book_fkey 	FOREIGN KEY (book)
			REFERENCES locale.book  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION,
        CONSTRAINT      locale_bookAutors_man_fkey 	FOREIGN KEY (man)
        		REFERENCES global.man  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION
 
) INHERITS (_history);
GRANT ALL ON TABLE locale.bookAutors TO http;

INSERT INTO locale.bookautors( book, man)
SELECT  b.id,m.id
   FROM locale.book b
   JOIN global.man m ON 1=1
WHERE  (b.id = m.id OR b.id+2 =m.id )AND  m.name != 'Админ' AND   m.name != 'Клавдия' ;

CREATE SEQUENCE locale.bookStore_seq;
GRANT ALL ON SEQUENCE locale.bookStore_seq TO http;

CREATE TABLE locale.bookStore (
	id  		bigint NOT NULL  DEFAULT nextval('locale.bookStore_seq'),
	name 		varchar(250)  NOT NULL ,
	manager         bigint NOT NULL,
	CONSTRAINT 	locale_bookStore_id 		PRIMARY KEY (id),
	CONSTRAINT      locale_bookStore_manager_fkey 	FOREIGN KEY (manager)
			REFERENCES global.man  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION
) INHERITS (_history);
GRANT ALL ON TABLE locale.bookStore  TO http;

INSERT INTO locale.bookstore( changer, changed,  name, manager)
SELECT  0, CURRENT_TIMESTAMP, 'Первый магазин', id FROM global.man WHERE name = 'Клавдия';
INSERT INTO locale.bookstore( changer, changed,  name, manager)
SELECT  0, CURRENT_TIMESTAMP, 'Второй магазин', id FROM global.man WHERE name = 'Админ';

CREATE SEQUENCE locale.bookStoreСontent_seq;
GRANT ALL ON SEQUENCE locale.bookStoreСontent_seq TO http;

CREATE TABLE locale.bookStoreСontent (
	id  		bigint NOT NULL  DEFAULT nextval('locale.bookStoreСontent_seq'),
	store           bigint NOT NULL,
	book            bigint NOT NULL,
	count           int NOT NULL DEFAULT 0,
	CONSTRAINT 	locale_bookStoreСontent_id 		PRIMARY KEY (id),
	CONSTRAINT      locale_bookStoreСontent_store_fkey 	FOREIGN KEY (store)
			REFERENCES locale.bookStore  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION,
	CONSTRAINT      locale_bookStoreСontent_book_fkey 	FOREIGN KEY (book)
			REFERENCES locale.book  (id) MATCH FULL
			ON UPDATE RESTRICT ON DELETE NO ACTION
) INHERITS (_history);
GRANT ALL ON TABLE locale.bookStoreСontent TO http;

INSERT INTO locale."bookstoreСontent"( store, book, count)
SELECT bs.id,b.id,(random()*100)::int  FROM locale.bookstore bs, locale.book b;
INSERT INTO locale."bookstoreСontent"( store, book, count)
SELECT bs.id,b.id,(random()*100)::int  FROM locale.bookstore bs, locale.book b ORDER BY b.id DESC  LIMIT 5
    
