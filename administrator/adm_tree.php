<?php
include('../connection.php');

function get_tree_with_stations (){
    $mas_tree = array();
    $result = null;
    function get_child($p_parent_id,$p_parent_type,$p_mas_tree){
        $result = null;
        foreach ($p_mas_tree as $node){
            if ($node['PARENT_ID']===$p_parent_id&&$node['PARENT_TYPE']===$p_parent_type){
                if ($node['TYPE']!=='station') {
                    $tree_Expand = 'tree_ExpandLeaf';
                } else {
                    $isRoot = 'tree_IsRoot';
                    $tree_Expand = 'tree_ExpandOpen';
                }
                
                $result .= '<li class="tree_Node '.$tree_Expand.' '.$isRoot.'" data-id="'.$node['ID'].'" data-type="'.$node['TYPE'].'">';
                $result .= '<div class="tree_Expand"></div>';
                if ($node['TYPE'] === 'railway') {
                    $result .= '<div class="tree_img tree_img_railway"></div>';
                } else if ($node['TYPE'] === 'point') {
                    $result .= '<div class="tree_img tree_img_point"></div>';
                }
                $result .= '<div class="tree_Content">'.$node['NAME'].'</div>';
                $result .= '<ul class="tree_Container">';
                //$result .= ($node['ID'].'|'.$node['TYPE'].'$');
                
                $result .=get_child($node['ID'],$node['TYPE'],$p_mas_tree);
                $result .= '</ul>';
            } 
        }
        return $result;
    }
    
    global $user;
    global $pwd;
    global $db;
    
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_stations_with_railways)');
    oci_execute($oci_request);

    
    while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($mas_tree, $tmp);
    }

    oci_close($conn);
    
    $result .= get_child('null','null',$mas_tree);
    
    echo $result;
}

