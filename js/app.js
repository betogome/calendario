/* ========== Configuración base ========== */
const YEAR = 2025;

/* Feriados 2025 (mes es 0-11) */
const HOLIDAYS = [
  { m: 0,  d: 1,  name: "Año Nuevo" },
  { m: 3,  d: 11, name: "Batalla de Rivas" },
  { m: 3,  d: 17, name: "Jueves Santo" },
  { m: 3,  d: 18, name: "Viernes Santo" },
  { m: 4,  d: 1,  name: "Día Internacional del Trabajo" },
  { m: 6,  d: 25, name: "Anexión del Partido de Nicoya" },
  { m: 7,  d: 2,  name: "Día de la Virgen de los Ángeles" },
  { m: 7,  d: 15, name: "Día de la Madre" },
  { m: 8,  d: 15, name: "Día de la Independencia" },
  { m: 9,  d: 12, name: "Día de las Culturas" },
  { m: 11, d: 25, name: "Navidad" }
];

const MONTHS_ES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Setiembre","Octubre","Noviembre","Diciembre"
];
const DOW_ES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]; // Lunes primero

/* Utilidades */
const today = new Date();
const isSameDate = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const dowMondayFirst = (jsDow) => (jsDow + 6) % 7;
const pad2 = (n) => String(n).padStart(2, "0");
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

function getHolidayMap(){
  const map = new Map();
  for(const h of HOLIDAYS){
    map.set(`${YEAR}-${pad2(h.m+1)}-${pad2(h.d)}`, h.name);
  }
  return map;
}

/* Render del calendario */
function renderCalendar(){
  const calendarEl = document.getElementById("calendar");
  const holidayMap = getHolidayMap();

  for(let month=0; month<12; month++){
    const monthArticle = document.createElement("article");
    monthArticle.className = "month";
    monthArticle.setAttribute("aria-label", `${MONTHS_ES[month]} ${YEAR}`);

    const header = document.createElement("header");
    header.className = "month__header";
    header.innerHTML = `<span>${MONTHS_ES[month]} ${YEAR}</span>`;
    monthArticle.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "month__grid";
    grid.setAttribute("role", "grid");
    grid.setAttribute("aria-label", `Días de ${MONTHS_ES[month]} ${YEAR}`);

    /* Días de la semana (Lun..Dom) */
    for(const d of DOW_ES){
      const el = document.createElement("div");
      el.className = "month__dow";
      el.setAttribute("role", "columnheader");
      el.textContent = d;
      grid.appendChild(el);
    }

    /* Celdas en blanco antes del día 1 con lunes como inicio */
    const firstDowJS = new Date(YEAR, month, 1).getDay(); // 0=Dom..6=Sáb
    const offset = dowMondayFirst(firstDowJS);
    for(let i=0; i<offset; i++){
      const blank = document.createElement("div");
      blank.className = "day day--blank";
      blank.setAttribute("aria-hidden", "true");
      grid.appendChild(blank);
    }

    /* Días del mes */
    const totalDays = getDaysInMonth(YEAR, month);
    for(let d=1; d<=totalDays; d++){
      const date = new Date(YEAR, month, d);
      const jsDow = date.getDay();                 // 0=Dom..6=Sáb
      const isToday = isSameDate(date, today);

      const dayEl = document.createElement("div");
      dayEl.className = "day";
      dayEl.setAttribute("role", "gridcell");
      dayEl.setAttribute("tabindex", "0");

      /* <time> semántico */
      const time = document.createElement("time");
      time.setAttribute("datetime", `${YEAR}-${pad2(month+1)}-${pad2(d)}`);
      time.textContent = d;
      dayEl.appendChild(time);

      if(isToday && YEAR===today.getFullYear()) {
        dayEl.classList.add("day--today");
      }

      /* Feriado */
      const key = `${YEAR}-${pad2(month+1)}-${pad2(d)}`;
      if(holidayMap.has(key)){
        const name = holidayMap.get(key);
        dayEl.classList.add("day--holiday");
        dayEl.setAttribute("data-tooltip", `${name} — ${pad2(d)}/${pad2(month+1)}`);
        dayEl.setAttribute("aria-label", `${d} de ${MONTHS_ES[month]}: ${name}`);
      } else {
        dayEl.setAttribute("aria-label", `${d} de ${MONTHS_ES[month]}`);
      }

      grid.appendChild(dayEl);
    }

    monthArticle.appendChild(grid);
    calendarEl.appendChild(monthArticle);
  }
}

/* Interacciones (modo oscuro) */
function setupActions(){
  const toggle = document.getElementById("toggleTheme");

  const saved = localStorage.getItem("prefers-dark");
  if(saved === "true"){
    document.body.classList.add("dark");
    toggle.setAttribute("aria-pressed", "true");
  } else if(saved === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    document.body.classList.add("dark");
    toggle.setAttribute("aria-pressed", "true");
  }

  toggle.addEventListener("click", ()=>{
    const willBeDark = !document.body.classList.contains("dark");
    document.body.classList.toggle("dark");
    localStorage.setItem("prefers-dark", String(willBeDark));
    toggle.setAttribute("aria-pressed", willBeDark ? "true" : "false");
  });
}

/* Init */
document.addEventListener("DOMContentLoaded", ()=>{
  renderCalendar();
  setupActions();
});
