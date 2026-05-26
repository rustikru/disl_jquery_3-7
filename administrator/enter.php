<?php
    session_start(); //Запускаем сессии
    include('../login.php');
    $auth = new AuthClass();
    
    if (isset($_POST["submit"])) { //Если логин и пароль были отправлены
        if (!$auth->auth(filter_input(INPUT_POST,'login'), filter_input(INPUT_POST,'password'))) { //Если логин и пароль введен не правильно
            //echo "<h2 style=\"color:red;\">Логин и пароль введен не правильно!</h2>";
        }
    }
    
    if ($auth->isAuthAdmin()){
        header("location: index.php");
        exit();
    } else { //Если не авторизован, показываем форму ввода логина и пароля
?>
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../css/login.css" media="screen" type="text/css" />
</head>

<body>
    <div id="login-form">
        <h1>АВТОРИЗАЦИЯ</h1>
        <fieldset>
            <form action="" method="post" name="loginForm">
                <input type="text" name="login" required value="Логин" onBlur="if(this.value==='')this.value='Логин'" onFocus="if(this.value==='Логин')this.value='' "> 
                <input type="password" name="password" required value="Пароль" onBlur="if(this.value==='')this.value='Пароль'" onFocus="if(this.value==='Пароль')this.value='' "> 
                <input type="submit" name="submit" value="ВОЙТИ">
            </form>
        </fieldset>
    </div>
<?php 
    }
?>	
</body>
</html>