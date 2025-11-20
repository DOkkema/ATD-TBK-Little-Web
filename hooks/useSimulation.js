// hooks/useSimulation.js
const { useState, useEffect, useCallback, useRef } = React;

const initialMachineState = {
    status: 'idle',
    progress: 0,
    currentBatch: null,
};

const initialQueueState = {
    currentBatch: null,
};

window.useSimulation = (language) => {
    const [steps, setSteps] = useState(window.INITIAL_STEPS);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [timeUnit, setTimeUnit] = useState('Seconds');
    
    // Initialize states based on initial steps
    const [machineStates, setMachineStates] = useState(
        Array(window.INITIAL_STEPS.length).fill(0).map(() => ({ ...initialMachineState }))
    );
    const [queueStates, setQueueStates] = useState(
        Array(window.INITIAL_STEPS.length - 1).fill(0).map(() => ({ ...initialQueueState }))
    );
    
    const [totalTime, setTotalTime] = useState(0);
    
    // Use refs for large history arrays to avoid stale closure issues and excessive re-renders
    const wipHistoryRef = useRef([]);
    const completedBatchesRef = useRef([]);
    
    const [nextBatchId, setNextBatchId] = useState(1);

    // Computed metrics state (exposed to UI)
    const [metrics, setMetrics] = useState({ wip: 0, throughput: 0, leadTime: 0 });
    
    // History for the Chart
    const [metricsHistory, setMetricsHistory] = useState([]);

    // Auto-translate step names when language changes
    useEffect(() => {
        const t = window.TRANSLATIONS[language];
        setSteps(currentSteps => currentSteps.map(step => {
            let newName = step.name;
            
            // Regex to find "Stap/Step X:" prefix
            const prefixRegex = /^(Stap|Step)\s+(\d+)(:?)/i;
            const match = step.name.match(prefixRegex);
            
            if (match) {
                const number = match[2];
                const separator = match[3] || ":";
                // Get the rest of the string (the custom or standard name)
                const rest = step.name.substring(match[0].length).trim();
                
                let translatedRest = rest;
                
                // Check if the name is a known standard name and translate it
                if (t.stepNameMapping && t.stepNameMapping[rest]) {
                    translatedRest = t.stepNameMapping[rest];
                }
                
                newName = `${t.stepPrefix} ${number}${separator} ${translatedRest}`;
            }
            
            if (newName !== step.name) {
                return { ...step, name: newName };
            }
            return step;
        }));
    }, [language]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            // Total simulated time to advance in this tick
            const totalSimTimeAdvance = (window.SIMULATION_SPEED / 1000) * speedMultiplier;
            
            // To ensure accuracy at high speeds (e.g. 128x), we sub-step the simulation.
            const MAX_STEP = 0.1;
            const iterations = Math.ceil(totalSimTimeAdvance / MAX_STEP);
            const dt = totalSimTimeAdvance / iterations;

            // Clone state for mutation within the loop
            let currentMachineStates = JSON.parse(JSON.stringify(machineStates));
            let currentQueueStates = JSON.parse(JSON.stringify(queueStates));
            let currentNextBatchId = nextBatchId;
            let loopTime = totalTime;
            
            const tickFinishedBatches = [];
            const numSteps = steps.length;

            // --- SUB-STEP LOOP ---
            for (let iter = 0; iter < iterations; iter++) {
                loopTime += dt;

                // 1. Advance progress
                for (let i = 0; i < numSteps; i++) {
                    const machine = currentMachineStates[i];
                    const params = steps[i];
                    if (!machine || !params) continue;

                    if (machine.status === 'setup') {
                        machine.progress += dt / (params.setupTime || 1);
                    } else if (machine.status === 'producing' && machine.currentBatch) {
                        const duration = params.cycleTime * machine.currentBatch.size;
                        machine.progress += dt / (duration || 1);
                    }
                }

                // 2. State Transitions (Backwards / Pull logic)
                for (let i = numSteps - 1; i >= 0; i--) {
                    const machine = currentMachineStates[i];
                    if (!machine) continue;

                    if ((machine.status === 'setup' || machine.status === 'producing') && machine.progress >= 1) {
                        if (machine.status === 'setup') {
                            machine.status = 'producing';
                            machine.progress = 0;
                        } else { // Production finished
                            if (i === numSteps - 1) { // Last step
                                const finishedBatch = { ...machine.currentBatch, endTime: loopTime };
                                tickFinishedBatches.push(finishedBatch);
                                machine.currentBatch = null;
                                machine.status = 'idle';
                                machine.progress = 0;
                            } else { // Intermediate step
                                const nextQueue = currentQueueStates[i];
                                if (nextQueue && nextQueue.currentBatch === null) {
                                    nextQueue.currentBatch = machine.currentBatch;
                                    machine.currentBatch = null;
                                    machine.status = 'idle';
                                    machine.progress = 0;
                                } else {
                                    machine.status = 'blocked';
                                }
                            }
                        }
                    }
                }
                
                // 3. Start new work (Forwards / Push logic)
                for (let i = 0; i < numSteps; i++) {
                    const machine = currentMachineStates[i];
                    if (!machine) continue;
                    
                    // Try to unblock
                    if (machine.status === 'blocked') {
                        const nextQueue = currentQueueStates[i];
                        if (nextQueue && nextQueue.currentBatch === null) {
                             nextQueue.currentBatch = machine.currentBatch;
                             machine.currentBatch = null;
                             machine.status = 'idle';
                             machine.progress = 0;
                        }
                    }

                    // Try to start idle machine
                    if (machine.status === 'idle') {
                        if (i === 0) { // First machine
                            if (steps[0]) {
                                const newBatch = { id: currentNextBatchId, size: steps[0].batchSize, startTime: loopTime };
                                currentNextBatchId++;
                                machine.currentBatch = newBatch;
                                machine.status = 'setup';
                                machine.progress = 0;
                            }
                        } else { // Downstream machines
                            const prevQueue = currentQueueStates[i - 1];
                            if (prevQueue && prevQueue.currentBatch) {
                                machine.currentBatch = prevQueue.currentBatch;
                                prevQueue.currentBatch = null;
                                machine.status = 'setup';
                                machine.progress = 0;
                            }
                        }
                    }
                }
            }
            // --- END LOOP ---

            // Commit state updates
            setTotalTime(loopTime);
            setMachineStates(currentMachineStates);
            setQueueStates(currentQueueStates);
            setNextBatchId(currentNextBatchId);

            // Update finished batches ref
            if (tickFinishedBatches.length > 0) {
                completedBatchesRef.current.push(...tickFinishedBatches);
            }

            // --- Metrics Calculation ---
            // Calculate current WIP based on the state at the END of the tick
            const currentWipInMachines = currentMachineStates.reduce((sum, m) => sum + (m.currentBatch?.size || 0), 0);
            const currentWipInQueues = currentQueueStates.reduce((sum, q) => sum + (q.currentBatch?.size || 0), 0);
            const currentTotalWip = currentWipInMachines + currentWipInQueues;
            
            // Update WIP History Ref (Rolling Window)
            const cutoff = loopTime - window.METRICS_WINDOW;
            wipHistoryRef.current.push({ t: loopTime, w: currentTotalWip });
            
            // Prune old data
            while (wipHistoryRef.current.length > 0 && wipHistoryRef.current[0].t <= cutoff) {
                wipHistoryRef.current.shift();
            }
            while (completedBatchesRef.current.length > 0 && completedBatchesRef.current[0].endTime <= cutoff) {
                completedBatchesRef.current.shift();
            }

            // Metrics Calculation (Same as before)
            const currentWipHistory = wipHistoryRef.current;
            const currentCompletedBatches = completedBatchesRef.current;
            const windowDuration = Math.min(loopTime, window.METRICS_WINDOW);
            
            // Avg WIP
            const avgWip = currentWipHistory.length > 0 
                ? currentWipHistory.reduce((sum, entry) => sum + entry.w, 0) / currentWipHistory.length 
                : 0;

            const conversionFactor = timeUnit === 'Hours' ? 24 : 60;
            const totalItemsCompleted = currentCompletedBatches.reduce((sum, batch) => sum + batch.size, 0);
            const windowDurationConverted = window.METRICS_WINDOW / conversionFactor; 
            const effectiveDurationConverted = loopTime < window.METRICS_WINDOW ? loopTime / conversionFactor : windowDurationConverted;
            
            const throughput = effectiveDurationConverted > 0 ? totalItemsCompleted / effectiveDurationConverted : 0;
            
            const totalLeadTimeRaw = currentCompletedBatches.reduce((sum, batch) => sum + (batch.endTime - batch.startTime), 0);
            const avgLeadTimeConverted = currentCompletedBatches.length > 0 ? (totalLeadTimeRaw / currentCompletedBatches.length) / conversionFactor : 0;

            const currentMetrics = {
                wip: avgWip,
                throughput: throughput,
                leadTime: avgLeadTimeConverted,
            };
            
            setMetrics(currentMetrics);

            // Update Chart History
            if (Math.floor(loopTime) > Math.floor(totalTime)) {
                setMetricsHistory(prev => {
                    const newHistory = [...prev, { time: loopTime, ...currentMetrics }];
                    if (newHistory.length > 3600) {
                        return newHistory.slice(newHistory.length - 3600);
                    }
                    return newHistory;
                });
            }

        }, window.SIMULATION_SPEED);

        return () => clearInterval(intervalId);
    }, [steps, speedMultiplier, machineStates, queueStates, totalTime, nextBatchId, timeUnit]);

    const updateStepParameter = useCallback((stepIndex, param, value) => {
        setSteps(currentSteps => {
            if (param === 'batchSize') {
                return currentSteps.map(p => ({ ...p, batchSize: value }));
            }
            return currentSteps.map((p, i) =>
                i === stepIndex ? { ...p, [param]: value } : p
            )
        });
    }, []);

    const reset = useCallback(() => {
        setSteps(window.INITIAL_STEPS);
        setSpeedMultiplier(1);
        setMachineStates(Array(window.INITIAL_STEPS.length).fill(0).map(() => ({ ...initialMachineState })));
        setQueueStates(Array(window.INITIAL_STEPS.length - 1).fill(0).map(() => ({ ...initialQueueState })));
        setTotalTime(0);
        wipHistoryRef.current = [];
        completedBatchesRef.current = [];
        setMetricsHistory([]);
        setNextBatchId(1);
        setMetrics({ wip: 0, throughput: 0, leadTime: 0 });
    }, []);

    const duplicateStepParameters = useCallback((sourceIndex) => {
        setSteps(currentSteps => {
            const sourceStep = currentSteps[sourceIndex];
            if (!sourceStep) return currentSteps;
            const { cycleTime, setupTime } = sourceStep;
            return currentSteps.map(p => ({ ...p, cycleTime, setupTime }));
        });
    }, []);

    const updateStepName = useCallback((stepIndex, newName) => {
        setSteps(currentSteps =>
            currentSteps.map((p, i) =>
                i === stepIndex ? { ...p, name: newName } : p
            )
        );
    }, []);

    const addStep = useCallback(() => {
        setSteps(currentSteps => {
            if (currentSteps.length >= window.MAX_STEPS) return currentSteps;
            
            const t = window.TRANSLATIONS[language];
            const lastStep = currentSteps[currentSteps.length - 1];
            const newId = currentSteps.length + 1;
            const color = window.STEP_COLORS[(newId - 1) % window.STEP_COLORS.length];
            
            const newStep = {
                id: newId,
                name: `${t.stepPrefix} ${newId}: ...`,
                color: color,
                icon: React.createElement(window.ProductIcon),
                cycleTime: lastStep.cycleTime,
                batchSize: lastStep.batchSize,
                setupTime: lastStep.setupTime
            };
            
            return [...currentSteps, newStep];
        });

        setMachineStates(prev => [...prev, { ...initialMachineState }]);
        setQueueStates(prev => [...prev, { ...initialQueueState }]);
    }, [language]);

    const removeStep = useCallback(() => {
        setSteps(currentSteps => {
            if (currentSteps.length <= window.MIN_STEPS) return currentSteps;
            return currentSteps.slice(0, -1);
        });
        setMachineStates(prev => {
            if (prev.length <= window.MIN_STEPS - 1) return prev;
            return prev.slice(0, -1);
        });
        setQueueStates(prev => {
            if (prev.length <= window.MIN_STEPS - 1) return prev;
            return prev.slice(0, -1);
        });
    }, []);

    return { 
        steps, 
        metrics, 
        metricsHistory, 
        machineStates, 
        queueStates, 
        updateStepParameter, 
        reset, 
        speedMultiplier, 
        updateSpeedMultiplier: setSpeedMultiplier, 
        duplicateStepParameters, 
        updateStepName, 
        timeUnit,
        setTimeUnit, 
        addStep,
        removeStep
    };
};