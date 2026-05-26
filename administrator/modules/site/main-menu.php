<?php

	function createMenu($parent, $menu)
	{
		$html = "";
		$li_class = "";
		if (isset($menu['parents'][$parent])) {
			foreach ($menu['parents'][$parent] as $itemId) {
				if (!isset($menu['parents'][$itemId])) {
					$li_class ='';
					if ($menu['items'][$itemId]['MENU_TYPE'] == 'heading') {
						$li_class =" class = 'menu-heading'";
					}
					$aTarget = ($menu['items'][$itemId]['PATHS_URL']=='#')?'':"target='_blank'";
					$html .= "<li >
							 <a ".$li_class." href='" . $menu['items'][$itemId]['PATHS_URL'] . "'".$aTarget." >" . $menu['items'][$itemId]['MENU_NAME'] . "</a>
						 </li>";
				}
				if (isset($menu['parents'][$itemId])) {
					$html .= "<li>
					  <a href='". $menu['items'][$itemId]['PATHS_URL'] . "' >" . $menu['items'][$itemId]['MENU_NAME'] .  "</a>";
					$html .= '<ul>';
					$html .= createMenu($itemId, $menu);
					$html .= '</ul>';

					$html .= "</li>";
				}
			}
		}
		return $html;
	}
	function get_main_menu ($p_user_id, $p_station_id, $p_part_site){
		
		$conn = oci_connect($GLOBALS['user'],$GLOBALS['pwd'],$GLOBALS['db'],"AL32UTF8");
		if (!$conn) {
				$e = oci_error();
				trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
		}
		$menus = array(
			'items' => array(),
			'parents' => array()
		);
		
		$arrChild = array();
		$oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_main_menu(:bind1,:bind2,:bind3))');
		
		OCIBindByName($oci_child, ":bind1", $p_user_id);
		OCIBindByName($oci_child, ":bind2", $p_station_id);
		OCIBindByName($oci_child, ":bind3", $p_part_site);
		
		oci_execute($oci_child);
		
		while ($items = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {

			$menus['items'][$items['ID']] = $items;		
			$menus['parents'][$items['PARENT_ID']][] = $items['ID'];

		}
		oci_close($conn);
		echo createMenu(-1, $menus);
	}
	
?>