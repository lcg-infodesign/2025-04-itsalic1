// Margine esterno per non disegnare sui bordi del canvas
let outerMargin = 100;

// Variabile che conterrà i dati caricati dal CSV
let data;

// Variabili globali per i limiti delle scale
let minLon, maxLon, minLat, maxLat, maxValue, minBlur, maxBlur;

function preload() {
  // Carico il file CSV nella cartella "assets"
  // Il terzo parametro ("header") indica che la prima riga del file contiene i nomi delle colonne
  data = loadTable("assets/data (1).csv", "csv", "header");
}

function setup() {
  // Crea un canvas che riempie tutta la finestra del browser
  createCanvas(windowWidth, windowHeight);

  // Stampa i dati in console per verificarne il contenuto
  console.log("data", data);

  // --- DEFINIZIONE DELLE SCALE ---

  // Scala per la longitudine → asse X
  let allLon = data.getColumn("longitude");
  minLon = min(allLon);
  maxLon = max(allLon);

  // Scala per la latitudine → asse Y
  let allLat = data.getColumn("latitude");
  minLat = min(allLat);
  maxLat = max(allLat);

  // Scala per il raggio → dipende dal valore numerico
  let allValues = data.getColumn("value");
  maxValue = max(allValues);

  // Scala per il blur → dipende dal grado di incertezza
  let allBlur = data.getColumn("uncertainty");
  minBlur = min(allBlur);
  maxBlur = max(allBlur);
}

// Variabile per memorizzare il punto su cui il mouse passa sopra
let hovered = null;

function mousePressed() {
//crea url da aprire
let = "detail.html?country=" + hovered.country;

console.log(hovered)
// carica pagina con parametro basandosi sul paese cliccato
window.location.href = myUrl;
}


function draw() {
  // Sfondo nero
  background(10);
  // --- CICLO PRINCIPALE: disegna un cerchio per ogni riga del dataset ---
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    // Leggo i dati dalle colonne del CSV
    let country = data.getString(rowNumber, "country");
    let value = data.getNum(rowNumber, "value");
    let lat = data.getNum(rowNumber, "latitude");
    let lon = data.getNum(rowNumber, "longitude");
    let uncertainty = data.getNum(rowNumber, "uncertainty");

    // Converto le coordinate geografiche in coordinate del canvas
    let x = map(lon, minLon, maxLon, outerMargin, width - outerMargin);
    let y = map(lat, minLat, maxLat, height - outerMargin, outerMargin);

    // Raggio proporzionale al valore
    let radius = map(value, 0, maxValue, 5, 50);

    // Blur proporzionale all’incertezza
    let blur = map(uncertainty, minBlur, maxBlur, 0, 20);

    // Calcolo la distanza dal mouse
    let d = dist(mouseX, mouseY, x, y);

    // Se il mouse è sopra il cerchio → cambia colore e salva i dati per il tooltip
    if (d < radius / 2) {
      hovered = { x: x, y: y, country: country, value: value };

      console.log(hovered)
      drawSun(x, y, radius, blur, "red");
    } else {
      drawSun(x, y, radius, blur, "yellow");
    }
  }

  // --- TOOLTIP ---
  // metto il tooltip alla fine per essere sicuro che sia disegnato sopra a tutto
  if (hovered) {
    // Cambia il cursore in “mano” (interattivo)
    cursor("pointer");

    // Testo del tooltip: mostra paese e valore
    let tooltipText = `${hovered.country}: ${hovered.value}`;
    drawTooltip(hovered.x, hovered.y, tooltipText);
  } else {
    // Torna al cursore normale
    cursor("default");
  }
}

// Funzione per disegnare un “sole” sfocato (con blur variabile)
function drawSun(x, y, radius, blur, color) {
  noStroke();

  // Applica un filtro di blur solo a questo elemento
 // drawingContext.filter = "blur(" + blur + "px)";
  fill(color);
  ellipse(x, y, radius, radius);

  // Reset del filtro per i prossimi elementi
  drawingContext.filter = "none";
}

// Funzione per disegnare un tooltip vicino al mouse
function drawTooltip(px, py, textString) {
  textSize(16);
  textAlign(LEFT, CENTER);
  fill("white");
  stroke("black");
  text(textString, px, py);
}
