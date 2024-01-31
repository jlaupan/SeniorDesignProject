function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const biasVoltageValue = document.getElementById('biasVoltageValue');
    const resistanceSlider = document.getElementById('resistance');
    const resistanceValue = document.getElementById('resistanceValue');
    const transistorTypeSelector = document.getElementById('transistorType');
    const incrementVoltageBtn = document.getElementById('incrementVoltage');
    const decrementVoltageBtn = document.getElementById('decrementVoltage');
    const resetVoltageBtn = document.getElementById('resetVoltage');
    const ctx = document.getElementById('biasGraph').getContext('2d');
    let biasVoltage = 0; // Initialize bias voltage
    let biasChart;

    function updateVoltageDisplay() {
        biasVoltageValue.textContent = `${biasVoltage.toFixed(2)}V`;
        updateGraph();
    }

    function updateResistanceDisplay() {
        resistanceValue.textContent = `${resistanceSlider.value}kΩ`;
    }

    incrementVoltageBtn.addEventListener('click', () => {
        biasVoltage += 0.25;
        updateVoltageDisplay();
    });

    decrementVoltageBtn.addEventListener('click', () => {
        biasVoltage -= 0.25;
        if (biasVoltage < 0) biasVoltage = 0;
        updateVoltageDisplay();
    });

    resetVoltageBtn.addEventListener('click', () => {
        biasVoltage = 0;
        updateVoltageDisplay();
    });

    const debouncedUpdate = debounce(() => {
        updateResistanceDisplay();
        updateGraph();
    }, 300);

    resistanceSlider.addEventListener('input', debouncedUpdate);
    transistorTypeSelector.addEventListener('change', updateGraph);

    function getTransistorCharacteristics(biasVoltage, resistance, type) {
    const Vth = 0.7; // Threshold voltage for Silicon transistors (approximate)
    const beta = 100; // Common value for current gain (hFE)

    const dataPoints = [];

    for (let Vbe = 0; Vbe <= biasVoltage; Vbe += biasVoltage / 10) {
        let Ic = 0;

        if (type === 'npn') {
            if (Vbe > Vth) {
                Ic = beta * ((Vbe - Vth) / resistance);
            }
        } else { // For PNP transistors
            if ((biasVoltage - Vbe) > Vth) {
                Ic = beta * ((biasVoltage - Vbe - Vth) / resistance);
            }
        }

        dataPoints.push({ x: Vbe, y: Ic });
    }

    return dataPoints;
}

    function updateGraph() {
        const resistance = parseFloat(resistanceSlider.value);
        const transistorType = transistorTypeSelector.value;
        const dataPoints = getTransistorCharacteristics(biasVoltage, resistance, transistorType);

        biasChart.data.labels = dataPoints.map(dp => dp.x.toFixed(2));
        biasChart.data.datasets[0].data = dataPoints;
        biasChart.update();
    }

     // Placeholder for initializing chat widget with GPT-3.5
    function initializeChatWidget() {
        console.log('Chat Widget Initialized');
    }
  
    function createGraph() {
        biasChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'V-I Characteristic',
                    data: [],
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Vgs (V)',
                            min: 0,
                            max: 15
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Ids (mA)',
                            min: 0,
                            max: 5
                        }
                    }
                }
            }
        });
    }

    createGraph();
    updateVoltageDisplay();
    updateResistanceDisplay();
  
    // Initialize chat widget function call remains the same...
    initializeChatWidget();
});
