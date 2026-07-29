let currentSlug = null;
let dislikes = null;
let attempts = 0;
let fetching = false;

const fmt = (n) =>
  n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K" : String(n);

const getSlug = () => {
  const m = location.pathname.match(/^\/problems\/([^/]+)/);
  return m ? m[1] : null;
};

async function fetchDislikes(slug) {
  try {
    const res = await fetch("/graphql/", {
      method: "POST",
      credentials: "omit",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query:
          "query q($titleSlug: String!) { question(titleSlug: $titleSlug) { dislikes } }",
        variables: { titleSlug: slug },
      }),
    });
    return (await res.json())?.data?.question?.dislikes ?? null;
  } catch {
    return null;
  }
}

function findDislikeButtons() {
  const btns = new Set();
  document
    .querySelectorAll('svg.fa-thumbs-down, svg[data-icon="thumbs-down"]')
    .forEach((svg) => {
      const btn = svg.closest("button") || svg.closest('[role="button"]');
      if (btn) btns.add(btn);
    });
  if (!btns.size) {
    // aria-label fallback in case the icon markup changes
    document
      .querySelectorAll('button[aria-label*="islike"], [role="button"][aria-label*="islike"]')
      .forEach((b) => btns.add(b));
  }
  return [...btns];
}

function inject() {
  if (dislikes == null) return;
  findDislikeButtons().forEach((btn) => {
    // button is square icon-only by default, make room for the count
    btn.classList.remove("aspect-1", "p-1.5", "gap-2");
    btn.classList.add("gap-1", "px-3", "py-1", "lc-md:px-2");
    btn.style.aspectRatio = "auto";
    btn.style.columnGap = "4px";
    let badge = btn.querySelector(".lc-dislike-count");
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "lc-dislike-count";
      btn.appendChild(badge);
    }
    const text = fmt(dislikes);
    if (badge.textContent !== text) badge.textContent = text;
  });
}

async function update() {
  const slug = getSlug();
  if (!slug) return;
  if (slug !== currentSlug) {
    currentSlug = slug;
    dislikes = null;
    attempts = 0;
  }
  if (dislikes == null && attempts < 3 && !fetching) {
    attempts++;
    fetching = true;
    const count = await fetchDislikes(slug);
    fetching = false;
    if (getSlug() !== slug) return;
    dislikes = count;
  }
  inject();
}

// leetcode is a SPA, so re-run on DOM changes
let timer = null;
new MutationObserver(() => {
  clearTimeout(timer);
  timer = setTimeout(update, 300);
}).observe(document.documentElement, { childList: true, subtree: true });

update();
