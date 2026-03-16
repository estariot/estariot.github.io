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
        gitsArea.innerHTML = gits.slice(0,).map(g=>`
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
        // scatter
        const cards = document.querySelectorAll(".list-item");

        cards.forEach(card => {
            const rotate = (Math.random() * 10) - 5;
            const shiftY = (Math.random() * 30) - 15;

            card.style.transform =
                `rotate(${rotate}deg) translateY(${shiftY}px)`;
        });

    });

}




// View page loader
const viewContent = document.getElementById("view-content");

if (viewContent) {

    const params = new URLSearchParams(window.location.search);

    const type = params.get("type");
    const file = params.get("file");

    loadMarkdown(type,file).then(md => {

        document.getElementById("view-title").textContent =
            file.replace(".md","").replace(/-/g," ");

        viewContent.innerHTML = mdToHtml(md);

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

        const titleMove = Math.min(scrollY * 0.8, vh * 0.45);
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
