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

const escapeAttr = value => String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function renderNewsEditor() {
  newsEditor.innerHTML = news.map((item, index) => `
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
    </article>`).join("");
  document.querySelector("#newsCount").textContent = `${news.length} noticia${news.length === 1 ? "" : "s"}`;
}

function renderEventsEditor() {
  eventsEditor.innerHTML = events.map((item, index) => `
    <article class="repeat-card" data-index="${index}">
      <div class="repeat-card-head"><span>Evento ${index + 1}</span><button type="button" class="remove-button" data-remove-event="${index}">Eliminar</button></div>
      <div class="repeat-grid">
        <label>Mes<input data-event-field="month" value="${escapeAttr(item.month)}" maxlength="8"></label>
        <label>Día<input data-event-field="day" value="${escapeAttr(item.day)}" maxlength="2" inputmode="numeric"></label>
        <label class="full">Nombre del evento<input data-event-field="title" value="${escapeAttr(item.title)}"></label>
      </div>
    </article>`).join("");
  document.querySelector("#eventsCount").textContent = `${events.length} evento${events.length === 1 ? "" : "s"}`;
}

function getData() {
  const values = Object.fromEntries(new FormData(form).entries());
  return { ...values, news, events };
}
function updatePreview() {
  currentHtml = buildNewsletter(getData());
  previewFrame.srcdoc = currentHtml;
}
function refresh() {
  updatePreview();
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
      const previewBody = document.querySelector("#previewFrame").contentDocument.body;
      const blobHtml = new Blob([previewBody.innerHTML], { type: "text/html" });
      const blobText = new Blob([previewBody.innerText], { type: "text/plain" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": blobHtml, "text/plain": blobText })]);
      feedback.textContent = "¡Copiado! Ahora pégalo en el cuerpo de un correo nuevo en Gmail.";
    } else {
      feedback.textContent = "Tu navegador no permite copiar formato enriquecido desde esta página. Usa «Ver código HTML» o prueba en Chrome con la página en localhost/HTTPS.";
    }
  } catch (error) {
    feedback.textContent = "No fue posible copiar automáticamente. Puedes revisar el código HTML y descargar el archivo.";
  }
}
function downloadHtml() {
  const blob = new Blob([currentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "boletin-somosminas.html";
  anchor.click();
  URL.revokeObjectURL(url);
}

newsEditor.addEventListener("input", event => {
  const field = event.target.dataset.newsField;
  if (!field) return;
  const index = Number(event.target.closest("[data-index]").dataset.index);
  news[index][field] = event.target.value;
  refresh();
});
newsEditor.addEventListener("click", event => {
  const index = event.target.dataset.removeNews;
  if (index === undefined) return;
  news.splice(Number(index), 1);
  renderNewsEditor();
  refresh();
});
eventsEditor.addEventListener("input", event => {
  const field = event.target.dataset.eventField;
  if (!field) return;
  const index = Number(event.target.closest("[data-index]").dataset.index);
  events[index][field] = event.target.value;
  refresh();
});
eventsEditor.addEventListener("click", event => {
  const index = event.target.dataset.removeEvent;
  if (index === undefined) return;
  events.splice(Number(index), 1);
  renderEventsEditor();
  refresh();
});

form.addEventListener("input", refresh);
document.querySelector("#addNews").addEventListener("click", () => {
  news.push({ category: "NUEVA NOTICIA", title: "Título de la noticia", description: "Escribe una breve descripción de la noticia.", image: "", alt: "", link: "" });
  renderNewsEditor();
  refresh();
});
document.querySelector("#addEvent").addEventListener("click", () => {
  events.push({ month: "NOV", day: "01", title: "Nombre del evento" });
  renderEventsEditor();
  refresh();
});
document.querySelector("#finishButton").addEventListener("click", openModal);
document.querySelector("#closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.querySelector("#copyButton").addEventListener("click", copyRichHtml);
document.querySelector("#showCodeButton").addEventListener("click", () => {
  document.querySelector("#codeWrap").hidden = false;
  document.querySelector("#htmlCode").value = currentHtml;
});
document.querySelector("#copyCodeButton").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentHtml);
    document.querySelector("#copyFeedback").textContent = "Código HTML copiado.";
  } catch {
    document.querySelector("#htmlCode").select();
    document.execCommand("copy");
    document.querySelector("#copyFeedback").textContent = "Código seleccionado/copiar. Si no se copió, usa Ctrl+C.";
  }
});
document.querySelector("#downloadButton").addEventListener("click", downloadHtml);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

renderNewsEditor();
renderEventsEditor();
refresh();
