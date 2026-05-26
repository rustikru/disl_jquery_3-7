<?php
    $user = 'xx_etw';
    $pwd = 'xx_etw';
    $host = '10.0.0.173'; // (HOST=10.0.0.173,) TEST-1, (HOST=10.0.0.172,) TEST-0
    $port = '51521';
    $serviceName = 'PROD';
    $db = '(DESCRIPTION =
                    (ADDRESS = (PROTOCOL = TCP)(HOST = '.$host.')(PORT = '.$port.'))
                    (CONNECT_DATA =
                      (SERVICE_NAME = '.$serviceName.')
                    )
              )';
	
