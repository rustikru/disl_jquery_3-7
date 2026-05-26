<?php
    session_start(); //Запускаем сессии

    include('../login.php');
    include('../connection.php');

    /*$content= file_get_contents('wagon_list.rtf');
    $content = str_replace('station_from','vodo',$content);
    
    if (ob_get_level()) {
      ob_end_clean();
    }
    // заставляем браузер показать окно сохранения файла
    header('Content-Description: File Transfer');
    header('Content-Type: application/rtf');
    header('Content-Disposition: attachment; filename=Натурный_лист.rtf');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . strlen($content));
    // читаем файл и отправляем его пользователю
    echo $content;*/

    function file_force_download($file,$p_file_name) {
      if (file_exists($file)) {
        // сбрасываем буфер вывода PHP, чтобы избежать переполнения памяти выделенной под скрипт
        // если этого не сделать файл будет читаться в память полностью!
        if (ob_get_level()) {
          ob_end_clean();
        }
        // заставляем браузер показать окно сохранения файла
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename='. $p_file_name . '.docx');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        // читаем файл и отправляем его пользователю
        if ($fd = fopen($file, 'rb')) {
          while (!feof($fd)) {
            print fread($fd, 1024);
          }
          fclose($fd);
        }
        exit;
      }
    }
    
    function get_req($p_req){
        $reg = '';
        $reg .= substr($p_req, 0, 1);
        for ($i2 = 1; $i2 < strlen($p_req); $i2++) {
            $reg .= '(<.*?>)*+' . substr($p_req, $i2, 1);
        }
        $reg = '#' . str_replace(array('#', '{', '[', ']', '}'), array('#', '{', '[', ']', '}'), $reg) . '#';
        
        return $reg;
    }

    $zip = new ZipArchive;
    if ($zip->open('wagon_list.docx') === TRUE) {
        $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        
        $content;
        $file_name;
        if ($_GET['report']=='DU'){
            $file_name = 'ДУ-1';
            $content='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

            $content.='<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" '
                                . 'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" '
                                . 'xmlns:o="urn:schemas-microsoft-com:office:office" '
                                . 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
                                . 'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" '
                                . 'xmlns:v="urn:schemas-microsoft-com:vml" '
                                . 'xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" '
                                . 'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
                                . 'xmlns:w10="urn:schemas-microsoft-com:office:word" '
                                . 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
                                . 'xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" '
                                . 'xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" '
                                . 'xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" '
                                . 'xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" '
                                . 'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">';
            $content.='<w:body>';
            $date_from = $_GET['date_from'];
            //echo $date_from;
            $content.='<w:p w:rsidR="00A60DA4" w:rsidRDefault="005E79AD"><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:t>'.substr($date_from, 0,2).'/'.substr($date_from, 3,2).' - '.substr($date_from, 8,2).'г. '.$_GET['train_num'].'</w:t></w:r></w:p>';
            $content.='<w:p w:rsidR="00A60DA4" w:rsidRDefault="005E79AD"><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:t>Выписка из ВУ - 14, ДУ - 1</w:t></w:r></w:p>';
            
            $oci_request = oci_parse($conn, 'begin xx_dislocation.add_cars_for_add_info_tbl(:bind1); xx_dislocation.return_child_add_info_bef; end;');
            OCIBindByName($oci_request, ":bind1", $_GET['cars']);
            oci_execute($oci_request);

            $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child_add_info)');
            oci_execute($oci_child);
            $j = 1;
            while ($car = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
                $content.='<w:p w:rsidR="00A60DA4" w:rsidRDefault="005E79AD"><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:t>'.$j.'. '.$car['ID'].' - '.$car['WEIGHT_DEP'].'</w:t></w:r></w:p>';

                $j+=1;
            }
            
            $content.='<w:p w:rsidR="00A60DA4" w:rsidRDefault="005E79AD"><w:pPr><w:spacing w:before="480" w:after="0"/></w:pPr><w:r><w:t>Сдали</w:t></w:r></w:p>';
            $content.='<w:p w:rsidR="00A60DA4" w:rsidRDefault="005E79AD"><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:t>ДСП - </w:t></w:r></w:p>';
            $content.='<w:p w:rsidR="00A60DA4" w:rsidRDefault="005E79AD"><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:t>Приёмосд. - </w:t></w:r></w:p>';
            $content.='<w:p w:rsidR="00A60DA4" w:rsidRDefault="005E79AD"><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:t>Осмотр. - </w:t></w:r></w:p>';
            
            $content.='</w:body>';
            $content.='</w:document>';
            //echo $content;
        }else{
            $file_name = 'ВУ-1';
            /*открываем наш шаблон для чтения (он находится вне документа)
            и помещаеем его содержимое в переменную $content*/
            $handle = fopen("document.xml", "r");
            $content = fread($handle, filesize("document.xml"));
            fclose($handle);
            /*Далее заменяем все что нам нужно например так */
            $content = preg_replace(get_req('{station_from}'), $_GET['station_from'], $content);
            $content = preg_replace(get_req('{station_to}'), $_GET['station_to'], $content);
            $content = preg_replace(get_req('{train_num}'), $_GET['train_num'], $content);

            $oci_request = oci_parse($conn, 'begin xx_dislocation.add_cars_for_add_info_tbl(:bind1); xx_dislocation.return_child_add_info_bef; end;');
            OCIBindByName($oci_request, ":bind1", $_GET['cars']);
            oci_execute($oci_request);

            $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child_add_info)');
            oci_execute($oci_child);
            
            
            //$all11 = 0;$all12 = 0;$all13 = 0;$all14 = 0;$all15 = 0;$all16 = 0;$all17 = 0;$all18 = 0;
            //$all21 = 0;$all22 = 0;$all23 = 0;$all24 = 0;$all25 = 0;$all26 = 0;$all27 = 0;$all28 = 0;
            //$all31 = 0;$all32 = 0;$all33 = 0;$all34 = 0;$all35 = 0;$all36 = 0;$all37 = 0;$all38 = 0;
            //$all41 = 0;$all42 = 0;$all43 = 0;$all44 = 0;$all45 = 0;$all46 = 0;$all47 = 0;$all48 = 0;
            $all = array ();
            for ($i=1;$i<=4;$i++){
                for ($j=1;$j<=8;$j++){
                    $all[$i][$j] = 0;
                }
            }
            $car_num = 1;
            while ($car = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
                if ($car['STATUS']!='Нерабочий парк'){
                    if ($car['WEIGHT_NET'] > 0){
                        $k = 1;
                        switch ($car['CAR_TYPE']) {
                            case 'КР':
                                $all[$k][1]++;
                                break;
                            case 'ПЛ':
                                $all[$k][2]++;
                                break;
                            case 'ПВ':
                                $all[$k][3]++;
                                $all13++;
                                break;
                            case 'ЦС':
                                $all[$k][4]++;
                                break;
                            case 'ФТГ':
                                $all[$k][6]++;$all[$k][5]++;
                                break;
                            case 'МВЗ':
                                $all[$k][7]++;$all[$k][5]++;
                                break;
                            default:
                                $all[$k][5]++;
                        }
                    }else{
                        $k = 2;
                        switch ($car['CAR_TYPE']) {
                            case 'КР':
                                $all[$k][1]++;
                                break;
                            case 'ПЛ':
                                $all[$k][2]++;
                                break;
                            case 'ПВ':
                                $all[$k][3]++;
                                $all13++;
                                break;
                            case 'ЦС':
                                $all[$k][4]++;
                                break;
                            case 'ФТГ':
                                $all[$k][6]++;$all[$k][5]++;
                                break;
                            case 'МВЗ':
                                $all[$k][7]++;$all[$k][5]++;
                                break;
                            default:
                                $all[$k][5]++;
                        }
                    }
                } else{
                    $k = 3;
                    switch ($car['CAR_TYPE']) {
                        case 'КР':
                            $all[$k][1]++;
                            break;
                        case 'ПЛ':
                            $all[$k][2]++;
                            break;
                        case 'ПВ':
                            $all[$k][3]++;
                            $all13++;
                            break;
                        case 'ЦС':
                            $all[$k][4]++;
                            break;
                        case 'ФТГ':
                            $all[$k][6]++;$all[$k][5]++;
                            break;
                        case 'МВЗ':
                            $all[$k][7]++;$all[$k][5]++;
                            break;
                        default:
                            $all[$k][5]++;
                    }
                }
                
                $cont_count = ($car['WEIGHT_NET'] > 0) ? $car['CONT_COUNT'].'/0' : '0/'.$car['CONT_COUNT'];
                
                $content = preg_replace(get_req('{num'.($car_num).'}'), $car['ID'], $content);
                $content = preg_replace(get_req('{net'.($car_num).'}'), $car['WEIGHT_NET'], $content);
                $content = preg_replace(get_req('{dep'.($car_num).'}'), $car['WEIGHT_DEP'], $content);
                $content = preg_replace(get_req('{freight'.($car_num).'}'), $car['FREIGHT_NAME'], $content);
                $content = preg_replace(get_req('{cont'.($car_num).'}'), $cont_count, $content);
                $car_num++;
            }

            for ($i = $car_num; $i <= 55; $i++){
                $content = preg_replace(get_req('{num'.($i).'}'), '', $content);
                $content = preg_replace(get_req('{net'.($i).'}'), '', $content);
                $content = preg_replace(get_req('{dep'.($i).'}'), '', $content);
                $content = preg_replace(get_req('{freight'.($i).'}'), '', $content);
                $content = preg_replace(get_req('{cont'.($i).'}'), '', $content);
            }
            
            for ($j=1;$j<=8;$j++){
                $all[4][$j] = $all[1][$j]+$all[2][$j]+$all[3][$j];
            }
            for ($i=1;$i<=4;$i++){
                for ($j=1;$j<=7;$j++){
                    $all[$i][8]+=$all[$i][$j];
                }
            }
            
            for ($i=1;$i<=4;$i++){
                for ($j=1;$j<=8;$j++){
                    $content = preg_replace(get_req('{all'.($i).($j).'}'), $all[$i][$j], $content);
                }
            }
            
        }

        
        
        oci_close($conn); 
        
        /*Удаляем имеющийся в архиве document.xml*/
        $zip->deleteName('word/document.xml');
        /*Пакуем созданный нами ранее и закрываем*/
        $zip->addFromString('word/document.xml',$content);
        $zip->close();
        $file_name.='_'.substr($_GET['date_from'], 0,10);
        file_force_download('wagon_list.docx',$file_name);
    }
?>