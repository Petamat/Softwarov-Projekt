// app.ts - Hlavní logika aplikace
import { cvikyData } from './data';

// Abstraktní bázová třída
abstract class ExerciseItem {
    protected name: string;
    protected sets: number;
    protected reps: number;
    protected restSeconds: number;

    constructor(name: string, sets: number, reps: number, restSeconds: number) {
        this.name = name;
        this.sets = sets > 0 ? sets : 1; 
        this.reps = reps > 0 ? reps : 1;
        this.restSeconds = restSeconds >= 0 ? restSeconds : 0;
    }

    public getName(): string { return this.name; }
    public abstract getTotalVolume(): number;

    public getSummary(): string {
        return `${this.name}: ${this.sets}x${this.reps}, odpočinek: ${this.restSeconds}s`;
    }
}

// Potomek pro silový trénink
class StrengthExercise extends ExerciseItem {
    private weightKg: number;
    private muscleGroup: string;

    constructor(name: string, sets: number, reps: number, rest: number, weightKg: number, muscleGroup: string) {
        super(name, sets, reps, rest);
        this.weightKg = weightKg >= 0 ? weightKg : 0;
        this.muscleGroup = muscleGroup;
    }

    public getTotalVolume(): number {
        return this.sets * this.reps * this.weightKg;
    }
}

// Potomek pro kardio trénink
class CardioExercise extends ExerciseItem {
    private distanceKm: number;
    private durationMin: number;

    constructor(name: string, sets: number, reps: number, rest: number, distanceKm: number, durationMin: number) {
        super(name, sets, reps, rest);
        this.distanceKm = distanceKm >= 0 ? distanceKm : 0;
        this.durationMin = durationMin > 0 ? durationMin : 1;
    }

    public getTotalVolume(): number {
        return this.distanceKm * 1000; // Objem v metrech
    }

    public getPace(): string {
        const p = this.durationMin / this.distanceKm;
        return `${Math.floor(p)}:${Math.round((p % 1) * 60).toString().padStart(2, '0')} min/km`;
    }
}

// Třída pro celý trénink (Polymorfismus v praxi)
class Workout {
    private exercises: ExerciseItem[] = [];
    private notes: string;

    constructor(notes: string) { this.notes = notes; }
    public addExercise(e: ExerciseItem): void { this.exercises.push(e); }

    public getTotalVolume(): number {
        return this.exercises.reduce((suma, cvik) => suma + cvik.getTotalVolume(), 0);
    }

    public printSummary(): void {
        console.log(`=== TRÉNINK: ${this.notes} ===`);
        for (let cvik of this.exercises) {
            console.log(`- ${cvik.getSummary()} | Objem: ${cvik.getTotalVolume()}`);
        }
        console.log(`CELKOVÝ OBJEM: ${this.getTotalVolume()}`);
    }
}

// Oživení objektů z číselníku
const dnesniTrenink = new Workout("Pondělní trénink");

for (let data of cvikyData) {
    if (data.typ === "silove") {
        dnesniTrenink.addExercise(new StrengthExercise(data.nazev, data.serie, data.opakovani, data.odpocinek, data.vaha!, data.svalovaSkupina!));
    } else if (data.typ === "kardio") {
        dnesniTrenink.addExercise(new CardioExercise(data.nazev, data.serie, data.opakovani, data.odpocinek, data.vzdalenost!, data.cas!));
    }
}

// Testovací výpis do konzole pro 1. fázi vývoje
dnesniTrenink.printSummary();