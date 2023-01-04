/** Sidebar where projects are listed */
const $sidebar = document.querySelector(".projects__sidebar");
/** Button to add a new project */
const $btnAddProject = document.getElementById("btn_addProject");
/** Ul where projects are listed */
const $projects = document.getElementById("projects");
/** Container where the current project is displayed */
const $projectWrapper = document.getElementById("project");
/** All templates available */
const $templates = {
  project: document.getElementById("template-project"),
  piece: document.getElementById("template-piece"),
};
const LS_KEY_PROJECTS = "projects";
const LS_KEY_INCREMENT_ID = "project-id";
const eventProjectEdited = new Event("project-edited");

function saveProjects() {
  localStorage.setItem(LS_KEY_PROJECTS, JSON.stringify(oProjects.projects));
}

function loadProjects() {
  return JSON.parse(localStorage.getItem(LS_KEY_PROJECTS)) ?? [];
}

/**
 * Creates a new project and add his name to the list of projects
 */
function addProject(p) {
  const project = new Project(n++, p);
  oProjects.projects.push(project);
  $projects.appendChild(project.createElement());
}

/**
 * It adds a piece to the project, and if the show parameter is true, it shows the piece.
 * @param {Piece|Project} p - The piece to add.
 * @param [show=true] - Whether or not to show the piece.
 */
function addPiece(p, show = true) {
  const piece = p instanceof Piece ? p : p.addPiece();
  document.getElementById("pieces").appendChild(piece.createElement());

  show && piece.show();
}

/** Display/Hide the sidebar */
function toggleSidebar() {
  $sidebar.parentNode.classList.toggle("sidebar-hidden");
}

class Project {
  /**
   * Create an instance of Project
   * @param {number} n Incremental value for the id and the default name
   * @param {Project=} project Data of the project if loaded
   */
  constructor(n, project) {
    // project infos
    this.id = n;
    this.name = `New Project ${n}`;
    this.desc = "This is a description of a new project";

    // If project already exists, fill all values
    project & Object.assign(this, project);

    // pieces infos
    this.pieces = [];
    project.pieces?.forEach((p) => this.addPiece(p));
    this.nPiece = project.nPiece ?? 1;
  }

  /**
   * Update the name of the project. Also update the name in the sidebar.
   * @param {string} name - The new name of the project
   */
  setName(name) {
    this.name = name;
    this.getElement().textContent = name;
    document.dispatchEvent(eventProjectEdited);
  }

  /**
   * Update the description of the project.
   * @param {string} desc - The description of the item.
   */
  setDesc(desc) {
    this.desc = desc;
    document.dispatchEvent(eventProjectEdited);
  }

  /**
   * Create an element with the name of the project
   * @returns {HTMLLiElement} The li element of the projects list
   */
  createElement() {
    const $li = document.createElement("li");
    $li.setAttribute("project-id", this.id);
    $li.textContent = this.name;
    $li.addEventListener("click", () => this.show());

    return $li;
  }

  /**
   * Return the element from the projects list
   * @returns {HTMLLiElement}
   */
  getElement() {
    return $projects.querySelector(`[project-id="${this.id}"]`);
  }

  /**
   * Get the content of the template and set the name and description.
   * @returns {HTMLElement}
   */
  getTemplate() {
    // Get the template content
    const template = $templates.project.cloneNode(true).content;

    // Update the title and desc
    template.querySelector(".project_name").textContent = this.name;
    template.querySelector(".project_desc").textContent = this.desc;

    return template;
  }

  /**
   * Create a new piece and add it to the project
   * @param {Piece=} p Object with all properties of the piece (used for loading of localStorage)
   * @returns {Piece}
   */
  addPiece(p) {
    const piece = new Piece(this.nPiece++, this.id, p);
    this.pieces.push(piece);
    document.dispatchEvent(eventProjectEdited);

    return piece;
  }

  /**
   * Remove the piece with the given id from the project
   * @param {number} id Id of the piece to remove
   */
  removePiece(id) {
    this.pieces = this.pieces.filter((p) => p.id !== id);
    document.dispatchEvent(eventProjectEdited);
  }

  /**
   * It returns the last piece in the pieces array.
   * @returns {Piece=} The last piece in the array.
   */
  lastPiece() {
    return this.pieces.at(-1);
  }

  /**
   * If the last piece exists, show it
   */
  showLastPiece() {
    const last = this.lastPiece();
    last && last.show();
  }

  /**
   * Set the project to active
   */
  setActive() {
    $projects.childNodes.forEach((p) => p.classList.remove("active"));
    this.getElement().classList.add("active");
  }

  /**
   * Display the project.
   *
   * Set the current active project and display the project in the right side.
   * Then add the pieces of the project and finally add all events.
   */
  show() {
    this.setActive();

    // Update the DOM
    $projectWrapper.replaceChildren(this.getTemplate());

    // Sidebar piece
    this.pieces.forEach((p) => addPiece(p, false));
    this.showLastPiece();

    // Add all events
    this.handleEvents($projectWrapper);
  }

  /**
   * Create all events for the project
   * @param {HTMLElement} wrapper 
   */
  handleEvents(wrapper) {
    const $btnToggleSidebar = wrapper.querySelector("#btn_toggleSidebar");
    const $btnRemove = wrapper.querySelector("#btn_removeProject");
    const $title = wrapper.querySelector(".project_name");
    const $desc = wrapper.querySelector(".project_desc");
    const $btnAddPiece = wrapper.querySelector("#btn_addPiece");

    $btnToggleSidebar.addEventListener("click", toggleSidebar);
    $btnRemove.addEventListener("click", () => this.remove());
    $title.addEventListener("input", (e) => {
      this.setName(e.currentTarget.textContent);
    });
    $desc.addEventListener("input", (e) =>
      this.setDesc(e.currentTarget.textContent)
    );

    $btnAddPiece.addEventListener("click", () => addPiece(this));
  }

  /**
   * Remove the project
   */
  remove() {
    this.getElement().remove();
    $projectWrapper.replaceChildren();
    oProjects.projects = oProjects.projects.filter((p) => p.id !== this.id);
    document.dispatchEvent(eventProjectEdited);
  }
}

class Piece {
  /**
   * Create an instance of Piece
   * @param {number} n Incremental value for the id and the default name
   * @param {number} idProject Id of the project of the piece
   * @param {Piece=} piece Data of the piece if loaded
   */
  constructor(n, idProject, piece) {
    this.id = n;
    this.name = `New Piece ${n++}`;
    this.desc = "This is a description of a new piece";
    this.photos = [];
    this.idProject = idProject;

    // If piece already exist, fill all values
    piece & Object.assign(this, piece);
  }

  /**
   * Update the name of the piece
   * @param {string} name New name
   */
  setName(name) {
    this.name = name;
    this.getElement().textContent = name;
  }

  /**
   * Update the description of the piece
   * @param {string} desc New description
   */
  setDesc(desc) {
    this.desc = desc;
  }

  /**
   * Create a list element with the name of the piece
   * @returns {HTMLLiElement}
   */
  createElement() {
    const $li = document.createElement("li");
    $li.setAttribute("piece-id", this.id);
    $li.textContent = this.name;
    $li.addEventListener("click", () => this.show());

    return $li;
  }

  /**
   * Returns the piece element from his id
   * @returns {HTMLLiElement}
   */
  getElement() {
    return document.querySelector(`[piece-id="${this.id}"]`);
  }

  /**
   * Recover the template of piece to create an element with the name and
   * description of the piece.
   * @returns {HTMLElement}
   */
  getTemplate() {
    // Get the template content
    const template = $templates.piece.cloneNode(true).content;

    // Update the title and desc
    template.querySelector(".piece_name").textContent = this.name;
    template.querySelector(".piece_desc").textContent = this.desc;

    return template;
  }

  /**
   * Set the piece to active and show it in the right side of the page
   */
  setActive() {
    const pieces = document.getElementById("pieces").childNodes;
    pieces.forEach((p) => p.classList.remove("active"));
    this.getElement().classList.add("active");
  }

  /**
   * Create all events for the piece
   * @param {HTMLElement} wrapper 
   */
  handleEvents(wrapper) {
    const $btnRemove = wrapper.querySelector("#btn_removePiece");
    const $title = wrapper.querySelector(".piece_name");
    const $desc = wrapper.querySelector(".piece_desc");
    const $form = wrapper.querySelector("#form_files");
    const $input = wrapper.querySelector("#input_file");

    $btnRemove.addEventListener("click", () => this.remove());
    $title.addEventListener("input", (e) => {
      this.setName(e.currentTarget.textContent);
    });
    $desc.addEventListener("input", (e) =>
      this.setDesc(e.currentTarget.textContent)
    );
    $input.addEventListener("change", (e) => this.changeImages(e), false);
    $form.addEventListener("submit", (e) => this.addPhotos(e));
  }

  /**
   * Show the project in the right side
   */ 
  show() {
    this.setActive();

    // Update the DOM
    const $pieceWrapper = document.getElementById("piece");
    $pieceWrapper.replaceChildren(this.getTemplate());

    this.showThumbnail();

    // Add all events
    this.handleEvents($pieceWrapper);
  }

  /**
   * Add photos previewed
   */
  addPhotos(e) {
    e.preventDefault();
    this.photos.push(
      ...Array.from(document.querySelector(".preview_files").childNodes).map(
        (p) => p.src
      )
    );
    e.target.querySelector("#input_file").value = "";
    document.dispatchEvent(eventProjectEdited);
  }

  /**
   * Called when the file input is changed
   * @param {Event} e 
   */
  changeImages(e) {
    Array.from(e.target.files).forEach((file) => {
      // On s'assure que `file.name` termine par 
      // une des extensions souhaitées
      if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        this.createThumbnail(file);
      }
    });
  }

  /**
   * Create a thumbnail from a file input
   * @param {File} file
   */
  createThumbnail(file) {
    const preview = document.querySelector(".preview_files");
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const img = document.createElement("img");
      img.src = reader.result;
      preview.appendChild(img);
    });
    reader.readAsDataURL(file);
  }

  /**
   * Create a thumbnail from a blob data
   * @param {Blob} src
   */
  createThumbnailFromBlob(src) {
    console.log(src)
    const preview = document.querySelector(".preview_files");
    const img = document.createElement("img");
    img.src = src;
    preview.appendChild(img);
  }

  /**
   * Show all the thumbnails of the piece
   */
  showThumbnail() {
    this.photos.forEach((src) => this.createThumbnailFromBlob(src));
  }

  /**
   * Remove the piece of the project
   */
  remove() {
    this.getElement().remove();
    document.getElementById("piece").replaceChildren();

    const project = oProjects.projects.find((p) => p.id === this.idProject);
    project.removePiece(this.id);
    project.showLastPiece();
  }
}

/** Number used to increment the name of the new project */
let n = 1;
/** @type {Project[]} */
let data = loadProjects();

// Observable to detect when the projects has changed
const oProjects = ObservableSlim.create(
  { projects: [], n },
  true,
  saveProjects
);

// Add all projects of data
data.map(addProject);

$btnAddProject.addEventListener("click", addProject);
document.addEventListener("project-edited", saveProjects);
