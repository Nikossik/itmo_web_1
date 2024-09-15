document.querySelectorAll("input[name='y']").forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        document.querySelectorAll("input[name='y']").forEach(cb => {
            if (cb !== this) cb.checked = false;
        });
    });
});

document.getElementById('pointForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const x = document.getElementById('x').value;
    const yElements = document.querySelectorAll('input[name="y"]:checked'); 
    const r = document.getElementById('r').value;

    if (!/^-?\d+(\.\d+)?$/.test(x) || x < -3 || x > 5) {
        alert("Please enter a valid X coordinate between -3 and 5.");
        console.warn("Invalid X value:", x);
        return;
    }

    if (yElements.length === 0) {
        alert("Please select a Y value.");
        console.warn("No Y value selected.");
        return;
    }

    const y = Array.from(yElements).map(el => el.value);

    if (y.length !== 1) {
        alert('Please select exactly one Y coordinate.');
        return;
    }
    
    const data = `x=${encodeURIComponent(x)}&y=${encodeURIComponent(y[0])}&r=${encodeURIComponent(r)}`;

    fetch('/fcgi-bin/server.jar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
    .then(response => response.json())
    .then(result => {
        const resultBody = document.getElementById('resultBody');
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>${x}</td>
            <td>${y}</td>
            <td>${r}</td>
            <td>${result.result !== undefined ? (result.result ? 'true' : 'false') : 'undefined'}</td>
            <td>${result.currentTime !== undefined ? result.currentTime : 'undefined'}</td>
            <td>${result.executionTime !== undefined ? result.executionTime : 'undefined'}</td>
        `;

        resultBody.appendChild(newRow);

        drawPoints(x, y[0], r); // Отображение точки на графике

    })
    .catch(error => console.error('Error:', error));
});

document.getElementById("r").addEventListener("change", drawGraph);

function drawGraph() {
    const r = document.getElementById("r").value;
    const canvas = document.getElementById("graphCanvas");
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    context.fillStyle = "#f0f0f0";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Axis
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();


    const scale = 80; 

    context.fillStyle = "black";
    context.font = "12px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const halfScale = scale / 2;
    const offset = canvas.width / 2;

    // X
    context.fillText("-R", offset - scale, offset + 10);
    context.fillText("-R/2", offset - halfScale, offset + 10);
    context.fillText("R/2", offset + halfScale, offset + 10);
    context.fillText("R", offset + scale, offset + 10);
    context.fillText("x", canvas.width - 10, offset - 10);

    // Y
    context.fillText("-R", offset - 15, offset + scale);
    context.fillText("-R/2", offset - 15, offset + halfScale);
    context.fillText("R/2", offset - 15, offset - halfScale);
    context.fillText("R", offset - 15, offset - scale);
    context.fillText("y", offset + 10, 10);

    context.fillStyle = "blue";
    context.globalAlpha = 0.5;

    // Rectangle
    context.fillRect(offset - scale, offset - scale, scale, scale);

    // Circle
    context.beginPath();
    context.moveTo(offset, offset);
    context.arc(offset, offset, halfScale, 1.5 * Math.PI, 2 * Math.PI, false);
    context.fill();

    // Triangle
    context.beginPath();
    context.moveTo(offset, offset);
    context.lineTo(offset + scale, offset);
    context.lineTo(offset, offset + scale);
    context.fill();

    
    context.globalAlpha = 1.0;
}

function drawPoints(x, y, r) {
    const canvas = document.getElementById("graphCanvas");
    const context = canvas.getContext("2d");
    const scale = 80;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pointX = centerX + x * scale;
    const pointY = centerY - y * scale;

    context.fillStyle = "red";
    context.beginPath();
    context.arc(pointX, pointY, 3, 0, 2 * Math.PI);
    context.fill();
}

drawGraph();