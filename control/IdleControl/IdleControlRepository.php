<?php
/**
 * IdleControlRepository.php
 *
 *
 * Подключение в data.php / router.php:
 *   require_once __DIR__ . '/control/IdleControlRepository.php';
 *   (new IdleControlRepository($conn, $auth))->handle($action, $_POST);
 */
class IdleControlRepository
{
    /** @var resource|\OCIConnection OCI8-соединение */
    private $conn;

    /** @var AuthClass */
    private AuthClass $auth;

    public function __construct($conn, AuthClass $auth)
    {
        $this->conn = $conn;
        $this->auth = $auth;
    }

    /**
     * вызывается из data.php
     */
    public function handle(string $action, array $post): void
    {
        switch ($action) {
            case 'get_idle_control_list':
                $this->getIdleControlList();
                break;
            case 'save_idle_control':
                $this->saveIdleControl();
                break;
            case 'delete_idle_control':
                $this->deleteIdleControl();
                break;
            case 'get_idle_reason_list':
                $this->getIdleReasonList();
                break;
        }
    }

    /**
     * Список записей контроля простоев
     * Хранимая процедура: xx_dislocation.get_idle_control_list(:bind1)
     * bind1 — JSON с фильтрами (car_number, is_excluded, date_from, date_to)
     */
    private function getIdleControlList(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'select * from table(xx_etw.xx_dislocation.get_idle_control_list(:bind1))'
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
     * Сохранение записи (INSERT / UPDATE через хранимую процедуру)
     * Хранимая процедура: xx_dislocation.save_idle_control(:bind1,:bind2,:bind3,:bind4)
     * bind1 — результат (out)
     * bind2 — user_id
     * bind3 — row_id (пусто = INSERT, заполнено = UPDATE)
     * bind4 — JSON с данными формы
     */
    private function saveIdleControl(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'begin :bind1 := xx_etw.xx_dislocation.save_idle_control(:bind2,:bind3,:bind4); end;'
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
     * Удаление записи (через хранимую процедуру)
     * Хранимая процедура: xx_dislocation.delete_idle_control(:bind1,:bind2,:bind3,:bind4)
     */
    private function deleteIdleControl(): void
    {
        $oci_request = oci_parse(
            $this->conn,
            'begin :bind1 := xx_etw.xx_dislocation.delete_idle_control(:bind2,:bind3,:bind4); end;'
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