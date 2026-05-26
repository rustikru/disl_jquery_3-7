<div id="add_btn_content" class="add-btn-content" style="display: none;">
    <?php
         /**
             * Функция для создания HTML-кнопки
             *
             * @param string $id        ID кнопки.
             * @param string $class     CSS-класс кнопки.
             * @param string $value     Текст на кнопке.
             * @param string $onclick   JavaScript-функция, вызываемая при нажатии.
             * @param string $size      Размер кнопки (опционально).
             * @return string           HTML-код кнопки.
             */
        function createButton($id, $class, $value, $onclick, $size = '') {
                
            
            $sizeAttr = $size ? 'size="' . htmlspecialchars($size, ENT_QUOTES) . '" ' : '';
                
                return '<input ' .
                    'id="' . htmlspecialchars($id, ENT_QUOTES) . '" ' .
                    'class="' . htmlspecialchars($class, ENT_QUOTES) . '" ' .
                    'type="button" ' .
                    $sizeAttr .
                    'value="' . htmlspecialchars($value, ENT_QUOTES) . '" ' .
                    'onclick="' . htmlspecialchars($onclick, ENT_QUOTES) . '">';
        }
        function get_modules_site($p_user_id, $p_station_id, $p_modules_code){
            
            $conn = oci_connect($GLOBALS['user'], $GLOBALS['pwd'], $GLOBALS['db'], "AL32UTF8");
            
            if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
            }
            $modules_site = array();
            $oci_stm = oci_parse($conn, 'select * from table(xx_etw.xx_disl_test.get_modules_site(:bind1,:bind2,:bind3))');
            oci_bind_by_name($oci_stm, ":bind1", $p_user_id);
            oci_bind_by_name($oci_stm, ":bind2", $p_station_id);
            oci_bind_by_name($oci_stm, ":bind3", $p_modules_code);
            
            oci_execute($oci_stm);
            
            while ($tmp = oci_fetch_array($oci_stm, OCI_ASSOC+OCI_RETURN_NULLS)) {
                array_push($modules_site, $tmp);
            }
            oci_close($conn);
            
            return $modules_site;
        }

        $modules_site = get_modules_site($auth->getUserId(), $auth->getStationId(),'add_btn_content');   
        
        foreach ($modules_site as $button) {
            echo createButton (
                $button['MODULE_ID'], $button['MODULE_CLASS'], $button['MODULE_NAME'], $button['MODULE_EVENT'], $button['MODULE_SIZE']
            );
        }
    ?>
</div>