<!DOCTYPE html>
<html>
    <head>
        <style type="text/css">
            .parent
			{
				width: 100%;
				height: 100%;
				position: absolute;
				top: 0;
				left: 0;
				overflow: auto;
			}
			.block_1 {
				
				position: absolute;
				top: 20%;
				left: 20%;
				
			}
			.block_2 {
				
				position: fixed;
				
			}
			.p-error-msg{
				font-size: 15pt;
			}
			.error-500-img{
				width: 150px;
			}
			.mail-error{
				font-size: 10pt;
				color: blue;
			}
        </style>
        <meta charset="utf-8">
		
        <title>Внутренняя дислокация</title>
        <link rel="stylesheet" href="css/site_layout.css" type="text/css">

	</head>

    <body>
		<div id="inf"></div>
		<div class="parent">
			<div class="block_1">
				<img src="img/site/site_error.png" class="error-500-img">
				<p class="p-error-msg">
					<?php 
						echo $_GET['msg']."<br> Попробуйте зайти позже или нажмите на кнопку 'Перезагрузить страницу'."; 
					?>
				</p>
				<p><a class="mail-error" href="mailto:Rustam.Bekmansurov@metafrax.ru?subject=Error-500.Дислокация-ПН">Сообщить об ошибке.</a></p>
				
				<div class="block_2">
					<a href="index.php" id="button_home" class="button_home">Перезагрузить страницу</a>
				</div>
			</div>
		</div>
    </body>
	<script>
		function goHome (){
			document.getElementById("button_home").click();
		}
		setInterval(goHome, 15000); // 15сек
	</script>
</html>

