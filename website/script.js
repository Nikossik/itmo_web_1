document.getElementById("pointForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы (перезагрузку страницы)

    let x = document.getElementById("x").value;
    let yCheckboxes = document.querySelectorAll("input[name='y']:checked");
    let r = document.getElementById("r").value;

    // Проверка данных
    if (!/^-?\d+(\.\d+)?$/.test(x) || x < -3 || x > 5) {
        alert("Please enter a valid X coordinate between -3 and 5.");
        return;
    }

    if (yCheckboxes.length === 0) {
        alert("Please select at least one Y value.");
        return;
    }

    // Сборка параметров
    let yValues = Array.from(yCheckboxes).map(cb => cb.value);
    let data = new URLSearchParams();
    data.append('x', x);
    data.append('y', yValues.join(','));  // Отправляем Y в виде строки, разделенной запятыми
    data.append('r', r);

    // AJAX-запрос на сервер
    fetch("https://helios.cs.ifmo.ru:24985/fcgi-bin/server.jar", {
        method: "POST",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.text())
    .then(html => {
        // Обновляем содержимое страницы полученным ответом
        document.getElementById("result").innerHTML = html;
    })
    .catch(error => console.error('Error:', error));
});

function drawGraph() {
    let r = document.getElementById("r").value;
    let canvas = document.getElementById("graphCanvas");
    let context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height); // Очистка холста

    // Настройка координатной системы
    context.fillStyle = "#f0f0f0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "black";
    context.beginPath();

    // Рисуем оси
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();

    context.fillStyle = "blue";
    context.globalAlpha = 0.5;

    // Масштабный коэффициент
    let scale = 80; // Изменяем масштаб, чтобы график был больше

    // Рисуем прямоугольник (часть графика)
    context.fillRect(canvas.width / 2 - scale * r, canvas.height / 2 - scale * r, scale * r, scale * r);

    // Рисуем четверть круга (часть графика), изменяем дугу на правую сторону
    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2);
    context.arc(canvas.width / 2, canvas.height / 2, scale * r / 2, 1.5 * Math.PI, 2 * Math.PI, false);
    context.fill();

    // Рисуем треугольник (часть графика)
    context.beginPath();
    context.moveTo(canvas.width / 2, canvas.height / 2);
    context.lineTo(canvas.width / 2 + scale * r, canvas.height / 2);
    context.lineTo(canvas.width / 2, canvas.height / 2 + scale * r);
    context.fill();
}

// Вызов функции для начальной отрисовки
drawGraph();


