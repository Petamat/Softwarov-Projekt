"use strict";
// app.ts - Hlavní řídicí centrum aplikace propojené s uživatelským rozhraním
// =========================================================================
// 1. ABSTRAKTNÍ BÁZOVÁ TŘÍDA - Společný předek (Rodič)
// =========================================================================
class ExerciseItem {
    // ZAPOUZDŘENÍ (Encapsulation): Atributy jsou chráněné (protected).
    // Nejsou vidět zvenčí aplikace, ale děti (potomci) k nim mají plný přístup.
    name;
    sets;
    reps;
    restSeconds;
    constructor(name, sets, reps, restSeconds) {
        this.name = name;
        // VALIDACE DATA: Základní kontrola vstupů, aby uživatel nezadal nesmysly (např. záporné série)
        this.sets = sets > 0 ? sets : 1;
        this.reps = reps > 0 ? reps : 1;
        this.restSeconds = restSeconds >= 0 ? restSeconds : 0;
    }
    // GETTERY: Bezpečné veřejné metody pro čtení chráněných dat zvenčí
    getName() { return this.name; }
    getSets() { return this.sets; }
    getReps() { return this.reps; }
    getRest() { return this.restSeconds; }
}
// =========================================================================
// 2. POTOMEK - Silové cvičení (Dědičnost / Inheritance)
// =========================================================================
class StrengthExercise extends ExerciseItem {
    // Unikátní chráněné vlastnosti (private - přístupné jen a pouze uvnitř této třídy)
    weightKg;
    muscleGroup;
    constructor(name, sets, reps, rest, weightKg, muscleGroup) {
        // super() posílá společná data nahoru do konstruktoru rodiče (ExerciseItem)
        super(name, sets, reps, rest);
        this.weightKg = weightKg >= 0 ? weightKg : 0;
        this.muscleGroup = muscleGroup || "Nespecifikováno";
    }
    // POLYMORFISMUS (Mnohotvárnost): Silový trénink počítá celkový objem jako: série x opakování x váha.
    getTotalVolume() {
        return this.sets * this.reps * this.weightKg;
    }
    // Specifické formátování detailů do HTML pro silový trénink
    getSpecificDetails() {
        return `Váha: <strong>${this.weightKg} kg</strong> | Partie: <strong>${this.muscleGroup}</strong>`;
    }
}
// =========================================================================
// 3. POTOMEK - Kardio cvičení (Dědičnost / Inheritance)
// =========================================================================
class CardioExercise extends ExerciseItem {
    distanceKm;
    durationMin;
    constructor(name, sets, reps, rest, distanceKm, durationMin) {
        super(name, sets, reps, rest);
        this.distanceKm = distanceKm >= 0 ? distanceKm : 0;
        this.durationMin = durationMin > 0 ? durationMin : 1;
    }
    // POLYMORFISMUS v praxi: Kardio počítá objem jinak – převádí kilometry na celkové metry.
    getTotalVolume() {
        return this.distanceKm * 1000;
    }
    // Specifické formátování detailů pro kardio (včetně matematického výpočtu tempa min/km)
    getSpecificDetails() {
        const pace = this.durationMin / this.distanceKm;
        const paceStr = isFinite(pace) ? `${Math.floor(pace)}:${Math.round((pace % 1) * 60).toString().padStart(2, '0')} min/km` : "N/A";
        return `Vzdálenost: <strong>${this.distanceKm} km</strong> | Čas: <strong>${this.durationMin} min</strong> (Tempo: ${paceStr})`;
    }
}
// =========================================================================
// 4. TŘÍDA PRO TRÉNINK - Kontejner na objekty (Kompozice)
// =========================================================================
class Workout {
    // Polymorfní pole: Můžeme do něj ukládat jak Silové, tak Kardio objekty pospolu, protože oba jsou typem ExerciseItem.
    exercises = [];
    addExercise(e) {
        this.exercises.push(e);
    }
    getExercises() {
        return this.exercises;
    }
    // POLYMORFNÍ SČÍTÁNÍ OBJEMU: Projedeme pole a u každého prvku zavoláme .getTotalVolume().
    // Je nám jedno, o jaký cvik jde, každý objekt sám ví, jak se má spočítat.
    getTotalVolume() {
        return this.exercises.reduce((suma, cvik) => suma + cvik.getTotalVolume(), 0);
    }
}
// =========================================================================
// 5. MANIPULACE S DOM (Propojení kódu s HTML formulářem)
// =========================================================================
// Vytvoření běžící instance tréninkového deníku
const aktualniTrenink = new Workout();
// Načtení prvků z HTML do TypeScriptu pomocí ID a přetypování (Type Assertion)
const form = document.getElementById('exercise-form');
const selectType = document.getElementById('ex-type');
const strengthInputs = document.getElementById('strength-inputs');
const cardioInputs = document.getElementById('cardio-inputs');
const workoutList = document.getElementById('workout-list');
const statCount = document.getElementById('stat-count');
const statVolume = document.getElementById('stat-volume');
// POSLUCHAČ ZMĚNY (Event Listener): Pokud uživatel přepne typ tréninku, skryjeme nebo ukážeme správná pole formuláře
selectType.addEventListener('change', () => {
    if (selectType.value === 'silove') {
        strengthInputs.classList.remove('hidden'); // Ukáže silová pole
        cardioInputs.classList.add('hidden'); // Skryje kardio pole
    }
    else {
        strengthInputs.classList.add('hidden'); // Skryje silová pole
        cardioInputs.classList.remove('hidden'); // Ukáže kardio pole
    }
});
// DYNAMICKÉ RENDEROWÁNÍ (Překreslování UI bez znovunačtení stránky)
function updateUI() {
    const cviky = aktualniTrenink.getExercises();
    // 1. Aktualizace horních číselných statistik
    statCount.innerText = cviky.length.toString();
    statVolume.innerText = aktualniTrenink.getTotalVolume().toLocaleString('cs-CZ');
    // Pokud je trénink prázdný, vyhodíme základní hlášku a ukončíme funkci
    if (cviky.length === 0) {
        workoutList.innerHTML = `<p class="empty-message">Trénink je zatím prázdný. Přidej první cvik pomocí formuláře.</p>`;
        return;
    }
    workoutList.innerHTML = ''; // Kompletně vyčistíme starý seznam karet, abychom ho vygenerovali znovu a čistě
    // Projdeme pole objektů cyklem a z každého vygenerujeme HTML kartu
    cviky.forEach((cvik) => {
        // Pomocí "instanceof" bezpečně poznáme, o jakou třídu (typ) objektu jde
        const isCardio = cvik instanceof CardioExercise;
        const cardClass = isCardio ? 'exercise-card cardio' : 'exercise-card';
        const typeBadge = isCardio ? '🏃 Kardio' : '💪 Silový';
        // Sestavení šablony HTML karty (využívá polymorfní volání metod rodiče i dětí)
        const cardHtml = `
            <div class="${cardClass}">
                <div class="ex-info">
                    <h3>${cvik.getName()} <span class="ex-badge">${typeBadge}</span></h3>
                    <p>${cvik.getSets()}x${cvik.getReps()} (odpočinek ${cvik.getRest()}s)</p>
                    <p style="margin-top: 5px; font-size: 0.85rem; color: #4a5568;">
                        ${cvik.getSpecificDetails()}
                    </p>
                </div>
                <div class="ex-volume" style="text-align: right;">
                    <span style="font-size: 0.8rem; color: #718096; display:block;">Objem práce</span>
                    <strong style="color: #1e3c72; font-size: 1.1rem;">${cvik.getTotalVolume().toLocaleString('cs-CZ')}</strong>
                </div>
            </div>
        `;
        // Vložení karty do HTML kontejneru na stránce
        workoutList.innerHTML += cardHtml;
    });
}
// POSLUCHAČ ODESLÁNÍ FORMULÁŘE (Tlačítko "Přidat cvik")
form.addEventListener('submit', (e) => {
    e.preventDefault(); // !!! ZÁSADNÍ PŘÍKAZ: Zamezí prohlížeči, aby po odeslání překreslil/načetl znovu celou stránku!
    // Vytáhnutí základních hodnot z formuláře
    const name = document.getElementById('ex-name').value;
    const type = selectType.value;
    const sets = parseInt(document.getElementById('ex-sets').value);
    const reps = parseInt(document.getElementById('ex-reps').value);
    const rest = parseInt(document.getElementById('ex-rest').value);
    // Na základě vybraného typu oživíme správný objekt v paměti počítače
    if (type === 'silove') {
        const weight = parseFloat(document.getElementById('ex-weight').value);
        const muscle = document.getElementById('ex-muscle').value;
        // Vytvoření instance Silového cvičení a jeho uložení do tréninku
        aktualniTrenink.addExercise(new StrengthExercise(name, sets, reps, rest, weight, muscle));
    }
    else {
        const distance = parseFloat(document.getElementById('ex-distance').value);
        const duration = parseInt(document.getElementById('ex-duration').value);
        // Vytvoření instance Kardio cvičení a jeho uložení do tréninku
        aktualniTrenink.addExercise(new CardioExercise(name, sets, reps, rest, distance, duration));
    }
    // Vyčištění formuláře pro nový zápis a okamžité překreslení statistik a karet na webu
    form.reset();
    selectType.value = type; // Ponecháme vybraný typ pro pohodlnější zadávání
    updateUI(); // Spuštění překreslení rozhraní
});
