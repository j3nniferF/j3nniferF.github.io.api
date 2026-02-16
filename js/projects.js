"use strict";

const GITHUB_USERNAME = "j3nniferF";
const PROJECTS_CONTAINER_ID = "projects";
const MAX_REPOS = 8;

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function repoCard(repo) {
  const name = escapeHtml(repo.name);
  const desc = escapeHtml(repo.description || "No description yet.");
  const url = repo.html_url;
  const homepage =
    repo.homepage && repo.homepage.startsWith("http") ? repo.homepage : "";
  const updated = formatDate(repo.updated_at);
  const lang = escapeHtml(repo.language || "");

  return `
    <article class="project-card">
      <h3 class="project-title">${name}</h3>
      <p class="project-desc">${desc}</p>

      <div class="project-meta">
        ${lang ? `<span class="project-pill">${lang}</span>` : ""}
        ${updated ? `<span class="project-updated">Updated ${updated}</span>` : ""}
      </div>

      <div class="project-links">
        <a class="project-link" href="${url}" target="_blank" rel="noopener noreferrer">GitHub</a>
        ${homepage ? `<a class="project-link" href="${homepage}" target="_blank" rel="noopener noreferrer">Live</a>` : ""}
      </div>
    </article>
  `;
}

async function loadProjects() {
  const container = document.getElementById(PROJECTS_CONTAINER_ID);
  if (!container) return;

  container.innerHTML = `<p class="projects-loading">Loading projects…</p>`;

  const endpoint = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

  try {
    const res = await fetch(endpoint);

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const repos = await res.json();

    const filtered = repos
      .filter((r) => !r.fork)
      .filter((r) => r.name !== `${GITHUB_USERNAME}.github.io`)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, MAX_REPOS);

    if (!filtered.length) {
      container.innerHTML = `<p class="projects-loading">No projects found.</p>`;
      return;
    }

    container.innerHTML = filtered.map(repoCard).join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="projects-loading">Couldn’t load projects right now.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadProjects);
