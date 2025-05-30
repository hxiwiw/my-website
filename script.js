const container = document.getElementById('container');

let Pmachines = 0; // количество станков
let Pdiameters = 0; // количество диаметров

let savedChumps = [];
let savedMachines = [];

function showNotification(message, type = 'error') {
    let notif = document.getElementById('notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notification';
        notif.style.position = 'fixed';
        notif.style.top = '20px';
        notif.style.right = '20px';
        notif.style.zIndex = '1000';
        notif.style.minWidth = '200px';
        notif.style.padding = '15px';
        notif.style.borderRadius = '5px';
        notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        notif.style.fontSize = '16px';
        document.body.appendChild(notif);
    }
    notif.textContent = message;
    notif.style.background = type === 'error' ? '#ffdddd' : '#ddffdd';
    notif.style.color = type === 'error' ? '#a00' : '#070';

    notif.style.display = 'block';
    setTimeout(() => {
        notif.style.display = 'none';
    }, 5000);
}

let content = document.getElementById('content');
if (!content) {
    content = addFirstContent(container);
}

function addFirstContent(container) {
    const newContent = document.createElement('div');
    newContent.id = 'contentFirst';

    newContent.innerHTML = `
        <div class="input_first">
            <div class="input_group">
                <label for="machines">Станков:</label>
                <input type="number" id="machines" min="1" placeholder="1.." required>
            </div>
            <div class="input_group">
                <label for="diameters">Диаметров:</label>
                <input type="number" id="diameters" min="1" placeholder="1.." required>
            </div>
            <button id="FirstContentNext">Сохранить данные</button>
        </div>
    `;

    container.appendChild(newContent);

    // Навешиваем обработчики сразу после добавления элементов
    document.getElementById('machines').addEventListener("change", function() {
        Pmachines = parseInt(this.value, 10);
        clearResults();
        if (isNaN(Pmachines)) {
            Pmachines = 0;
            this.value = '';
            showNotification("Введите корректное количество станков", 'error');
        } else if (Pmachines < 1) {
            Pmachines = 0;
            this.value = '';
            showNotification("Количество станков должно быть больше 0", 'error');
        } else if (Pmachines > 1) {
            showNotification("Данные о станках сохранены", 'success');
            const contentFourth = document.getElementById('contentFourth');
            if (contentFourth && contentFourth.querySelector("table")) {
                adjustMachineTable(Pmachines, contentFourth); // ✅ подгоняем таблицу
            }
        }
    });
    document.getElementById('diameters').addEventListener("change", function() {
        Pdiameters = parseInt(this.value, 10);
        clearResults();
        if (isNaN(Pdiameters)) {
            Pdiameters = 0;
            this.value = '';
            showNotification("Введите корректное количество диаметров", 'error');
        } else if (Pdiameters < 1) {
            Pdiameters = 0;
            this.value = '';
            showNotification("Количество диаметров должно быть больше 0", 'error');
        } else {
            showNotification("Данные о диаметрах сохранены", 'success');
            const contentThird = document.getElementById('contentThird');
            if (contentThird && contentThird.querySelector("table")) {
                adjustChumpsTable(Pdiameters, contentThird); // ✅ подгоняем таблицу
            }
            const contentFourth = document.getElementById('contentFourth');
            if (contentFourth && contentFourth.querySelector("table")) {
                adjustMachineTable(Pmachines, contentFourth); // ✅ подгоняем таблицу
            }
        }
    });
    document.getElementById('FirstContentNext').addEventListener("click", function() {
        Pmachines = parseInt(document.getElementById('machines').value, 10);
        Pdiameters = parseInt(document.getElementById('diameters').value, 10);
        clearResults();

        let contentSecond = document.getElementById('contentSecond');
        if ((Pmachines > 0 && Pdiameters > 0) && !contentSecond) {
            FirstContentNext = document.getElementById('FirstContentNext');
            FirstContentNext.remove();

            addSecondContent(container);
            showNotification("Выберите способ ввода данных", 'success');
        } else if ((Pmachines > 0 && Pdiameters > 0) && contentSecond) {
            showNotification("Новые данные сохранены", 'success');
        } else {
            showNotification("Введите корректные данные о станках и диаметрах", 'error');
        }
    });

    return newContent;
}
function addSecondContent(container) {
    const newContent = document.createElement('div');
    newContent.id = 'contentSecond';

    newContent.innerHTML = `
        <p>Выберите способ ввода данных о чураках:</p>
        <div class="input_second">
            <button id="manual_input">Ручной ввод</button>
            <button id="generate_input">Генерация</button>
            <input type="file" id="import_file" style="display:none" accept=".txt">
            <button id="import_data">Загрузка</button>
        </div>
    `;

    container.appendChild(newContent);

    document.getElementById('import_data').addEventListener('click', function() {
        document.getElementById('import_file').click();
    });

    document.getElementById('import_file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            const text = evt.target.result;
            const lines = text.split('\n');

            // 1. Считываем количество станков и диаметров
            Pmachines = parseInt(lines[0].split(':')[1]);
            Pdiameters = parseInt(lines[1].split(':')[1]);

            const machinesInput = document.getElementById('machines');
            if (machinesInput) machinesInput.value = Pmachines;

            const diametersInput = document.getElementById('diameters');
            if (diametersInput) diametersInput.value = Pdiameters;

            // 2. Считываем чураки
            let chumps = [];
            let i = 3; // строки с 3-й (индекс 2) — "Таблица чураков:"
            while (lines[i] && lines[i].startsWith('Тип')) {
                // Пример строки: Тип 1: Диаметр=32, Кол-во=10, Время=2
                const match = lines[i].match(/Диаметр=(\d+), Кол-во=(\d+), Время=(\d+)/);
                if (match) {
                    chumps.push({
                        diameter: parseInt(match[1]),
                        count: parseInt(match[2]),
                        time: parseInt(match[3])
                    });
                }
                i++;
            }
            savedChumps = chumps;

            // 3. Считываем станки
            let machines = [];
            i++; // пропускаем строку "Таблица распределения по станкам:"
            while (lines[i] && lines[i].includes(':')) {
                // Пример строки: Станок 1: 100, 0, 0
                const parts = lines[i].split(':');
                const machineName = parts[0].trim();
                const values = parts[1].split(',').map(v => parseFloat(v.trim()));
                machines.push({ machine: machineName, values });
                i++;
            }
            savedMachines = machines;

            // 4. Перерисовываем таблицы и заполняем input'ы
            // --- Чураки ---
            let contentTable = document.getElementById('chumps_table_container');
            if (!contentTable) {
                addThirdContent(container);
                contentTable = document.getElementById('chumps_table_container');
            }
            chumpsTable(Pdiameters, contentTable);

            // Заполняем input'ы чураков
            const chumpInputs = contentTable.querySelectorAll("tr");
            for (let j = 1; j <= Pdiameters; j++) {
                const cells = chumpInputs[j].querySelectorAll("td");
                if (chumps[j-1]) {
                    cells[1].querySelector("input").value = chumps[j-1].diameter;
                    cells[2].querySelector("input").value = chumps[j-1].count;
                    cells[3].querySelector("input").value = chumps[j-1].time;
                }
            }

            // --- Станки ---
            let contentTableMachines = document.getElementById('machine_table_container');
            if (!contentTableMachines) {
                addFourthContent(container);
                contentTableMachines = document.getElementById('machine_table_container');
            }
            machineAllocation(Pmachines, contentTableMachines);

            // Заполняем input'ы станков
            const machineRows = contentTableMachines.querySelectorAll("tr");
            for (let m = 1; m <= Pmachines; m++) {
                const cells = machineRows[m].querySelectorAll("td");
                if (machines[m-1]) {
                    for (let d = 1; d <= Pdiameters; d++) {
                        cells[d].querySelector("input").value = machines[m-1].values[d-1] || 0;
                    }
                }
            }

            showNotification("Данные успешно загружены", "success");
            clearResults();
        };
        reader.readAsText(file);
    });

    document.getElementById('manual_input').addEventListener("click", function() { // обработка нажатия кнопки "Ручной ввод"
        showNotification("Введите данные в таблицу", 'success');
        clearResults();
        let contentTable = document.getElementById('chumps_table_container');
        if (!contentTable) {
            addThirdContent(container);
            contentTable = document.getElementById('chumps_table_container');
        }
        chumpsTable(Pdiameters, contentTable);
    });

    document.getElementById('generate_input').addEventListener("click", function() {
        showNotification("Генерация данных...", 'success');
        clearResults();        
        let contentTable = document.getElementById('chumps_table_container');
        if (!contentTable) {
            addThirdContent(container); // создаём обёртку под таблицу
            contentTable = document.getElementById('chumps_table_container');
        }

        // если таблица уже существует — не создаём новую, а дополняем
        if (!contentTable.querySelector("table")) {
            chumpsTable(Pdiameters, contentTable); // создаём таблицу
        }

        // заполняем только пустые поля
        fillGeneratedValues(contentTable, Pdiameters);
        
        
    });

    
    return newContent;
}

function addThirdContent(container) {
    const newContent = document.createElement('div');
    newContent.id = 'contentThird';
    newContent.innerHTML = `
    <p>Введите данные о чураках, которые будут обрабатываться на станках:</p>
        <div class="input_third">
            <div class="input_group" id="chumps_table_container">
            
            </div>
            <button id="clear_table">Очистить таблицу</button>
            <button id="save_table">Сохранить таблицу</button>
        </div>`;


    container.appendChild(newContent);

    document.getElementById('clear_table').addEventListener("click", function() {
        clearChumpsTable(document.getElementById('chumps_table_container'));
    });
    document.getElementById('save_table').addEventListener("click", function() {
        const contentTable = document.getElementById('chumps_table_container');
        if (contentTable.querySelector("table")) {
            const inputs = contentTable.querySelectorAll("input");
            let allValid = true;

            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    showNotification("Пожалуйста, заполните все поля", 'error');
                    allValid = false;
                }
            });

            if (allValid) {
                savedChumps = saveChumpsTable(contentTable); // сохраняем таблицу
                showNotification("Таблица успешно сохранена", 'success');
                let contentTableMachines = document.getElementById('machine_table_container');
                if (!contentTableMachines) {
                    addFourthContent(container); // создаём обёртку под таблицу
                    contentTableMachines = document.getElementById('machine_table_container');
                }
                machineAllocation(Pmachines, contentTableMachines); // создаём таблицу распределения
            }
        } else {
            showNotification("Таблица не создана. Пожалуйста, создайте таблицу.", 'error');
        }
    });

    return newContent;
}

function addFourthContent(container) {
    const newContent = document.createElement('div');
    newContent.id = 'contentFourth';
    newContent.innerHTML = `
    <p>Введите данные о распределении чураков по станкам:</p>
    <div class="input_fourth">
        <div class="input_group" id="machine_table_container">

        </div>
        <button id="clear_table_fourth">Очистить таблицу</button>
        <button id="save_table_fourth">Вычислить данные</button>
    </div>
    `;

    container.appendChild(newContent);

    document.getElementById('clear_table_fourth').addEventListener("click", function() {
        clearChumpsTable(document.getElementById('machine_table_container'));
        clearResults();
    });
    document.getElementById('save_table_fourth').addEventListener("click", function() {
        const contentTable = document.getElementById('machine_table_container');
        if (contentTable.querySelector("table")) {
            const inputs = contentTable.querySelectorAll("input");
            let allValid = true;

            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    showNotification("Пожалуйста, заполните все поля", 'error');
                    allValid = false;
                } else if (isNaN(input.value) || input.value < 0 || input.value > 100) {
                    showNotification("Введите корректное значение от 0 до 100", 'error');
                    allValid = false;
                }
            });

            if (allValid) {
                showNotification("Таблица успешно сохранена", 'success');
                savedMachines = saveMachineTable(contentTable);
                savedChumps = saveChumpsTable(document.getElementById('chumps_table_container'));

                let fifthContent = document.getElementById('contentFifth');
                if (!fifthContent) {
                    addFifthContent(container); // создаём пятый контент
                    fifthContent = document.getElementById('contentFifth');
                }
                calculate(); // запускаем расчёт
                
            }
        } else {
            showNotification("Таблица не создана. Пожалуйста, создайте таблицу.", 'error');
        }
    });
    
    return newContent;
}

function calculate() {
    const chumps = savedChumps;
    const machines = savedMachines;

    const stats = analyzeMachineProductivity(chumps, machines);
    const maxProd = findMaxProductivity(stats, chumps, machines);
    const sortedChumps = sortMachinesByTime(chumps);

    const resultDiv = document.getElementById("analysis_results");

    // Формируем подробную таблицу
    let tableHTML = `
        <table>
            <tr>
                <th>Станок</th>
                ${chumps.map((c, i) => `<th>D${i + 1}<br>(${c.diameter} мм)</th>`).join('')}
                <th>Σ П₁ (шт/ч)</th>
                <th>Σ П₂ (м³/ч)</th>
            </tr>
    `;

    machines.forEach((machine, mi) => {
        tableHTML += `<tr><td>${machine.machine}</td>`;
        let sumP1 = 0;
        let sumP2 = 0;
        machine.values.forEach((percent, ci) => {
            const chump = chumps[ci];
            const { diameter, time } = chump;
            let cell = '';
            if (time > 0 && percent > 0) {
                const volume = calculateLogVolume(diameter);
                const P1 = (60 * Ku * percent / 100) / time;
                const P2 = P1 * volume;
                sumP1 += P1;
                sumP2 += P2;
                cell = `
                    <div>Проц: ${percent}%</div>
                    <div>П₁: ${P1.toFixed(2)}</div>
                    <div>П₂: ${P2.toFixed(2)}</div>
                `;
            }
            tableHTML += `<td>${cell}</td>`;
        });
        tableHTML += `<td><b>${sumP1.toFixed(2)}</b></td><td><b>${sumP2.toFixed(2)}</b></td></tr>`;
    });

    tableHTML += `</table>`;

    // Итоговый вывод
    resultDiv.innerHTML = `
        <h3>Результаты расчёта:</h3>
        <p><strong>Максимальная производительность (П₂):</strong> ${maxProd.maxP2} м³/ч</p>
        <p><strong>Станок:</strong> ${maxProd.machine}</p>
        <p><strong>Диаметр при макс. производительности:</strong> ${maxProd.diameter} мм</p>
        <h4>Подробная таблица по станкам и диаметрам:</h4>
        ${tableHTML}
        <h4>Сортировка диаметров по времени обработки:</h4>
        <ul>
            ${sortedChumps.map(d => `<li>${d.diameter} мм — ${d.time} мин</li>`).join("")}
        </ul>
        <button id="export_data">Экспорт данных</button>
    `;
    document.getElementById('export_data').addEventListener('click', function() {
        let text = `Станков: ${Pmachines}\nДиаметров: ${Pdiameters}\n`;

        text += 'Таблица чураков:\n';
        savedChumps.forEach((c, i) => {
            text += `Тип ${i+1}: Диаметр=${c.diameter}, Кол-во=${c.count}, Время=${c.time}\n`;
        });

        text += 'Таблица распределения по станкам:\n';
        savedMachines.forEach((m, i) => {
            text += `${m.machine}: ${m.values.join(', ')}\n`;
        });

        const blob = new Blob([text], {type: "text/plain"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "export.txt";
        link.click();
    });
}

function addFifthContent(container) {
    const newContent = document.createElement('div');
    newContent.id = 'contentFifth';
    newContent.innerHTML = `
    <p>Результаты анализа производительности станков:</p>
    <div class="input_fifth">
        <div id="analysis_results"></div>
    </div>
    `;
    container.appendChild(newContent);

    return newContent;
}

function chumpsTable(Pdiameters, container) {
    const table = document.createElement("table");
    container.innerHTML = "";

    for (let i = 0; i < Pdiameters + 1; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < 4; j++) {
            if (i === 0) {
                // Заголовки
                const cell = document.createElement("td");
                if (j === 0) cell.textContent = `Чураки`;
                if (j === 1) cell.textContent = `Диаметр`;
                if (j === 2) cell.textContent = `Кол-во`;
                if (j === 3) cell.textContent = `Время`;
                row.appendChild(cell);
            } else {
                const cell = document.createElement("td");
                if (j === 0) {
                    cell.textContent = `Тип ${i}`;
                } else {
                    const input = document.createElement("input");
                    input.type = "number";
                    input.min = "0";
                    input.addEventListener("keydown", function (e) {
                        // Разрешаем только цифры, Backspace, Delete, стрелки, Tab
                        if (
                            e.key === "e" || e.key === "E" ||
                            e.key === "+" || e.key === "-" ||
                            e.key === "." ||
                            (e.key.length === 1 && !e.key.match(/[0-9]/)) // любые нецифровые символы
                        ) {
                            e.preventDefault();
                        }
                    });
                    input.addEventListener("change", function () {
                            clearResults(); 
                            const value = parseInt(this.value, 10);
                            if (isNaN(value) || value < 0) {
                                showNotification("Введите корректное значение", 'error');
                                this.value = '';
                                return;
                            }
                            showNotification(`Значение установлено: ${value}`, 'success');
                        });
                    if (j === 1) input.placeholder = "Диаметр";
                    if (j === 2) input.placeholder = "Кол-во";
                    if (j === 3) {
                        input.placeholder = "1-3";
                        input.min = "1";
                        input.max = "3";
                        input.addEventListener("change", function () {
                            clearResults();
                            const timeValue = parseInt(this.value, 10);
                            if (isNaN(timeValue)) {
                                showNotification("Введите корректное время (от 1 до 3)", 'error');
                                this.value = '';
                            } else if (timeValue > 3) {
                                showNotification("Время не может быть больше 3", 'error');
                                this.value = '3';
                            } else if (timeValue < 1) {
                                showNotification("Время не может быть меньше 1", 'error');
                                this.value = '1';
                            } else {
                                showNotification(`Время установлено: ${timeValue}`, 'success');
                            }
                        });
                    }
                cell.appendChild(input);
                }
            row.appendChild(cell);
            }
        }
        table.appendChild(row);
    }

    container.appendChild(table);
}

function fillGeneratedValues(container, diameters) {
    const table = container.querySelector("table");
    if (!table) return;

    const rows = table.querySelectorAll("tr");

    for (let i = 1; i <= diameters; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");

        // Диаметр (j = 1), Кол-во (j = 2), Время (j = 3)
        const diameterInput = cells[1].querySelector("input");
        const countInput = cells[2].querySelector("input");
        const timeInput = cells[3].querySelector("input");

        if (diameterInput && diameterInput.value.trim() === '') {
            diameterInput.value = getRandomInt(32, 128);
        }
        if (countInput && countInput.value.trim() === '') {
            countInput.value = getRandomInt(10, 100); // пример
        }
        if (timeInput && timeInput.value.trim() === '') {
            timeInput.value = getRandomInt(1, 3);
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clearChumpsTable(container) {
    const table = container.querySelector("table");

    const inputs = table.querySelectorAll("input");
    inputs.forEach(input => {
        input.value = '';
    });

    showNotification("Все значения в таблице сброшены", 'success');
}

function adjustChumpsTable(newCount, container) {
    const table = container.querySelector("table");
    if (!table) {
        chumpsTable(newCount, container); // если таблицы нет — создать новую
        return;
    }

    const currentRows = table.rows.length - 1; // без заголовка

    if (newCount > currentRows) {
        // Добавить недостающие строки
        for (let i = currentRows + 1; i <= newCount; i++) {
            const row = document.createElement("tr");
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement("td");
                if (j === 0) {
                    cell.textContent = `Тип ${i}`;
                } else {
                    const input = document.createElement("input");
                    input.type = "number";
                    input.min = "0";
                    input.addEventListener("keydown", function (e) {
                        if (
                            e.key === "e" || e.key === "E" ||
                            e.key === "+" || e.key === "-" ||
                            e.key === "." ||
                            (e.key.length === 1 && !e.key.match(/[0-9]/))
                        ) {
                            e.preventDefault();
                        }
                    });
                    input.addEventListener("change", function () {
                        clearResults();
                        const value = parseInt(this.value, 10);
                        if (!isNaN(value)) {
                            showNotification(`Значение установлено: ${value}`, 'success');
                        }
                    });
                    if (j === 1) input.placeholder = "Диаметр";
                    if (j === 2) input.placeholder = "Кол-во";
                    if (j === 3) {
                        input.placeholder = "1-3";
                        input.min = "1";
                        input.max = "3";
                        input.addEventListener("change", function () {
                            clearResults();
                            const timeValue = parseInt(this.value, 10);
                            if (isNaN(timeValue)) {
                                showNotification("Введите корректное время (от 1 до 3)", 'error');
                                this.value = '';
                            } else if (timeValue > 3) {
                                showNotification("Время не может быть больше 3", 'error');
                                this.value = '3';
                            } else if (timeValue < 1) {
                                showNotification("Время не может быть меньше 1", 'error');
                                this.value = '1';
                            } else {
                                showNotification(`Время установлено: ${timeValue}`, 'success');
                            }
                        });
                    }
                    cell.appendChild(input);
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        }

        showNotification("Таблица дополнена", 'success');
    } else if (newCount < currentRows) {
        // Удалить лишние строки с конца
        for (let i = currentRows; i > newCount; i--) {
            table.deleteRow(i);
        }
        showNotification("Таблица сокращена", 'success');
    } else {
        showNotification("Размер таблицы не изменился", 'info');
    }
}

function machineAllocation(Pmachines, container) {
    const table = document.createElement("table");
    container.innerHTML = "";

    const headerRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.textContent = "Станок / Диаметр";
    headerRow.appendChild(emptyCell);

    for (let d = 1; d <= Pdiameters; d++) {
        const cell = document.createElement("td");
        cell.textContent = `D${d}`;
        headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);

    // Строки станков
    for (let m = 1; m <= Pmachines; m++) {
        const row = document.createElement("tr");
        const labelCell = document.createElement("td");
        labelCell.textContent = `Станок ${m}`;
        row.appendChild(labelCell);

        for (let d = 1; d <= Pdiameters; d++) {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.max = "100";
            input.placeholder = `%`;
            input.required = true;
            cell.appendChild(input);
            row.appendChild(cell);

            input.addEventListener("change", function () {
            clearResults();
            const row = this.closest("tr");
            const inputs = row.querySelectorAll("input");
            let sum = 0;

            // Считаем сумму без текущего input
            inputs.forEach(inp => {
                if (inp !== this) {
                    const val = parseFloat(inp.value);
                    if (!isNaN(val)) sum += val;
                }
            });

            let currentValue = parseFloat(this.value);
            let total = sum + currentValue;

            if (total > 100) {
                const allowed = 100 - sum;
                this.value = allowed >= 0 ? allowed : 0;
                showNotification(
                    `Сумма по строке не должна превышать 100%. Установлено максимально допустимое значение: ${this.value}%. Текущая сумма: 100%.`,
                    'error'
                );
            } else if (total < 100) {
                showNotification(
                    `Значение установлено: ${this.value}%. Сумма по строке: ${total}%. Недостаёт до 100%: ${100 - total}%.`,
                    'info'
                );
            } else {
                showNotification(
                    `Значение установлено: ${this.value}%. Сумма по строке: 100%.`,
                    'success'
                );
            }
        });
        }
        table.appendChild(row);
    }

    container.appendChild(table);
}

function clearMachineTable(container) {
    const table = container.querySelector("table");
    if (table) {
        const inputs = table.querySelectorAll("input");
        inputs.forEach(input => {
            input.value = '';
        });
        showNotification("Все значения в таблице станков сброшены", 'success');
    }
}

function adjustMachineTable(newCount, container) {
    const table = container.querySelector("table");
    if (!table) {
        machineAllocation(newCount, container); // если таблицы нет — создать новую
        return;
    }

    const currentRows = table.rows.length - 1; // без заголовка
    const currentCols = table.rows[0].cells.length - 1; // без первой ячейки-заголовка

    // 1. Корректируем количество строк (станков)
    if (newCount > currentRows) {
        // Добавить недостающие строки
        for (let i = currentRows + 1; i <= newCount; i++) {
            const row = document.createElement("tr");
            const labelCell = document.createElement("td");
            labelCell.textContent = `Станок ${i}`;
            row.appendChild(labelCell);

            for (let j = 1; j <= Pdiameters; j++) {
                const cell = document.createElement("td");
                const input = document.createElement("input");
                input.type = "number";
                input.min = "0";
                input.max = "100";
                input.placeholder = `%`;
                input.required = true;
                cell.appendChild(input);
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        showNotification("Таблица станков дополнена", 'success');
    } else if (newCount < currentRows) {
        // Удалить лишние строки с конца
        for (let i = currentRows; i > newCount; i--) {
            table.deleteRow(i);
        }
        showNotification("Таблица станков сокращена", 'success');
    }

    // 2. Корректируем количество столбцов (типов чураков)
    const newCols = Pdiameters;
    // Корректируем заголовок
    const headerRow = table.rows[0];
    const headerCurrentCols = headerRow.cells.length - 1;
    if (newCols > headerCurrentCols) {
        // Добавить недостающие заголовки
        for (let j = headerCurrentCols + 1; j <= newCols; j++) {
            const cell = document.createElement("td");
            cell.textContent = `D${j}`;
            headerRow.appendChild(cell);
        }
    } else if (newCols < headerCurrentCols) {
        // Удалить лишние заголовки
        for (let j = headerCurrentCols; j > newCols; j--) {
            headerRow.deleteCell(j);
        }
    }

    // Корректируем каждую строку (кроме заголовка)
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const rowCurrentCols = row.cells.length - 1;
        if (newCols > rowCurrentCols) {
            // Добавить недостающие ячейки
            for (let j = rowCurrentCols + 1; j <= newCols; j++) {
                const cell = document.createElement("td");
                const input = document.createElement("input");
                input.type = "number";
                input.min = "0";
                input.max = "100";
                input.placeholder = `%`;
                input.required = true;
                cell.appendChild(input);
                row.appendChild(cell);
            }
        } else if (newCols < rowCurrentCols) {
            // Удалить лишние ячейки
            for (let j = rowCurrentCols; j > newCols; j--) {
                row.deleteCell(j);
            }
        }
    }

    showNotification("Таблица станков обновлена", 'success');
}

function saveChumpsTable(container) {
    const table = container.querySelector("table");
    if (!table) {
        showNotification("Таблица чураков не найдена", "error");
        return;
    }

    const data = [];

    const rows = table.rows;
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const type = row.cells[0].textContent.trim();
        const inputs = Array.from(row.querySelectorAll("input"));
        const [diameter, count, time] = inputs.map(input => parseFloat(input.value) || 0);
        data.push({ type, diameter, count, time });
    }
    showNotification("Данные чураков сохранены", "success");

    return data;
}

function saveMachineTable(container) {
    const table = container.querySelector("table");
    if (!table) {
        showNotification("Таблица станков не найдена", "error");
        return;
    }

    const data = [];

    const rows = table.rows;
    for (let i = 1; i < rows.length; i++) { // пропускаем заголовок
        const row = rows[i];
        const machineName = row.cells[0].textContent.trim();
        const values = [];

        for (let j = 1; j < row.cells.length; j++) {
            const input = row.cells[j].querySelector("input");
            const value = input ? parseFloat(input.value) || 0 : 0;
            values.push(value);
        }

        data.push({ machine: machineName, values });
    }

    showNotification("Данные сохранены", "success");

    return data;
}

// Глобальные коэффициенты
const Ku = 0.95; // коэффициент использования
const chumpLength = 2; // длина чурака (м)

function calculateLogVolume(diameter) {
    const radius = diameter / 2 / 100; // перевод в метры
    return Math.PI * radius * radius * chumpLength;
}

function analyzeMachineProductivity(chumpsData, machinesData) {
    const machineStats = [];

    machinesData.forEach(({ machine, values }, machineIndex) => {
        let totalP1 = 0;
        let totalP2 = 0;

        values.forEach((percent, i) => {
            const chump = chumpsData[i];
            const { diameter, time } = chump;
            if (time <= 0 || percent <= 0) return;

            const volume = calculateLogVolume(diameter);
            const P1 = (60 * Ku * percent / 100) / time;
            const P2 = P1 * volume;

            totalP1 += P1;
            totalP2 += P2;
        });

        machineStats.push({
            machine,
            totalP1,
            totalP2,
        });
    });

    return machineStats;
}

function findMaxProductivity(machineStats, chumpsData, machinesData) {
    let maxMachine = null;
    let maxIndex = -1;
    let maxValue = -Infinity;

    machineStats.forEach((stat, i) => {
        if (stat.totalP2 > maxValue) {
            maxValue = stat.totalP2;
            maxMachine = stat;
            maxIndex = i;
        }
    });

    // Найдём, по какому диаметру достигнута макс. производительность
    let maxP2 = 0;
    let diameter = 0;
    const values = machinesData[maxIndex].values;
    values.forEach((percent, i) => {
        const chump = chumpsData[i];
        const { diameter: d, time } = chump;
        if (time <= 0 || percent <= 0) return;

        const volume = calculateLogVolume(d);
        const P1 = (60 * Ku * percent / 100) / time;
        const P2 = P1 * volume;

        if (P2 > maxP2) {
            maxP2 = P2;
            diameter = d;
        }
    });

    return {
        machine: maxMachine.machine,
        maxP1: maxMachine.totalP1.toFixed(2),
        maxP2: maxMachine.totalP2.toFixed(2),
        diameter,
    };
}

function sortMachinesByTime(chumpsData) {
    return chumpsData
        .map((chump, i) => ({ index: i, diameter: chump.diameter, time: chump.time }))
        .sort((a, b) => a.time - b.time);
}

function clearResults() {
    const resultDiv = document.getElementById("analysis_results");
    if (resultDiv) resultDiv.innerHTML = "";
}

// выгрузка данных, выбор того, что выгружать
// ввод, генерация, загрузка данных
// расчёт в реальном времени
// вывод данных в реальном времени