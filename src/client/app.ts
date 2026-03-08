const byId = (id) => document.getElementById(id);
const PROJECTS_PER_PAGE = 1;

const initNetworkBackground = () => {
  const canvas = byId("network-bg");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let tick = 0;
  let pointerX = 0;
  let pointerY = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let layers = [];

  const layerSpecs = [
    { depth: 0.35, speed: 0.18, radius: [0.6, 1.2], distance: 130, alpha: 0.12, density: 14000 },
    { depth: 0.7, speed: 0.28, radius: [0.9, 1.8], distance: 160, alpha: 0.14, density: 10500 },
    { depth: 1.15, speed: 0.42, radius: [1.2, 2.4], distance: 190, alpha: 0.16, density: 8200 },
  ];

  const buildLayers = () => {
    const area = width * height;
    layers = layerSpecs.map((spec) => {
      const count = Math.max(35, Math.min(220, Math.floor(area / spec.density)));
      return {
        ...spec,
        nodes: Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * spec.speed,
          vy: (Math.random() - 0.5) * spec.speed,
          r: spec.radius[0] + Math.random() * (spec.radius[1] - spec.radius[0]),
        })),
      };
    });
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pointerX = width / 2;
    pointerY = height / 2;
    buildLayers();
  };

  const step = () => {
    tick += 1;
    const targetX = ((pointerX / Math.max(1, width)) - 0.5) * 2;
    const targetY = ((pointerY / Math.max(1, height)) - 0.5) * 2;
    parallaxX += (targetX - parallaxX) * 0.04;
    parallaxY += (targetY - parallaxY) * 0.04;

    ctx.clearRect(0, 0, width, height);

    for (const layer of layers) {
      const offsetX = parallaxX * 22 * layer.depth;
      const offsetY = parallaxY * 18 * layer.depth;
      const nodes = layer.nodes;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20 || n.x > width + 20) n.vx *= -1;
        if (n.y < -20 || n.y > height + 20) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > layer.distance) continue;
          const alpha = (1 - dist / layer.distance) * layer.alpha;
          ctx.strokeStyle = `rgba(225, 232, 244, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8 + layer.depth * 0.25;
          ctx.beginPath();
          ctx.moveTo(a.x + offsetX, a.y + offsetY);
          ctx.lineTo(b.x + offsetX, b.y + offsetY);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const pulse = 0.32 + 0.22 * Math.sin((tick + n.x + n.y) * 0.018 * layer.depth);
        ctx.fillStyle = `rgba(245, 248, 255, ${pulse.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x + offsetX, n.y + offsetY, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    rafId = window.requestAnimationFrame(step);
  };

  resize();
  step();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  });
  window.addEventListener("beforeunload", () => window.cancelAnimationFrame(rafId), { once: true });
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

const fetchJSON = async (path) => {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return res.json();
};

const setEmpty = (el) => {
  const tmpl = byId("empty-state");
  if (!(tmpl instanceof HTMLTemplateElement)) return;
  el.appendChild(tmpl.content.cloneNode(true));
};

const formatCategory = (value) => {
  if (!value) return "General";
  return String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const renderStars = (level) => {
  const safeLevel = Math.max(0, Math.min(5, Number(level) || 0));
  return `${"★".repeat(safeLevel)}${"☆".repeat(5 - safeLevel)}`;
};

const normalizeLinkLabel = (label, url) => {
  if (label && String(label).trim()) return String(label).trim();
  const value = String(url || "").toLowerCase();
  if (value.startsWith("mailto:")) return "Email";
  if (value.includes("linkedin.com")) return "LinkedIn";
  if (value.includes("github.com")) return "GitHub";
  if (value.includes("forms.gle") || value.includes("typeform.com") || value.includes("tally.so")) return "Contact Form (Phone)";
  return "Link";
};

const renderHome = (home) => {
  byId("name").textContent = home?.name || "Your Name";
  byId("headline").textContent = home?.headline || "Add headline in Admin > Globals > home";
  byId("bio").textContent = home?.bio || "Add your bio in the home global.";
  const avatarEl = byId("avatar");
  if (!(avatarEl instanceof HTMLImageElement)) return;
  const photo = home?.profilePhoto && typeof home.profilePhoto === "object" ? home.profilePhoto : null;
  const photoURL = photo?.sizes?.avatar?.url || photo?.url || "";

  if (photoURL) {
    avatarEl.src = photoURL;
    avatarEl.alt = photo?.alt || "Profile photo";
    avatarEl.hidden = false;
  } else {
    avatarEl.hidden = true;
  }

  const linksEl = byId("links");
  linksEl.innerHTML = "";
  const configuredLinks = Array.isArray(home?.links)
    ? home.links
        .filter((link) => link && link.url)
        .map((link) => ({
          label: normalizeLinkLabel(link.label, link.url),
          url: String(link.url),
        }))
    : [];

  const labelsSeen = new Set(configuredLinks.map((link) => link.label.toLowerCase()));
  const defaultLinks = [];
  if (!labelsSeen.has("email") && home?.email) {
    defaultLinks.push({ label: "Email", url: `mailto:${home.email}` });
  }
  if (!labelsSeen.has("linkedin")) {
    defaultLinks.push({ label: "LinkedIn", url: "https://www.linkedin.com/in/alexander-okonkwo/" });
  }
  if (!labelsSeen.has("github")) {
    defaultLinks.push({ label: "GitHub", url: "https://github.com/owwix" });
  }
  const hasContactForm = labelsSeen.has("contact form") || labelsSeen.has("contact form (phone)");
  if (!hasContactForm && home?.email) {
    defaultLinks.push({
      label: "Contact Form (Phone)",
      url: `mailto:${home.email}?subject=Portfolio%20Inquiry`,
    });
  }

  const linksToRender = [...configuredLinks, ...defaultLinks];
  for (const link of linksToRender) {
    const normalizedLabel = link.label.toLowerCase();

    if (normalizedLabel.startsWith("email")) {
      const span = document.createElement("span");
      span.className = "pill";
      const visibleEmail = String(link.url).replace(/^mailto:/i, "");
      span.textContent = `Email: ${visibleEmail}`;
      linksEl.appendChild(span);
      continue;
    }

    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = normalizedLabel.startsWith("contact form") ? "-> Reach Me by Phone" : link.label;
    a.target = "_blank";
    a.rel = "noreferrer";
    linksEl.appendChild(a);
  }
};

const renderProjects = (docs) => {
  const wrap = byId("projects");
  wrap.innerHTML = "";
  if (!docs.length) return setEmpty(wrap);

  const listWrap = document.createElement("div");
  listWrap.className = "stack";
  wrap.appendChild(listWrap);

  const controls = document.createElement("div");
  controls.className = "pagination";
  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "page-btn";
  prevBtn.textContent = "Prev";
  const pageLabel = document.createElement("span");
  pageLabel.className = "page-label";
  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "page-btn";
  nextBtn.textContent = "Next";
  controls.appendChild(prevBtn);
  controls.appendChild(pageLabel);
  controls.appendChild(nextBtn);
  wrap.appendChild(controls);

  let page = 0;
  const pages = Math.max(1, Math.ceil(docs.length / PROJECTS_PER_PAGE));

  const paintPage = () => {
    listWrap.innerHTML = "";
    const startIndex = page * PROJECTS_PER_PAGE;
    const current = docs.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

    for (const project of current) {
      const card = document.createElement("article");
      card.className = "item";
      const stack = (project.techStack || []).map((t) => t.technology).filter(Boolean);
      const start = formatDate(project.startDate);
      const end = formatDate(project.endDate);
      const image = project?.projectImage && typeof project.projectImage === "object" ? project.projectImage : null;
      const imageURL = image?.url || image?.sizes?.avatar?.url || "";
      card.innerHTML = `
        ${imageURL ? `<img class="project-image" src="${imageURL}" alt="${image?.alt || project.title || "Project image"}" />` : ""}
        <h3>${project.title || "Untitled Project"}</h3>
        <p>${project.summary || ""}</p>
        <div class="meta">
          ${
            project.liveUrl
              ? `<a class="badge badge-link" href="${project.liveUrl}" target="_blank" rel="noreferrer">Live URL</a>`
              : '<span class="badge">Not Yet Live</span>'
          }
          ${project.repoUrl ? `<a class="badge badge-link" href="${project.repoUrl}" target="_blank" rel="noreferrer">Repo</a>` : ""}
        </div>
        <div class="meta">
          ${project.featured ? '<span class="badge featured">Featured</span>' : ""}
          ${start ? `<span class="badge">${start}${end ? ` - ${end}` : ""}</span>` : ""}
          ${stack.slice(0, 4).map((s) => `<span class="badge">${s}</span>`).join("")}
        </div>
      `;
      listWrap.appendChild(card);
    }

    pageLabel.textContent = `${page + 1} of ${pages}`;
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= pages - 1;
    controls.hidden = pages <= 1;
  };

  prevBtn.addEventListener("click", () => {
    if (page > 0) {
      page -= 1;
      paintPage();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (page < pages - 1) {
      page += 1;
      paintPage();
    }
  });

  paintPage();
};

const renderSkills = (docs) => {
  const wrap = byId("skills");
  wrap.innerHTML = "";
  if (!docs.length) return setEmpty(wrap);

  const rows = docs.flatMap((doc) => {
    if (Array.isArray(doc?.skills) && doc.skills.length) {
      return doc.skills.map((skill) => ({
        ...skill,
        category: skill?.category || doc?.category || "general",
      }));
    }
    if (doc?.name) {
      return [
        {
          name: doc.name,
          proficiency: doc.proficiency,
          yearsExperience: doc.yearsExperience,
          category: doc.category || "general",
        },
      ];
    }
    return [];
  });

  if (!rows.length) return setEmpty(wrap);

  const categoryOrder = [
    "frontend-development",
    "backend-development",
    "programming-languages",
    "databases",
    "cloud-deployment",
    "developer-tools",
    "general",
  ];

  const grouped = rows.reduce((acc, skill) => {
    const key = skill.category || "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill);
    return acc;
  }, {});

  const orderedKeys = Object.keys(grouped).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    if (safeA !== safeB) return safeA - safeB;
    return a.localeCompare(b);
  });

  const tabs = document.createElement("div");
  tabs.className = "skill-tabs";
  const panel = document.createElement("section");
  panel.className = "skill-category";
  wrap.appendChild(tabs);
  wrap.appendChild(panel);

  let activeCategory = orderedKeys[0];

  const buildPanel = () => {
    panel.innerHTML = "";
    const title = document.createElement("h3");
    title.className = "skill-category-title";
    title.textContent = formatCategory(activeCategory);
    panel.appendChild(title);

    const list = [...grouped[activeCategory]].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));

    const listWrap = document.createElement("div");
    listWrap.className = "stack";
    panel.appendChild(listWrap);

    for (const skill of list) {
      const card = document.createElement("article");
      card.className = "item item-compact";
      card.innerHTML = `
        <h3>${skill.name || "Unnamed skill"}</h3>
        <div class="meta">
          <span class="badge skill-stars">${renderStars(skill.proficiency)} (${skill.proficiency || 0}/5)</span>
          ${skill.yearsExperience ? `<span class="badge">${skill.yearsExperience} yrs experience</span>` : ""}
        </div>
      `;
      listWrap.appendChild(card);
    }

    const controls = document.createElement("div");
    controls.className = "pagination";
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "page-btn";
    prevBtn.textContent = "Prev";
    const pageLabel = document.createElement("span");
    pageLabel.className = "page-label";
    pageLabel.textContent = `${orderedKeys.indexOf(activeCategory) + 1} of ${orderedKeys.length}`;
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "page-btn";
    nextBtn.textContent = "Next";
    const activeIndex = orderedKeys.indexOf(activeCategory);

    prevBtn.addEventListener("click", () => {
      const nextIndex = (activeIndex - 1 + orderedKeys.length) % orderedKeys.length;
      activeCategory = orderedKeys[nextIndex];
      for (const tab of Array.from(tabs.querySelectorAll(".skill-tab"))) {
        tab.classList.remove("is-active");
      }
      tabs.children[nextIndex].classList.add("is-active");
      buildPanel();
    });

    nextBtn.addEventListener("click", () => {
      const nextIndex = (activeIndex + 1) % orderedKeys.length;
      activeCategory = orderedKeys[nextIndex];
      for (const tab of Array.from(tabs.querySelectorAll(".skill-tab"))) {
        tab.classList.remove("is-active");
      }
      tabs.children[nextIndex].classList.add("is-active");
      buildPanel();
    });

    controls.appendChild(prevBtn);
    controls.appendChild(pageLabel);
    controls.appendChild(nextBtn);
    controls.hidden = orderedKeys.length <= 1;
    panel.appendChild(controls);
  };

  for (const key of orderedKeys) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `skill-tab${key === activeCategory ? " is-active" : ""}`;
    btn.textContent = formatCategory(key);
    btn.addEventListener("click", () => {
      activeCategory = key;
      for (const tab of Array.from(tabs.querySelectorAll(".skill-tab"))) {
        tab.classList.remove("is-active");
      }
      btn.classList.add("is-active");
      buildPanel();
    });
    tabs.appendChild(btn);
  }

  buildPanel();
};

const renderExperiences = (docs) => {
  const wrap = byId("experiences");
  wrap.innerHTML = "";
  if (!docs.length) return setEmpty(wrap);

  const sorted = [...docs].sort(
    (a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime(),
  );
  for (const exp of sorted) {
    const card = document.createElement("article");
    card.className = "item";
    const start = formatDate(exp.startDate);
    const end = exp.current ? "Present" : formatDate(exp.endDate);
    card.innerHTML = `
      <h3>${exp.role || "Role"} ${exp.company ? `- ${exp.company}` : ""}</h3>
      <p>${exp.summary || ""}</p>
      <div class="meta">
        ${start ? `<span class="badge">${start}${end ? ` - ${end}` : ""}</span>` : ""}
        ${exp.location ? `<span class="badge">${exp.location}</span>` : ""}
        ${exp.current ? '<span class="badge featured">Current</span>' : ""}
      </div>
    `;
    wrap.appendChild(card);
  }
};

const renderBlogs = (docs) => {
  const wrap = byId("blogs");
  wrap.innerHTML = "";
  if (!docs.length) return setEmpty(wrap);

  const sorted = [...docs].sort(
    (a, b) => new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime(),
  );
  const [featured, ...rest] = sorted;
  const getImageURL = (post) => {
    const image = post?.coverImage && typeof post.coverImage === "object" ? post.coverImage : null;
    return image?.url || image?.sizes?.avatar?.url || "";
  };
  const getTags = (post) => (post.tags || []).map((t) => t.tag).filter(Boolean);
  const getReadTime = (post) => {
    const text = [post.summary || "", post.content || ""].join(" ").trim();
    const words = text ? text.split(/\s+/).length : 0;
    return `${Math.max(1, Math.round(words / 220))} min read`;
  };

  const featuredCard = document.createElement("article");
  featuredCard.className = "item blog-featured";
  featuredCard.innerHTML = `
    ${getImageURL(featured) ? `<img class="project-image blog-image" src="${getImageURL(featured)}" alt="${featured?.title || "Featured post"}" />` : ""}
    <h3>${featured.title || "Untitled post"}</h3>
    <p>${featured.summary || ""}</p>
    <div class="meta">
      ${featured.publishedDate ? `<span class="badge">${formatDate(featured.publishedDate)}</span>` : ""}
      <span class="badge">${getReadTime(featured)}</span>
      ${featured.slug ? `<span class="badge">/${featured.slug}</span>` : ""}
    </div>
    <div class="meta">
      ${getTags(featured).slice(0, 6).map((tag) => `<span class="badge">${tag}</span>`).join("")}
    </div>
  `;
  wrap.appendChild(featuredCard);

  if (!rest.length) return;

  const controls = document.createElement("div");
  controls.className = "blog-rail-controls";
  const leftBtn = document.createElement("button");
  leftBtn.type = "button";
  leftBtn.className = "page-btn";
  leftBtn.textContent = "←";
  leftBtn.setAttribute("aria-label", "Scroll blog posts left");
  const rightBtn = document.createElement("button");
  rightBtn.type = "button";
  rightBtn.className = "page-btn";
  rightBtn.textContent = "→";
  rightBtn.setAttribute("aria-label", "Scroll blog posts right");
  controls.appendChild(leftBtn);
  controls.appendChild(rightBtn);
  wrap.appendChild(controls);

  const rail = document.createElement("div");
  rail.className = "blog-rail";
  rail.tabIndex = 0;
  rail.setAttribute("aria-label", "Recent blog posts rail");
  for (const post of rest) {
    const card = document.createElement("article");
    card.className = "item blog-mini";
    card.innerHTML = `
      ${getImageURL(post) ? `<img class="project-image blog-mini-image" src="${getImageURL(post)}" alt="${post?.title || "Post"}" />` : ""}
      <h3>${post.title || "Untitled post"}</h3>
      <p>${post.summary || ""}</p>
      <div class="meta">
        ${post.publishedDate ? `<span class="badge">${formatDate(post.publishedDate)}</span>` : ""}
        <span class="badge">${getReadTime(post)}</span>
      </div>
    `;
    rail.appendChild(card);
  }
  wrap.appendChild(rail);

  const scrollAmount = () => Math.max(280, Math.round(rail.clientWidth * 0.82));
  const scrollLeft = () => rail.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
  const scrollRight = () => rail.scrollBy({ left: scrollAmount(), behavior: "smooth" });

  leftBtn.addEventListener("click", scrollLeft);
  rightBtn.addEventListener("click", scrollRight);

  rail.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollLeft();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollRight();
    }
  });
};

const init = async () => {
  initNetworkBackground();
  try {
    const [home, projects, skills, experiences, blogs] = await Promise.all([
      fetchJSON("/api/globals/home?depth=2"),
      fetchJSON("/api/projects?depth=2&limit=24&sort=-startDate"),
      fetchJSON("/api/skills?limit=60"),
      fetchJSON("/api/experiences?limit=24&sort=-startDate"),
      fetchJSON("/api/blog-posts?depth=2&limit=30&sort=-publishedDate"),
    ]);

    renderHome(home);
    renderProjects(projects.docs || []);
    renderSkills(skills.docs || []);
    renderExperiences(experiences.docs || []);
    renderBlogs(blogs.docs || []);
  } catch (err) {
    byId("name").textContent = "Could not load content";
    byId("headline").textContent = "Check that the server and database are running.";
    byId("bio").textContent = err instanceof Error ? err.message : "Unknown error.";
  }
};

void init();
