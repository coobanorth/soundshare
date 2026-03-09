<?php

class MyAPI
{

    public $mysqli;

    //construct method which is called when a new instance of the api is made
    function __construct()
    {
        //sets sqli to throw an exception for errors instead of outputting error message
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
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
            if (isset($_GET["chat"])) {
                $chat = $_GET["chat"];

                // Check for the keyword 'all'
                if ($chat === "all") {
                    $this->get_all_chats($mysqli);
                    exit();
                }

                // Invalid input
                http_response_code(400);
                exit();
            }

            //if not specified throw error
            else {
                http_response_code(400);
            }
        }
    }

    //get all chats
    private function get_all_chats($mysqli)
    {
        $sql = "SELECT * FROM dm_chats ORDER BY dm_chat_timestamp DESC";
        $result = $mysqli->query($sql);

        $this->result_to_json($result);
    }

    private function result_to_json($result)
    {
        //if there is a result
        if ($result !== false) {
            //check if there is more than 1 row
            if ($result->num_rows > 0) {

                //creates json object
                $myObj = new stdClass();
                //creates chat array
                $chat_array = array();

                while ($row = $result->fetch_row()) {
                    //creating each chat object
                    $resultclass = new stdClass();
                    //adding sql result array elements as parameters in the resultclass object
                    $resultclass->dm_chat_id = (int) $row[0];
                    $resultclass->dm_chat_sender = $row[1];
                    $resultclass->dm_chat_receiver = $row[2];
                    $resultclass->dm_chat_message = $row[3];
                    $resultclass->dm_chat_timestamp = $row[4];
                    //adding object to the messages_array array
                    $chat_array[] = $resultclass;
                }

                //setting chat parameter as the chat_array array
                $myObj->chat = $chat_array;
                $myJSON = json_encode($myObj, JSON_PRETTY_PRINT);
                echo $myJSON;

                //free memory from storing result set
                $result->free_result();
            } else {
                http_response_code(204);
            }
        } else {
            http_response_code(404);
        }
    }

}

$soundshare_api = new MyAPI();
?>