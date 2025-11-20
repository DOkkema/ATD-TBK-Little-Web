// constants.js
const { createElement } = React;

window.APP_VERSION = '1.0.1';

// Define ProductIcon as a global component
window.ProductIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);

window.MIN_STEPS = 2;
window.MAX_STEPS = 5;

window.STEP_COLORS = [
    'border-[#0093D0]', // Actief Blauw
    'border-[#FE5000]', // Sociaal Oranje
    'border-[#EF3340]', // Helder Rood
    'border-[#001489]', // Slim Donker Blauw
    'border-[#E5E7EB]', // Neutraal Grijs
    'border-[#D7C4E2]', // Kalm Paars
];

window.INITIAL_STEPS = [
  { id: 1, name: 'Stap 1: Zagen',   color: window.STEP_COLORS[0],    icon: <window.ProductIcon />, cycleTime: 1.0,   batchSize: 10, setupTime: 20 },
  { id: 2, name: 'Stap 2: Buigen',   color: window.STEP_COLORS[1], icon: <window.ProductIcon />, cycleTime: 2.0,   batchSize: 10, setupTime: 20 },
  { id: 3, name: 'Stap 3: Lassen', color: window.STEP_COLORS[2],   icon: <window.ProductIcon />, cycleTime: 3.0, batchSize: 10, setupTime: 20 },
  { id: 4, name: 'Stap 4: Assembleren',  color: window.STEP_COLORS[3],   icon: <window.ProductIcon />, cycleTime: 4.0,   batchSize: 10, setupTime: 20 },
];

window.SIMULATION_SPEED = 50; // Interval in ms
window.QUEUE_CAPACITY = 1; // Each queue can hold one batch
window.METRICS_WINDOW = 1200; // Rolling window in seconds