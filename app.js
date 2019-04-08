var express = require('express');
var bodyParser = require("body-parser");
const qiniu = require('qiniu')
var fs = require("fs");

var app = express();
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "10000kb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Content-Length, Authorization, Accept, timestamp , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200);
        /让options请求快速返回/
    } else {
        next();
    }
});
app.get('/1', function (req, res) {
    res.send('Hello World!');
});
app.post('/', function (req, res) {
    //接收前台POST过来的base64
    // console.log(req.body);
    // res.end();
    var imgData = req.body.data;
    //过滤data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile("image"+Math.random()+".png", dataBuffer, function (err) {
        if (err) {
            res.send(err);
        } else {
            res.send("保存成功！");
        }
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

var accessKey = 'QYGk8q3PQIi_LMOA9pjToblZcrDDIYqH3M1PNEkt'; //可在个人中心=》秘钥管理查看
var secretKey = 'MfbfaEW0I0hMoQxXvVYVoI5EoRuw22vt_AD8UqIH'; //可在个人中心=》秘钥管理查看
var bucket = "ionanth_szw"; //存储空间名称
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var options = {
    scope: bucket
}
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);
console.log(uploadToken)


const config = new qiniu.conf.Config()
config.zone = qiniu.zone.Zone_z0
const putExtra = new qiniu.form_up.PutExtra()
const formUploader = new qiniu.form_up.FormUploader(config)

var key = 'test.png'; //上传到服务器的名称
var localFile = "./1.png"; // 本地文件路径
formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr,
    respBody, respInfo) {
    if (respErr) {
        throw respErr;
    }
    if (respInfo.statusCode == 200) {
        console.log(respBody);
    } else {
        console.log(respInfo.statusCode);
        console.log(respBody);
    }
});



// const utils = {
//     async getToken() {
//         try {
//             let token = ''
//             let tokenStatus = await checkItem('qiniuToken')
//             if (!tokenStatus) {
//                 token = putPolicy.uploadToken(mac)
//                 await setItem('qiniuToken', {
//                     token
//                 }, expires)
//             } else {
//                 let res = await getItem('qiniuToken')
//                 token = res['token']
//             }
//             return token
//         } catch (error) {
//             console.error('获取七牛Token错误', error)
//             return 0
//         }
//     }
// }