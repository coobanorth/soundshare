if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Registration Failed', err));
    });
}

window.addEventListener("load", () => {
    if (localStorage.getItem("user_id")) {
        window.location.href = "chats.html";
    }
});

window.addEventListener('load', function () {

    const container = document.querySelector(".signup");

    container.innerHTML = `
        <div id="signup_modal" class="hidden modal">
            <div class="modal-content">
                <h3>Sign Up</h3>

                <input type="text" id="fname" placeholder="First Name" class="form-control"/>
                <input type="text" id="lname" placeholder="Last Name" class="form-control"/>
                <input type="email" id="email" placeholder="Email" class="form-control"/>
                <input type="password" id="password" placeholder="Password" class="form-control"/>

                <button id="create_user_btn">Sign Up!</button>
                <button id="close_modal">Cancel</button>
            </div>
        </div>

        <div id="login_modal" class="hidden modal">
        <div class="modal-content">
            <h3>Login</h3>

            <input type="email" id="login_email" placeholder="Email" class="form-control"/>
            <input type="password" id="login_password" placeholder="Password" class="form-control"/>

            <button id="login_btn">Login</button>
            <button id="close_login_modal">Cancel</button>
        </div>
    </div>
    `;

    const modal = document.getElementById("signup_modal");

    // OPEN SIGNUP MODAL
    document.getElementById("sign_up").onclick = () => {
        modal.classList.remove("hidden");
    };

    // CLOSE SIGNUP MODAL
    document.getElementById("close_modal").onclick = () => {
        modal.classList.add("hidden");
    };

    // CLICK OUTSIDE SIGNUP
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });

    const loginModal = document.getElementById("login_modal");

    // OPEN LOGIN MODAL
    document.getElementById("login").onclick = () => {
        loginModal.classList.remove("hidden");
    };

    // CLOSE LOGIN MODAL
    document.getElementById("close_login_modal").onclick = () => {
        loginModal.classList.add("hidden");
    };

    // CLICK OUTSIDE TO CLOSE
    loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add("hidden");
        }
    });

    // CREATE USER
    document.getElementById("create_user_btn").onclick = async () => {

        const fname = document.getElementById("fname").value.trim();
        const lname = document.getElementById("lname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!fname || !lname || !email || !password) {
            alert("Please fill all fields");
            return;
        }

        const formData = new FormData();
        formData.append("action", "create_user");
        formData.append("fname", fname);
        formData.append("lname", lname);
        formData.append("email", email);
        formData.append("password", password);

        try {
            const response = await fetch(
                "https://cn483.brighton.domains/soundshare/src/server/api.php",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {
                console.log("User created:", data);

                localStorage.setItem("user_id", data.user_id);
                localStorage.setItem("user_name", fname + " " + lname);

                // optional redirect
                window.location.href = "chats.html";

            } else {
                alert(data.error || "Signup failed");
            }

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }

        // Reset form
        modal.classList.add("hidden");
        document.getElementById("fname").value = "";
        document.getElementById("lname").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    }

    document.getElementById("login_btn").onclick = async () => {

        const email = document.getElementById("login_email").value.trim();
        const password = document.getElementById("login_password").value.trim();

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        const formData = new FormData();
        formData.append("action", "login");
        formData.append("email", email);
        formData.append("password", password);

        try {
            const response = await fetch(
                "https://cn483.brighton.domains/soundshare/src/server/api.php",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {
                console.log("Login success:", data);

                localStorage.setItem("user_id", data.user.user_id);
                localStorage.setItem("user_name", data.user.fname + " " + data.user.lname);

                // redirect to chat
                window.location.href = "chats.html";

            } else {
                alert(data.error || "Login failed");
            }

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }

        // Clear fields + close modal
        loginModal.classList.add("hidden");
        document.getElementById("login_email").value = "";
        document.getElementById("login_password").value = "";
    };

});