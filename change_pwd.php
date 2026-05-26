<?php
    session_start(); //Запускаем сессии
    include('login.php');
    include('connection.php');
    $auth = new AuthClass();
  
    if ($auth->isAuth()){
        if (isset($_POST["submit"])) {
            if ($auth->change_pwd(filter_input(INPUT_POST,'new_pwd2'))) {
                $auth->out();
                header("location: /index.php");
                exit();
            }
        }
?>
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="css/login.css" media="screen" type="text/css" />
    <script src="jquery/3.7/jquery-migrate-3.4.1.js" type="text/javascript"></script>
    <script src="jquery/3.7/jquery-3.7.1.min.js" type="text/javascript"></script>
    
    
    <script>
        $(document).ready(function() {
            $('#new_pwd1, #new_pwd2').on('keyup', function(e){
                if ($('#new_pwd1').val()===$('#new_pwd2').val()&&$('#new_pwd1').val()!==''){
                    $('#btn_submit').prop('disabled', false);
                } else{
                    $('#btn_submit').prop('disabled', true);
                }
            });
        });
    </script>
</head>

<body>
    <div id="login-form">
        <h1>Изменение пароля</h1>
        <fieldset>
            <form action="" method="post" name="loginForm">
                <input disabled type="text" name="login" required value="<?php echo $auth->getLogin();?>">
                <label for="new_pwd1">Новый пароль:</label>
                <input type="password" id="new_pwd1" name="new_pwd1" required>
                <label for="new_pwd2">Подтверждение пароля:</label>
                <input type="password" id="new_pwd2" name="new_pwd2" required>
                <input disabled id="btn_submit" type="submit" name="submit" value="ИЗМЕНИТЬ">
            </form>
        </fieldset>
    </div>
<?php 
    }else{
        header("location: /index.php");
        exit();
    }
?>	
</body>
</html>