var isCounting = false;
var countingIntervalId = -1;
var centisecondsOnTimer = 0;

// Contains an array of lap times, or how long it took to complete each lap.
// This is the time that will be shown in the list for that lap.
var lapTimes = [];

// this is the total time on the stopwatch when the last time was taken, 
// for use in calculating the next laps total time. 
// Initially 0 for calculating the first laps time against the beginning.
var lastLapStopwatchTime = 0;

// format a number for use in the timer, i.e. pad numbers less than 10 with leading zeroes
function formatNumberAsTime(value) {
    return value.toString().padStart(2, '0');
}

// formats the given centisecond time in MM:SS.CC notation.
function formatTimeForTimer(time) {
    let centiseconds = time % 100;
    let seconds = Math.floor(time / 100) % 60;
    let minutes = Math.floor(time / 6000);

    return `${formatNumberAsTime(minutes)}:${formatNumberAsTime(seconds)}.${formatNumberAsTime(centiseconds)}`
}

// updates the timer html with the current centiseconds state,
// properly formatted.
function updateTimer() {
    document.getElementById("timer").innerHTML = formatTimeForTimer(centisecondsOnTimer);
}

function updateLapList() {
    let lapListElement = document.getElementById("lapList");
    console.log(lapListElement);
    // for now, just separating times by spaces is fine.
    lapListElement.innerHTML = lapTimes.join(" ");
}

function incrementTimer() {
    centisecondsOnTimer += 1;
    updateTimer();
}

function lapOrResetTimer() {
    let lapResetButton = document.getElementById("lapResetButton");
    if (isCounting) {
        // trigger a lap
        let lapDuration = centisecondsOnTimer - lastLapStopwatchTime;
        let lapDurationString = formatTimeForTimer(lapDuration);
        lapTimes.push(lapDurationString);
        lastLapStopwatchTime = centisecondsOnTimer;
        updateLapList();
    } else {
        // trigger a reset: set timer to 0, go back to disabled lap button, clear laps
        centisecondsOnTimer = 0;
        updateTimer();

        lapResetButton.disabled = true;
        lapResetButton.innerHTML = "Lap";

        lapTimes = [];
        lastLapStopwatchTime = 0;
        updateLapList();
    }
}

function toggleTimer() {
    let toggleButton = document.getElementById("toggleButton")
    let lapResetButton = document.getElementById("lapResetButton");
    if (isCounting) {
        // stop timer, change button back to start timer, change lap button to reset
        clearInterval(countingIntervalId);
        toggleButton.innerHTML = "Start";
        lapResetButton.innerHTML = "Reset";
    } else {
        // start timer, change button to stop timer, enable lap button
        countingIntervalId = setInterval(incrementTimer, 10);
        toggleButton.innerHTML = "Stop";

        lapResetButton.innerHTML = "Lap";
        lapResetButton.disabled = false;
    }
    isCounting = !isCounting;
}

document.getElementById("toggleButton").addEventListener("click", toggleTimer);
document.getElementById("lapResetButton").addEventListener("click", lapOrResetTimer);