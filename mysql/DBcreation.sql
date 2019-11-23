use capstoneDB;
drop view POST_LIST;
drop table COMMENT_NOTI;
drop table COMMENT_SML;
drop table COMMENT_MID;
drop table COMMENT_BIG;
drop table POST_NOTI;
drop table POST_SML;
drop table POST_MID;
drop table POST_BIG;
drop table ATTENDENCE;
drop table PROJECT;
drop table STATUS_INFO;
drop table USER;

CREATE TABLE USER(
    USER_ID VARCHAR(20),
    USER_PW VARCHAR(512),
    SALT VARCHAR(512),
    NAME VARCHAR(50),
    DEPT VARCHAR(50),
    TOKEN VARCHAR(255),
    PRIMARY KEY(USER_ID)
);

CREATE TABLE STATUS_INFO(
    STATUS_DESC VARCHAR(20),
    STATUS INT(1),
    PRIMARY KEY(STATUS)
);
INSERT STATUS_INFO VALUES("ONGOING", 0);
INSERT STATUS_INFO VALUES("COMPLETE", 1);
INSERT STATUS_INFO VALUES("ERASED", -1);

CREATE TABLE PROJECT(
    PROJ_ID INT(11) UNSIGNED AUTO_INCREMENT,
    PROJ_MGR_UID varchar(20),
    PROJ_NAME VARCHAR(200),
    PROJ_PROGRESS FLOAT(5,2),
    PROJ_START DATETIME,
    PROJ_END DATETIME,
    PROJ_DESC TEXT,
    PROJ_STATUS INT(1),
    FOREIGN KEY(PROJ_STATUS) REFERENCES STATUS_INFO (STATUS),
    FOREIGN KEY(PROJ_MGR_UID) REFERENCES USER (USER_ID),
    PRIMARY KEY(PROJ_ID)
);

CREATE TABLE ATTENDENCE(
    PROJ_ID INT(11) UNSIGNED,
    USER_ID VARCHAR(20),
    -- FOREIGN KEY (USER_ID) REFERENCES USER (USER_ID),
    FOREIGN KEY (PROJ_ID) REFERENCES PROJECT (PROJ_ID),
    PRIMARY KEY(USER_ID, PROJ_ID)
);

CREATE TABLE POST_BIG(
    BIG_ID INT(11) UNSIGNED AUTO_INCREMENT,
    PROJ_ID INT(11) UNSIGNED,
    BIG_LEVEL INT(30),
    BIG_TITLE VARCHAR(200),
    BIG_START DATETIME,
    BIG_END DATETIME,
    BIG_DESC TEXT,
    BIG_ATTACHMENT TEXT,
    BIG_STATUS INT(1),
    BIG_AUTHOR VARCHAR(20),
    BIG_CREATED DATETIME,
    BIG_WEIGHT FLOAT(5,2),
    BIG_PROGRESS FLOAT(5,2),
    FOREIGN KEY (PROJ_ID) REFERENCES PROJECT (PROJ_ID),
    FOREIGN KEY (BIG_AUTHOR) REFERENCES USER (USER_ID),
    FOREIGN KEY (BIG_STATUS) REFERENCES STATUS_INFO (STATUS),
    PRIMARY KEY(BIG_ID)
);

CREATE TABLE POST_MID(
    MID_ID INT(11) UNSIGNED AUTO_INCREMENT,
    BIG_ID INT(11) UNSIGNED,
    MID_LEVEL INT(30),
    MID_TITLE VARCHAR(200),
    MID_START DATETIME,
    MID_END DATETIME,
    MID_DESC TEXT,
    MID_ATTACHMENT TEXT,
    MID_STATUS INT(1),
    MID_AUTHOR VARCHAR(20),
    MID_CREATED DATETIME,
    FOREIGN KEY (BIG_ID) REFERENCES POST_BIG (BIG_ID),
    FOREIGN KEY (MID_AUTHOR) REFERENCES USER (USER_ID),
    FOREIGN KEY (MID_STATUS) REFERENCES STATUS_INFO (STATUS),
    PRIMARY KEY(MID_ID)
);

CREATE TABLE POST_SML(
    SML_ID INT(11) UNSIGNED AUTO_INCREMENT,
    MID_ID INT(11) UNSIGNED,
    SML_TITLE VARCHAR(200),
    SML_START DATETIME,
    SML_END DATETIME,
    SML_DESC TEXT,
    SML_ATTACHMENT TEXT,
    SML_STATUS INT(1),
    SML_AUTHOR VARCHAR(20),
    SML_CREATED DATETIME,
    FOREIGN KEY (MID_ID) REFERENCES POST_MID (MID_ID),
    FOREIGN KEY (SML_AUTHOR) REFERENCES USER (USER_ID),
    FOREIGN KEY (SML_STATUS) REFERENCES STATUS_INFO (STATUS),
    PRIMARY KEY(SML_ID)
);

CREATE TABLE POST_NOTI(
    NOTI_ID INT(11) UNSIGNED AUTO_INCREMENT,
    PROJ_ID INT(11) UNSIGNED,
    NOTI_TITLE VARCHAR(200),
    NOTI_DESC TEXT,
    NOTI_STATUS INT(1),
    NOTI_AUTHOR VARCHAR(20),
    NOTI_CREATED DATETIME,
    FOREIGN KEY (PROJ_ID) REFERENCES PROJECT (PROJ_ID),
    FOREIGN KEY (NOTI_AUTHOR) REFERENCES USER (USER_ID),
    FOREIGN KEY (NOTI_STATUS) REFERENCES STATUS_INFO (STATUS),
    PRIMARY KEY(NOTI_ID)
);

CREATE TABLE COMMENT_BIG(
    BIGC_ID INT(11) UNSIGNED AUTO_INCREMENT,
    BIG_ID INT(11) UNSIGNED,
    BIGC_AUTHOR VARCHAR(20),
    BIGC_COMMENT TEXT,
    BIGC_TIME DATETIME,
    BIGC_STATUS INT(1),
    FOREIGN KEY (BIG_ID) REFERENCES POST_BIG (BIG_ID),
    FOREIGN KEY (BIGC_AUTHOR) REFERENCES USER (USER_ID),
    FOREIGN KEY (BIGC_STATUS) REFERENCES STATUS_INFO (STATUS),
    PRIMARY KEY(BIGC_ID)
);

CREATE TABLE COMMENT_MID(
    MIDC_ID INT(11) UNSIGNED AUTO_INCREMENT,
    MID_ID INT(11) UNSIGNED,
    MIDC_AUTHOR VARCHAR(20),
    MIDC_COMMENT TEXT,
    MIDC_TIME DATETIME,
    MIDC_STATUS INT(1),
    FOREIGN KEY (MID_ID) REFERENCES POST_MID (MID_ID),
    FOREIGN KEY (MIDC_AUTHOR) REFERENCES USER (USER_ID),
    FOREIGN KEY (MIDC_STATUS) REFERENCES STATUS_INFO (STATUS),
    PRIMARY KEY(MIDC_ID)
);

CREATE TABLE COMMENT_SML(
    SMLC_ID INT(11) UNSIGNED AUTO_INCREMENT,
    SML_ID INT(11) UNSIGNED,
    SMLC_AUTHOR VARCHAR(20),
    SMLC_COMMENT TEXT,
    SMLC_TIME DATETIME,
    SMLC_STATUS INT(1),
    FOREIGN KEY (SML_ID) REFERENCES POST_SML (SML_ID),
    FOREIGN KEY (SMLC_AUTHOR) REFERENCES USER (USER_ID),
    FOREIGN KEY (SMLC_STATUS) REFERENCES STATUS_INFO (STATUS),
    PRIMARY KEY(SMLC_ID)
);

CREATE TABLE COMMENT_NOTI(
    NOTIC_ID INT(11) UNSIGNED AUTO_INCREMENT,
    NOTI_ID INT(11) UNSIGNED,
    NOTIC_AUTHOR VARCHAR(20),
    NOTIC_COMMENT TEXT,
    NOTIC_TIME DATETIME,
    NOTIC_STATUS INT(1),
    FOREIGN KEY (NOTI_ID) REFERENCES POST_NOTI (NOTI_ID),
    FOREIGN KEY (NOTIC_AUTHOR) REFERENCES USER (USER_ID),
    FOREIGN KEY (NOTIC_STATUS) REFERENCES STATUS_INFO (STATUS),
    PRIMARY KEY(NOTIC_ID)
);