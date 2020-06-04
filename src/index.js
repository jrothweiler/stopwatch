var isCounting = false;
var countingIntervalId = -1;
var millisecondsOnTimer = 0;

// Array of lap times, or how long it took to complete each lap.
var lapTimes = [];

// total time on the stopwatch when the last lap time was taken, 
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
    document.getElementById("timer").innerText = formatTimeForTimer(millisecondsOnTimer);
}

// update lap list html with the new time entry
function updateLapList(newTime) {
    let lapTable = document.getElementById("lapTable");

    // Create new table entry for new time
    let tableEntry = document.createElement('tr');

    let lapNumberElement = document.createElement('td');
    lapNumberElement.innerText = `Lap ${lapTable.children.length + 1}`;

    let lapTimeElement = document.createElement('td');
    lapTimeElement.innerText = formatTimeForTimer(newTime); 

    // append the columns to the row, then the row to the table
    tableEntry.appendChild(lapNumberElement);
    tableEntry.appendChild(lapTimeElement);
    lapTable.appendChild(tableEntry);

    // Iterate through new set of children and update 
    let currentLapRows = document.getElementById("lapTable").children;
    for (let i =  0; i < lapTimes.length; i++) {
        let currentRowTime = lapTimes[i];
        let currentRowElement = currentLapRows[i];
        let currentRowElementClasses = currentRowElement.classList;

        currentRowElementClasses.remove('bestTime');
        currentRowElementClasses.remove('worstTime');
        
        if (bestLapTime != worstLapTime) {
            if (bestLapTime == currentRowTime) {
                currentRowElementClasses.add('bestTime');
            } else if (worstLapTime == currentRowTime) {
                currentRowElementClasses.add('worstTime');
            } 
        }
    }
}

// functionality for left button, which is either reset or lap
// depending on if the stopwatch is running.
function lapOrResetTimer() {
    let lapResetButton = document.getElementById("lapResetButton");
    if (isCounting) {
        // trigger a lap: calculate new lap time
        let lapDuration = millisecondsOnTimer - lastLapStopwatchTime;

        // update best and worst times if able
        if (lapDuration > worstLapTime) {
            worstLapTime = lapDuration; 
        }
        if (lapDuration < bestLapTime) {
            bestLapTime = lapDuration;
        }

        // add to array of laps, update html
        let lapDurationString = lapDuration;
        lapTimes.push(lapDurationString);
        lastLapStopwatchTime = millisecondsOnTimer;
        updateLapList(lapDuration);
    } else {
        // trigger a reset: set timer to 0
        millisecondsOnTimer = 0;
        lastRecordedStopwatchTime = null;
        updateTimer();

        bestLapTime = Infinity;
        worstLapTime = -Infinity;

        // go back to disabled lap button
        lapResetButton.disabled = true;
        lapResetButton.innerText = "Lap";

        // clear laps, clear table
        lapTimes = [];
        lastLapStopwatchTime = null;
        document.getElementById("lapTable").textContent = '';
    }
}

// functionality for right button, which starts or stops the timer.
function toggleTimer() {
    let toggleButton = document.getElementById("toggleButton")
    let lapResetButton = document.getElementById("lapResetButton");
    if (isCounting) {
        // stop timer
        clearInterval(countingIntervalId);

        // change button back to start timer
        toggleButton.innerText = "Start";
        toggleButton.classList.add("stopped");
        toggleButton.classList.remove("started");

        // change lap button to reset
        lapResetButton.innerText = "Reset";
    } else {
        // start timer 
        countingIntervalId = setInterval(updateTimer, 10);
        
        // change button to stop timer
        toggleButton.innerText = "Stop";
        toggleButton.classList.add("started");
        toggleButton.classList.remove("stopped");

        // enable lap button
        lapResetButton.innerText = "Lap";
        lapResetButton.disabled = false;

        // set date for calculating elapsed time to current date, to ignore
        // elapsed time while paused.
        lastRecordedStopwatchTime = Date.now();
    }
    isCounting = !isCounting;
}

document.getElementById("toggleButton").addEventListener("click", toggleTimer);
document.getElementById("lapResetButton").addEventListener("click", lapOrResetTimer);