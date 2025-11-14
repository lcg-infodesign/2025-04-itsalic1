let data;

function preload() {
  data = loadTable("assets/data (1).csv", "csv", "header")
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let parameters = getURLParams();
  
  console.log(parameters);

  /* per accedere ad un valore nell'array devo inserire l'indice [i] che, 
  in questo caso, rappresenta tutte le righe dell'Italia (unica riga, ma generalmente la funzione ne filtra di più) 
  lo 0, tuttavia, è pari all'1 - dunque una riga */
  let selected = data.findRows("Italy", "country") [0];

  let dimensions = [
    "Access to financial assets", 
    "Access to justice", 
    "Access to land assets", 
    "Access to non-land assets", 
    "Child marriage eradication", 
    "Female genital mutilation eradication", 
    "Freedom of movement", 
    "Household responsibilities", 
    "Political voice", 
    "Violence against women eradication", 
    "Workplace rights",
  ];

 background("white");

for (let i = 0; i < dimensions.length; i++) {
// filtro sul valore - prendi il valore selezionato dall'array
  let dim = dimensions[i];
  let value = selected.get(dim);

  /* in p5.js posso calcolare angoli in radianti o gradi (angleMode), ma nell'esempio è calcolato in 360esimi
   variabile con il numero della riga [i] - il valore massimo è l'array dimensions */
  let angle = map(i, 0, dimensions.length, 0, 360);
  let barLenght = map(value, 0, 100, 20, 200);

  /* ad ogni ciclo for devo andare a spostare al centro,
  ruotare in base all'angolo e disegnare una riga proporzionale al valore che abbiamo calcolato */
  push();
  translate (windowWidth / 2, windowHeight / 2);
  angleMode(DEGREES);
  rotate(angle);
  line(20, 0, barLenght, 0)

  pop();

  console.log(dim, value);


}
}

