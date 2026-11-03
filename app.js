const birthdateInput = document.getElementById('birthdate');
const genderSelect = document.getElementById('gender');
const customGroup = document.getElementById('custom-group');
const customAgeInput = document.getElementById('customAge');
const calculateBtn = document.getElementById('calculate');

const daysEl = document.getElementById('days-remaining');
const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const hoursEl = document.getElementById('hours');
const moonsEl = document.getElementById('moons');
const liveSecondsEl = document.getElementById('live-seconds');

const LUNAR_CYCLE_DAYS = 29.53059;
let countdownInterval = null;
let expectedDeathDate = null;

// Load saved data
function loadSaved() {
    const savedBirth = localStorage.getItem('memento_birthdate');
    const savedGender = localStorage.getItem('memento_gender');
    const savedCustom = localStorage.getItem('memento_custom');
    
    if (savedBirth) birthdateInput.value = savedBirth;
    if (savedGender) {
        genderSelect.value = savedGender;
        toggleCustom();
    }
    if (savedCustom) customAgeInput.value = savedCustom;
    
    if (savedBirth) {
        calculate();
    }
}

function toggleCustom() {
    customGroup.style.display = genderSelect.value === 'custom' ? 'flex' : 'none';
}

genderSelect.addEventListener('change', toggleCustom);

function getExpectedYears() {
    if (genderSelect.value === 'custom') {
        return parseFloat(customAgeInput.value) || 75;
    }
    return parseFloat(genderSelect.value);
}

function calculate() {
    const birthStr = birthdateInput.value;
    if (!birthStr) {
        alert('Entre ta date de naissance.');
        return;
    }

    const birthDate = new Date(birthStr);
    if (isNaN(birthDate.getTime())) {
        alert('Date invalide.');
        return;
    }

    const expectedYears = getExpectedYears();
    const expectedMs = expectedYears * 365.25 * 24 * 60 * 60 * 1000;
    expectedDeathDate = new Date(birthDate.getTime() + expectedMs);

    // Save
    localStorage.setItem('memento_birthdate', birthStr);
    localStorage.setItem('memento_gender', genderSelect.value);
    if (genderSelect.value === 'custom') {
        localStorage.setItem('memento_custom', customAgeInput.value);
    }

    updateDisplay();
    
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateDisplay, 1000);
}

function updateDisplay() {
    if (!expectedDeathDate) return;

    const now = new Date();
    let remainingMs = expectedDeathDate - now;

    if (remainingMs <= 0) {
        daysEl.textContent = '0';
        yearsEl.textContent = '0';
        monthsEl.textContent = '0';
        hoursEl.textContent = '0';
        moonsEl.textContent = '0';
        liveSecondsEl.textContent = 'DÉPASSÉ';
        return;
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    // Approximate years and months
    const years = Math.floor(totalDays / 365.25);
    const remainingAfterYears = totalDays - (years * 365.25);
    const months = Math.floor(remainingAfterYears / 30.4375);
    const days = Math.floor(remainingAfterYears % 30.4375);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    const moons = Math.floor(totalDays / LUNAR_CYCLE_DAYS);

    daysEl.textContent = totalDays.toLocaleString('fr-FR');
    yearsEl.textContent = years;
    monthsEl.textContent = months;
    hoursEl.textContent = hours;
    moonsEl.textContent = moons.toLocaleString('fr-FR');

    liveSecondsEl.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

calculateBtn.addEventListener('click', calculate);

// Auto-calculate on input change if already calculated
birthdateInput.addEventListener('change', () => {
    if (expectedDeathDate) calculate();
});
customAgeInput.addEventListener('change', () => {
    if (expectedDeathDate && genderSelect.value === 'custom') calculate();
});

// Init
loadSaved();
toggleCustom();
