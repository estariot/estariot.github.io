

let ghUser = "";
let ghRepo = "";
let ghToken = "";

// Auth
document.getElementById("auth-save").onclick = () => {
    ghUser = document.getElementById("gh-user").value.trim();
    ghRepo = document.getElementById("gh-repo").value.trim();
    ghToken = document.getElementById("gh-token").value.trim();

    if (!ghUser || !ghRepo || !ghToken) {
        document.querySelector(".auth-status").textContent = "Missing fields.";
        return;
    }

    document.querySelector(".auth-status").textContent =
        "Admin mode enabled.";
    document.getElementById("editor-section").style.display = "block";
};

function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

document.getElementById("submit-post").onclick = async () => {
    const type = document.getElementById("content-type").value;
    const title = document.getElementById("post-title").value.trim();
    const tags = document.getElementById("post-tags").value.trim();
    const content = document.getElementById("post-content").value.trim();

    if (!title || !content) {
        document.getElementById("editor-status").textContent = "Missing title or content.";
        return;
    }

    const slug = slugify(title);
    const path = `${type}/${slug}.md`;

    const mdFile = `# ${title}\n\n**Tags:** ${tags}\n\n---\n\n${content}`;

    const url = `https://api.github.com/repos/${ghUser}/${ghRepo}/contents/${path}`;

    const base64Content = btoa(unescape(encodeURIComponent(mdFile)));

    const body = {
        message: `Add ${type.slice(0, -1)}: ${title}`,
        content: base64Content
    };

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${ghToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        document.getElementById("editor-status").textContent =
            "Published successfully!";
    } else {
        const error = await response.json();
        document.getElementById("editor-status").textContent =
            "Error: " + (error.message || "Unknown issue");
    }
};
