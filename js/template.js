const esc = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

const safeUrl = (value) => {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) ? esc(url) : "";
};
const font = "'Ancizar Sans','Trebuchet MS',Arial,Helvetica,sans-serif";
const p = (text, style = "") =>
  `<p style="margin:0;${style}font-family:${font};">${text}</p>`;

function newsCard(item, cellWidth = "50%") {
  const image = safeUrl(item.image);
  const link = safeUrl(item.link);

  return `<td width="${cellWidth}" valign="top"
    style="padding:8px;width:${cellWidth};">
    <table style="width:100%;border:1px solid #e5eaf0;
      border-radius:10px;overflow:hidden;
      border-collapse:separate;background-color:#ffffff;"
      role="presentation" cellpadding="0" cellspacing="0" border="0">

      <tr>
        <td>
          ${
            image
              ? `<img src="${image}" alt="${esc(item.alt)}"
          width="280" style="width:100%;height:auto;display:block;border:0;">`
              : ""
          }
        </td>
      </tr>

      <tr>
        <td style="padding:16px;font-family:${font};">
          ${p(esc(item.category), "margin:0 0 9px;color:#159c9a;font-size:10px;font-weight:bold;letter-spacing:1px;")}

          <h3 style="margin:0 0 10px;color:#102c4e;font-size:17px;line-height:1.4;font-family:${font};">
            ${esc(item.title)}
          </h3>

          ${p(esc(item.description), "margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.7;")}

          ${link ? `<a href="${link}" style="color:#128b8b;font-size:12px;font-weight:bold;text-decoration:none;font-family:${font};" target="_blank">Leer noticia →</a>` : ""}
        </td>
      </tr>
    </table>
  </td>`;
}

function eventCell(item, cellWidth = "25%") {
  return `
    <td width="${cellWidth}" valign="top"
      style="padding:5px;width:${cellWidth};">

      <table role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="width:100%;height:125px;table-layout:fixed;
        border:1px solid #e4eaf0;border-radius:8px;
        border-collapse:separate;background:#fff;">

        <tr>
          <td align="center" valign="middle"
            style="padding:8px 4px;font-family:${font};">

            ${p(esc(item.month), "color:#159c9a;font-size:10px;font-weight:bold;")}

            ${p(esc(item.day), "margin:5px 0;color:#102c4e;font-size:25px;font-weight:bold;")}

            ${p(esc(item.title), "color:#64748b;font-size:11px;line-height:1.4;")}

          </td>
        </tr>
      </table>
    </td>
  `;
}

export function buildNewsletter(data) {
  const newsRows = [];

  for (let i = 0; i < data.news.length; i += 2) {
    const pair = data.news.slice(i, i + 2);

    if (pair.length === 2) {
      // Dos noticias: distribución normal
      newsRows.push(`
      <tr>
        ${pair.map((item) => newsCard(item)).join("")}
      </tr>
    `);
    } else {
      // Una noticia: centrada
      newsRows.push(`
      <tr>
        <td colspan="2" align="center" style="padding:0;">
          <table role="presentation"
            width="50%"
            align="center"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="width:50%;border-collapse:collapse;">
            <tr>
              ${newsCard(pair[0], "100%")}
            </tr>
          </table>
        </td>
      </tr>
    `);
    }
  }
  const eventRows = [];

  for (let i = 0; i < data.events.length; i += 4) {
    const group = data.events.slice(i, i + 4);

    if (group.length === 4) {
      // Cuatro eventos: distribución normal
      eventRows.push(`
      <tr>
        ${group.map((item) => eventCell(item)).join("")}
      </tr>
    `);
    } else {
      // Última fila incompleta: centrar automáticamente
      const tableWidth = `${group.length * 25}%`;
      const cellWidth = `${100 / group.length}%`;

      eventRows.push(`
      <tr>
        <td colspan="4" align="center" style="padding:0;">

          <table role="presentation"
            width="${group.length * 25}%"
            align="center"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="width:${tableWidth};border-collapse:collapse;">

            <tr>
              ${group.map((item) => eventCell(item, cellWidth)).join("")}
            </tr>

          </table>

        </td>
      </tr>
    `);
    }

    if (i + 4 < data.events.length) {
      eventRows.push(`
      <tr>
        <td colspan="4" height="6"
          style="height:6px;font-size:0;line-height:6px;">
          &nbsp;
        </td>
      </tr>
    `);
    }
  }

  const featureImage = safeUrl(data.featureImage);
  const featureUrl = safeUrl(data.featureUrl);
  const socials = [
    [
      "https://www.instagram.com/minasmedellinunal/?hl=es",
      "https://img.icons8.com/ios-glyphs/30/FFFFFF/instagram-new.png",
      "Instagram",
      24,
    ],
    [
      "https://www.facebook.com/fminas/?locale=es_LA",
      "https://img.icons8.com/ios-glyphs/30/FFFFFF/facebook-new.png",
      "Facebook",
      24,
    ],
    [
      "https://www.youtube.com/c/FacultaddeMinasUNAL",
      "https://img.icons8.com/ios-glyphs/30/FFFFFF/youtube-play.png",
      "YouTube",
      26,
    ],
    ["https://x.com/fminas", "https://cdn.simpleicons.org/x/FFFFFF", "X", 24],
    [
      "https://co.linkedin.com/company/fminas",
      "https://img.icons8.com/ios-glyphs/30/FFFFFF/linkedin.png",
      "LinkedIn",
      24,
    ],
    [
      "https://api.whatsapp.com/send?phone=573194188262&text=Hola%2c%20quiero%20que%20me%20agreguen%20a%20la%20lista%20de%20difusi%c3%b3n%20de%20Whatsapp.%20Soy%3a",
      "https://img.icons8.com/ios-glyphs/30/FFFFFF/whatsapp.png",
      "WhatsApp",
      24,
    ],
  ];

  return `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Boletín #SomosMinas</title></head>
<body style="margin:0;padding:0;background-color:#eef1f5;">
<div style="display:none;font-size:1px;color:#eef1f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Noticias, actividades y próximos eventos de la Facultad de Minas - UNAL Medellín.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f5;width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:24px 10px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:#fff;border-collapse:collapse;border-radius:8px;overflow:hidden;">
<tr><td align="center" style="padding:38px 24px 34px;background:#102c4e;font-family:${font};">
${p("FACULTAD DE MINAS · UNIVERSIDAD NACIONAL DE COLOMBIA", "margin:0 0 12px;color:#c9d9e9;font-size:11px;letter-spacing:3px;text-transform:uppercase;")}
<h1 style="margin:0 0 10px;color:#f2ae1c;font-size:30px;line-height:1.25;font-weight:bold;font-family:${font};">Boletín #SomosMinas</h1>
${p("Conoce lo que sucede en nuestra comunidad académica", "color:#d3dfeb;font-size:15px;")}
${p(`EDICIÓN N.º ${esc(data.edition)} · ${esc(data.period)}`, "margin:18px 0 0;color:#f2ae1c;font-size:12px;font-weight:bold;letter-spacing:1.5px;")}
</td></tr>
<tr><td style="padding:30px 36px 10px;font-family:${font};">
${p("NUESTRA COMUNIDAD", "margin:0 0 10px;color:#159c9a;font-size:12px;font-weight:bold;letter-spacing:2px;")}
<h2 style="margin:0 0 12px;color:#102c4e;font-size:23px;line-height:1.3;font-family:${font};">${esc(data.introTitle)}</h2>
${p(esc(data.introText), "color:#64748b;font-size:14px;line-height:1.8;")}
</td></tr>
<tr><td style="padding:26px 30px 10px;font-family:${font};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><h2 style="margin:0;color:#102c4e;font-size:22px;font-family:${font};">Noticias</h2></td><td align="right" valign="middle"><span style="color:#159c9a;font-size:12px;font-weight:bold;font-family:${font};">01 — ${String(data.news.length).padStart(2, "0")}</span></td></tr><tr><td colspan="2" style="padding-top:12px;"><div style="height:3px;width:48px;background:#159c9a;font-size:0;">&nbsp;</div></td></tr></table></td></tr>
<tr><td style="padding:8px 24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">${newsRows.join("")}</table></td></tr>
<tr><td style="padding:10px 30px;"><div style="height:1px;background:#e5eaf0;font-size:0;">&nbsp;</div></td></tr>
<tr><td style="padding:16px 30px 10px;font-family:${font};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><h2 style="margin:0;color:#102c4e;font-size:22px;font-family:${font};">Agenda de Eventos</h2></td><td align="right" valign="middle"><span style="color:#159c9a;font-size:12px;font-weight:bold;font-family:${font};">${esc(data.agendaMonth)}</span></td></tr><tr><td colspan="2" style="padding-top:12px;"><div style="height:3px;width:48px;background:#159c9a;font-size:0;">&nbsp;</div></td></tr></table></td></tr>
<tr><td style="padding:8px 24px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse;">${eventRows.join("")}</table></td></tr>
<tr><td style="padding:28px 24px;background:#f3f7f9;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="50%" align="center" valign="middle" style="padding:12px;width:50%;font-family:${font};">${featureUrl && featureImage ? `<a href="${featureUrl}" target="_blank" style="text-decoration:none;display:inline-block;"><img src="${featureImage}" alt="${esc(data.featureAlt)}" width="240" height="240" style="width:240px;max-width:100%;height:240px;border-radius:50%;border:4px solid #fff;display:block;object-fit:cover;"></a>` : featureImage ? `<img src="${featureImage}" alt="${esc(data.featureAlt)}" width="240" style="width:100%;max-width:240px;height:auto;border-radius:50%;border:4px solid #fff;display:block;">` : ""}</td>
<td width="50%" valign="middle" style="padding:18px 12px;width:50%;font-family:${font};">
${p(esc(data.featureCategory), "margin:0 0 10px;color:#159c9a;font-size:11px;font-weight:bold;letter-spacing:2px;")}
<h2 style="margin:0 0 12px;color:#102c4e;font-size:23px;line-height:1.3;font-family:${font};">${esc(data.featureTitle)}</h2>
${p(esc(data.featureText), "margin:0 0 18px;color:#64748b;font-size:13px;line-height:1.8;")}
${featureUrl ? `<table role="presentation" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" bgcolor="#159c9a" style="border-radius:6px;background:#159c9a;"><a href="${featureUrl}" target="_blank" style="display:inline-block;padding:12px 20px;color:#fff;font-size:12px;font-weight:bold;text-decoration:none;font-family:${font};">${esc(data.featureButton)}</a></td></tr></table>` : ""}
</td></tr></table></td></tr>
<tr><td align="center" style="padding:30px 28px;font-family:${font};"><h2 style="margin:0 0 10px;color:#102c4e;font-size:20px;font-family:${font};">${esc(data.closingTitle)}</h2>${p(esc(data.closingText), "color:#64748b;font-size:13px;line-height:1.7;")}</td></tr>
<tr><td align="center" style="padding:30px 24px;background:#102c4e;font-family:${font};">
${p("Facultad de Minas · UNAL Sede Medellín", "margin:0 0 8px;color:#fff;font-size:17px;font-weight:bold;")}
${p("Oficina de Comunicaciones · Información, comunidad y nuevas oportunidades.", "margin:0 0 20px;color:#c9d9e9;font-size:12px;line-height:1.7;")}
<table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0"><tr>${socials.map(([href, src, alt, w]) => `<td align="center" style="padding:0 9px;"><a href="${href}" target="_blank" style="text-decoration:none;"><img src="${src}" alt="${alt}" width="${w}" height="24" style="display:block;width:${w}px;height:24px;border:0;"></a></td>`).join("")}</tr></table>
<div style="height:1px;background:#38516d;margin:24px 0 18px;font-size:0;">&nbsp;</div>
${p("© 2026 · Universidad Nacional de Colombia - Sede Medellín - Facultad de Minas", "margin:0 0 8px;color:#c9d9e9;font-size:11px;line-height:1.7;")}
${p("Recibes este correo por tu relación con nuestra comunidad.", "color:#9eb1c5;font-size:10px;line-height:1.7;")}
</td></tr></table></td></tr></table></body></html>`;
}
