<?php

	function getBaseUrl()
	{
		$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
		$host = $_SERVER['HTTP_HOST'];
		
		return $protocol . $host . '/';
	}

	function createMenu($parent, $menu)
	{
		$html = "";
		$baseUrl = getBaseUrl(); // Получаем базовый URL
		if (isset($menu['parents'][$parent])) {
			foreach ($menu['parents'][$parent] as $itemId) {
				$pathUrl = $menu['items'][$itemId]['PATHS_URL'];
				
				// Если путь относительный, добавляем базовый URL
				if ($pathUrl !== '#' && !preg_match('~^(http|https)://~', $pathUrl)) {
					$pathUrl = $baseUrl . '/' . ltrim($pathUrl, '/');
				}
				
				// Удаляем лишние обратные слэши
				$pathUrl = str_replace('\\', '', $pathUrl);

				if (!isset($menu['parents'][$itemId])) {
					$li_class ='';
					if ($menu['items'][$itemId]['MENU_TYPE'] == 'heading') {
						$li_class =" class='menu-heading'";
					}
					$aTarget = ($pathUrl == '#') ? '' : " target='_blank'";
					$html .= "<li>
								<a ".$li_class." href='" . htmlspecialchars($pathUrl, ENT_QUOTES) . "'" . $aTarget . ">" . $menu['items'][$itemId]['MENU_NAME'] . "</a>
							  </li>";
				}
				if (isset($menu['parents'][$itemId])) {
					$html .= "<li>
						<a href='" . htmlspecialchars($pathUrl, ENT_QUOTES) . "'>" . $menu['items'][$itemId]['MENU_NAME'] . "</a>";
					$html .= '<ul>';
					$html .= createMenu($itemId, $menu);
					$html .= '</ul>';
					$html .= "</li>";
				}
			}
		}
		return $html;
	}

	function get_main_menu($p_user_id, $p_station_id)
	{
		$conn = oci_connect($GLOBALS['user'], $GLOBALS['pwd'], $GLOBALS['db'], "AL32UTF8");
		if (!$conn) {
			$e = oci_error();
			trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
		}
		$menus = array(
			'items' => array(),
			'parents' => array()
		);

		$oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_main_menu(:bind1,:bind2))');
		OCIBindByName($oci_child, ":bind1", $p_user_id);
		OCIBindByName($oci_child, ":bind2", $p_station_id);

		oci_execute($oci_child);

		while ($items = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
			$menus['items'][$items['ID']] = $items;
			$menus['parents'][$items['PARENT_ID']][] = $items['ID'];
		}
		oci_close($conn);
		echo createMenu(-1, $menus);
	}
?>
