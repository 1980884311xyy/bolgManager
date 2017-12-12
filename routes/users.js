var express = require('express');
var router = express.Router();
var async=require("async");
var multiparty=require("multiparty");
var cheerio=require("cheerio");

var fs=require("fs");

var conn=require("../utils/conn")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/registerInster",(req,res)=>{
  var username=req.body.username;
  var password=req.body.password;
  var email=req.body.email
  console.log("***************")
  console.log(username,password,email);
  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接成功");
    var User=db.collection("User");
    async.waterfall([
      (callback)=>{
        User.find({username:username},{username:1,_id:0}).toArray((err,result)=>{
          if(err) throw err;
          console.log(result);
          if(result.length>0){
           callback(null,true);//表示存在
          }else{
            callback(null,false);//表示不存在
          }
        })  
      },
      (arg,callback)=>{
        if(!arg){
          User.insert({username:username,password:password,email:email},(err,result)=>{
            if(err) throw err;
            callback(null,true);//插入成功
          })
        }else{
          callback(null,false)
        }
        db.close();
      }
    ],(err,result)=>{
      if(err) throw err;
      if(result){
        console.log("插入成功");
        res.send("1");
      }else{
        console.log("插入失败");
        res.send("0")
      }
    })
  })
}) 

router.post("/loginquery",(req,res)=>{
  var username=req.body.username;
  var password=req.body.password;
  console.log(req.body)
  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接");
    var User=db.collection("User");
     User.find({username:username,password:password}).toArray((err,result)=>{
      if(err) throw err;
      console.log(result);
      if(result.length>0){
        console.log("查询成功");
        //设置一个会话；
        req.session.username=username;
        console.log(req.session);
        res.send("true")//
      }else{
        console.log("查找失败");
        res.send("false");
      }
    }) 

  })
})

//上传图片
router.post("/uploadImg",(req,res)=>{
	var form =new multiparty.Form();   //实例化 multiparty

	// 设置编码
	form.encoding = "utf-8";
	//  设置文件的存储路径(临时)
	form.uploadDir = "./uploadtemp";
	// 设置文件的大小限制
	form.maxFilesSize = 2*1024*1024;

	form.parse(req,function(err,fields,files){
		// if(err) throw err;
		//  fields 上传的文件被解析的域
		// files 对应的文件
		console.log(fields)
		var uploadUrl = "/images/upload/";  //文件上传真实的后台路径
		file = files["filedata"];  // 富文本编辑框 xheditor
		originalFilename = file[0].originalFilename;  //文件初始名 后缀名
		tempath = file[0].path;   //临时文件的路径  进行删除 进行读取
		console.log(tempath);
		var timestamp = new Date().getTime();  //获取时间戳
		uploadUrl += timestamp + originalFilename; //213233212311.png
		newPath = "./public"+uploadUrl;
        console.log(newPath);
        // 通过文件流读写上传图片
		var fileReadStream = fs.createReadStream(tempath);   //读图片
		var fileWriteStream = fs.createWriteStream(newPath); // 写入图片

		fileReadStream.pipe(fileWriteStream);

		// 监听文件上传关闭
		fileWriteStream.on("close",function(){
			fs.unlinkSync(tempath)  //删除临时文件
			res.send('{"err":"","msg":"'+uploadUrl+'"}')
		})
	})
});

//发表文章
router.post("/articleInsert",(req,res)=>{
  var title=req.body.title;
  var content=req.body.content;
  var author=req.session.username;
  var $=cheerio.load(content);
  var url=$("img").eq(0).attr("src");
  console.log("***********")
  console.log(typeof author);

  if(author){
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
      var article=db.collection("article");
      var articleids=db.collection("articleids");
      //每次插入之前让文章的id+1
      async.waterfall([
        (callback)=>{
          articleids.findAndModify(
            {name:"article"},
            [["_id","desc"]],
            {$inc:{id:1}},
            function(err,result){
              if(err) throw err;
              // console.log(result)
              callback(null,result.value.id);
            })
        },
        (id,callback)=>{
          article.insert({title:title,content:content,img:url,data:new Date(),id:id,author:author},(err,result)=>{
            if(err) throw errr;
            console.log("插入成功");
            callback(null,true);
          }) 
        }
      ],(err,result)=>{
        if(err) throw err;
        if(result){
          res.send(result);
        }else{
          res.send("false");
        }
      })
    })
  }else{
    res.send("false");
  }

})

//发表评论
router.post("/articleCommentInsert",(req,res)=>{
  //获得用户名，文章id，评论内容
  var idc=parseFloat(req.body.id);
  var commentval=req.body.comment;
  var username=req.session.username;
  console.log("%%%%%%%%%%%%%%%")
  console.log(idc);
  console.log("%%%%%%%%%%%%%%%")
  //comment入库
  if(username){
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
      var comment=db.collection("comment");
      var commentids=db.collection("commentids");
  
      async.waterfall([
        (callback)=>{
          commentids.findAndModify(
            {name:"comment"},
            [["_id","desc"]],
            {$inc:{id:1}},
            (err,result)=>{
              if(err) throw err;
              console.log(result.value.id);
              callback(null,result.value.id);//评论自增成功；
            }
          )
        },
        (id,callback)=>{
          if(id){
              comment.insert({username:username,comment:commentval,id:id,data:Date(),idc:idc,countjia:0,countjian:0},(err,result)=>{
              if(err) throw err;
              console.log("评论插入成功")
              callback(null,true);//插入成功
              db.close();
            })
          }else{
            callback(null,false);
          }
        }
      ],(err,result)=>{
        if(err) throw err;
        console.log(result);
        if(result){
          res.send("1");
        }else{
          res.send("2")
        }
      })
    })
  }else{
    res.send("0");
  }
})

//显示评论
router.get("/showComment",(req,res)=>{
  //根据文章id显示评论；每页只显示最新的十条评论
  var idc=parseInt(req.query.id);
  console.log("***&&&&&&%%%%%%")
  console.log(idc);
  console.log("***&&&&&&%%%%%%")
  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接成功")
    var comment1=db.collection("comment");
    /* comment1.find({idc:idc},{_id:0,username:1,comment:1,data:1,id:1}).toArray((err,result)=>{
     if(err) throw err;
     console.log(result);
   })   */
   comment1.find({idc:idc},{_id:0}).sort({data:-1}).limit(10).toArray((err,result)=>{
    if(err) throw err;
    // console.log(result);
    res.send(result);
   });
  })
})

//更新count countjia countjian
router.get("/countupdate",(req,res)=>{
  var id=parseInt(req.query.id);
  var countjia=req.query.countjia;
  var countjian=req.query.countjian;
  console.log("**********")
  console.log(req.query);
  console.log(id,countjia,countjian);
  console.log("***********")
  if(countjia){
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功")
      var comment1=db.collection("comment");
      comment1.update({id:id},{$set:{countjia:countjia}},(err,result)=>{
       if(err) throw err;
      //  console.log(result);
      //  console.log(更新成功)
      db.close();
     })  
    }) 
  }
  if(countjian){
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功")
      var comment1=db.collection("comment");
      comment1.update({id:id},{$set:{countjian:countjian}},(err,result)=>{
       if(err) throw err;
      //  console.log(更新成功)
      //  console.log(result);
      db.close();
     })  
    }) 
  }
}) 
  
//删除
router.get("/articledelete",(req,res)=>{
  var username=req.session.username;
  var id=parseInt(req.query.id);
  console.log("*************");
  console.log(username,id);
  if(username){
    //先根据文章id查询出该文章的author是不是此时的登录用户，
    //如果是就删除该id对应的文章，如果不是就不能删除
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功")
      var article=db.collection("article");
      async.waterfall([
        function(callback){
            article.find({id:id},{_id:0}).toArray((err,result)=>{
            if(err) throw err;
            // console.log(result);
            if(result[0].author!=username){
              // res.send("false")//表示不是该作者，不能删除
              callback(null,false);
            }else{
              callback(null,true)
            }
          })
        },
      ],(err,result)=>{
        console.log(result);
        if(result){
          //删除该条数据；
          article.deleteOne({id:id},function(err,result){
            if(err) throw err;
            console.log("删除成功");
            res.send("true")//删除成功；
            // console.log(result);
          })
        }else{
          res.send("false")//表示不是该作者，不能删除
        }
      })
    })
  }
})

//修改
router.get("/articledeleteModify",(req,res)=>{
  var username=req.session.username;
  var id=parseInt(req.query.id);
  console.log("*************");
  console.log(username,id);
  if(username){
    //先根据文章id查询出该文章的author是不是此时的登录用户，
    //如果是就删除该id对应的文章，如果不是就不能删除
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功")
      var article=db.collection("article");
          article.find({id:id},{_id:0}).toArray((err,result)=>{
          if(err) throw err;
          // console.log(result);
          if(result[0].author!=username){
            // res.send("false")//表示不是该作者，不能删除
            res.send("");
          }else{
            res.send(result[0]);
          }
          })
          db.close();
    })
  }
})

//文章修改后提交
router.post("/updateSubnitArticle",(req,res)=>{
  var title=req.body.title;
  var content=req.body.content;
  var author=req.session.username;
  var id=parseInt(req.body.id);
  var $=cheerio.load(content);
  var url=$("img").eq(0).attr("src");
  console.log("***********")
  console.log(typeof author);

  if(author){
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
      var article=db.collection("article");
          article.update({id:id},{title:title,content:content,img:url,id:id,data:new Date(),author:author},function(err,result){
            if(err) throw err;
            console.log(result);
            res.send("true");
          });
       })
  }else{
    res.send("false");
  }
})

module.exports = router;

