/* ===================================
   MAREA · Script.js
   =================================== */

// ── Imágenes ────────────────────────
// Las imágenes se cargan desde el HTML via data-src (base64 embebida en index.html)

// ── NAV scroll ──────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

// ── Hamburger menu ───────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
});

mobileClose.addEventListener('click', closeMobileMenu);

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Hero BG Ken Burns ─────────────────
window.addEventListener('load', () => {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) heroBg.classList.add('loaded');
});

// ── Reveal on scroll ─────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ── Calendar ─────────────────────────
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;

function renderCalendar() {
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById('calMonthLabel').textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const grid = document.getElementById('calGrid');
  // Keep headers (first 7 children)
  const headers = Array.from(grid.children).slice(0, 7);
  grid.innerHTML = '';
  headers.forEach(h => grid.appendChild(h));

  // Empty cells before first day (week starts Monday)
  const offset = (firstDay === 0 ? 6 : firstDay - 1);
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day';
    dayEl.textContent = d;

    const thisDate = new Date(year, month, d);
    thisDate.setHours(0, 0, 0, 0);

    if (thisDate < today) {
      dayEl.classList.add('past');
    } else {
      if (thisDate.getTime() === today.getTime()) {
        dayEl.classList.add('today');
      }
      if (selectedDate && thisDate.getTime() === selectedDate.getTime()) {
        dayEl.classList.add('selected');
      }

      dayEl.addEventListener('click', () => {
        selectedDate = thisDate;
        document.getElementById('selectedDateDisplay').textContent =
          thisDate.toLocaleDateString('es-AR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
        renderCalendar();
        clearError('fecha');
      });
    }

    grid.appendChild(dayEl);
  }
}

document.getElementById('calPrev').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('calNext').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// ── Time slots ────────────────────────
const timeSlots = document.querySelectorAll('.time-slot');
timeSlots.forEach(slot => {
  slot.addEventListener('click', () => {
    timeSlots.forEach(s => s.classList.remove('selected'));
    slot.classList.add('selected');
    selectedTime = slot.dataset.time;
    clearError('hora');
  });
});

// ── Form validation & submit ──────────
const form = document.getElementById('reservaForm');

function showError(field, msg) {
  const input = document.getElementById(field);
  const errEl = document.getElementById(`err-${field}`);
  if (input) input.classList.add('error');
  if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
}

function clearError(field) {
  const input = document.getElementById(field);
  const errEl = document.getElementById(`err-${field}`);
  if (input) input.classList.remove('error');
  if (errEl) errEl.classList.remove('show');
}

function validateForm() {
  let valid = true;

  const nombre = document.getElementById('nombre').value.trim();
  if (!nombre) { showError('nombre', 'Por favor ingresá tu nombre'); valid = false; }
  else clearError('nombre');

  const telefono = document.getElementById('telefono').value.trim();
  if (!telefono || !/^[\d\s\+\-\(\)]{7,}$/.test(telefono)) {
    showError('telefono', 'Ingresá un número de teléfono válido'); valid = false;
  } else clearError('telefono');

  const servicio = document.getElementById('servicio').value;
  if (!servicio) { showError('servicio', 'Seleccioná un servicio'); valid = false; }
  else clearError('servicio');

  if (!selectedDate) { showError('fecha', 'Elegí una fecha en el calendario'); valid = false; }
  else clearError('fecha');

  if (!selectedTime) { showError('hora', 'Seleccioná un horario'); valid = false; }
  else clearError('hora');

  return valid;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const nombre   = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const servicio = document.getElementById('servicio').value;
  const duracion = document.querySelector('input[name="duracion"]:checked').value;
  const mensaje  = document.getElementById('mensaje').value.trim();

  const fechaStr = selectedDate.toLocaleDateString('es-AR', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });

  // WhatsApp message – client
  const msgCliente = encodeURIComponent(
`✨ ¡Hola! Quiero reservar una sesión:

📋 Servicio: ${servicio}
📅 Fecha: ${fechaStr}
🕐 Hora: ${selectedTime}
⏱️ Duración: ${duracion}
${mensaje ? `\n💬 Mensaje: ${mensaje}` : ''}

Mi nombre: ${nombre}
Teléfono: ${telefono}`
  );

  // WhatsApp number – CAMBIAR por el número real
  const WA_NUMBER = '5491165936538';

  // Google Calendar text
  const calText = buildCalendarText(nombre, servicio, fechaStr, selectedTime, duracion, telefono);

  showModal({ nombre, servicio, fechaStr, selectedTime, duracion, calText, msgCliente, WA_NUMBER });
});

function buildCalendarText(nombre, servicio, fecha, hora, duracion, tel) {
  return `Sesión: ${servicio}
Terapeuta: Marea – Energía Femenina
Cliente: ${nombre} (${tel})
Fecha: ${fecha}
Hora: ${hora}
Duración: ${duracion}

Recordar confirmar 24h antes por WhatsApp.`;
}

// ── Modal ─────────────────────────────
function showModal({ nombre, servicio, fechaStr, selectedTime, duracion, calText, msgCliente, WA_NUMBER }) {
  const overlay = document.getElementById('confirmModal');
  const sumEl   = document.getElementById('modalSummary');

  sumEl.textContent = `${servicio} · ${fechaStr} · ${selectedTime} · ${duracion}`;

  // WhatsApp client button
  document.getElementById('btnWaCliente').onclick = () => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${msgCliente}`, '_blank');
  };

  // WhatsApp owner button (same number, different message)
  const msgDuena = encodeURIComponent(
`🌊 Nueva reserva recibida:
👤 ${nombre}
📋 ${servicio}
📅 ${fechaStr} · ${selectedTime}
⏱️ ${duracion}`
  );
  document.getElementById('btnWaDuena').onclick = () => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${msgDuena}`, '_blank');
  };

  // Google Calendar button
  document.getElementById('btnCalendar').onclick = () => {
    const startISO = buildISODate(selectedDate, selectedTime);
    const endISO   = buildISODate(selectedDate, selectedTime, duracion);
    const gcUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE`
      + `&text=${encodeURIComponent('Sesión: ' + servicio + ' – Marea')}`
      + `&dates=${startISO}/${endISO}`
      + `&details=${encodeURIComponent(calText)}`
      + `&sf=true&output=xml`;
    window.open(gcUrl, '_blank');
  };

  // Copy text
  document.getElementById('calendarCopyText').textContent = calText;
  document.getElementById('btnCopyText').onclick = () => {
    navigator.clipboard.writeText(calText).then(() => {
      document.getElementById('btnCopyText').textContent = '✓ ¡Copiado!';
      setTimeout(() => { document.getElementById('btnCopyText').textContent = '📋 Copiar texto para agendar'; }, 2000);
    });
  };

  overlay.classList.add('active');
}

function buildISODate(date, timeStr, duracion) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);

  if (duracion) {
    const mins = duracion === '30 min' ? 30 : duracion === '45 min' ? 45 : 60;
    d.setMinutes(d.getMinutes() + mins);
  }

  return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('confirmModal').classList.remove('active');
});

document.getElementById('confirmModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('active');
  }
});

// ── Live input validation ─────────────
['nombre','telefono','servicio'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => clearError(id));
});

// ── Init calendar ─────────────────────
renderCalendar();

// ── Smooth anchor ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── Parallax subtle on hero ───────────
const heroBgImg = document.querySelector('.hero-bg img');
if (heroBgImg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBgImg.style.transform = `scale(1) translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
}

// ── Service card CTA ──────────────────
document.querySelectorAll('.service-cta-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const servicio = btn.dataset.service;
    document.getElementById('servicio').value = servicio;
    document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
    clearError('servicio');
  });
});
