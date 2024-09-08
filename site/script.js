document.getElementById("pointForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    let x = document.getElementById("x").value;
    let yCheckboxes = document.querySelectorAll("input[name='y']:checked");
    let r = document.getElementById("r").value;

    console.log("Submitted values - X:", x, "Y:", yCheckboxes, "R:", r); 
    if (!/^-?\d+(\.\d+)?$/.test(x) || x < -3 || x > 5) {
        alert("Please enter a valid X coordinate between -3 and 5.");
        console.warn("Invalid X value:", x); 
        return;
    }

    if (yCheckboxes.length === 0) {
        alert("Please select at least one Y value.");
        console.warn("No Y values selected."); 
        return;
    }

    let yValues = Array.from(yCheckboxes).map(cb => cb.value);
    let data = new URLSearchParams();
    data.append('x', x);
    data.append('y', yValues.join(','));  
    data.append('r', r);

    console.log("Data to be sent:", data.toString()); 

    fetch("https://helios.cs.ifmo.ru:24985/fcgi-bin/server.jar", {
        method: "POST",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => {
        console.log("Response status:", response.status);
        return response.text();
    })
    .then(html => {
        document.getElementById("result").innerHTML = html;
        drawGraph(); 
        drawPoints(x, yValues, r); 
    })
    .catch(error => console.error('Error:', error));
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

    // прямоугольник 
    context.fillRect(canvas.width / 2 - scale * r, canvas.height / 2 - scale * r, scale * r, scale * r);

    // четверть круга
    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2);
    context.arc(canvas.width / 2, canvas.height / 2, scale * r / 2, 1.5 * Math.PI, 2 * Math.PI, false);
    context.fill();

    //  треугольник 
    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2);
    context.lineTo(canvas.width / 2 + scale * r, canvas.height / 2);
    context.lineTo(canvas.width / 2, canvas.height / 2 + scale * r);
    context.fill();
}

drawGraph();
