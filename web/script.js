function sendData() {
    var x = document.getElementById("x").value;
    var yElement = document.querySelector('input[name="y"]:checked');
    var r = document.getElementById("r").value;

    if (!/^-?\d+(\.\d+)?$/.test(x) || x < -3 || x > 5) {
        alert("Please enter a valid X coordinate between -3 and 5.");
        console.warn("Invalid X value:", x);
        return;
    }

    if (!yElement) {
        alert("Please select a Y value.");
        console.warn("No Y value selected.");
        return;
    }

    var y = yElement.value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://helios.cs.ifmo.ru:24985/fcgi-bin/server.jar", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var jsonResponse = JSON.parse(xhr.responseText);


            var resultBody = document.getElementById("resultBody");
            var newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${jsonResponse.x}</td>
                <td>${jsonResponse.y}</td>
                <td>${jsonResponse.r}</td>
                <td>${jsonResponse.result}</td>
                <td>${jsonResponse.currentTime}</td>
                <td>${jsonResponse.executionTime}</td>
            `;
            resultBody.appendChild(newRow);

            drawGraph();
            drawPoints(x, [y], r);
        } else if (xhr.readyState == 4) {
            console.error("Error:", xhr.statusText);
        }
    };


    xhr.send("x=" + encodeURIComponent(x) + "&y=" + encodeURIComponent(y) + "&r=" + encodeURIComponent(r));
}


document.getElementById("pointForm").addEventListener("submit", function(event) {
    event.preventDefault();
    sendData();
});


document.querySelectorAll("input[name='y']").forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        document.querySelectorAll("input[name='y']").forEach(cb => {
            if (cb !== this) cb.checked = false;
        });
    });
});

document.getElementById("r").addEventListener("change", drawGraph); 

function drawGraph() {
    let r = document.getElementById("r").value;
    let canvas = document.getElementById("graphCanvas");
    let context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height); 

    context.fillStyle = "#f0f0f0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "black";
    context.beginPath();

    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();

    context.fillStyle = "blue";
    context.globalAlpha = 0.5;

    let scale = 80; 

    // rectangle
    context.fillRect(canvas.width / 2 - scale * r, canvas.height / 2 - scale * r, scale * r, scale * r);

    // quarter circle
    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2);
    context.arc(canvas.width / 2, canvas.height / 2, scale * r / 2, 1.5 * Math.PI, 2 * Math.PI, false);
    context.fill();

    //triangle
    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2);
    context.lineTo(canvas.width / 2 + scale * r, canvas.height / 2);
    context.lineTo(canvas.width / 2, canvas.height / 2 + scale * r);
    context.fill();
}

drawGraph();
