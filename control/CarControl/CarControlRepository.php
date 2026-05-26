<?php
/**
 * CarControlRepository.php
 *
 * Репозиторий модуля "Контроль вагонов".
 * SQL и вызовы хранимых процедур перенесены из data.php без изменений.
 *
 * Использование в data.php:
 *   require_once __DIR__ . '/control/CarControlRepository.php';
 *   $repo = new CarControlRepository($conn, $auth);
 *   $repo->handle($_POST['ajax_action'], $_POST);
 */
class CarControlRepository
{
    /** @var resource OCI8-соединение */
    private $conn;

    /** @var AuthClass */
    private AuthClass $auth;

    public function __construct($conn, AuthClass $auth)
    {
        $this->conn = $conn;
        $this->auth = $auth;
    }

    /**
     * Диспетчер — вызывается из data.php
     */
    public function handle(string $action, array $post): void
    {
        switch ($action) {
            case 'get_car_color_select':
                $this->getCarColorSelect();
                break;
            case 'get_control_code_cause':
                $this->getControlCodeCause();
                break;
            case 'get_control_standart':
                $this->getControlStandart();
                break;
            case 'save_control_car':
                $this->saveControlCar();
                break;
            case 'delete_control_car':
                $this->deleteControlCar();
                break;
            case 'get_idle_reason_list':
                $this->getIdleReasonList();
                break;    
        }
    }

    /**
     * Справочник цветов вагонов
     * Оригинал: get_car_color_select (строки 3997-4017 data.php)
     */
    private function getCarColorSelect(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'select * from table(xx_dislocation.get_car_color_select(:bind1,:bind2))'
        );
        $userId = $this->auth->getUserId();
        $params = filter_input(INPUT_POST, 'params');
        oci_bind_by_name($oci_request, ':bind1', $userId);
        oci_bind_by_name($oci_request, ':bind2', $params);
        oci_execute($oci_request);

        $arrResult = [];
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
            $arrResult[] = $tmp;
        }

        echo json_encode($arrResult);
    }

    /**
     * Справочник кодов причин
     * Оригинал: get_control_code_cause 
     */
    private function getControlCodeCause(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'select * from table(xx_dislocation.get_control_code_cause(:bind2))'
        );
        $params = filter_input(INPUT_POST, 'params');
        oci_bind_by_name($oci_request, ':bind2', $params);
        oci_execute($oci_request);

        $arrResult = [];
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
            $arrResult[] = $tmp;
        }

        echo json_encode($arrResult);
    }

    private function getIdleReasonList(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'select * from table(xx_etw.xx_dislocation.get_idle_reason_list())'
        );
        oci_execute($oci_request);

        $arrResult = [];
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
            $arrResult[] = $tmp;
        }

        echo json_encode($arrResult);
    }

    /**
     * Список записей контроля
     * Оригинал: get_control_standart (строки 3700-3719 data.php)
     */
    private function getControlStandart(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'select * from table(xx_dislocation.get_control_standart(:bind1))'
        );
        $params = filter_input(INPUT_POST, 'params');
        oci_bind_by_name($oci_request, ':bind1', $params);
        oci_execute($oci_request);

        $arrResult = [];
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
            $arrResult[] = $tmp;
        }

        echo json_encode($arrResult);
    }

    /**
     * Сохранение записи контроля (INSERT/UPDATE через хранимую процедуру)
     * Оригинал: save_control_car (строки 4679-4697 data.php)
     */
    private function saveControlCar(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'begin :bind1 := xx_dislocation.save_control_car(:bind2,:bind3,:bind4); end;'
        );
        $result  = null;
        $userId  = $this->auth->getUserId();
        $rowId   = filter_input(INPUT_POST, 'row_id');
        $addData = filter_input(INPUT_POST, 'add_data');

        oci_bind_by_name($oci_request, ':bind1', $result, 10000);
        oci_bind_by_name($oci_request, ':bind2', $userId);
        oci_bind_by_name($oci_request, ':bind3', $rowId);
        oci_bind_by_name($oci_request, ':bind4', $addData);

        oci_execute($oci_request);

        echo $result;
    }

    /**
     * Удаление записи контроля (через хранимую процедуру)
     * Оригинал: delete_control_car (строки 3721-3739 data.php)
     */
    private function deleteControlCar(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'begin :bind1 := xx_dislocation.delete_control_car(:bind2,:bind3,:bind4); end;'
        );
        $result  = null;
        $userId  = $this->auth->getUserId();
        $rowId   = filter_input(INPUT_POST, 'row_id');
        $addData = filter_input(INPUT_POST, 'add_data');

        oci_bind_by_name($oci_request, ':bind1', $result, 10000);
        oci_bind_by_name($oci_request, ':bind2', $userId);
        oci_bind_by_name($oci_request, ':bind3', $rowId);
        oci_bind_by_name($oci_request, ':bind4', $addData);

        oci_execute($oci_request);

        echo $result;
    }
}