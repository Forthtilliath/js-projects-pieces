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

/** Number used to increment the name of the new project */
let n = 1;

$btnAddProject.addEventListener("click", addProject);

/**
 * Creates a new project and add his name to the list of projects
 */
function addProject() {
  const project = new Project(n++);
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
  constructor(n) {
    // project infos
    this.id = n;
    this.name = `New Project ${n}`;
    this.desc = "This is a description of a new project";
    // pieces infos
    this.nPiece = 1;
    this.pieces = [];
  }

  /**
   * Update the name of the project. Also update the name in the sidebar.
   * @param {string} name - The new name of the project
   */
  setName(name) {
    this.name = name;
    this.getElement().textContent = name;
  }

  /**
   * Update the description of the project.
   * @param {string} desc - The description of the item.
   */
  setDesc(desc) {
    this.desc = desc;
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
   * @returns {Piece}
   */
  addPiece() {
    const piece = new Piece(this.nPiece++, this);
    this.pieces.push(piece);

    return piece;
  }

  /**
   * Remove the piece with the given id from the project
   * @param {number} id
   */
  removePiece(id) {
    this.pieces = this.pieces.filter((p) => p.id !== id);
  }

  /**
   * It returns the last piece in the pieces array.
   * @returns The last piece in the array.
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
   * The add the pieces of the project and finally add all events.
   * @param {Project} p - The project object
   */
  show() {
    this.setActive();
  
    // Update the DOM
    $projectWrapper.replaceChildren(this.getTemplate());
  
    // Sidebar piece
    this.pieces.forEach((p) => addPiece(p, false));
    this.showLastPiece();
  
    // Add all events
    //   handleProjectEvents($projectWrapper, p);
    this.handleEvents($projectWrapper);
  }

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

  remove() {
    this.getElement().remove();
    $projectWrapper.replaceChildren();
  }
}

class Piece {
  constructor(n, p) {
    this.id = n;
    this.name = `New Piece ${n++}`;
    this.desc = "This is a description of a new piece";
    this.photos = [];
    this.project = p;
  }

  setName(name) {
    this.name = name;
    this.getElement().textContent = name;
  }

  setDesc(desc) {
    this.desc = desc;
  }

  createElement() {
    const $li = document.createElement("li");
    $li.setAttribute("piece-id", this.id);
    $li.textContent = this.name;
    $li.addEventListener("click", () => this.show());

    return $li;
  }

  getElement() {
    return document.querySelector(`[piece-id="${this.id}"]`);
  }

  getTemplate() {
    // Get the template content
    const template = $templates.piece.cloneNode(true).content;

    // Update the title and desc
    template.querySelector(".piece_name").textContent = this.name;
    template.querySelector(".piece_desc").textContent = this.desc;

    return template;
  }

  setActive() {
    const pieces = document.getElementById("pieces").childNodes;
    pieces.forEach((p) => p.classList.remove("active"));
    this.getElement().classList.add("active");
  }

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
    //   $form.addEventListener("submit", (e) => this.addPhotos(e));
    $form.addEventListener("submit", (e) => this.addPhotos(e));
  }

  // Show the project in the right side
  show() {
    // setActivePiece(p.id);
    this.setActive();
  
    // Update the DOM
    const $pieceWrapper = document.getElementById("piece");
    $pieceWrapper.replaceChildren(this.getTemplate());
  
    this.showThumbnail();
  
    // Add all events
    this.handleEvents($pieceWrapper);
  }

  addPhotos(e) {
    e.preventDefault();
    this.photos.push(...document.querySelector(".preview_files").childNodes);
    e.target.querySelector("#input_file").value = "";
  }

  changeImages(e) {
    // document.querySelector(".preview_files").replaceChildren();
    const allowedTypes = ["png", "jpg", "jpeg", "gif"];
    Array.from(e.target.files).forEach((f) => {
      const extension = f.name.split(".").pop();
      if (allowedTypes.includes(extension)) {
        this.createThumbnail(f);
      }
    });
  }

  createThumbnail(f) {
    const preview = document.querySelector(".preview_files");
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const img = document.createElement("img");
      img.src = reader.result;
      //   this.photos.push(img);
      preview.appendChild(img);
    });
    reader.readAsDataURL(f);
  }

  showThumbnail(f) {
    const preview = document.querySelector(".preview_files");
    this.photos.forEach((img) => preview.appendChild(img));
  }

  remove() {
    this.getElement().remove();
    document.getElementById("piece").replaceChildren();

    this.project.removePiece(this.id);
    this.project.showLastPiece();
  }
}
