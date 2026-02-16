<?php

class MyAPI
{

    public $mysqli;

    //construct method which is called when a new instance of the api is made
    function __construct()
    {
        //sets sqli to throw an exception for errors instead of outputting error message
        mysqli_report(MYSQLI_REPORT_STRICT | MYSQLI_REPORT_STRICT);
        //sets HTTP header with JSON MIME type
        header('content-type: application/json');
        try {
            //creates connection to database
            $this->mysqli = new mysqli("165.227.235.122", "cn483_soundshare_admin", "soundshare_admin", "cn483_soundshare");
        } catch (Exception $e) {
            //error code for failed database connection
            http_response_code(500);
            exit();
        }
        //source_sql function with the users requested source and the mysqli connection
        $this->handle_request($this->mysqli);
    }

    //destruct method which is called at the very end which closes the mysqli connection
    function __destruct()
    {
        $this->mysqli->close();
    }

    public function handle_request($mysqli)
    {
        $method = $_SERVER['REQUEST_METHOD'];

        //handles posts
        if ($method === 'POST') {

        } 
        
        //handles gets
        elseif ($method === 'GET') {
        }

        //if not specified throw error
        else{
            http_response_code(405);
        }
    }

}

$soundshare_api = new MyAPI();
?>