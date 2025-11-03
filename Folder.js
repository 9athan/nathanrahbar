document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("folder-container");

  const folder = document.createElement("div");
  folder.className = "folder";

  const folderBack = document.createElement("div");
  folderBack.className = "folder__back";

  // Create papers with links
  const papers = [
    { label: "About Me", href: "index2.html#home" },
    { label: "Experience", href: "rivian.html" },
    { label: "Projects", href: "projects.html" }
  ];

  papers.forEach(item => {
    const paper = document.createElement("div");
    paper.className = "paper";
    const link = document.createElement("a");
    link.href = item.href;
    link.className = "folder-link";
    link.textContent = item.label;
    paper.appendChild(link);
    folderBack.appendChild(paper);
  });

  const folderFront = document.createElement("div");
  folderFront.className = "folder__front";

  folderBack.appendChild(folderFront);
  folder.appendChild(folderBack);
  container.appendChild(folder);

  // Toggle open/close on click
  folder.addEventListener("click", () => {
    folder.classList.toggle("open");
  });
});

