document.getElementById("r").addEventListener("change", drawGraph);
function drawGraph() {
    const r = document.getElementById("r").value;
    const canvas = document.getElementById("graphCanvas");
    const context = canvas.getContext("2d");

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

    const scale = 80;

    context.fillRect(canvas.width / 2 - scale * r, canvas.height / 2 - scale * r, scale * r, scale * r);

    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2);
    context.arc(canvas.width / 2, canvas.height / 2, scale * r / 2, 1.5 * Math.PI, 2 * Math.PI, false);
    context.fill();

    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2);
    context.lineTo(canvas.width / 2 + scale * r, canvas.height / 2);
    context.lineTo(canvas.width / 2, canvas.height / 2 + scale * r);
    context.fill();
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
drawPoints();


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
    })
    .catch(error => console.error('Error:', error));
});