<?php
include('connection.php');
class AuthClass {
    /**
     * Проверяет, авторизован пользователь или нет
     * Возвращает true если авторизован, иначе false
     * @return boolean 
     */
    public function isAuth() {
        if (isset($_SESSION["is_auth"])) { //Если сессия существует
            return $_SESSION["is_auth"]; //Возвращаем значение переменной сессии is_auth (хранит true если авторизован, false если не авторизован)
        }
        else return false; //Пользователь не авторизован, т.к. переменная is_auth не создана
    }
    
    public function isAuthAdmin() {
        if (isset($_SESSION["is_auth_admin"])) { //Если сессия существует
            return $_SESSION["is_auth_admin"]; //Возвращаем значение переменной сессии is_auth (хранит true если авторизован, false если не авторизован)
        }
        else return false; //Пользователь не авторизован, т.к. переменная is_auth не создана
    }
    
    /**
     * Авторизация пользователя
     * @param string $login
     * @param string $passwors 
     */
    public function auth($login, $password) {
        global $user;
        global $pwd;
        global $db;
	
        $err = array();
        if(!preg_match("/^[a-zA-Z0-9_]+$/",$login)){
                $err[] = "Логин может состоять только из букв английского алфавита и цифр";
        } 
		else {
            $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
            if (!$conn) {
                    $e = oci_error();
                    trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
            }

            $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.return_user_data_new(:bind1))');
            OCIBindByName($oci_request, ":bind1", $login);
            oci_execute($oci_request);
            
			while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS)) {
				if ($tmp['PASSWORD'] === md5($password)) {
				
					$_SESSION['is_auth'] = true; //Делаем пользователя авторизованным
					$_SESSION['login'] = $login; //Записываем в сессию логин пользователя
					$_SESSION['user_id'] = $tmp['USER_ID'];
					$_SESSION['full_name'] = $tmp['FULL_NAME'];
					$_SESSION['flag_change_pwd'] = $tmp['FLAG_CHANGE_PWD'];
					$_SESSION['enterprise'] = $tmp['ENTERPRISE'];
					$_SESSION['test'] = 'test';
					$_SESSION["".$tmp['RIGHTS_CODE'].""] = $tmp['RIGHTS_VAL'];
					if ($tmp['RIGHTS_VAL'] == 'Y' && $tmp['RIGHTS_CODE'] == 'administrator'){
							$_SESSION['is_auth_admin'] = true;
						}
					
				}
				else { //Логин и пароль не подошел
					$_SESSION["is_auth"] = false;
					$_SESSION['is_auth_admin'] = false;
					
				}
			}
			oci_close($conn);
			
			if ($_SESSION['is_auth']){
				return true; 
			}else {
				return false; 
			}
			
			
        }
    }
    
    public function change_pwd($new_pwd) {
        global $user;
        global $pwd;
        global $db;
	
        $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
        if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $v_new_pwd = md5($new_pwd);
        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.change_pwd(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result,100);
        oci_bind_by_name($oci_request, ":bind2", $_SESSION['login']);
        oci_bind_by_name($oci_request, ":bind3", $v_new_pwd);
        oci_execute($oci_request);

        oci_close($conn);
        
        if ($result==='done'){
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * Метод возвращает логин авторизованного пользователя 
     */
    public function getLogin() {
        if ($this->isAuth()) { //Если пользователь авторизован
            return $_SESSION["login"]; //Возвращаем логин, который записан в сессию
        }
    }
    
    public function getUserId() {
        if ($this->isAuth()) { //Если пользователь авторизован
            return $_SESSION["user_id"]; //Возвращаем логин, который записан в сессию
        }
    }
    
    public function getFullName() {
        if ($this->isAuth()) { //Если пользователь авторизован
            return $_SESSION['full_name']; 
        }
    }
	
	public function getAdministrator() {
        if ($this->isAuth()) { //Если пользователь авторизован
            return $_SESSION['administrator']; 
        }
    }
    
    public function get_flag_change_pwd() {
        if ($this->isAuth()) { //Если пользователь авторизован
            return $_SESSION['flag_change_pwd']; 
        }
    }
    
    public function getStation() {
        if ($this->isAuth()) { //Если пользователь авторизован
            return $_SESSION["station"]; 
        }
    }
    
    public function getRights() {
        if ($this->isAuth()) { //Если пользователь авторизован
            global $user;
			global $pwd;
			global $db;
			$mas = array();
			
			$conn = oci_connect($user,$pwd,$db,"AL32UTF8");
            if (!$conn) {
                    $e = oci_error();
                    trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
            }

            $oci_request = oci_parse($conn, 'select lower(x.rights_code) as rights_code from table(xx_dislocation.get_rights_list()) x');
            //OCIBindByName($oci_request, ":bind1", $login);
            oci_execute($oci_request);
			while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS)) {
				$mas[$tmp['RIGHTS_CODE']] = $_SESSION["".$tmp['RIGHTS_CODE'].""];
			}
			return $mas; 
        }
    }
    
    public function getStationId() {
        if ($this->isAuth()) { //Если пользователь авторизован
            if (isset($_SESSION["station_id"])) {
				return $_SESSION["station_id"];
			}
        }
    }
    
    public function setStation($p_station_id,$p_station) {
        if ($this->isAuth()) { //Если пользователь авторизован
            $_SESSION['station_id'] = $p_station_id;
            $_SESSION['station'] = $p_station;
        }
    }
    
    public function get_enterprise() {
        if ($this->isAuth()) { //Если пользователь авторизован
            return $_SESSION["enterprise"]; //Возвращаем логин, который записан в сессию
        }
    }    
    
    public function out() {
        $_SESSION = array(); //Очищаем сессию
        session_destroy(); //Уничтожаем
        header("location: /index.php");
    }
}