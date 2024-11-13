let currentUser = null;
let files = [];

async function fetchFiles() {
    try {
        const response = await fetch("/.netlify/functions/files");
        files = await response.json();
        displayFiles();
    } catch (error) {
        console.error("Error fetching files:", error);
    }
}

const users = {
    admin: "admin",
    employee: "employee",
    public: "public"
};

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let userType;

    // Determine user type based on whether username is provided
    if (username) {
        userType = username; // For admin, username would be something like "admin"
    } else {
        userType = "employee"; // Assume employee if no username is entered
    }

    try {
        const response = await fetch("/.netlify/functions/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userType, password }), // Send userType and password
        });

        if (response.ok) {
            // Login successful
            currentUser = userType;
            localStorage.setItem("currentUser", userType);
            loadFileManager();
        } else {
            // Login failed
            const errorText = await response.text();
            alert(errorText || "Invalid credentials");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
    }
}

function publicAccess() {
    currentUser = "public";
    localStorage.setItem("currentUser", "public");
    loadFileManager();
}

function loadFileManager() {
    console.log("Loading file manager for:", currentUser); // Debug
    document.getElementById("login").style.display = "none";
    document.getElementById("file-manager").style.display = "block";
    document.getElementById("top-nav").style.display = "flex";

    // Show the "Change Password" button only for the admin
    if (currentUser === "admin") {
        document.querySelector("#top-nav button[onclick='goToChangePassword()']").style.display = "inline-block";
    } else {
        document.querySelector("#top-nav button[onclick='goToChangePassword()']").style.display = "none";
    }

    document.getElementById("admin-controls").style.display = currentUser === "admin" ? "block" : "none";
    fetchFiles();
}

function uploadFile() {
    const fileInput = document.getElementById("fileUpload");
    const file = fileInput.files[0];

    // Check if file size exceeds 10MB before proceeding
    if (file.size > 10 * 1024 * 1024) { // 10MB
        alert("Warning: File size should not exceed 10MB.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Show the upload progress popup
    const progressPopup = document.getElementById("uploadProgressPopup");
    const progressBar = document.getElementById("uploadProgressBar");
    const progressText = document.getElementById("uploadProgressText");
    progressPopup.style.display = "block";
    progressText.textContent = "Uploading...";

    // Create a new XMLHttpRequest to handle progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/.netlify/functions/upload", true);

    // Update the progress bar during upload
    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            progressBar.value = percentComplete;
            progressText.textContent = `Uploading... ${Math.round(percentComplete)}%`;
        }
    };

    // Hide the progress popup on upload completion
    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("File uploaded successfully!");
            fetchFiles(); // Refresh the file list
        } else {
            alert(xhr.responseText || "Failed to upload file.");
        }
        progressPopup.style.display = "none";
        progressBar.value = 0;
        progressText.textContent = "Uploading...";
    };

    // Handle errors
    xhr.onerror = function () {
        alert("An error occurred during the upload. Please try again.");
        progressPopup.style.display = "none";
        progressBar.value = 0;
        progressText.textContent = "Uploading...";
    };

    // Send the form data
    xhr.send(formData);
}

function displayFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = ""; // Clear existing list

    console.log("Displaying files for user:", currentUser, files); // Debug

    files.forEach((file, index) => {
        if ((file.visibility === "hidden" && currentUser === "public") ||
            (file.visibility === "employee" && currentUser === "public")) return;

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = file.name;
        row.appendChild(nameCell);

        const downloadCell = document.createElement("td");
        const downloadLink = document.createElement("a");
        downloadLink.href = file.url;
        downloadLink.download = file.name;
        downloadLink.textContent = "Download";
        downloadCell.appendChild(downloadLink);
        row.appendChild(downloadCell);

        if (currentUser === "admin") {
            const visibilityCell = document.createElement("td");
            const visibilityCheckbox = document.createElement("input");
            visibilityCheckbox.type = "checkbox";
            visibilityCheckbox.checked = file.visibility === "all";
            visibilityCheckbox.onclick = () => toggleVisibility(file.name, visibilityCheckbox.checked);
            visibilityCell.appendChild(visibilityCheckbox);
            row.appendChild(visibilityCell);

            const deleteCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteFile(file.name);
            deleteCell.appendChild(deleteButton);
            row.appendChild(deleteCell);
        }

        fileList.appendChild(row);
    });
}

async function toggleVisibility(fileName, isVisible) {
    try {
        const response = await fetch("/.netlify/functions/update-visibility", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileName, visibility: isVisible ? "all" : "hidden" }),
        });

        if (response.ok) {
            alert("Visibility updated successfully.");
        } else {
            alert("Failed to update visibility.");
        }
    } catch (error) {
        console.error("Error updating visibility:", error);
    }
}

async function deleteFile(fileName) {
    try {
        const response = await fetch("/.netlify/functions/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileName }),
        });

        if (response.ok) {
            alert("File deleted successfully.");
            fetchFiles();
        } else {
            alert("Failed to delete file.");
        }
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}
