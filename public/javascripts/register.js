
var username=$("#username");
var password=$("#password");
var respassword=$("#repassword")
var email=$("#email");

//失去焦点验证，验证用户名是否存在
username.blur(function(){
    userFn();
}) 

function userFn(){
    var usernametxt=username.val();
    //字母开头，不少于4位且不多于16位，以字母数字下划线组合
    if(!usernametxt){
        layer.alert("用户名不能为空",{icon:2});
        return false;
    }else if(!(/^[a-zA-Z]{1}([a-zA-Z0-9]){3,15}$/.test(usernametxt))){
        layer.alert("用户名格式错误",{icon:2});
        $(".info1").css({"color":"red","display":"block"});
        return false;
    }else{
        $(".info1").css({"display":"none"});
        $.ajax({
            type: "POST",
            url:"/registerquery",
            data:{username:usernametxt},
            success:function(data){
                console.log(data);
                if(data=="0"){
                    layer.alert("用户名已被注册，请重新输入",{icon:2});
                    return false;
                }
            }
        })
    }
}
//失去焦点验证
function passFn(){
    var passwordtxt=password.val();
    //字母开头，不少于4位且不多于16位，以字母数字下划线组合
    if(!passwordtxt){
        layer.alert("密码不能为空",{icon:2})
        return false;
    }else if(!(/^(\w){6,20}$/.test(passwordtxt))){
        layer.alert("密码格式错误",{icon:2});
        $(".info2").css({"color":"red","display":"block"});
        return false;
    }else{
        $(".info2").css({"display":"none"});
    }
}
password.blur(function(){
    passFn()
}) 

function repassFn(){
    var repasswordtxt=respassword.val();
    var  passwordtxt=password.val();
    //字母开头，不少于4位且不多于16位，以字母数字下划线组合
    if(!repasswordtxt){
        layer.alert("重复密码不能为空",{icon:2})
        return false;
    }else if(repasswordtxt!=passwordtxt){
        layer.alert("两次密码不同",{icon:2});
        return false;
    }
}
respassword.blur(function(){
    repassFn()
}) 

function emailFn(){
    var emailtxt=email.val();
    //字母开头，不少于4位且不多于16位，以字母数字下划线组合
    if(!emailtxt){
        layer.alert("邮箱不能为空",{icon:2})
        return false;
    }else if(!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(emailtxt)){
        layer.alert("邮箱格式错误",{icon:2});
        return false;
    }
}
email.blur(function(){
    emailFn()
}) 

function submitFn(){
    var usernametxt=username.val();
    var passwordtxt=password.val();
    var repasswordtxt=respassword.val();
    var emailtxt=email.val();
    //字母开头，不少于4位且不多于16位，以字母数字下划线组合
    if(!usernametxt){
        layer.alert("用户名不能为空",{icon:2});
        return false;
    }else if(!passwordtxt){
        layer.alert("密码不能为空",{icon:2});
        return false;
    }else if(!respassword){
        layer.alert("重复密码不能为空",{icon:2});
        return false;
    }else if(!emailtxt){
        layer.alert("邮箱不能为空",{icon:2});
        return false;
    }else{
        $.ajax({
            type:"POST",
            url:"/users/registerInster",
            data:{username:usernametxt,password:passwordtxt,email:emailtxt},
            success:function(data){
                console.log(data);
                if(data=="1"){
                    //跳转到登录页面
                    location.href="/login";
                }else{
                    layer.msg("用户名已被注册",{icon:5});
                }
            }
        })
    }
}

$("#submit").click(function(){
    submitFn();
})






