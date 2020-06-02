var isCounting = false;
var countingIntervalId = -1;
var centisecondsOnTimer = 0;

// format a number for use in the timer, i.e. pad numbers less than 10 with leading zeroes
function formatNumberAsTime(value) {
    return value.toString().padStart(2, '0');
}

// given an amount of time as total centiseconds, formats it as a timer string
function formatMillisecondsTime(time) {
    let centiseconds = time % 100;
    let seconds = Math.floor(time / 100) % 60;
    let minutes = Math.floor(time / 6000);

    return `${formatNumberAsTime(minutes)}:${formatNumberAsTime(seconds)}.${formatNumberAsTime(centiseconds)}`
}

function incrementTimer() {
    centisecondsOnTimer += 1;
    document.getElementById("timer").innerHTML = formatMillisecondsTime(centisecondsOnTimer);
}

function toggleTimer() {
    let toggleButton = document.getElementById("toggleButton")
    if (isCounting) {
        // stop timer, change button back to start timer, change lap button to reset
        clearInterval(countingIntervalId);
        toggleButton.innerHTML = "Start";
    } else {
        // start timer, change button to stop timer, enable lap button
        countingIntervalId = setInterval(incrementTimer, 10);
        toggleButton.innerHTML = "Stop";
    }
    isCounting = !isCounting;
}

document.getElementById("toggleButton").addEventListener("click", toggleTimer);