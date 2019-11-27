//package.json은 외장모듈 관리를 위해 사용(npm init)
var http = require('http')
var express = require('express')
var static = require('serve-static')
var path = require('path')
var bodyParser = require('body-parser')
var multer = require('multer')
var fs = require('fs')
var cors = require('cors') // 다른 서버로 접근하기위해서 사용
var mysql = require('mysql');
var crypto = require('crypto'); //비밀번호 암호화
var mysqlDB = require('./mysql-db');

mysqlDB.connect();

var app = express();
app.set('port', process.env.PORT || 9000); //포트 지정
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); //post방식으로 데이터 받기위해 2줄 적어야한다
app.use(cors());


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = './public'    
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
})
var upload = multer({
    storage: storage,
    limit: {
        files: 12,
        filesize: 1024*1024*50
    }
});

var router = express.Router();
app.use('/', router);

app.use(function (req, res, next) {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' })
    res.write(`<h3>해당하는 내용이 없습니다</h3>`)
    res.end();
})

http.createServer(app).listen(app.get('port'), function () {
    console.log("익스프레스로 웹 서버를 실행함 : " + app.get('port'));
}) //express를 이용해 웹서버 만든다


// SIGNUP
router.route("/user/register").post(function (req, res) {
    var email = req.body.email;
    var inputPassword = req.body.password;
    var u_name = req.body.name;
    var department = req.body.department;
    var u_salt = Math.round((new Date().valueOf() * Math.random())) + "";
    var hashPassword = crypto.createHash("sha512").update(inputPassword + u_salt).digest("hex");
    console.log(`email : ${email} , password : ${inputPassword}, hashPassword : ${hashPassword}, name : ${u_name} , department : ${department}, salt : ${u_salt}`);

    var data = { USER_ID: email, USER_PW: hashPassword, NAME: u_name, DEPT: department, TOKEN: "t", SALT: u_salt };
    mysqlDB.query('INSERT INTO USER set ?', data, function (err, results) {
        var admit;
        if (!err) {
            admit = { "register": "success" };
            console.log("Create user success");
            res.write(JSON.stringify(admit));
            res.end();
            console.log(results);
        } else {
            console.log("USER INSERT ERROR");
            admit = { "register": "deny" };
            res.write(JSON.stringify(admit));
            res.end();
        }
    })
})
// LOGIN
router.route("/user/login").post(function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    console.log("email : " + email);
    console.log("password : " + password);

    mysqlDB.query('select * from USER where USER_ID=?', [email], function (err, results) {
        var login;
        if (err) {
            login = { "login": "error" };
            console.log("LOGIN ERROR");
            console.log(err);
            console.log(JSON.stringify(login));
            res.write(JSON.stringify(login));
            res.end();
            return;
        }

        if (results.length > 0) {
            console.log(results);
            var user = results[0];
            var hashPassword = crypto.createHash("sha512").update(password + user.SALT).digest("hex");

            if (hashPassword === user.USER_PW) {
                console.log("login success");
                login = { "login": "success" };
            } else {
                console.log("WRONG ID or PASSWORD");
                login = { "login": "wrong" }
            }
            console.log(JSON.stringify(login));
            res.write(JSON.stringify(login));
            res.end();
        }
        else {
            login = { "login": "wrong" };
            console.log("WRONG ID")
            console.log(JSON.stringify(login));
            res.write(JSON.stringify(login));
            res.end();
        }
    })
})


router.route("/task/createBIG").post(upload.array('userFiles', 12), function (req, res) {
    if(req.files != null)
	files = req.files;
    else
	files = []
    var projectID = req.body.projectID;
    var BigLevel = req.body.BigLevel;
    var BigTitle = req.body.BigTitle;
    var BigStart = req.body.BigStart;
    var BigEnd = req.body.BigEnd;
    var BigDesc = req.body.BigDesc;
    var BigAttach = req.body.BigAttach;
    var BigStatus = req.body.BigStatus;
    var BigAuthor = req.body.BigAuthor;
    var BigCreated = req.body.BigCreated;
    var BigWeight = req.body.BigWeight;
    var BigProgress = req.body.BigProgress;

    console.log(`projectID : ${projectID} , BigLevel : ${BigLevel}, BigTitle : ${BigTitle}, BigStart : ${BigStart} , BigEnd : ${BigEnd}, BigDesc : ${BigDesc}, 
            BigStatus : ${BigStatus}, BigAuthor : ${BigAuthor}, BigCreated : ${BigCreated} , BigWeight : ${BigWeight}, BigProgress : ${BigProgress}`);

    var data = {
        PROJ_ID: projectID, BIG_LEVEL: BigLevel, BIG_TITLE: BigTitle, BIG_START: BigStart, BIG_END: BigEnd, BIG_DESC: BigDesc, BIG_ATTACHMENT: BigAttach,
        BIG_STATUS: BigStatus, BIG_AUTHOR: BigAuthor, BIG_CREATED: BigCreated, BIG_WEIGHT: BigWeight, BIG_PROGRESS: BigProgress
    };

    mysqlDB.query('INSERT INTO POST_BIG set ?', data, function (err, results) {
        var admit;
        if (!err) {
            
            console.log("Create task success");

            var dir = "./public/"+projectID;
	    var dir2 = dir1+"/"+results["insertId"];
            if(!fs.existsSync(dir1)){
		fs.mkdirSync(dir1);
               	fs.mkdirSync(dir2);
            }else if(!fs.existsSync(dir2)){
	    	fs.mkdirSync(dir2);
	    }
	    for(var i=0; i<files.length; ++i)
            	fs.rename("./public/"+files[i].originalname, dir2+"/"+files[i].originalname, function(err){});        
            
            admit = { "create": "success" };
            res.write(JSON.stringify(admit));
	    res.end();
        } else {
	    console.log(err);
            console.log("TASK INSERT ERROR");
            admit = { "create": "deny" };
            res.write(JSON.stringify(admit));
            res.end();
        }
    })
    
})

// GENERATE-TASK-Middle
router.route("/task/createMID").post(function (req, res) {
    var BigID = req.body.BigID;
    var MidLevel = req.body.MidLevel;
    var MidTitle = req.body.MidTitle;
    var MidStart = req.body.MidStart;
    var MidEnd = req.body.MidEnd;
    var MidDesc = req.body.MidDesc;
    var MidAttach = req.body.MidAttach;
    var MidStatus = req.body.MidStatus;
    var MidAuthor = req.body.MidAuthor;
    var MidCreated = req.body.MidCreated;


    console.log(`BigID : ${BigID} , MidLevel : ${MidLevel}, MidTitle : ${MidTitle}, MidStart : ${MidStart} , MidEnd : ${MidEnd}, MidDesc : ${MidDesc}, `
        + `MidAttach : ${MidAttach} , MidStatus : ${MidStatus}, MidAuthor : ${MidAuthor}, MidCreated : ${MidCreated}`);

    var data = {
        BIG_ID: BigID, MID_LEVEL: MidLevel, MID_TITLE: MidTitle, MID_START: MidStart, MID_END: MidEnd, MID_DESC: MidDesc,
        MID_ATTACHMENT: MidAttach, MID_STATUS: MidStatus, MID_AUTHOR: MidAuthor, MID_CREATED: MidCreated
    };
    mysqlDB.query('INSERT INTO POST_MID set ?', data, function (err, results) {
        var admit;
        if (!err) {
            admit = { "create": "success" };
            console.log("Create task success");
            res.write(JSON.stringify(admit));
            res.end();
        } else {
            console.log("TASK INSERT ERROR");
            admit = { "create": "deny" };
            res.write(JSON.stringify(admit));
            res.end();
        }
    })
})

// GENERATE-TASK-Small
router.route("/task/createSML").post(function (req, res) {
    var MidID = req.body.MidID;
    var SmlTitle = req.body.SmlTitle;
    var SmlStart = req.body.SmlStart;
    var SmlEnd = req.body.SmlEnd;
    var SmlDesc = req.body.SmlDesc;
    var SmlAttach = req.body.SmlAttach;
    var SmlStatus = req.body.SmlStatus;
    var SmlAuthor = req.body.SmlAuthor;
    var SmlCreated = req.body.SmlCreated;


    console.log(`MidID : ${MidID} , SmlTitle : ${SmlTitle}, SmlStart : ${SmlStart} , SmlEnd : ${SmlEnd}, SmlDesc : ${SmlDesc}, `
        + `SmlAttach : ${SmlAttach} , SmlStatus : ${SmlStatus}, SmlAuthor : ${SmlAuthor}, SmlCreated : ${SmlCreated}`);

    var data = {
        MID_ID: MidID, SML_TITLE: SmlTitle, SML_START: SmlStart, SML_END: SmlEnd, SML_DESC: SmlDesc,
        SML_ATTACHMENT: SmlAttach, SML_STATUS: SmlStatus, SML_AUTHOR: SmlAuthor, SML_CREATED: SmlCreated
    };
    mysqlDB.query('INSERT INTO POST_SML set ?', data, function (err, results) {
        var admit;
        if (!err) {
            admit = { "create": "success" };
            console.log("Create task success");
            res.write(JSON.stringify(admit));
            res.end();
        } else {
            console.log("TASK INSERT ERROR");
            admit = { "create": "deny" };
            res.write(JSON.stringify(admit));
            res.end();
        }
    })
})

// PROJECT Create
router.route("/project/create").post(function (req, res) {
    var mgr_id = req.body.mgr_id;
    var title = req.body.title;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var desc = req.body.desc;
    var user_id = req.body.user_id;
    var p_salt =  Math.round((new Date().valueOf() * Math.random())) + "";
    var  hashURL = crypto.createHash("sha512").update(mgr_id + p_salt).digest("hex");
    console.log(req.body);
    var data = {
        PROJ_MGR_UID: mgr_id,
        PROJ_NAME: title,
        PROJ_START: start_date,
        PROJ_END: end_date,
        PROJ_DESC: desc,
        PROJ_PROGRESS: 0.00,
        PROJ_STATUS: 0,
        PROJ_URL: hashURL,
        SALT: p_salt
    };
    console.log(data);
    mysqlDB.query('INSERT INTO PROJECT set ?', data, function (err, results) {
        var admit;
        if (!err) {
            // admit={"create":"success"};
            console.log("PROJECT create success");
            // res.write(JSON.stringify(admit));
            // res.end();
            data = {
                PROJ_ID: results.insertId,
                USER_ID: user_id
            };
            console.log(data);
            mysqlDB.query('INSERT INTO ATTENDENCE set ?', data, function (err, results) {
                var admit;
                if (!err) {
                    admit = { "create": "success" };
                    console.log("ATTENDENCE create success");
                    res.write(JSON.stringify(admit));
                    res.end();
                } else {
                    console.log("ATTENDENCE create fail");
                    admit = { "create": "deny" };
                    res.write(JSON.stringify(admit));
                    res.end();
                }
            })
        } else {
            console.log(err);

            console.log("PROJECT create fail");
            admit = { "create": "deny" };
            res.write(JSON.stringify(admit));
            res.end();
        }
    })



})

//project list select
router.route("/project/select").get(function (req, res) {
    var user_id = req.query.user_id;
    console.log("======= Proejct Select =======\n");
    console.log("user_id: " + user_id);

    mysqlDB.query('select * from PROJECT pj where PROJ_STATUS=0 AND EXISTS ( select * from ATTENDENCE at where at.USER_ID = ? AND pj.PROJ_ID = at.PROJ_ID)', [user_id], function (err, rows, fields) {
        if (err) {
            console.log("error입니다")
        }
        else {
            console.log(rows);
            res.write(JSON.stringify(rows));
            res.end();
        }
    })
})




//get Project name
router.route("/projectName/select").get(function (req, res) {
    var proj_id = req.query.proj_id;
    console.log("======= project Name Select =======\n");
    console.log("proj_id: " + proj_id);

    mysqlDB.query('select PROJ_NAME from PROJECT where PROJ_ID = ?', [proj_id], function (err, rows, fields) {
        if (err) {
            console.log("error입니다")
        }
        else {
            console.log(rows);
            res.write(JSON.stringify(rows[0]));
            res.end();
        }
    })
})


//get Project Info
router.route("/projectInfo/select").get(function (req, res) {
    var proj_url = req.query.proj_url;
    console.log("======= project Name Select =======\n");
    console.log("proj_url: " + proj_url);

    mysqlDB.query('select PROJ_ID, PROJ_NAME, PROJ_MGR_UID, PROJ_DESC from PROJECT where PROJ_URL = ?', [proj_url], function (err, rows, fields) {
        if (err) {
            console.log("error입니다")
        }   
        else {
            console.log(rows);
            res.write(JSON.stringify(rows[0]));
            res.end();
        }
    })
})


//task view select
router.route("/taskView/select").get(function (req, res) {
    var proj_id = req.query.proj_id;
    console.log("======= task Select =======\n");
    console.log("proj_id: " + proj_id);

    mysqlDB.query('select BIG_LEVEL, BIG_TITLE, MID_LEVEL, MID_TITLE, SML_TITLE from POST_LIST where PROJ_ID = ?', [proj_id], function (err, rows, fields) {
        if (err) {
            console.log("error입니다")
        }
        else {
            console.log(rows);
            res.write(JSON.stringify(rows));
            res.end();
        }
    })
})
//big list select alert list
router.route("/taskView/Big/select").get(function (req, res) {
    var proj_id = req.query.proj_id;
    console.log("======= Big Task Select =======\n");

    mysqlDB.query('select BIG_ID, BIG_LEVEL, BIG_TITLE from POST_BIG where PROJ_ID = ? order by BIG_LEVEL', [proj_id], function (err, rows, fields) {
        if (err) {
            console.log("error입니다")
        }
        else {
            console.log(rows);
            res.write(JSON.stringify(rows));
            res.end();
        }
    })
})
//middle list select alert list
router.route("/taskView/Mid/select").get(function (req, res) {
    var big_id = req.query.big_id;
    console.log("======= Mid Task Select =======\n");

    mysqlDB.query('select MID_ID, MID_LEVEL, MID_TITLE from POST_MID where BIG_ID = ? order by MID_LEVEL', [big_id], function (err, rows, fields) {
        if (err) {
            console.log("error입니다")
        }
        else {
            console.log(rows);
            res.write(JSON.stringify(rows));
            res.end();
        }
    })
})

//small list select 
router.route("/taskView/Sml/select").get(function (req, res) {
    var mid_id = req.query.mid_id;
    console.log("======= Sml Task Select =======\n");

    mysqlDB.query('select SML_ID, SML_TITLE, SML_CREATED from POST_SML where MID_ID = ? order by SML_CREATED', [mid_id], function (err, rows, fields) {
        if (err) {
            console.log("error입니다")
        }
        else {
            console.log(rows);
            res.write(JSON.stringify(rows));
            res.end();
        }
    })
})


//notilist list 
router.route("/notification/select").get(function (req, res) {
    var proj_id = req.query.proj_id;
    console.log("======= Notification Select =======\n");

    mysqlDB.query('select * from POST_NOTI where proj_id = ?', [proj_id], function (err, rows, fields) {
        if (err) {
            console.log("error입니다")
        }
        else {
            console.log(rows);
            res.write(JSON.stringify(rows));
            res.end();
        }
    })
})


// Attend-project-member
router.route("/attend/member").post(function (req, res) {
    var projectID = req.body.proj_id;
    var userID = req.body.user_id;
    console.log(`projectID : ${projectID} , userID : ${userID}`);

    var data = {
        PROJ_ID: projectID, USER_ID: userID
    };
    mysqlDB.query('INSERT INTO ATTENDENCE set ?', data, function (err, results) {
        var admit;
        if (!err) {
            admit = { "attend": "success" };
            console.log("Add member success");
            res.write(JSON.stringify(admit));
            res.end();
        } else {
            console.log("Add member ERROR");
            admit = { "attend": "deny" };
            res.write(JSON.stringify(admit));
            res.end();
        }
    })
})
