$(function(){
    $("#submit-btn").click(function(){
        var titlevalue=$("#title").val();
        var contenttxt=$("#content").val();
        if(!titlevalue){
            layer.alert("请输入标题",{icon:2});
        }else if(!contenttxt){
            layer.alert("请输入文章内容",{icon:2});
        }else{
            $.ajax({
                type:"POST",
                url:"/users/articleInsert",
                data:{title:titlevalue,content:contenttxt},
                success:function(data){
                    console.log(data);
                    if(data==true){
                        //跳转到首页
                        layer.msg("发布成功",{icon:1});
                        setTimeout(function(){
                            location.href="/";
                        },1000)
                    }else{
                        layer.msg("您没登录，请先登录",{icon:2});
                        setTimeout(function(){
                            location.href="/login";
                        },1000)
                    }
                }
            })
        }
    })

})