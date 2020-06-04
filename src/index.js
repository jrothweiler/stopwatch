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


// the previous time to compare against for incrementing the timer.
// is set to the current time when the start button is clicked, 
// or when the timer is updated while running.
let lastRecordedStopwatchTime = null;
let startingTime = null;

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
    let currentTime = Date.now();
    let totalTime = currentTime - startingTime - millisecondsPaused;
    timer.innerText = formatTimeForTimer(totalTime);
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
    lapTable.prepend(tableEntry);

    // Iterate through new set of children and update 
    let currentLapRows = document.getElementById("lapTable").children;
    for (let i = 0; i < currentLapRows.length; i++) {
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

        if (currentLapRows.length >= 10) {
            let lapTimeElement = currentRowElement.children[1];
            lapTimeElement.classList.add('scrollVisible')
        }
    }
}

// functionality for left button, which is either reset or lap
// depending on if the stopwatch is running.
function lapOrResetTimer() {
    let lapResetButton = document.getElementById("lapResetButton");
    if (isCounting) {
        let currentTime = Date.now();
        // trigger a lap: calculate new lap time
        let lapDuration = currentTime - lastLapStopwatchTime - millisecondsPausedSinceLastLap;

        // update best and worst times if able
        if (lapDuration > worstLapTime) {
            worstLapTime = lapDuration; 
        }
        if (lapDuration < bestLapTime) {
            bestLapTime = lapDuration;
        }

        // add to array of laps, update html
        lapTimes.unshift(lapDuration);
        
        console.log(`lap time was ${lapDuration}`)
        console.log(millisecondsPausedSinceLastLap)
        console.log(currentTime)
        console.log(lastLapStopwatchTime)
        lastLapStopwatchTime = currentTime;
        updateLapList(lapDuration);
        millisecondsPausedSinceLastLap = 0;
    } else {
        // trigger a reset: set timer to 0
        millisecondsPaused = 0;
        lastRecordedStopwatchTime = null;
        document.getElementById('timer').textContent = '00:00.00';

        bestLapTime = Infinity;
        worstLapTime = -Infinity;

        // go back to disabled lap button
        lapResetButton.disabled = true;
        lapResetButton.innerText = "Lap";

        // clear laps, clear table
        lapTimes = [];
        lastLapStopwatchTime = null;
        startingTime = null;
        document.getElementById("lapTable").textContent = '';
    }
}

// functionality for right button, which starts or stops the timer.
function toggleTimer() {
    console.log(`Now ${Date.now()}`)
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

        if (startingTime) {
            let pauseTime = Date.now() - lastRecordedStopwatchTime;
            millisecondsPaused += pauseTime;
            millisecondsPausedSinceLastLap += pauseTime;
        } else {
            startingTime = Date.now();
            lastLapStopwatchTime = Date.now();
        }
    }
    lastRecordedStopwatchTime = Date.now();
    isCounting = !isCounting;
}

document.getElementById("toggleButton").addEventListener("click", toggleTimer);
document.getElementById("lapResetButton").addEventListener("click", lapOrResetTimer);