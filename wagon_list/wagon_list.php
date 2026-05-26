<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Натурный лист</title>
        <style type="text/css">
            body {
                font: 16px Tahoma,sans-serif;
            }
            @media print { /* Стиль для печати */
            body {
                font: 20px Tahoma,sans-serif;
            }
            .not-print {
                display: none;
            }
            }
  </style>
    </head>
    <body> <!--onload="window.print();"-->
    <script language=javascript>

    </script>
    <div>
        <span>Номер поезда: <?php echo $_GET['train_num'];?></span>
    </div>
    <div>
        <span>Локомотив 1</span><br>
        <span>Номер локомотива: <?php echo $_GET['l_loco1_num'];?></span><br>
        <span>Машинист: <?php echo $_GET['l_loco1_driver1'];?></span><br>
        <span>Пом. машиниста: <?php echo $_GET['l_loco1_driver2'];?></span><br>
        <span>Кондуктор: <?php echo $_GET['l_loco1_conductor'];?></span><br>
    </div>
    <div>
        <span>Локомотив 2</span><br>
        <span>Номер локомотива: <?php echo $_GET['l_loco2_num'];?></span><br>
        <span>Машинист: <?php echo $_GET['l_loco2_driver1'];?></span><br>
        <span>Пом. машиниста: <?php echo $_GET['l_loco2_driver2'];?></span><br>
        <span>Кондуктор: <?php echo $_GET['l_loco2_conductor'];?></span><br>
    </div>
    <div style="width: 900px;">
        <span>Вагоны: 
        <?php 
            $l_cars_mas = explode("|", $_GET['l_cars']);
            foreach ($l_cars_mas as $value) {
                echo $value . ' ';
            }
        ?>
        </span>
    </div>
    <button class='not-print'onclick="window.print();;">Печать</button>

</body>
</html>