window.addEventListener('load', function () {
    let user_id = 1;

    const js_display_id = document.getElementById("display_id");
    js_display_id.textContent = "User ID: " + user_id;


    all_chats(user_id);

});

async function all_chats(user_id) {
    const url = 'https://cn483.brighton.domains/soundshare/src/server/api.php?chat=all';

    try {

        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);

        conversation_list(user_id, obj)
        message_in_a_chat(user_id, obj)



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
    console.log(unique_chats);

    for (const x of unique_chats) {
        const div = document.createElement("div");
        div.classList.add("chat-card");
        // text
        const sender = document.createElement("button");
        sender.textContent = `Sender: ${x}`;
        sender.id = x;

        div.appendChild(sender);

        document.getElementById("chat_list").appendChild(div);
    }

};

//output messages in chat box
async function message_in_a_chat(user_id, obj) {
    for (const item of obj.chat) {

        const dm_chat_receiver = item.dm_chat_receiver;
        const dm_chat_message = item.dm_chat_message;


        const next_message = document.createElement("p");
        if (dm_chat_receiver == user_id) {
            next_message.classList.add("received");
        }
        else {
            next_message.classList.add("sent");
        }
        next_message.textContent = `${dm_chat_message}`;
        document.getElementById("chat").appendChild(next_message);
    }
}
