let data;
let img;
let volcanoes = [];
let hoverRadius = 8;

let boxWidth, boxHeight, boxX, boxY;
let padding = 10;
let legendHeight = 100;
let titleHeight = 130;

/* funzione per far si che i nomi dei vulcani vengano letti e collegati correttamente
alle visioni di dettaglio */
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")                   // separa lettere e accenti
    .replace(/[\u0300-\u036f]/g, "")   // rimuove gli accenti
    .replace(/[^a-z0-9]/g, "_")        // sostituisce tutto ciò che non è alfanumerico con _
    .replace(/_+/g, "_")               // evita più underscore consecutivi
    .replace(/^_+|_+$/g, "");          // rimuove underscore iniziali/finali
}

function preload() {
  data = loadTable("assets/data_volcanoes.csv", "csv", "header");
  img = loadImage("assets/worldmap.png");
}

function setup() {
  createCanvas(windowWidth, 1000);
  noLoop();
  background(30);

  // imposta la larghezza totale del box al 90% rispetto al canvas
  boxWidth = width * 0.9;
  /* calcola l'altezza del box sottraendo all'altezza globale, il titolo, 
  la legenda e un ipotetico margine */
  boxHeight = height - titleHeight - legendHeight - 40;
  // centrano il box orizzontalmente e verticalmente 
  boxX = (width - boxWidth) / 2;
  boxY = titleHeight + legendHeight + 20;

  /* cicla i dati e li estrae per numero / stringa 
  (isNan) mi permette di saltare la riga in caso di latitudine, longitudine
  o categoria non presente e continuare */
  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = data.getNum(i, "Latitude");
    let lon = data.getNum(i, "Longitude");
    let type = data.getString(i, "TypeCategory");
    let name = data.getString(i, "Volcano Name");
    let country = data.getString(i, "Country");
    let type_volcano = data.getString(i, "Type");
    let elevation = data.getString(i, "Elevation (m)");
    let id = data.getString(i, "Volcano Number");
    let location = data.getString(i, "Location")

    if (isNaN(lat) || isNaN(lon) || !type) continue;

  /* attraverso la funzione riesco a convertire le coordinate geografiche
  per disegnarle correttamente sulla mappa */
    let pos = geoToPixel(lat, lon);
  // riesco ad ottenere uan restituzione dei valori
    volcanoes.push({ x: pos.x, y: pos.y, id, name, location, country, elevation, type, type_volcano, lat, lon});
  }
}

function draw() {
  background(30);

  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  noStroke();
  text("Volcanoes of the world", width / 2, 40);
  textSize(14)
  text("Il presente dataset rappresenta una panoramica globale della distribuzione dei vulcani nel mondo.", width / 2, 80);
  text("Ogni elemento del set di dati è georeferenziato tramite coordinate di latitudine e longitudine e possiede informazioni descrittive che vanno dal nome all'elevazione.", width / 2, 100)

  /* ripristina l'allineamento del testo per gli elementi successivi 
  (etichette, tooltip) */
  textAlign(LEFT, BASELINE);

  drawLegend();

  // disegna l'immagine mappa all'interno del rettangolo
  image(img, boxX, boxY, boxWidth, boxHeight);

  stroke(255);
  noFill();
  rect(boxX, boxY, boxWidth, boxHeight);

  /* cicla per ogni vulcano presente nell'array e disegna un glifo 
  basandosi sul tipo e l'altezza */
  for (let v of volcanoes) {
    drawGlyph(v.x, v.y, v.type, v.elevation);
  }

  /* se il mouse è entro 8 pixel, viene mostrato il tooltip informativo
  - break mi viene utile per mostrare SOLO il primo tooltip trovato
  e, dunque, evitare sovrapposizioni */
  for (let v of volcanoes) {
    if (dist(mouseX, mouseY, v.x, v.y) < hoverRadius) {
      drawTooltip(v);
      break;
    }
  }
}

function mousePressed() {
  for (let v of volcanoes) {
    if (dist(mouseX, mouseY, v.x, v.y) < hoverRadius) {
      let nameLink = normalizeName(v.name);
      window.location.href = `detail.html?name=${nameLink}&lat=${v.lat}`;;
      break;
    }
  }
}

// viene chiamata ogni volta che l'utente muove il mouse nel canvas
function mouseMoved() {
  redraw();
}

/* prende le coordinate x, y, tipologia ed altezza e le salva, 
traslandole e centrandole */
function drawGlyph(x, y, type, elevation) {
  push();
  translate(x, y);
  noStroke();

/* switch controlla il valore della variabile type e, 
in base a quella, imposta il colore specifica 
- break serve per uscire dallo switch una volta trovato il caso giusto*/
  switch (type) {
    case "Stratovolcano": fill(240, 76, 60); break;
    case "Cone": fill(243, 156, 18); break;
    case "Caldera": fill(155, 89, 184); break;
    case "Crater System": fill(52, 137, 219); break;
    case "Maars / Tuff ring": fill(26, 188, 156); break;
    case "Shield Volcano": fill(46, 204, 113); break;
    case "Submarine Volcano": fill(52, 40, 94); break;
    case "Other / Unknown": fill(128, 128, 128); break;

  }

/* appoggiandosi alla variabile legata all'altezza, si va a convertire il
valore in un numero decimale e, in seguito, a trasformarlo in un valore 
della scala prefissata */
  let h = map(parseFloat(elevation), -6000, 6879, 1, 12);
  triangle(-6, 6, 6, 6, 0, -h);
  pop();
}

/* il parametro v contiene tutte le info (nome, tipo, altitudine, paese)
- larghezza e altezza + 10 pixel per posizionare il tooltip */
function drawTooltip(v) {
  let w = 190;
  let h = 110;
  let tx = v.x + 10;
  let ty = v.y + 10;

/* controlla se il tooltip esce dal canvas
se sfora:
- a destra o in basso, lo sposta a sinistra o in alto
- a sinistra o in alto, lo riporta dentro al canvas  */
  if (tx + w > width) tx = v.x - w - 10;
  if (tx < 0) tx = 10;
  if (ty + h > height) ty = v.y - h - 10;
  if (ty < 0) ty = 10;

  // disegno del tootip e aggiunta delle info relative
  fill(0, 180);
  stroke(255);
  rect(tx, ty, w, h, 5);

  fill(255);
  noStroke();
  textSize(10);
  text(`Name: ${v.name}`, tx + 10, ty + 22);
  text(`Type: ${v.type_volcano}`, tx + 10, ty + 40);
  text(`📏 ${v.elevation} m`, tx + 10, ty + 76);
  text(`📍 ${v.country}`, tx + 10, ty + 94);
  
}

/* imposta posizione e dimensione della legenda 
- coordinate della legenda + altezza del riquadro + margine interno */
function drawLegend() {
  let innerPad = 12;
  let legendX = boxX;
  let legendY = titleHeight + 10;
  let boxW = boxWidth;
  let boxH = legendHeight;

  // spaziatura con distanza orizzontale e verticale 
  let spacingX = (boxW / 2 - 2 * innerPad) / 4;
  let spacingY = 20;

  fill(0, 180);
  stroke(255);
  rect(legendX, legendY, boxW, boxH, 5);

  /* calcola le coordinate 
  - divide la legenda in due colonne e le riorganizza per il testo ed i simboli */
  let dividerX = legendX + boxW / 2;
  let contentXLeft = legendX + innerPad + 10;
  let contentXRight = dividerX + innerPad + 10;
  let contentY = legendY + innerPad + 10;

  fill(255);
  noStroke();
  textSize(12);
  text("Categories:", contentXLeft, contentY);

  let types = [
    { label: "Cone", color: [243, 156, 18]},
    { label: "Caldera", color: [155, 89, 184] },
    { label: "Crater System", color: [52, 137, 219] },
    { label: "Maars / Tuff ring", color: [26, 188, 156] },
    { label: "Shield Volcano", color: [46, 204, 113] },
    {label: "Stratovolcano", color: [240, 76, 60]},
    { label: "Submarine Volcano", color: [52, 40, 94] },
    { label: "Other / Unknown", color: [128, 128, 128] }
  ];

  /* scorre gli 8 tipi di vulcano definiti nell'array 
  e li divide in 2 righe da 4 colonne */
  for (let i = 0; i < types.length; i++) {
    let col = i % 4;
    // floor arrotonda un numero per difetto
    let row = floor(i / 4);
    /* calcola la posizione per ogni elemento della legenda
    ORGANIZZA IN GRIGLIA
    (spostamento orizzontale - colonna, spostamento verticale - riga */
    let x = contentXLeft + col * spacingX;
    let y = contentY + 20 + row * spacingY;

    // imposta i colori dei vulcani e le posizioni delle etichette
    fill(types[i].color);
    triangle(x, y + 8, x + 12, y + 8, x + 6, y - 4);
    fill(255);
    textSize(11);
    text(types[i].label, x + 18, y + 6);
  }
  
  // linea verticale bianca come separatore per le due colonne
  stroke(255);
  line(dividerX, legendY + innerPad, dividerX, legendY + boxH - innerPad);

  noStroke();
  fill(255);
  textSize(12);
  /* contentXRight - coordinata X per la colonna destra
  contentY per la prima riga di contenuto */
  text("Elevation (m):", contentXRight, contentY);

  // ripete il medesimo processo per le tipologie - cicla ogni valore, lo trasforma e lo posiziona in griglia
  let elevations = [-6000, -4000, -2000, 0, 2000, 4000, 6000, 6879];
  for (let i = 0; i < elevations.length; i++) {
    let col = i % 4;
    let row = floor(i / 4);
    let x = contentXRight + col * spacingX;
    let y = contentY + 20 + row * spacingY;

    let h = map(elevations[i], -6000, 6879, 1, 12);
    fill(170, 170, 170);
    triangle(x, y + 8, x + 12, y + 8, x + 6, y - h);
    fill(255);
    textSize(11);
    text(`${elevations[i]} m`, x + 18, y + 6);
  }
}

/* funzione per convertire:
- la longitudine in X (da -180 a +180 gradi - sx / dx)
- la latitudine in Y (da 90 a -90 gradi - nei canvas, Y cresce verso il basso) */
function geoToPixel(lat, lon) {
  let x = map(lon, -180, 180, boxX + padding, boxX + boxWidth - padding);
  let y = map(lat, 90, -90, boxY + padding, boxY + boxHeight - padding);
  return { x, y };
}