window.addEventListener('load', function () {
    let user_id = 1;

    const js_display_id = document.getElementById("display_id");
    js_display_id.textContent = "User ID: " + user_id;

    load_chats(user_id);
});

async function load_chats(user_id) {
    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?receiver=${user_id}`;

    try {

        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);

        conversation_list(user_id, obj)

    } catch (error) {
        console.log(error);
    }
};

//conversation list
async function conversation_list(user_id, obj) {
    const unique_chats = new Set();

    for (const item of obj.chat) {
        const dm_chat_sender = item.dm_chat_sender;

        if (user_id != dm_chat_sender) {
            unique_chats.add(dm_chat_sender);
        }
    }

    for (const x of unique_chats) {
        const name = await get_user_name(x);
        const div = document.createElement("div");
        div.classList.add("chat-card");
        // text
        const sender = document.createElement("button");
        sender.textContent = name;
        sender.id = x;

        sender.addEventListener("click", function () {
            message_in_a_chat(user_id, this.id);
        });

        div.appendChild(sender);

        document.getElementById("chat_list").appendChild(div);
    }

};

async function get_user_name(user_id) {
    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?userid-name=${user_id}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);

        for (const item of obj.name) {
            const fname = item.fname;
            const lname = item.lname;
            return fname + " " + lname;
        }

    } catch (error) {
        console.log(error);
    }
}

//output messages in chat box
async function message_in_a_chat(user_id, sender_id) {
    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?sender=${sender_id}&receiver=${user_id}`;

    try {

        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);


        const chatBox = document.getElementById("chat");
        chatBox.innerHTML = "";

        const messageBox = document.getElementById("message_box");
        messageBox.innerHTML = "";

        for (const item of obj.chat) {

            const next_message = document.createElement("p");

            if (item.dm_chat_sender == sender_id) {
                next_message.classList.add("received");
            } else {
                next_message.classList.add("sent");
            }

            next_message.textContent = item.dm_chat_message;
            chatBox.appendChild(next_message);
        }

        // Create input
        const input = document.createElement("input");
        input.type = "text";
        input.id = "message_input";
        input.placeholder = "Type a message...";

        // Create button
        const button = document.createElement("button");
        button.id = "send_button";
        button.textContent = "Send";

        // Create audio record button
        const rec_button = document.createElement("button");
        rec_button.id = "rec_audio_toggle";
        rec_button.textContent = "Record Audio";


        // Add elements to message box
        messageBox.appendChild(input);
        messageBox.appendChild(button);
        messageBox.appendChild(rec_button);


        // Add click event
        button.addEventListener("click", () => {
            const message = input.value;
            send_message(sender_id, user_id, message);
        });


        // scroll to newest message
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.log(error);
    }
}

//send message method
async function send_message(sender_id, user_id, message) {
    const message_to = sender_id;
    const message_from = user_id

    const formData = new FormData();
    formData.append("message_to", message_to);
    formData.append("message_from", message_from);
    formData.append("message", message);

    try {
        const response = await fetch(
            "https://cn483.brighton.domains/soundshare/src/server/api.php",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            console.log("Failed to send message");
        } else {
            console.log("Message sent");

        }
        message_in_a_chat(user_id, sender_id);


    } catch (error) {
        console.log(error);
    }
}
