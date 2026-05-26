<?php
include('connection.php');
class helper {    
    public function returnStations (){
        global $user;
        global $pwd;
        global $db;
        
        $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.returnStations())');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        return $arrChild;
    }
}

