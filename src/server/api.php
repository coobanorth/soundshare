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
            //SEND MESSAGE
            if (isset($_POST["room_id"]) && isset($_POST["message_from"]) && isset($_POST["message"])) {
                $room_id = $_POST["room_id"];
                $message_from = $_POST["message_from"];
                $message = $_POST["message"];

                if (trim($_POST['message']) === '') {
                    exit("Invalid message");
                }

                $this->send_message($room_id, $message_from, $message, $mysqli);
            }
            //SEND RECORDED AUDIO
            elseif (isset($_POST['room_id']) && isset($_POST['message_from']) && isset($_FILES['audio'])) {
                $room_id = $_POST['room_id'];
                $message_from = $_POST['message_from'];

                $uploadDir = "uploads/audio/";

                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $fileName = time() . "_" . basename($_FILES["audio"]["name"]);
                $filePath = $uploadDir . $fileName;

                if (move_uploaded_file($_FILES["audio"]["tmp_name"], $filePath)) {

                    $this->send_message($room_id, $message_from, $filePath, $mysqli);

                } else {
                    http_response_code(500);
                    echo json_encode(["status" => "file upload failed"]);
                }

                exit;

            }

            //CREATE NEW CHAT ROOM
            elseif (isset($_POST['action'])) {

                $room_name = $_POST["room_name"];
                $room_creator = $_POST["room_creator"];
                $users = $_POST["users"];

                $this->new_room($room_name, $room_creator, $users, $mysqli);
            }
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

            //GET REQUEST FOR MESSAGES IN A ROOM
            elseif (isset($_GET["room"])) {
                $room_id = $_GET["room"];

                $this->get_room_messages($mysqli, $room_id);
            }

            //GET REQUEST FOR ROOMS A USER IS IN
            elseif (isset($_GET["user_room"])) {
                $user_id = $_GET["user_room"];

                $this->get_users_rooms($mysqli, $user_id);
            }

            //GET ROOM NAME
            elseif (isset($_GET["room_name"])) {
                $room_name = $_GET["room_name"];

                $this->get_room_name($mysqli, $room_name);
            }

            //GET ALL USERS
            elseif (isset($_GET["get_users"])) {
                $this->get_users($mysqli);
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

            //user set
            elseif (isset($_GET["user"])) {
                $user = $_GET["user"];

                $this->get_user_chats($mysqli, $user);
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
        $sql = "SELECT 
    dm_chat_id AS id,
    dm_chat_sender AS sender,
    dm_chat_receiver AS receiver,
    dm_chat_message AS content,
    dm_chat_timestamp AS timestamp,
    'chat' AS type
FROM dm_chats
WHERE 
    (dm_chat_sender = $sender AND dm_chat_receiver = $receiver)
    OR 
    (dm_chat_sender = $receiver AND dm_chat_receiver = $sender)

UNION ALL

SELECT 
    dm_audio_id AS id,
    dm_audio_sender AS sender,
    dm_audio_receiver AS receiver,
    dm_audio_audio AS content,
    dm_audio_timestamp AS timestamp,
    'audio' AS type
FROM dm_audio
WHERE 
    (dm_audio_sender = $sender AND dm_audio_receiver = $receiver)
    OR 
    (dm_audio_sender = $receiver AND dm_audio_receiver = $sender)

ORDER BY timestamp ASC;";
        $result = $mysqli->query($sql);

        $this->sr_result_to_json($result);
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

    //get all chats where user is sender or receiver
    private function get_user_chats($mysqli, $user)
    {
        $sql = "SELECT * FROM dm_chats WHERE dm_chat_receiver = $user OR dm_chat_sender = $user ORDER BY dm_chat_timestamp ASC;";
        $result = $mysqli->query($sql);

        $this->result_to_json($result);
    }

    //get name based on userid
    private function get_name_from_userid($mysqli, $userid)
    {
        $sql = "SELECT fname, lname FROM `users` WHERE user_id = $userid";
        $result = $mysqli->query($sql);

        $this->name_to_json($result);
    }


    //MESSAGES IN A ROOM
    private function get_room_messages($mysqli, $room_id)
    {
        $sql = "SELECT 
    m.message_id,
    m.room_id,
    m.message_sender,
    CONCAT(u.fname, ' ', u.lname) AS sender_name,
    m.contents,
    m.message_timestamp
FROM messages m
JOIN users u ON m.message_sender = u.user_id
WHERE m.room_id = $room_id
ORDER BY m.message_timestamp ASC;";
        $result = $mysqli->query($sql);

        $this->messages_to_json($result);
    }

    //ROOMS A USER IS IN
    private function get_users_rooms($mysqli, $user_id)
    {
        $sql = "SELECT room_id FROM room_members WHERE user_id = $user_id";
        $result = $mysqli->query($sql);

        $this->users_rooms_to_json($result);
    }

    //ROOM NAME
    private function get_room_name($mysqli, $room_id)
    {
        $sql = "SELECT room_name FROM chat_rooms WHERE room_id = $room_id";
        $result = $mysqli->query($sql);

        $this->room_name_to_json($result);
    }

    //CREATE A NEW ROOM
    private function new_room($room_name, $room_creator, $users, $mysqli)
    {
        // 1. Create room
        $stmt = $mysqli->prepare("
        INSERT INTO chat_rooms (room_name, room_creator)
        VALUES (?, ?)
    ");

        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $mysqli->error]);
            return;
        }

        $stmt->bind_param("ss", $room_name, $room_creator);

        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $stmt->error]);
            return;
        }

        $room_id = $mysqli->insert_id;
        $stmt->close();

        // 2. Add creator as member (option al but recommended)
        $stmt = $mysqli->prepare("INSERT INTO room_members (room_id, user_id) VALUES (?, ?)");

        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $mysqli->error]);
            return;
        }

        foreach ($users as $user_id) {
            $stmt->bind_param("ii", $room_id, $user_id);

            if (!$stmt->execute()) {
                http_response_code(500);
                echo json_encode([
                    "status" => "error",
                    "message" => $stmt->error
                ]);
                return;
            }
        }

        $stmt->close();

        // 3. success response
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "room_id" => $room_id
        ]);
    }

    //GET USERS
    private function get_users($mysqli)
    {
        $sql = "SELECT user_id, fname, lname FROM users";
        $result = $mysqli->query($sql);

        //if there is a result
        if ($result !== false) {
            //check if there is more than 1 row
            if ($result->num_rows > 0) {

                //creates json object
                $myObj = new stdClass();
                //creates chat array
                $users = array();

                while ($row = $result->fetch_row()) {
                    //creating each chat object
                    $resultclass = new stdClass();
                    //adding sql result array elements as parameters in the resultclass object
                    $resultclass->user_id = (int) $row[0];
                    $resultclass->fname = $row[1];
                    $resultclass->lname = $row[2];
                    //adding object to the messages_array array
                    $users[] = $resultclass;
                }

                //setting chat parameter as the chat_array array
                $myObj->users = $users;
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



    private function users_rooms_to_json($result)
    {
        //if there is a result
        if ($result !== false) {
            //check if there is more than 1 row
            if ($result->num_rows > 0) {

                //creates json object
                $myObj = new stdClass();
                //creates chat array
                $rooms_array = array();

                while ($row = $result->fetch_row()) {
                    //creating each chat object
                    $resultclass = new stdClass();
                    //adding sql result array elements as parameters in the resultclass object
                    $resultclass->room_id = (int) $row[0];
                    //adding object to the messages_array array
                    $rooms_array[] = $resultclass;
                }

                //setting chat parameter as the chat_array array
                $myObj->rooms = $rooms_array;
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

    private function messages_to_json($result)
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
                    $resultclass->message_id = (int) $row[0];
                    $resultclass->room_id = $row[1];
                    $resultclass->message_sender = $row[2];
                    $resultclass->sender_name = $row[3];
                    $resultclass->contents = $row[4];
                    $resultclass->message_timestamp = $row[5];
                    //adding object to the messages_array array
                    $chat_array[] = $resultclass;
                }

                //setting chat parameter as the chat_array array
                $myObj->messages = $chat_array;
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

    private function sr_result_to_json($result)
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
                    $resultclass->id = (int) $row[0];
                    $resultclass->sender = $row[1];
                    $resultclass->receiver = $row[2];
                    $resultclass->content = $row[3];
                    $resultclass->timestamp = $row[4];
                    $resultclass->type = $row[5];
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

    private function room_name_to_json($result)
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
                    $resultclass->room_name = $row[0];
                    //adding object to the messages_array array
                    $name_array[] = $resultclass;
                }

                //setting chat parameter as the chat_array array
                $myObj->room_name = $name_array;
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
    private function send_message($room_id, $message_from, $message, $mysqli)
    {
        $message = trim($message);
        $stmt = $mysqli->prepare(
            "INSERT INTO messages 
        (room_id, message_sender, contents)
        VALUES (?, ?, ?)"
        );

        if (!$stmt) {
            http_response_code(500);
            return;
        }

        $stmt->bind_param(
            "sss",
            $room_id,
            $message_from,
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

    //send message
    private function send_audio($message_to, $message_from, $audio_path, $mysqli)
    {
        $stmt = $mysqli->prepare(
            "INSERT INTO dm_audio 
        (dm_audio_sender, dm_audio_receiver, dm_audio_audio)
        VALUES (?, ?, ?)"
        );

        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["status" => "db error"]);
            return;
        }

        $stmt->bind_param(
            "sss",
            $message_from,
            $message_to,
            $audio_path
        );

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "path" => $audio_path
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "insert failed"]);
        }

        $stmt->close();
    }







}

$soundshare_api = new MyAPI();