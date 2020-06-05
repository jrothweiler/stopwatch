//----------- State ---------------
let isCounting = false;
let countingIntervalId = -1;
let millisecondsPaused = 0;
let millisecondsPausedSinceLastLap = 0;

// Array of lap times, or how long it took to complete each lap.
let lapTimes = [];

// total time on the stopwatch when the last lap time was taken, 
// for use in calculating the next laps total time. 
// null is interpretted as 0 for first lap.
let lastLapStopwatchTime = null;
let bestLapTime = Infinity;
let worstLapTime = -Infinity;


// the previous Date when the stopwatch was paused or started
// used at the next toggle to calculate the time elapsed
// between the two Dates.
let lastStopwatchToggleTime = null;

// Date the stopwatch was first started at. 
let startingTime = null;

//----------- UI handlers ---------------

// format a number for use in the timer, i.e. pad numbers less than 10 with leading zeroes
function padNumber(value) {
    return value.toString().padStart(2, '0');
}

// formats the given centisecond time in MM:SS.CC notation.
function formatTimeForTimer(elapsedTime) {
    const milliseconds = elapsedTime % 1000;
    const [minutes, seconds, centiseconds] = [
        Math.floor(elapsedTime / 60000),
        Math.floor(elapsedTime / 1000) % 60,
        Math.round(milliseconds / 10)
    ].map(padNumber)

    return `${minutes}:${seconds}.${centiseconds}`
}

// updates our UI in reaction to a change in time on the timer.
function onTimerChange(newTime) {
    let timer = document.getElementById("timer");
    timer.innerText = formatTimeForTimer(newTime);

    if (newTime == 0) {
        // since we cant lap or reset from 0, set to lap and disable
        let lapResetButton = document.getElementById("lapResetButton");
        lapResetButton.disabled = true;
        lapResetButton.innerText = "Lap";
    }
}

// updates our UI in reaction to a change in lap list
function onLapsChange(newLaps) {
    let lapTable = document.getElementById("lapTable");
    lapTable.textContent = '';
    for (let i =  1; i <= newLaps.length; i++) {
        let currentLapTime = newLaps[i - 1];
        let tableEntry = document.createElement('tr');

        if (bestLapTime != worstLapTime) {
            if (bestLapTime == currentLapTime) {
                tableEntry.classList.add('bestTime');
            } else if (worstLapTime == currentLapTime) {
                tableEntry.classList.add('worstTime');
            } 
        }

        // create each column, one with lap number, the other with time
        let lapNumber = document.createElement('td');
        lapNumber.innerText = `Lap ${i}`;

        let lapTime = document.createElement('td');
        lapTime.innerText = formatTimeForTimer(currentLapTime); 

        // append the columns to the row, then the row to the table
        tableEntry.appendChild(lapNumber);
        tableEntry.appendChild(lapTime);
        lapTable.prepend(tableEntry);
    }
}

// updates our UI in reaction to a change in running state, either 
// paused to running or running to paused
function onTimerToggle(isNowRunning) {
    let toggleButton = document.getElementById("toggleButton");
    let lapResetButton = document.getElementById("lapResetButton");
    if (isNowRunning) {
        toggleButton.innerText = "Stop";
        toggleButton.classList.add("started");
        toggleButton.classList.remove("stopped");
        
        lapResetButton.innerText = 'Lap';
    } else {
        toggleButton.innerText = "Start";
        toggleButton.classList.add("stopped");
        toggleButton.classList.remove("started");

        lapResetButton.innerText = 'Reset';
    }
    lapResetButton.disabled = false;
}

//----------- Logic handlers ---------------

// updates the timer html with the current centiseconds state,
// properly formatted.
function updateTimer() {
    let currentTime = Date.now();
    let totalTime = currentTime - startingTime - millisecondsPaused;
    onTimerChange(totalTime);
}

// functionality for left button, which is either reset or lap
// depending on if the stopwatch is running.
function lapOrResetTimer() {
    if (isCounting) {
        let currentTime = Date.now();
        let lapDuration = currentTime - lastLapStopwatchTime - millisecondsPausedSinceLastLap;

        // update best and worst times if able
        if (lapDuration > worstLapTime) {
            worstLapTime = lapDuration; 
        }
        if (lapDuration < bestLapTime) {
            bestLapTime = lapDuration;
        }

        lapTimes.unshift(lapDuration);
        
        lastLapStopwatchTime = currentTime;
        millisecondsPausedSinceLastLap = 0;

        onLapsChange(lapTimes);
    } else {
        // trigger a reset: set timer state to 0
        millisecondsPaused = 0;
        millisecondsPausedSinceLastLap = 0;
        lastStopwatchToggleTime = null;
        startingTime = null;

        // clear lap state
        lapTimes = [];
        lastLapStopwatchTime = null;
        bestLapTime = Infinity;
        worstLapTime = -Infinity;

        onLapsChange(lapTimes);
        onTimerChange(0);
    }
}

// functionality for right button, which starts or stops the timer.
function toggleTimer() {
    let currentDate = Date.now();
    if (isCounting) {
        clearInterval(countingIntervalId);
    } else {
        // start timer 
        countingIntervalId = setInterval(updateTimer, 10);

        if (startingTime) {
            // case for resuming after a pause, 
            let pauseTime = currentDate - lastStopwatchToggleTime;
            millisecondsPaused += pauseTime;
            millisecondsPausedSinceLastLap += pauseTime;
        } else {
            // else, we are starting for the first time,
            startingTime = currentDate;
            lastLapStopwatchTime = currentDate;
        }
    }
    lastStopwatchToggleTime = currentDate;
    isCounting = !isCounting;
    onTimerToggle(isCounting);
}

document.getElementById("toggleButton").addEventListener("click", toggleTimer);
document.getElementById("lapResetButton").addEventListener("click", lapOrResetTimer);