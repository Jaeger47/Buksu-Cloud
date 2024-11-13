// Redirect to the login page if not logged in as admin
if (localStorage.getItem("currentUser") !== "admin") {
    window.location.href = "/";
}

async function changePassword() {
    const userType = document.getElementById("userType").value;
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    const response = await fetch("/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType, oldPassword, newPassword })
    });

    if (response.ok) {
        alert("Password updated successfully");
        window.location.href = "/"; // Redirect back to file manager
    } else {
        alert("Error: " + (await response.text()));
    }
}

function goBack() {
    window.location.href = "/"; // Redirect back to file manager without re-login
}
