async function loadPhotoData() {
    const res = await fetch("photos.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load photos.json");
        return res.json();
    }

    function makeImg(src, alt = "Image", className = "") {
        const img = document.createElement("img");
        img.src = src;
        img.alt = alt;
        img.loading = "lazy";
        if (className) img.className = className;
        return img;
    }

    function makeThumb(src, alt, side /* "left" | "right" */) {
        const wrap = document.createElement("div");
        wrap.className = "thumb sqs-gallery-design-autocolumns-slide" + (side === "right" ? " slide-stretched" : "");
        wrap.style.cssText = `top:-60px; left:${side === "right" ? 560 : 0}px; width:550px; position:relative; padding-bottom:10px; z-index:10;`;
        wrap.appendChild(makeImg(src, alt));
        return wrap;
    }

    // yearFilter: null => all years, or "2024", "2025", ...
    async function renderGallery({ yearFilter = null, photoRoot = "Photos/" } = {}) {
        const stacked = document.getElementById("stackedImages");
        const leftCol = document.getElementById("leftColumn");
        const rightCol = document.getElementById("rightColumn");

        if (!stacked || !leftCol || !rightCol) {
        throw new Error("Missing containers: #stackedImages, #leftColumn, #rightColumn");
    }

    const data = await loadPhotoData();
    const photosByYear = data.photosByYear || {};

    const years = Object.keys(photosByYear).sort(); // ascending
    const chosenYears = yearFilter ? [yearFilter] : years;

    // Flatten photos in the render order you want
    const photos = [];
    for (const y of chosenYears) {
        const arr = photosByYear[y] || [];
        for (const p of arr) {
            photos.push({
                year: y,
                file: p.file,
                alt: p.alt || "Image"
            });
        }
    }

    // Clear existing
    stacked.innerHTML = "";
    leftCol.innerHTML = "";
    rightCol.innerHTML = "";

    // Render
    photos.forEach((p, idx) => {
        const src = photoRoot + p.file;

        // stacked (full width)
        const img = makeImg(src, p.alt);
        img.style.cssText = "font-size:0; left:164px; top:-14px; width:100%; height:auto; padding-bottom:10px; position:relative;";
        stacked.appendChild(img);

        // two columns
        const side = idx % 2 === 0 ? "left" : "right";
        (side === "left" ? leftCol : rightCol).appendChild(makeThumb(src, p.alt, side));
    });
}