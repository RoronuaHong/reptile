const http = require("http"),
    fs = require("fs"),
    async = require("async"),
    superagent = require("superagent"),
    cheerio = require("cheerio");

console.log("爬虫程序开始~~~~~~~~");

//发起POST请求
superagent.post("http://wcatproject.com/weaponSearch/function/getData.php").send({

    //请求的表单信息Form Data
    info: "isempty",
    star: [0, 0, 0, 1],
    job: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    phase: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    cate: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    phases: ['初代', '第一期','第二期','第三期','第四期','第五期','第六期', '第七期','第八期','第九期','第十期','第十一期','第十二期','第十三期','第十四期', '第十五期', '第十六期', '第十七期', '第十八期', '第十九期', '第二十期', '第二十一期', '第二十二期'],
    cates: ['活動限定','限定角色','聖誕限定','正月限定','黑貓限定','中川限定','茶熊限定','夏日限定', '七大罪', '獅劍限定', '溫泉限定', '黑貓2016', '茶熊2016', '獵人合作', '騎士限定', '夏日2016', '偵探限定', '獅劍2016']
})
    .set("Accept", "application/json, text/javascript, */*; q=0.01")
    .set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
    .end((err, res) => {

        //请求返回后的处理
        //将response中返回的结果转换成JSON对象
        const heroes = JSON.parse(res.text);

        //并发遍历heroes对象
        async.mapLimit(heroes, 1, (hero, callback) => {

            //对每个角色对象的处理逻辑
            //获取角色数据第一位的数据，即：角色id
            const heroId = hero[0];
            fetchInfo(heroId, callback);
        }, (err, result) => {
            console.log("抓取的角色数: " + heroes.length);
        });
    });

//获取角色信息
let concurrencyCount = 0;                 //当前并发数
const fetchInfo = (heroId, callback) => {
    concurrencyCount++;

    //根据角色ID, 进行详细页面的爬取和解析
    superagent.get("http://wcatproject.com/char/" + heroId)
        .end((err, res) => {

            //获取爬到的角色详细页面内容
            const $ = cheerio.load(res.text, {decodeEntities: false});

            //对页面内容进行解析，以收集队长技能为例
            console.log(heroId + "\t" + $(".leader-skill span").last().text());
            concurrencyCount--;
            callback(null, callback);
            console.log("爬虫结束！");
        });
}

// http.createServer(function(request, response) {
//     response.writeHead(200, {"Content-Type": "text/plain"});
//     response.end("Hello World");
// }).listen(7713);
// console.log("Server running at http://127.0.0.1:7713");