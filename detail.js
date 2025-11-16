let data, selected, infoIcon;

function preload() {
  data = loadTable("assets/data_volcanoes.csv", "csv", "header");
  infoIcon = loadImage("assets/info_icon.png");
}

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

  let params = getURLParams();
  let normalizedParam = params.name?.toLowerCase();
  let paramLat = parseFloat(params.lat);

  for (let i = 0; i < data.getRowCount(); i++) {
    let volcanoName = data.getString(i, "Volcano Name");
    let normalizedName = normalizeName(volcanoName);
    let lat = parseFloat(data.getString(i, "Latitude"));

    if (
      normalizedName === normalizedParam &&
      !isNaN(paramLat) &&
      Math.abs(lat - paramLat) < 0.0001
    ) {
      selected = data.getRow(i);
      break;
    }
  }

  let backLink = createA("index.html", "←", "_self");
  backLink.position(445, 140); // posizione sullo schermo (x, y)
  backLink.style ("font-family", "Arial")
  backLink.style("font-size", "20px");
  backLink.style("color", "white");
  backLink.style("text-decoration", "none");

}


function draw() {
  background(30);
  if (selected) {
    drawCard();
  }
}

function drawCard() {
  let w = 700;
  let h = 500;
  let x = (width - w) / 2;
  let y = (height - h) / 2;

  fill(0, 180);
  stroke(255);
  strokeWeight(2);
  rect(x, y, w, h, 12);

  noStroke();
  fill(255);

  textSize(12);
  text("ID: " + selected.get("Volcano Number"), x + 30, y + 75);

  let typeColor = getTypeColor(selected.get("TypeCategory"));
  fill(typeColor);
  rect(x + 30, 290, 160, 28, 6);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(selected.get("TypeCategory"), x + 110, 304);
  textAlign(LEFT, BASELINE);

  textSize(30);
  fill(255);
  text(selected.get("Volcano Name"), x + 30, 235);

  textSize(14);
  text("Lat: " + selected.get("Latitude") + " | Lon: " + selected.get("Longitude"), x + 30, 265);

  textSize(16);
  text("📍 " + selected.get("Location") + ", " + selected.get("Country"), x + 30, 365);
  text("📏 " + selected.get("Elevation (m)") + " m", x + 30, 400);
  text("Last Known Eruption: " + selected.get("Last Known Eruption"), x + 30, 490);

  let status = selected.get("Status");
  if (status && status.trim() !== "" && status.toLowerCase() !== "nan") {
    text("Status:  " + status, x + 30, 450);

    // Icona informativa accanto allo status
    let iconX = x + 250;
    let iconY = 433;
    let iconSize = 20;
    image(infoIcon, iconX, iconY, iconSize, iconSize);

    // Tooltip al passaggio del mouse
    let mouseOverIcon = dist(mouseX, mouseY, iconX + iconSize / 2, iconY + iconSize / 2) < iconSize / 2;
    if (mouseOverIcon) {
      let explanation = getStatusExplanation(status);
      let tw = textWidth(explanation) + 20;
      let th = 40;
      let tx = iconX + 20;
      let ty = iconY - 10;

      fill(0, 200);
      stroke(255);
      rect(tx, ty, tw - 40, th, 5);

      noStroke();
      fill(255);
      textSize(12);
      text(explanation, tx + 10, ty + 12, tw - 20, th - 10);
    }
  } else {
    text("Status: Not available", x + 30, 450);
  }

}

function mousePressed() {
  let x = (width - 600) / 2;
  let iconX = x + 200;
  let iconY = 388;
  let iconSize = 20;

  let status = selected.get("Status");
  if (status && status.trim() !== "" && status.toLowerCase() !== "nan") {
    let clickedIcon = dist(mouseX, mouseY, iconX + iconSize / 2, iconY + iconSize / 2) < iconSize / 2;
    if (clickedIcon) {
      let explanation = getStatusExplanation(status);
    }
  }
}

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

function getStatusExplanation(status) {
  status = status.toLowerCase();
  if (status === "historical") {
    return "Eruptions documented during / shortly after observation.";
  }
  if (["hydrophonic", "radiocarbon", "anthropology", "ar/ar", "dendrochronology", "hydration rind", "ice core", "k-ar", "lichenometry", "magnetism", "seismicity", "tephrochronological", "varve count?"].includes(status)) {
    return "Dated eruptions, based on scientific techniques.";
  }
  if (["fumarolic", "hot springs"].includes(status)) {
    return "Dated eruptions, based on thermal features.";
  }
  if (["pleistocene", "pleistocene-fumarol"].includes(status)) {
    return "Pleistocene thermal features: preceded by the word Pleistocene.";
  }
  if (["uncertain", "holocene?"].includes(status)) {
    return "Low certainty of Holocene volcanism.";
  }
  if (status === "holocene") {
    return "Confirmed activity during the Holocene epoch.";
  }
}

function mouseMoved() {
  redraw();
}