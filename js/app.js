import { initialNews, initialEvents } from "./data.js";
import { buildNewsletter } from "./template.js";

const form = document.querySelector("#newsletterForm");
const newsEditor = document.querySelector("#newsEditor");
const eventsEditor = document.querySelector("#eventsEditor");
const previewFrame = document.querySelector("#previewFrame");
const modal = document.querySelector("#finishModal");

let news = structuredClone(initialNews);
let events = structuredClone(initialEvents);
let currentHtml = "";
let previewUpdateTimer = null;
let previewInitialized = false;

const escapeAttr = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

function renderNewsEditor() {
  newsEditor.innerHTML = news
    .map(
      (item, index) => `
    <article class="repeat-card" data-index="${index}">
      <div class="repeat-card-head"><span>Noticia ${index + 1}</span><button type="button" class="remove-button" data-remove-news="${index}">Eliminar</button></div>
      <div class="repeat-grid">
        <label class="full">Categoría<input data-news-field="category" value="${escapeAttr(item.category)}"></label>
        <label class="full">Título<input data-news-field="title" value="${escapeAttr(item.title)}"></label>
        <label class="full">Descripción<textarea data-news-field="description" rows="2">${escapeAttr(item.description)}</textarea></label>
        <label class="full">URL de imagen<input data-news-field="image" type="url" value="${escapeAttr(item.image)}" placeholder="https://..."></label>
        <label class="full">Texto alternativo<input data-news-field="alt" value="${escapeAttr(item.alt)}"></label>
        <label class="full">Enlace de la noticia<input data-news-field="link" type="url" value="${escapeAttr(item.link)}" placeholder="https://..."></label>
      </div>
    </article>`,
    )
    .join("");
  document.querySelector("#newsCount").textContent =
    `${news.length} noticia${news.length === 1 ? "" : "s"}`;
}

function renderEventsEditor() {
  eventsEditor.innerHTML = events
    .map(
      (item, index) => `
    <article class="repeat-card" data-index="${index}">
      <div class="repeat-card-head"><span>Evento ${index + 1}</span><button type="button" class="remove-button" data-remove-event="${index}">Eliminar</button></div>
      <div class="repeat-grid">
        <label>Fecha de inicio<input data-event-field="startDate" type="date" value="${escapeAttr(item.startDate)}" required></label>
        <label>Fecha de finalización<input data-event-field="endDate" type="date" value="${escapeAttr(item.endDate)}"></label>
        <label>Hora de inicio<input data-event-field="startTime" type="time" value="${escapeAttr(item.startTime)}"></label>
        <label>Hora de finalización<input data-event-field="endTime" type="time" value="${escapeAttr(item.endTime)}"></label>
        <label class="full">Lugar del evento<input data-event-field="place" value="${escapeAttr(item.place)}" placeholder="Ej. Auditorio Alejandro López"></label>
        <label class="full">Nombre del evento<input data-event-field="title" value="${escapeAttr(item.title)}"></label>
      </div>
    </article>`,
    )
    .join("");
  document.querySelector("#eventsCount").textContent =
    `${events.length} evento${events.length === 1 ? "" : "s"}`;
}

function getData() {
  const values = Object.fromEntries(new FormData(form).entries());
  return { ...values, news, events };
}

// Inicializa el documento del iframe una sola vez. En las siguientes ediciones
// actualiza solamente su contenido, sin navegar/recrear el iframe. Esto evita
// el parpadeo y conserva naturalmente el scroll del editor y de la vista previa.
function updatePreview() {
  const html = buildNewsletter(getData());
  currentHtml = html;

  const parsed = new DOMParser().parseFromString(html, "text/html");
  const nextBody = parsed.body.innerHTML;
  const frameDocument = previewFrame.contentDocument;

  if (!previewInitialized || !frameDocument?.body) {
    previewFrame.srcdoc = html;
    previewInitialized = true;
    return;
  }

  if (frameDocument.body.innerHTML !== nextBody) {
    frameDocument.body.innerHTML = nextBody;
  }
}

// Agrupa las pulsaciones rápidas para no reconstruir la vista previa en cada tecla.
// El pequeño retraso no afecta los datos: solamente evita trabajo y repintados innecesarios.
function refresh() {
  window.clearTimeout(previewUpdateTimer);
  previewUpdateTimer = window.setTimeout(updatePreview, 100);
}

function openModal() {
  currentHtml = buildNewsletter(getData());
  document.querySelector("#htmlCode").value = currentHtml;
  document.querySelector("#copyFeedback").textContent = "";
  document.querySelector("#codeWrap").hidden = true;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

async function copyRichHtml() {
  const feedback = document.querySelector("#copyFeedback");
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const parsed = new DOMParser().parseFromString(currentHtml, "text/html");
      const blobHtml = new Blob([parsed.body.innerHTML], { type: "text/html" });
      const blobText = new Blob([parsed.body.innerText], {
        type: "text/plain",
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blobHtml, "text/plain": blobText }),
      ]);
      feedback.textContent =
        "¡Copiado! Ahora pégalo en el cuerpo de un correo nuevo en Gmail.";
    } else {
      feedback.textContent =
        "Tu navegador no permite copiar formato enriquecido. Usa «Ver código HTML» o prueba en Chrome con localhost/HTTPS.";
    }
  } catch {
    feedback.textContent =
      "No fue posible copiar automáticamente. Puedes revisar el código HTML y descargar el archivo.";
  }
}
function downloadHtml() {
  const blob = new Blob([currentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "boletin-somosminas.html";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

newsEditor.addEventListener("input", (event) => {
  const field = event.target.dataset.newsField;
  if (!field) return;
  const index = Number(event.target.closest("[data-index]").dataset.index);
  news[index][field] = event.target.value;
  refresh();
});
newsEditor.addEventListener("click", (event) => {
  const index = event.target.dataset.removeNews;
  if (index === undefined) return;
  news.splice(Number(index), 1);
  renderNewsEditor();
  refresh();
});
eventsEditor.addEventListener("input", (event) => {
  const field = event.target.dataset.eventField;
  if (!field) return;
  const index = Number(event.target.closest("[data-index]").dataset.index);
  events[index][field] = event.target.value;
  refresh();
});
eventsEditor.addEventListener("change", (event) => {
  const field = event.target.dataset.eventField;
  if (!field) return;
  const index = Number(event.target.closest("[data-index]").dataset.index);
  events[index][field] = event.target.value;
  refresh();
});
eventsEditor.addEventListener("click", (event) => {
  const index = event.target.dataset.removeEvent;
  if (index === undefined) return;
  events.splice(Number(index), 1);
  renderEventsEditor();
  refresh();
});

form.addEventListener("input", (event) => {
  if (!event.target.dataset.newsField && !event.target.dataset.eventField)
    refresh();
});
form.addEventListener("change", (event) => {
  if (!event.target.dataset.newsField && !event.target.dataset.eventField)
    refresh();
});

document.querySelector("#addNews").addEventListener("click", () => {
  news.push({
    category: "NUEVA NOTICIA",
    title: "Título de la noticia",
    description: "Escribe una breve descripción de la noticia.",
    image: "",
    alt: "",
    link: "",
  });
  renderNewsEditor();
  refresh();
});
document.querySelector("#addEvent").addEventListener("click", () => {
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 10);
  events.push({
    startDate: localDate,
    endDate: "",
    startTime: "",
    endTime: "",
    place: "",
    title: "Nombre del evento",
  });
  renderEventsEditor();
  refresh();
});
document.querySelector("#finishButton").addEventListener("click", openModal);
document.querySelector("#closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.querySelector("#copyButton").addEventListener("click", copyRichHtml);
document.querySelector("#showCodeButton").addEventListener("click", () => {
  document.querySelector("#codeWrap").hidden = false;
  document.querySelector("#htmlCode").value = currentHtml;
});
document
  .querySelector("#copyCodeButton")
  .addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(currentHtml);
      document.querySelector("#copyFeedback").textContent =
        "Código HTML copiado.";
    } catch {
      document.querySelector("#htmlCode").select();
      document.execCommand("copy");
      document.querySelector("#copyFeedback").textContent =
        "Código seleccionado/copiar. Si no se copió, usa Ctrl+C.";
    }
  });
document
  .querySelector("#downloadButton")
  .addEventListener("click", downloadHtml);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

renderNewsEditor();
renderEventsEditor();
refresh();
