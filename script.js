// Theme
const body = document.body;
const toggleBtn = document.getElementById("theme-toggle");

if (toggleBtn) {
    toggleBtn.onclick = () => {
        const current = body.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";

        body.setAttribute("data-theme", next);
        toggleBtn.textContent = next === "dark" ? "Light Mode" : "Dark Mode";

        localStorage.setItem("theme", next);
    };
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
    body.setAttribute("data-theme", savedTheme);

    if (toggleBtn) {
        toggleBtn.textContent =
            savedTheme === "dark" ? "Light Mode" : "Dark Mode";
    }
}

// Markdown converter
function mdToHtml(md) {
    return md
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/gim, "<em>$1</em>")
        .replace(/---/gim, "<hr>")
        .replace(/\n/gim, "<br>");
}

// JSON loader
async function loadIndex(type) {
    try {
        const res = await fetch(`${type}/index.json`);
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

// Markdown loader
async function loadMarkdown(type, filename) {
    const res = await fetch(`${type}/${filename}`);
    return await res.text();
}

// Homepage previews
async function loadLatest() {
    const postsArea = document.getElementById("latest-posts");
    const extrasArea = document.getElementById("latest-extras");
    const gitsArea = document.getElementById("latest-gits");

    let posts = await loadIndex("posts");
    let extras = await loadIndex("extras");
    let gits = await loadIndex("gits");

    posts = posts.sort((a,b)=>new Date(b.date)-new Date(a.date));
    extras = extras.sort((a,b)=>new Date(b.date)-new Date(a.date));
    gits = gits.sort((a,b)=>new Date(b.date)-new Date(a.date));

    if (postsArea) {
        postsArea.innerHTML = posts.slice(0,6).map(p=>`
            <div class="preview-item">
                <a href="view.html?type=posts&file=${p.filename}">
                    <h4>${p.title}</h4>
                </a>
                <p>${p.date}</p>
            </div>
        `).join("");
    }

    if (extrasArea) {
        extrasArea.innerHTML = extras.slice(0,4).map(e=>`
            <div class="preview-item">
                <a href="view.html?type=extras&file=${e.filename}">
                    <h4>${e.title}</h4>
                </a>
                <p>${e.date}</p>
            </div>
        `).join("");
    }

    if (gitsArea) {
        gitsArea.innerHTML = gits.slice(0,4).map(g=>`
            <div class="preview-item">
                <a href="view.html?type=gits&file=${g.filename}">
                    <h4>${g.title}</h4>
                </a>
                <p>${g.date}</p>
            </div>
        `).join("");
    }
}

// List page
const listContainer = document.getElementById("list-container");

if (listContainer) {

    const type = listContainer.dataset.type;

    loadIndex(type).then(items => {

        if (type === "extras") {
            // --- Pinboard style for Miscellanea ---
            items.sort((a,b)=>new Date(b.date)-new Date(a.date));
            const containerWidth = listContainer.offsetWidth;
            let verticalOffset = 0;

            items.forEach(item => {
                const div = document.createElement("div");
                div.classList.add("list-item");

                const x = Math.random() * (containerWidth - 220);
                verticalOffset += 50 + Math.random() * 30;
                const rotate = (Math.random() - 0.5) * 10;

                div.style.position = "absolute";
                div.style.left = `${x}px`;
                div.style.top = `${verticalOffset}px`;
                div.style.transform = `rotate(${rotate}deg)`;

                div.innerHTML = `
                    <a href="view.html?type=extras&file=${item.filename}">
                        <h4>${item.title}</h4>
                        <span>${item.date}</span>
                    </a>
                `;

                listContainer.appendChild(div);
            });

            listContainer.style.position = "relative";
            listContainer.style.height = verticalOffset + 100 + "px";

        } else {
            // --- Regular list for posts/gits ---
            items.forEach(item => {
                const div = document.createElement("div");
                div.classList.add("list-item");

                div.innerHTML = `
                    <a href="view.html?type=${type}&file=${item.filename}">
                        ${item.title}
                    </a>
                    <span>${item.date}</span>
                `;

                listContainer.appendChild(div);
            });

            // optional scatter effect
            const cards = document.querySelectorAll(".list-item");
            cards.forEach(card => {
                const rotate = (Math.random() * 10) - 5;
                const shiftY = (Math.random() * 30) - 15;
                card.style.transform =
                    `rotate(${rotate}deg) translateY(${shiftY}px)`;
            });
        }

    });

}

// View page loader
const viewContent = document.getElementById("view-content");

if (viewContent) {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const file = params.get("file");

    loadMarkdown(type, file).then(md => {
        const titleEl = document.getElementById("view-title");
        if (titleEl) {
            titleEl.textContent = file.replace(".md","").replace(/-/g," ");
        }
        viewContent.innerHTML = mdToHtml(md);
    });
}

// spew posts 
const foldersContainer = document.getElementById("folders-container");

if (foldersContainer) {
    loadIndex("posts").then(posts => {
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // group posts by date
        const grouped = {};
        posts.forEach(p => {
            const date = p.date;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(p);
        });

        // clear container first to avoid duplicates
        foldersContainer.innerHTML = "";

        Object.keys(grouped)
            .sort((a,b) => new Date(b) - new Date(a))
            .forEach(date => {
                const folder = document.createElement("div");
                folder.classList.add("folder");
                folder.dataset.expanded = "false";

                const folderTitle = document.createElement("div");
                folderTitle.classList.add("folder-title");
                folderTitle.textContent = `${date}`;

                folder.appendChild(folderTitle);
                foldersContainer.appendChild(folder);

                const folderEntries = [];

                // create entries
                grouped[date].forEach(p => {
                    const entry = document.createElement("a");
                    entry.href = `view.html?type=posts&file=${p.filename}`;
                    entry.classList.add("entry-card");
                    entry.textContent = p.title;

                    entry.style.position = "absolute";
                    entry.style.opacity = 0;
                    entry.style.transition = "all 0.3s ease";
                    entry.style.pointerEvents = "none";
                    entry.style.zIndex = "10";

                    entry.dataset.folderDate = date;

                    document.body.appendChild(entry);
                    folderEntries.push(entry);
                });

                // click to spew / collapse
                folderTitle.addEventListener("click", (e)=>{
                    e.preventDefault();
                    e.stopPropagation();

                    const expanded = folder.dataset.expanded === "true";

                    // get folder position now
                    const folderRect = folderTitle.getBoundingClientRect();
                    const scrollX = window.scrollX;
                    const scrollY = window.scrollY;

                    folderEntries.forEach(entry => {
                        if (!expanded) {
                            const x = folderRect.right + scrollX + Math.random() * 300 + 50; // to the right
                            const y = folderRect.top + scrollY + (Math.random() - 0.5) * 100; // ±50px y
                            const rot = (Math.random() - 0.5) * 10;

                            // start at folder position
                            entry.style.left = folderRect.left + scrollX + "px";
                            entry.style.top = folderRect.top + scrollY + "px";

                            requestAnimationFrame(()=>{
                                entry.style.transform = `translate(${x - folderRect.left - scrollX}px, ${y - folderRect.top - scrollY}px) rotate(${rot}deg)`;
                                entry.style.opacity = 1;
                                entry.style.pointerEvents = "auto";
                            });
                        } else {
                            // collapse back to folder
                            entry.style.transform = `translate(0,0) rotate(0deg)`;
                            entry.style.opacity = 0;
                            entry.style.pointerEvents = "none";
                        }
                    });

                    folder.dataset.expanded = (!expanded).toString();
                });
            });
    });
}
// Scroll animations
document.addEventListener("DOMContentLoaded", ()=>{
    const heroTitle = document.querySelector(".hero-title");
    const subtitle = document.querySelector(".subtitle");
    const folios = document.querySelectorAll(".folio");

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        const masthead = document.querySelector(".masthead");

        const titleMove = Math.min(scrollY * 0.65, vh * 0.45);
        const subtitleMove = Math.min(scrollY * 0.45, vh * 0.28);

        if (heroTitle){
            heroTitle.style.transform = `translateY(${titleMove}px)`;
        }
        if (subtitle){
            subtitle.style.transform = `translateY(${subtitleMove}px)`;
            subtitle.style.opacity = Math.max(0, 1 - scrollY / 300);
        }
        if (masthead){
            const newHeight = Math.max(vh - scrollY * 0.5, vh * 0.65);
            masthead.style.minHeight = newHeight + "px";
        }
    });

    const observer = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if (entry.isIntersecting){
                entry.target.classList.add("visible");
            }
        });
    },{threshold:0.15});

    folios.forEach(folio=>{
        observer.observe(folio);
    });
});

// Init
loadLatest();