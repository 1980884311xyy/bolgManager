var express = require('express');
var router = express.Router();
var async=require("async");

var conn=require("../utils/conn");

/* GET home page. */
router.get('/', function(req, res, next) {
      conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("连接数据库成功");
      var article=db.collection("article");
      article.find({},{title:1,count:1,content:1,img:1,_id:0,data:1,id:1}).sort({data:-1}).limit(6).toArray((err,result)=>{
        if(err) throw err;
          res.render('index', {username:req.session.username,result:result});//1表示登录并有文章
        db.close();
      })
    })
});

//注册
 router.get("/register",(req,res)=>{
  res.render("register",{username:''});
})
router.post("/registerquery",(req,res)=>{
  var username=req.body.username;
  console.log(username);
  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接成功");
    var User=db.collection("User");
    User.find({username:username},{username:1,_id:0}).toArray((err,result)=>{
      if(err) throw err;
      console.log(result);
      if(result.length>0){
        res.send("0");//表示存在
      }else{
        res.send("1");
      }
    }) 
    db.close();
  })
}) 


//登录
router.get("/login",(req,res)=>{
  res.render("login",{username:''});
})
//退出
router.get("/layout",(req,res)=>{
  req.session.username = undefined;
  res.redirect("/");
})

//写博文
router.get("/writeBlog",(req,res)=>{
  res.render("writeBlog",{username:req.session.username});
})

//点击阅读全文
router.get("/articleDetail",(req,res)=>{
  //获得文章id
  var ids=parseInt(req.query.ids);
  console.log(ids);
  //根据id查询article表
  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接成功")
    var article=db.collection("article");
    article.find({id:ids},{_id:0,data:1,title:1,content:1,author:1,id:1}).toArray((err,result)=>{
      if(err) throw err;
      // console.log(result);
      res.render("articleDetail",{username:req.session.username,result:result})
      db.close();
    })

  })
})
//博文管理
router.get("/blogManage",(req,res)=>{
  res.render("blogManage",{username:req.session.username})
})
router.get("/blogCount",(req,res)=>{
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
      var article=db.collection("article");
      article.find({},{}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
      })
    })
})

//博文管理 显示 分页
router.get("/blogManagePage",(req,res)=>{
  var num=req.query.num;//当前页
  var username=req.session.username;
  var pageSize=10;//每页显示10条;
  var pagecount=0;//数据总数
  console.log("**************")
  console.log(num)
     conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
      var article=db.collection("article");
            article.find({},{_id:0}).sort({data:-1}).skip((num-1)*pageSize).limit(pageSize).toArray((err,result)=>{
            if(err) throw err;
            res.send({result:result});
              // console.log(result);
              db.close();
          }) 
    })
})

router.get("/findarticle",(req,res)=>{
  //获得文章id；
  var id=parseInt(req.query.id);
  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接成功");
    db.collection("article").find({id:id},{_id:0}).toArray((err,result)=>{
      if(err) throw err;
      res.send(result[0]);
    })
  })
})

router.get("/updatearticle",(req,res)=>{
  res.render("updatearticle",{username:req.session.username});
})


module.exports = router;
