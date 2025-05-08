const supabaseUrl = "https://ifvxpvotbftwsgmqmdrf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmdnhwdm90YmZ0d3NnbXFtZHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTEwOTIsImV4cCI6MjA2MjI4NzA5Mn0._uO3Oqg3pZ5DiQRmrJG5WAms3NOfc6vvOa5yyWshHIE";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDisplay = document.getElementById("login-error");

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("nombre_usuario", username)
    .eq("contraseña", password)
    .single();

  if (error || !data) {
    errorDisplay.textContent = "Usuario o contraseña incorrectos.";
    return;
  }

  currentUser = data;
  document.getElementById("login").style.display = "none";
  document.getElementById("lobby").style.display = "block";
  document.getElementById("nombre-usuario").textContent = currentUser.nombre_usuario;
  document.getElementById("saldo-fichas").textContent = currentUser.fichas;
}

function irAJuego(nombreJuego) {
  if (nombreJuego === "tragamonedas") {
    document.getElementById("lobby").style.display = "none";
    document.getElementById("juego-tragamonedas").style.display = "block";
    document.getElementById("resultado").textContent = "";
    document.getElementById("slot1").textContent = "❔";
    document.getElementById("slot2").textContent = "❔";
    document.getElementById("slot3").textContent = "❔";
  }
}

function cerrarSesion() {
  currentUser = null;
  document.getElementById("login").style.display = "block";
  document.getElementById("lobby").style.display = "none";
  document.getElementById("juego-tragamonedas").style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("login-error").textContent = "";
}

const iconos = ["🍒", "🍋", "🔔", "⭐", "7️⃣"];

async function jugar() {
  const fichasApostadas = parseInt(document.getElementById("fichas-apuesta").value);
  if (isNaN(fichasApostadas) || fichasApostadas < 1) {
    alert("Debes apostar al menos 1 ficha.");
    return;
  }

  if (fichasApostadas > currentUser.fichas) {
    alert("No tienes suficientes fichas.");
    return;
  }

  const slot1 = iconos[Math.floor(Math.random() * iconos.length)];
  const slot2 = iconos[Math.floor(Math.random() * iconos.length)];
  const slot3 = iconos[Math.floor(Math.random() * iconos.length)];

  document.getElementById("slot1").textContent = slot1;
  document.getElementById("slot2").textContent = slot2;
  document.getElementById("slot3").textContent = slot3;

  let ganancia = 0;
  if (slot1 === slot2 && slot2 === slot3) {
    ganancia = fichasApostadas * 3;
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    ganancia = fichasApostadas;
  }

  currentUser.fichas = currentUser.fichas - fichasApostadas + ganancia;

  document.getElementById("saldo-fichas").textContent = currentUser.fichas;
  document.getElementById("resultado").textContent = ganancia > 0
    ? `Ganaste ${ganancia} fichas!`
    : `Perdiste ${fichasApostadas} fichas.`;

  await supabase
    .from("usuarios")
    .update({ fichas: currentUser.fichas })
    .eq("id", currentUser.id);

  await supabase.from("jugadas").insert({
    usuario_id: currentUser.id,
    fichas_apostadas: fichasApostadas,
    fichas_ganadas: ganancia,
    resultado: `${slot1} | ${slot2} | ${slot3}`
  });
}
