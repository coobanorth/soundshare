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
            $message_to = $_POST["message_to"];
            $message_from = $_POST["message_from"];
            $message = $_POST["message"];

            $this->send_message($message_to, $message_from, $message, $mysqli);
        }

        //handles gets
        elseif ($method === 'GET') {

            //chat value
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

            //sender&reciever set
            elseif (isset($_GET["sender"]) && isset($_GET["receiver"])) {
                $sender = $_GET["sender"];
                $receiver = $_GET["receiver"];

                $this->get_SR_chat($mysqli, $sender, $receiver);
                exit();
            }

            //sender set
            elseif (isset($_GET["sender"])) {
                $sender = $_GET["sender"];

                $this->get_S_chat($mysqli, $sender);
                exit();
            }

            //receiver set
            elseif (isset($_GET["receiver"])) {
                $receiver = $_GET["receiver"];

                $this->get_R_chat($mysqli, $receiver);
                exit();
            }

            //get users name
            elseif (isset($_GET["userid-name"])) {
                $userid = $_GET["userid-name"];

                $this->get_name_from_userid($mysqli, $userid);
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
        $sql = "SELECT * FROM dm_chats ORDER BY dm_chat_timestamp ASC";
        $result = $mysqli->query($sql);

        $this->result_to_json($result);
    }

    //get chat based on sender and receiver
    private function get_SR_chat($mysqli, $sender, $receiver)
    {
        $sql = "SELECT * FROM dm_chats WHERE (dm_chat_sender = $sender AND dm_chat_receiver = $receiver) OR (dm_chat_sender = $receiver AND dm_chat_receiver = $sender) ORDER BY dm_chat_timestamp ASC";
        $result = $mysqli->query($sql);

        $this->result_to_json($result);
    }

    //get chat based on sender
    private function get_S_chat($mysqli, $sender)
    {
        $sql = "SELECT * FROM dm_chats WHERE dm_chat_sender = $sender ORDER BY dm_chat_timestamp ASC";
        $result = $mysqli->query($sql);

        $this->result_to_json($result);
    }

    //get chat based on receiver
    private function get_R_chat($mysqli, $receiver)
    {
        $sql = "SELECT * FROM dm_chats WHERE dm_chat_receiver = $receiver ORDER BY dm_chat_timestamp ASC";
        $result = $mysqli->query($sql);

        $this->result_to_json($result);
    }

    //get name based on userid
    private function get_name_from_userid($mysqli, $userid){
        $sql = "SELECT fname, lname FROM `users` WHERE user_id = $userid";
        $result = $mysqli->query($sql);

        $this->name_to_json($result);
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

private function name_to_json($result)
    {
        //if there is a result
        if ($result !== false) {
            //check if there is more than 1 row
            if ($result->num_rows > 0) {

                //creates json object
                $myObj = new stdClass();
                //creates chat array
                $name_array = array();

                while ($row = $result->fetch_row()) {
                    //creating each chat object
                    $resultclass = new stdClass();
                    //adding sql result array elements as parameters in the resultclass object
                    $resultclass->fname = $row[0];
                    $resultclass->lname = $row[1];
                    //adding object to the messages_array array
                    $name_array[] = $resultclass;
                }

                //setting chat parameter as the chat_array array
                $myObj->name = $name_array;
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



    //send message
    private function send_message($message_to, $message_from, $message, $mysqli)
    {
        $message = trim($message);
        $stmt = $mysqli->prepare(
            "INSERT INTO dm_chats 
        (dm_chat_sender, dm_chat_receiver, dm_chat_message)
        VALUES (?, ?, ?)"
        );

        if (!$stmt) {
            http_response_code(500);
            return;
        }

        $stmt->bind_param(
            "sss",
            $message_from,
            $message_to,
            $message
        );

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["status" => "success"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error"]);
        }

        $stmt->close();
    }







}

$soundshare_api = new MyAPI();