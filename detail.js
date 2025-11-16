// definizione delle variabili
let data, selected, infoIcon;

function preload() {
  data = loadTable("assets/data_volcanoes.csv", "csv", "header");
  infoIcon = loadImage("assets/info_icon.png");
}

/* funzione necessaria per NORMALIZZARE il Volcano Name
- alcuni nomi possiedono delle spaziature / simboli speciali;
in questo modo è possibile creare collegamenti validi per tutti i vulcani  */
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");

  /* PREPARAZIONE DATI ESTERNI
  estrae i parametri dalla URL, prende il parametro name e lo converte in minuscolo
  - il medesimo discorso si applica alla latitudine (da stringa a decimale)  */
  let params = getURLParams();
  let normalizedParam = params.name && params.name.toLowerCase();
  let paramLat = parseFloat(params.lat);

  /* RICERCA VULCANO CORRETTO 
  identifica un vulcano preciso, da mostrare nella scheda, basandosi su nome e latitudine 
  - estrae dal DATASET, normalizza nome / latitudine e confronta con la URL */
  for (let i = 0; i < data.getRowCount(); i++) {
    let volcanoName = data.getString(i, "Volcano Name");
    let normalizedName = normalizeName(volcanoName);
    let lat = parseFloat(data.getString(i, "Latitude"));

    if (
      normalizedName === normalizedParam &&
      !isNaN(paramLat) &&
      // approssimazione minima - dato preciso per la latitudine
      Math.abs(lat - paramLat) < 0.0001
    ) {
      // se trova una corrispondenza salva la riga i nella variabile selected
      selected = data.getRow(i);
      break;
    }
  }

  // link per ritornare alla mappa
  link = createA("index.html", "←", "_self");
  link.style("font-family", "Arial");
  link.style("font-size", "16px");
  link.style("color", "white");
  link.style("text-decoration", "none");
}

/* se selected ESISTE - si va a recuperare il valore che, con typeColor, 
viene restituito sotto forma di background color in base alla tipologia del vulcano.
se selected NON ESISTE - viene impostato uno sfondo nero */
function draw() {
  if (selected) {
    let typeColor = getTypeColor(selected.get("TypeCategory"));
    background(typeColor);
    drawCard();
  } else {
    background(30);
  }
}

// funzione per definire la card con le informazioni
function drawCard() {
  let w = 700;
  let h = 550;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  fill(0, 180);
  stroke(255);
  strokeWeight(2);
  rect(x, y, w, h, 10);

  noStroke();
  fill(255);

  textSize(12);
  let volcanoID = selected.get("Volcano Number");
  if (volcanoID) {
  text("ID: " + volcanoID, x + 50, y + 100);
} else {
  text("ID: Not available", x + 50, y + 100);
}
/* necessario per disegnare etichetta con tipologia vulcano
- recupera la categoria, usa getTypeColor per ottenere il colore associato
e imposta rettangolo */
  let typeColor = getTypeColor(selected.get("TypeCategory"));
  fill(typeColor);
  rect(x + 50, 300, 160, 28, 6);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(selected.get("TypeCategory"), x + 130, 315);
  textAlign(LEFT, BASELINE);

  textSize(30);
  fill(255);
  text(selected.get("Volcano Name"), x + 50, 235);

  textSize(14);
  text("Lat: " + selected.get("Latitude") + " | Lon: " + selected.get("Longitude"), x + 50, 275);

  textSize(16);
  text("📍 " + selected.get("Location") + ", " + selected.get("Country"), x + 50, 390);
  text("📏 " + selected.get("Elevation (m)") + " m", x + 50, 430);
  text("Last Known Eruption: " + selected.get("Last Known Eruption"), x + 50, 540);

/* utile per visualizzare lo stato del vulcano
- recupera il valore, verifica che non sia nullo ed imposta il testo */
let status = selected.get("Status");
if (status != null && status.trim() !== "") {
  textSize(16); 
  let statusText = "Status: " + status;
  text(statusText, x + 50, 500);

  // calcola la larghezza in pixel + dimensioni, in modo da posizionare subito dopo l'icona
  let textW = textWidth(statusText);
  let iconSize = 20;
  let iconX = x + 50 + textW + 10;
  let iconY = 483;

  image(infoIcon, iconX, iconY, iconSize, iconSize);

  /* aggiunge un tooltip informativo per chiarificare lo stato
  - calcola la distanza tra il cursore / il centro dell'icona (raggio = metà dimensione = tooltip),
  e recupera la spiegazione dello stato, definendone le dimensioni  */
  let mouseOverIcon = dist(mouseX, mouseY, iconX + iconSize / 2, iconY + iconSize / 2) < iconSize / 2;
  if (mouseOverIcon) {
    let explanation = getStatusExplanation(status);
    let tw = 180; 
    let th = 50; 
    let tx = iconX + 20;
    let ty = iconY - 10;
    
    fill(0, 200);
    stroke(255);
    rect(tx, ty, tw, th, 5);
    
    noStroke();
    fill(255);
    textSize(12);
    textAlign(LEFT, TOP);
    text(explanation, tx + 10, ty + 10, tw - 20, th - 20);
  }
  // se lo status non è disponibile - messaggio di fallback
} else {
  textSize(16);
  text("Status: Not available", x + 50, 500);
}

// necessario per tooltip che appare al passaggio del mouse
function mouseMoved() {
  redraw();
}

// disegna la barra visiva legata all'attività del vulcano all'interno della card
drawEruptionBar(x + w - 250, y + 120);

// posizione del link per la mappa
link.position(x + 50, y + 40);
}

// definisce la funzione per associare colore specifico / categoria di vulcano
function getTypeColor(type) {
  switch (type) {
    case "Stratovolcano": return color(240, 76, 60);
    case "Cone": return color(243, 156, 18);
    case "Caldera": return color(155, 89, 184);
    case "Crater System": return color(52, 137, 219);
    case "Maars / Tuff ring": return color(26, 188, 156);
    case "Shield Volcano": return color(46, 204, 113);
    case "Submarine Volcano": return color(52, 40, 94);
    case "Other / Unknown": return color(128, 128, 128);
    default: return color(200);
  }
}

/* funzione che restituisce una spiegazione testuale in base allo stato eruttivo del vulcano 
- converte lo stato in minuscolo e restituisce la definizione 
(.includes mi aiuta a controllare se presente nello status) */
function getStatusExplanation(status) {
  status = status.toLowerCase();
  if (status === "historical") {
    return "Eruptions documented during / after observation.";
  }
  if (["hydrophonic", "radiocarbon", "anthropology", "ar/ar", "dendrochronology", "hydration rind", "ice core", "k-ar", "lichenometry", "magnetism", "seismicity", "tephrochronology", "varve count?"].includes(status)) {
    return "Dated eruptions, based on scientific techniques.";
  }
  if (["fumarolic", "hot springs"].includes(status)) {
    return "Dated eruptions, based on thermal features.";
  }
  if (["pleistocene", "pleistocene-fumarol"].includes(status)) {
    return "Pleistocene thermal features";
  }
  if (["uncertain", "holocene?"].includes(status)) {
    return "Low certainty of Holocene volcanism.";
  }
  if (status === "holocene") {
    return "Confirmed activity during the Holocene epoch.";
  }
  return "Status explanation not available.";
}

/* funzione utile per disegnare la barra visiva che rappresenta la cronologia delle eruzioni
- crea un array di oggetti con sigla che rappresenta classe temporale di eruzione (code) 
+ descrizione leggibile da mostrare per utente (label) */
function drawEruptionBar(x, y) {
  let labels = [
    { code: "?", label: "? - Unknown" },
    { code: "D", label: "D - Dated in A.D (generic)" },
    { code: "D1", label: "D1 - 1964 or after" },
    { code: "D2", label: "D2 - 1900 / 1963" },
    { code: "D3", label: "D3 - 1800 / 1899" },
    { code: "D4", label: "D4 - 1700 / 1799" },
    { code: "D5", label: "D5 - 1500 / 1699" },
    { code: "D6", label: "D6 - A.D 1 / 1499" },
    { code: "D7", label: "D7 - B.C Holocene" },
    { code: "P", label: "P - Pleistocene" },
    { code: "Q", label: "Q - Quaternary eruptions" },
    { code: "U", label: "U - Undated" },
    { code: "UNKNOWN", label: "Unknown - Not reported" }
  ];

  /* prende il valore della colonna
  - se esiste gli spazi vengono rimossi ed il valore reso maiuscolo */
  let activeCode = selected.get("Last Known Eruption");
  if (activeCode) activeCode = activeCode.trim().toUpperCase();
  // se assente, viene impostata stringa vuota
  else activeCode = "";

  // disegna barra verticale fatta da tante "bande" delle seguenti dimensioni
  let bandWidth = 30;
  let bandHeight = 24;

  /* viene disegnata una banda sotto l'altra con bandY che cambia ad ogni ciclo
  (ciclo for rettangolo + etichetta)*/
  for (let i = 0; i < labels.length; i++) {
    let bandY = y + i * bandHeight;

    /* se il codice del periodo è UGUALE a quello dell'ultima eruzione
    disegna rettangolo bianco evidenziato, altrimenti grigio scuro */
    fill(labels[i].code === activeCode ? color(255, 255, 255) : color(100));
    noStroke();
    rect(x, bandY, bandWidth, bandHeight);

    // aggiunge etichetta accanto al rettangolo, che mostra descrizione leggibile
    fill(255);
    textSize(12);
    textAlign(LEFT, CENTER);
    text(labels[i].label, x + bandWidth + 10, bandY + bandHeight / 2);
  }

  textAlign(LEFT, BASELINE);
}