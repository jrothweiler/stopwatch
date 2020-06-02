var isCounting = false;
var countingIntervalId = -1;
var centisecondsOnTimer = 0;

// format a number for use in the timer, i.e. pad numbers less than 10 with leading zeroes
function formatNumberAsTime(value) {
    return value.toString().padStart(2, '0');
}

// given an amount of time as total centiseconds, formats it as a timer string
function updateTimer() {
    let centiseconds = centisecondsOnTimer % 100;
    let seconds = Math.floor(centisecondsOnTimer / 100) % 60;
    let minutes = Math.floor(centisecondsOnTimer / 6000);

    let timerString = `${formatNumberAsTime(minutes)}:${formatNumberAsTime(seconds)}.${formatNumberAsTime(centiseconds)}`

    document.getElementById("timer").innerHTML = timerString;
}

function incrementTimer() {
    centisecondsOnTimer += 1;
    updateTimer();
    
}

function lapOrResetTimer() {
    let lapResetButton = document.getElementById("lapResetButton");
    if (isCounting) {
        // trigger a lap
    } else {
        // trigger a reset
        centisecondsOnTimer = 0;
        updateTimer();
        lapResetButton.disabled = true;
        lapResetButton.innerHTML = "Lap";
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
        lapResetButton.disabled = false;
    }
    isCounting = !isCounting;
}

document.getElementById("toggleButton").addEventListener("click", toggleTimer);
document.getElementById("lapResetButton").addEventListener("click", lapOrResetTimer);