var isCounting = false;
var countingIntervalId = -1;
var millisecondsOnTimer = 0;

// Contains an array of lap times, or how long it took to complete each lap.
var lapTimes = [];

// this is the total time on the stopwatch when the last lap time was taken, 
// for use in calculating the next laps total time. 
// null is interpretted as 0 for first lap.
var lastLapStopwatchTime = null;
var bestLapTime = Infinity;
var worstLapTime = -Infinity;


// the previous time to compare against for incrementing the timer.
// is set to the current time when the start button is clicked, 
// or when the timer is updated while running.
var lastRecordedStopwatchTime = null;

// format a number for use in the timer, i.e. pad numbers less than 10 with leading zeroes
function padNumber(value) {
    return value.toString().padStart(2, '0');
}

// formats the given centisecond time in MM:SS.CC notation.
function formatTimeForTimer(elapsedTime) {
    let milliseconds = elapsedTime % 1000;
    let centiseconds = Math.round(milliseconds / 10);
    let seconds = Math.floor(elapsedTime / 1000) % 60;
    let minutes = Math.floor(elapsedTime / 60000);

    return `${padNumber(minutes)}:${padNumber(seconds)}.${padNumber(centiseconds)}`
}

// updates the timer html with the current centiseconds state,
// properly formatted.
function updateTimer() {
    let timer = document.getElementById("timer");
    if (isCounting) {
        let currentTime = Date.now();
        let millisecondsElapsed = currentTime - lastRecordedStopwatchTime;
        millisecondsOnTimer += millisecondsElapsed;
        lastRecordedStopwatchTime = currentTime;
    }
    document.getElementById("timer").innerHTML = formatTimeForTimer(millisecondsOnTimer);
}

// update lap list html with current lap state.
function updateLapList() {
    console.log(bestLapTime);
    console.log(worstLapTime);
    let lapTable = document.getElementById("lapTable");
    lapTable.textContent = '';
    for (let i =  1; i <= lapTimes.length; i++) {
        let lap = lapTimes[i - 1];
        let tableEntry = document.createElement('tr');
        if (bestLapTime != worstLapTime) {
            if (bestLapTime == lap) {
                tableEntry.classList.add('bestTime');
            } else if (worstLapTime == lap) {
                tableEntry.classList.add('worstTime');
            } 
        }
        let lapNumber = document.createElement('td');
        let lapTime = document.createElement('td');
        lapNumber.innerHTML = `Lap ${i}`;
        lapTime.innerHTML = formatTimeForTimer(lap); 
        tableEntry.appendChild(lapNumber);
        tableEntry.appendChild(lapTime);
        lapTable.appendChild(tableEntry);
    }
}

// functionality for left button, which is either reset or lap
// depending on if the stopwatch is running.
function lapOrResetTimer() {
    let lapResetButton = document.getElementById("lapResetButton");
    if (isCounting) {
        // trigger a lap: calculate new lap time, add to array of laps, update html
        let lapDuration = millisecondsOnTimer - lastLapStopwatchTime;
        if (lapDuration > worstLapTime) {
            worstLapTime = lapDuration; 
        }
        if (lapDuration < bestLapTime) {
            bestLapTime = lapDuration;
        }

        let lapDurationString = lapDuration;
        lapTimes.push(lapDurationString);
        lastLapStopwatchTime = millisecondsOnTimer;
        updateLapList();
    } else {
        // trigger a reset: set timer to 0, go back to disabled lap button, clear laps
        millisecondsOnTimer = 0;
        lastRecordedStopwatchTime = null;
        updateTimer();

        bestLapTime = Infinity;
        worstLapTime = -Infinity;

        lapResetButton.disabled = true;
        lapResetButton.innerHTML = "Lap";

        lapTimes = [];
        lastLapStopwatchTime = null;
        updateLapList();
    }
}

// functionality for right button, which starts or stops the timer.
function toggleTimer() {
    let toggleButton = document.getElementById("toggleButton")
    let lapResetButton = document.getElementById("lapResetButton");
    if (isCounting) {
        // stop timer, change button back to start timer, change lap button to reset
        clearInterval(countingIntervalId);
        toggleButton.innerHTML = "Start";
        lapResetButton.innerHTML = "Reset";
        toggleButton.classList.add("stopped");
        toggleButton.classList.remove("started");
    } else {
        // start timer, change button to stop timer, enable lap button
        countingIntervalId = setInterval(updateTimer, 10);
        toggleButton.innerHTML = "Stop";
        toggleButton.classList.add("started");
        toggleButton.classList.remove("stopped");

        lapResetButton.innerHTML = "Lap";
        lapResetButton.disabled = false;

        // set date for calculating elapsed time to current date, to ignore
        // elapsed time while paused.
        lastRecordedStopwatchTime = Date.now();
    }
    isCounting = !isCounting;
}

document.getElementById("toggleButton").addEventListener("click", toggleTimer);
document.getElementById("lapResetButton").addEventListener("click", lapOrResetTimer);