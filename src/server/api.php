<?php
class MyAPI
{
    private $mysqli;

    public function __construct()
    {
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        header('Content-Type: application/json');

        try {
            $this->mysqli = new mysqli(
                "165.227.235.122",
                "cn483_soundshare_admin",
                "soundshare_admin",
                "cn483_soundshare"
            );
        } catch (Exception $e) {
            http_response_code(500);
            exit(json_encode(["error" => "Database connection failed"]));
        }

        $this->handle_request();
    }

    public function __destruct()
    {
        if ($this->mysqli) {
            $this->mysqli->close();
        }
    }

    private function handle_request()
    {
        switch ($_SERVER['REQUEST_METHOD']) {

            case 'POST':
                $this->handle_post();
                break;

            case 'GET':
                $this->handle_get();
                break;

            default:
                http_response_code(405);
        }
    }

    // ========================= POST =========================
    private function handle_post()
    {
        // ACTION-BASED ROUTING
        if (isset($_POST['action'])) {

            switch ($_POST['action']) {

                case 'create_room':
                    $this->create_room(
                        $_POST["room_name"],
                        $_POST["room_creator"],
                        $_POST["users"]
                    );
                    break;

                case 'create_user':
                    $this->create_user(
                        $_POST["fname"],
                        $_POST["lname"],
                        $_POST["email"],
                        $_POST["password"]
                    );
                    break;

                case 'login':
                    $this->login_user(
                        $_POST["email"],
                        $_POST["password"]
                    );
                    break;

                default:
                    http_response_code(400);
                    echo json_encode(["error" => "Invalid action"]);
            }

            return;
        }

        // SEND TEXT MESSAGE
        if (isset($_POST["room_id"], $_POST["message_from"], $_POST["message"])) {

            $message = trim($_POST["message"]);
            if ($message === '') {
                http_response_code(400);
                exit(json_encode(["error" => "Empty message"]));
            }

            $this->send_message($_POST["room_id"], $_POST["message_from"], $message);
        }

        // SEND AUDIO
        elseif (isset($_POST['room_id'], $_POST['message_from'], $_FILES['audio'])) {

            $uploadDir = "uploads/audio/";
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileName = time() . "_" . basename($_FILES["audio"]["name"]);
            $filePath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES["audio"]["tmp_name"], $filePath)) {
                $this->send_message($_POST['room_id'], $_POST['message_from'], $filePath);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Upload failed"]);
            }
        } else {
            http_response_code(400);
        }
    }

    // ========================= GET =========================
    private function handle_get()
    {
        if (isset($_GET["room"])) {
            $this->get_room_messages($_GET["room"]);
        } elseif (isset($_GET["user_room"])) {
            $this->get_user_rooms($_GET["user_room"]);
        } elseif (isset($_GET["room_name"])) {
            $this->get_room_name($_GET["room_name"]);
        } elseif (isset($_GET["get_users"])) {
            $this->get_users();
        } elseif (isset($_GET["userid-name"])) {
            $this->get_user_name($_GET["userid-name"]);
        } else {
            http_response_code(400);
        }
    }

    // ========================= CORE METHODS =========================

    private function send_message($room_id, $sender, $message)
    {
        $stmt = $this->mysqli->prepare(
            "INSERT INTO messages (room_id, message_sender, contents)
            VALUES (?, ?, ?)"
        );

        $stmt->bind_param("iis", $room_id, $sender, $message);
        $stmt->execute();

        http_response_code(201);
        echo json_encode(["status" => "success"]);
    }

    private function get_room_messages($room_id)
    {
        $stmt = $this->mysqli->prepare(
            "SELECT m.message_id, m.room_id, m.message_sender,
                    CONCAT(u.fname, ' ', u.lname) AS sender_name,
                    m.contents, m.message_timestamp
            FROM messages m
            JOIN users u ON m.message_sender = u.user_id
            WHERE m.room_id = ?
            ORDER BY m.message_timestamp ASC"
        );

        $stmt->bind_param("i", $room_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $this->output_json("messages", $result);
    }

    private function get_user_rooms($user_id)
    {
        $stmt = $this->mysqli->prepare(
            "SELECT room_id FROM room_members WHERE user_id = ?"
        );

        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $this->output_json("rooms", $result);
    }

    private function get_room_name($room_id)
    {
        $stmt = $this->mysqli->prepare(
            "SELECT room_name FROM chat_rooms WHERE room_id = ?"
        );

        $stmt->bind_param("i", $room_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $this->output_json("room_name", $result);
    }

    private function get_users()
    {
        $result = $this->mysqli->query(
            "SELECT user_id, fname, lname FROM users"
        );

        $this->output_json("users", $result);
    }

    private function get_user_name($user_id)
    {
        $stmt = $this->mysqli->prepare(
            "SELECT fname, lname FROM users WHERE user_id = ?"
        );

        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $this->output_json("name", $result);
    }

    private function create_room($name, $creator, $users)
    {
        $this->mysqli->begin_transaction();

        try {
            // Create room
            $stmt = $this->mysqli->prepare(
                "INSERT INTO chat_rooms (room_name, room_creator)
                VALUES (?, ?)"
            );
            $stmt->bind_param("ss", $name, $creator);
            $stmt->execute();

            $room_id = $this->mysqli->insert_id;

            // Add users
            if (!is_array($users)) {
                $users = explode(",", $users);
            }

            $stmt = $this->mysqli->prepare(
                "INSERT INTO room_members (room_id, user_id)
                VALUES (?, ?)"
            );

            foreach ($users as $user) {
                $user = (int) $user;
                $stmt->bind_param("ii", $room_id, $user);
                $stmt->execute();
            }

            // System message
            $msg = "**CHAT CREATED BY USER $creator**";

            $stmt = $this->mysqli->prepare(
                "INSERT INTO messages (room_id, message_sender, contents)
                VALUES (?, ?, ?)"
            );
            $stmt->bind_param("iis", $room_id, $creator, $msg);
            $stmt->execute();

            $this->mysqli->commit();

            echo json_encode(["status" => "success", "room_id" => $room_id]);

        } catch (Exception $e) {
            $this->mysqli->rollback();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    private function create_user($fname, $lname, $email, $password)
    {
        $fname = trim($fname);
        $lname = trim($lname);
        $email = strtolower(trim($email));
        $password = trim($password);

        if (empty($fname) || empty($lname) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing user data"]);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid email"]);
            return;
        }

        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Check email exists
        $stmt = $this->mysqli->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Email already exists"]);
            $stmt->close();
            return;
        }
        $stmt->close();

        // Insert user
        $stmt = $this->mysqli->prepare(
            "INSERT INTO users (fname, lname, email, password)
         VALUES (?, ?, ?, ?)"
        );

        $stmt->bind_param("ssss", $fname, $lname, $email, $hashed_password);

        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "user_id" => $this->mysqli->insert_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "User creation failed"]);
        }

        $stmt->close();
    }

    private function login_user($email, $password)
    {
        $email = strtolower(trim($email));
        $password = trim($password);

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing credentials"]);
            return;
        }

        $stmt = $this->mysqli->prepare(
            "SELECT user_id, fname, lname, password 
         FROM users 
         WHERE email = ?"
        );

        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
            return;
        }

        $user = $result->fetch_assoc();

        // Verify password
        if (!password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
            return;
        }

        // SUCCESS
        echo json_encode([
            "status" => "success",
            "user" => [
                "user_id" => $user["user_id"],
                "fname" => $user["fname"],
                "lname" => $user["lname"]
            ]
        ]);

        $stmt->close();
    }

    // ========================= HELPER =========================
    private function output_json($key, $result)
    {
        if (!$result || $result->num_rows === 0) {
            http_response_code(204);
            return;
        }

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        echo json_encode([$key => $data], JSON_PRETTY_PRINT);
    }
}

new MyAPI();