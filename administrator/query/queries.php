<?php
    function getStations($conn) {
        $mas_stations = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.getStations)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($mas_stations, $tmp);
        }
        
        return $mas_stations;
    }

    // Функция для получения подразделений
    function getDivisions($conn) {
        $mas_divisions = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_divisions)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($mas_divisions, $tmp);
        }
        return $mas_divisions;
    }

    // Функция для получения предприятий
    function getEnterprise($conn) {
        $mas_enterprise = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_enterprise)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($mas_enterprise, $tmp);
        }
        return $mas_enterprise;
    }

    // Функция для получения учетных данных
    function getCredentials($conn) {
        $mas_credential = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_credentials)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($mas_credential, $tmp);
        }
        return $mas_credential;
    }

    // Функция для получения учетных данных
    function getRightsList($conn) {
        $mas_rights_list = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_etw.xx_dislocation.get_rights_list)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($mas_rights_list, $tmp);
        }
        return $mas_rights_list;
    }
?>
