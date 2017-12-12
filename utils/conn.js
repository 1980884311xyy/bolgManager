var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var CONN_DB_STR = "mongodb://120.78.187.239:27017/cd1706xyy";

module.exports = {
    getDb:function(callback){
        MongoClient.connect(CONN_DB_STR,(err,db)=>{
            if(err){
                callback(err,null);
            }else{
                callback(null,db);
            }
        })
    }
}