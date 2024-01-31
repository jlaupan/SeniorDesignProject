function updateGraphScales() {
    const maxVgs = parseFloat(gateVoltageSlider.max) - parseFloat(sourceVoltageSlider.min);
    const maxVds = parseFloat(drainVoltageSlider.max) - parseFloat(sourceVoltageSlider.min);
    const maxIds = calculateMaxCurrent(maxVgs, maxVds);

    mosfetChart.options.scales.x.max = maxVgs;
    mosfetChart.options.scales.y.max = maxIds;
    mosfetChart.update();
}

// Function to calculate maximum possible current (Ids)
function calculateMaxCurrent(maxVgs, maxVds) {
    // Assuming saturation region for maximum current calculation
    // Ids = 0.5 * k * (Vgs - Vth)^2
    const Vth = 2; // Threshold voltage (V)
    const k = 0.5; // Transconductance parameter (A/V^2), adjust as needed

    let maxCurrent = 0;
    if (maxVgs > Vth) {
        maxCurrent = 0.5 * k * Math.pow(maxVgs - Vth, 2);
    }
    // Consider additional conditions or more accurate calculations as needed
    return maxCurrent;
}

document.addEventListener('DOMContentLoaded', function() {
    // Sliders
    const gateVoltageSlider = document.getElementById('gateVoltage');
    const drainVoltageSlider = document.getElementById('drainVoltage');
    const sourceVoltageSlider = document.getElementById('sourceVoltage');

    // Display spans
    const gateVoltageValue = document.getElementById('gateVoltageValue');
    const drainVoltageValue = document.getElementById('drainVoltageValue');
    const sourceVoltageValue = document.getElementById('sourceVoltageValue');
    const mosfetState = document.getElementById('mosfetState');
    // Graph setup
    const ctx = document.getElementById('mosfetGraph').getContext('2d');
  
  
let mosfetChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'MOSFET States',
            data: [],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Vgs (Gate-Source Voltage)'
                },
                min: 0, // Minimum value for x-axis
                max: 10, // Maximum value for x-axis, adjust as needed
            },
            y: {
                title: {
                    display: true,
                    text: 'Ids (Drain-Source Current)'
                },
                min: 0, // Minimum value for y-axis
                max: 5, // Maximum value for y-axis, adjust as needed
            }
        }
    }
});

    // Update the graph with relevant data points
    function updateGraph(Vg, Vd, Vs) {
        // Example logic to add data points based on the MOSFET states
        // This will need to be adjusted based on the actual characteristics and data
        mosfetChart.data.datasets[0].data = [
            { x: Vg - Vs, y: calculateCurrent(Vg, Vd, Vs) } // Calculate current based on the given voltages
        ];
        mosfetChart.update();
    }

    function calculateCurrent(Vg, Vd, Vs) {
    const Vth = 2; // Threshold voltage (V)
    const k = 0.5; // Transconductance parameter (A/V^2), adjust as needed

    const Vgs = Vg - Vs;
    const Vds = Vd - Vs;

    if (Vgs <= Vth) {
        // Cutoff region
        return 0;
    } else if (Vds > Vgs - Vth) {
        // Saturation region
        return 0.5 * k * Math.pow(Vgs - Vth, 2);
    } else {
        // Active region
        return k * ((Vgs - Vth) * Vds - 0.5 * Math.pow(Vds, 2));
    }
    }
    // Update slider values and MOSFET state
    function updateValues() {
        const Vg = parseFloat(gateVoltageSlider.value);
        const Vd = parseFloat(drainVoltageSlider.value);
        const Vs = parseFloat(sourceVoltageSlider.value);

        gateVoltageValue.textContent = `${Vg}V`;
        drainVoltageValue.textContent = `${Vd}V`;
        sourceVoltageValue.textContent = `${Vs}V`;

        updateMOSFETState(Vg, Vd, Vs);
      updateGraph(parseFloat(gateVoltageSlider.value), parseFloat(drainVoltageSlider.value), parseFloat(sourceVoltageSlider.value));
    }

    // State information element
    const stateInfo = document.getElementById('stateInfo');

    // Update the information box based on the MOSFET state
    function updateStateInfo(state) {
        let infoText = '';
        switch (state) {
            case 'Saturation':
                infoText = 'In Saturation, the MOSFET operates as an amplifier. The current from drain to source is controlled by the gate-source voltage.';
                break;
            case 'Active':
                infoText = 'In the Active region, the MOSFET acts like a constant current source, allowing a steady current flow regardless of the drain-source voltage.';
                break;
            case 'Cutoff':
                infoText = 'In the Cutoff state, the MOSFET is off. There is no current flow from drain to source as the gate-source voltage is below the threshold.';
                break;
        }
        stateInfo.textContent = infoText;
    }
    // Calculate and update MOSFET state
    function updateMOSFETState(Vg, Vd, Vs) {
        // Add your logic here to determine the MOSFET state
        // For simplicity, let's assume a threshold voltage (Vth)
        const Vth = 2; // Threshold voltage for this example

        if (Vg <= Vth) {
            mosfetState.textContent = 'Cutoff';
        } else if (Vd > Vg - Vth) {
            mosfetState.textContent = 'Saturation';
        } else {
            mosfetState.textContent = 'Active';
        }
      updateStateInfo(mosfetState.textContent);
    }

    // Event Listeners for sliders
    gateVoltageSlider.addEventListener('input', updateValues);
    drainVoltageSlider.addEventListener('input', updateValues);
    sourceVoltageSlider.addEventListener('input', updateValues);

    // Reset Button
    document.getElementById('resetButton').addEventListener('click', () => {
        gateVoltageSlider.value = 5;
        drainVoltageSlider.value = 5;
        sourceVoltageSlider.value = 0;
        updateValues();
    });

    
  let currentStateIndex = 0;
    const states = ['Saturation', 'Active', 'Cutoff'];

    // Toggle Simulation
    document.getElementById('toggleSimulation').addEventListener('click', () => {
        currentStateIndex = (currentStateIndex + 1) % states.length;
        setMOSFETState(states[currentStateIndex]);
    });

    function setMOSFETState(state) {
        switch (state) {
            case 'Saturation':
                // Set slider values for Saturation state
                gateVoltageSlider.value = 5;
                drainVoltageSlider.value = 3; // Vd < Vg - Vth
                sourceVoltageSlider.value = 0;
                break;
            case 'Active':
                // Set slider values for Active state
                gateVoltageSlider.value = 5;
                drainVoltageSlider.value = 6; // Vd > Vg - Vth
                sourceVoltageSlider.value = 0;
                break;
            case 'Cutoff':
                // Set slider values for Cutoff state
                gateVoltageSlider.value = 1; // Vg < Vth
                drainVoltageSlider.value = 5;
                sourceVoltageSlider.value = 0;
                break;
        }
        updateValues();
        updateStateInfo(state);
        updateGraph(parseFloat(gateVoltageSlider.value), parseFloat(drainVoltageSlider.value), parseFloat(sourceVoltageSlider.value));
    }

    // Initial update
    updateValues();

});

