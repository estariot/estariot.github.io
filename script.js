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
        const res = await fetch(`/${type}/index.json`);

        if (!res.ok) return [];

        return await res.json();
    } catch {
        return [];
    }
}




// Markdown loader
async function loadMarkdown(type, filename) {
    const res = await fetch(`/${type}/${filename}`);
    return await res.text();
}




// Homepage previews
async function loadLatest() {

    const postsArea = document.getElementById("latest-posts");
    const extrasArea = document.getElementById("latest-extras");
    const gitsArea = document.getElementById("latest-gits");

    if (!postsArea && !extrasArea && !gitsArea) return;

    let posts = await loadIndex("posts");
    let extras = await loadIndex("extras");
    let gits = await loadIndex("gits");

    posts = posts.sort((a,b)=>new Date(b.date)-new Date(a.date));
    extras = extras.sort((a,b)=>new Date(b.date)-new Date(a.date));
    gits = gits.sort((a,b)=>new Date(b.date)-new Date(a.date));


    if (postsArea) {
        postsArea.innerHTML = posts.slice(0,2).map(p => `
            <a class="card" href="view.html?type=posts&file=${p.filename}">
                <h4>${p.title}</h4>
                <p class="card-date">${p.date}</p>
            </a>
        `).join("");
    }


    if (extrasArea) {
        extrasArea.innerHTML = extras.slice(0,2).map(e => `
            <a class="card" href="view.html?type=extras&file=${e.filename}">
                <h4>${e.title}</h4>
                <p class="card-date">${e.date}</p>
            </a>
        `).join("");
    }


    if (gitsArea) {
        gitsArea.innerHTML = gits.slice(0,2).map(g => `
            <a class="card" href="view.html?type=gits&file=${g.filename}">
                <h4>${g.title}</h4>
                <p class="card-date">${g.date}</p>
            </a>
        `).join("");
    }

}




// List pages
const listContainer = document.getElementById("list-container");

if (listContainer) {

    const type = listContainer.dataset.type;

    loadIndex(type).then(items => {

        items.forEach(item => {

            const link = document.createElement("a");

            link.classList.add("list-item");
            link.href = `view.html?type=${type}&file=${item.filename}`;
            link.textContent = item.title;

            listContainer.appendChild(link);

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

    const heroTitle = document.querySelector(".masthead h1");
    const subtitle = document.querySelector(".subtitle");
    const folios = document.querySelectorAll(".folio");


    window.addEventListener("scroll", ()=>{

        const scrollY = window.scrollY;

        if (heroTitle) {
            heroTitle.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        if (subtitle) {
            subtitle.style.transform = `translateY(${scrollY * 0.15}px)`;
            subtitle.style.opacity = 1 - scrollY / 400;
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
