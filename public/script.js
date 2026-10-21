// ==========================================
// GET HTML ELEMENTS
// ==========================================

const targetInput = document.getElementById("target");

const portInput = document.getElementById("port");

const checkPortBtn =
    document.getElementById("checkPortBtn");

const scanCommonBtn =
    document.getElementById("scanCommonBtn");

const clearBtn =
    document.getElementById("clearBtn");

const resultsBody =
    document.getElementById("resultsBody");

const totalPorts =
    document.getElementById("totalPorts");

const openPorts =
    document.getElementById("openPorts");

const closedPorts =
    document.getElementById("closedPorts");

const targetDisplay =
    document.getElementById("targetDisplay");

const resultMessage =
    document.getElementById("resultMessage");

const scanStatus =
    document.getElementById("scanStatus");

const progressContainer =
    document.getElementById("progressContainer");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const progressPercent =
    document.getElementById("progressPercent");


// ==========================================
// CHECK SPECIFIC PORT
// ==========================================

checkPortBtn.addEventListener("click", async () => {

    const target = targetInput.value.trim();

    const port = portInput.value.trim();


    // Validate target
    if (!target) {

        showMessage(
            "Please enter an IP address or hostname."
        );

        targetInput.focus();

        return;
    }


    // Validate port
    if (!port) {

        showMessage(
            "Please enter a port number."
        );

        portInput.focus();

        return;
    }


    if (port < 1 || port > 65535) {

        showMessage(
            "Port must be between 1 and 65535."
        );

        portInput.focus();

        return;
    }


    // Start loading
    setLoading(true);

    setScanStatus("SCANNING", "scanning");

    resultMessage.textContent =
        `Checking port ${port} on ${target}...`;


    try {

        const response = await fetch(
            "/check-port",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    target: target,
                    port: port
                })
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            showMessage(
                data.message ||
                "Unable to check port."
            );

            return;
        }


        // Display result
        displaySingleResult(
            data.target,
            data.result
        );


        // Update statistics
        totalPorts.textContent = "1";

        targetDisplay.textContent =
            data.target;


        if (data.result.status === "OPEN") {

            openPorts.textContent = "1";

            closedPorts.textContent = "0";

        } else {

            openPorts.textContent = "0";

            closedPorts.textContent = "1";
        }


        resultMessage.textContent =
            `Port ${data.result.port} checked successfully.`;


        setScanStatus("COMPLETE", "complete");

    }

    catch (error) {

        showMessage(
            "Unable to connect to the server."
        );

        console.error(error);

    }

    finally {

        setLoading(false);
    }

});


// ==========================================
// SCAN COMMON PORTS
// ==========================================

scanCommonBtn.addEventListener(
    "click",
    async () => {

        const target =
            targetInput.value.trim();


        // Validate target
        if (!target) {

            showMessage(
                "Please enter an IP address or hostname."
            );

            targetInput.focus();

            return;
        }


        // Start scanning
        setLoading(true);

        setScanStatus(
            "SCANNING",
            "scanning"
        );


        progressContainer.classList.remove(
            "hidden"
        );


        progressFill.style.width = "0%";

        progressPercent.textContent = "0%";

        progressText.textContent =
            "Starting scan...";


        resultsBody.innerHTML = "";


        targetDisplay.textContent = target;


        try {

            // Small animation for progress
            let progress = 0;

            const progressTimer =
                setInterval(() => {

                    if (progress < 90) {

                        progress += 10;

                        progressFill.style.width =
                            `${progress}%`;

                        progressPercent.textContent =
                            `${progress}%`;

                        progressText.textContent =
                            "Scanning ports...";

                    }

                }, 150);


            const response = await fetch(
                "/scan-common",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        target: target
                    })
                }
            );


            const data =
                await response.json();


            clearInterval(progressTimer);


            if (!response.ok ||
                !data.success) {

                showMessage(
                    data.message ||
                    "Unable to scan ports."
                );

                return;
            }


            // Complete progress
            progressFill.style.width = "100%";

            progressPercent.textContent =
                "100%";

            progressText.textContent =
                "Scan completed";


            // Display all results
            displayCommonResults(
                data.results
            );


            // Statistics
            totalPorts.textContent =
                data.total;

            openPorts.textContent =
                data.open;

            closedPorts.textContent =
                data.closed;


            resultMessage.textContent =
                `${data.open} open and ${data.closed} closed ports found.`;


            setScanStatus(
                "COMPLETE",
                "complete"
            );

        }

        catch (error) {

            showMessage(
                "Unable to connect to the server."
            );

            console.error(error);

        }

        finally {

            setLoading(false);

            setTimeout(() => {

                progressContainer.classList.add(
                    "hidden"
                );

            }, 1500);
        }

    }
);


// ==========================================
// DISPLAY SINGLE RESULT
// ==========================================

function displaySingleResult(
    target,
    result
) {

    resultsBody.innerHTML = "";


    const row =
        document.createElement("tr");


    row.innerHTML = `
        <td>
            <strong>${result.port}</strong>
        </td>

        <td>
            ${result.service}
        </td>

        <td>
            ${createStatusBadge(
                result.status
            )}
        </td>

        <td>
            ${formatResponseTime(
                result.response_time
            )}
        </td>
    `;


    resultsBody.appendChild(row);
}


// ==========================================
// DISPLAY COMMON PORT RESULTS
// ==========================================

function displayCommonResults(
    results
) {

    resultsBody.innerHTML = "";


    results.forEach(result => {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>
                <strong>${result.port}</strong>
            </td>

            <td>
                ${result.service}
            </td>

            <td>
                ${createStatusBadge(
                    result.status
                )}
            </td>

            <td>
                ${formatResponseTime(
                    result.response_time
                )}
            </td>
        `;


        resultsBody.appendChild(row);

    });

}


// ==========================================
// CREATE STATUS BADGE
// ==========================================

function createStatusBadge(status) {

    let className = "other";

    let icon = "⚠️";


    if (status === "OPEN") {

        className = "open";

        icon = "●";

    }

    else if (status === "CLOSED") {

        className = "closed";

        icon = "●";
    }


    return `
        <span class="status-badge ${className}">
            ${icon} ${status}
        </span>
    `;
}


// ==========================================
// FORMAT RESPONSE TIME
// ==========================================

function formatResponseTime(time) {

    if (!time || time === 0) {

        return "—";
    }


    return `${time} ms`;
}


// ==========================================
// CLEAR RESULTS
// ==========================================

clearBtn.addEventListener(
    "click",
    () => {

        targetInput.value = "";

        portInput.value = "";


        resultsBody.innerHTML = `
            <tr class="empty-row">

                <td colspan="4">

                    <div class="empty-state">

                        <div class="empty-icon">
                            📡
                        </div>

                        <h3>
                            No Results Yet
                        </h3>

                        <p>
                            Enter a target and start
                            a port scan.
                        </p>

                    </div>

                </td>

            </tr>
        `;


        totalPorts.textContent = "0";

        openPorts.textContent = "0";

        closedPorts.textContent = "0";

        targetDisplay.textContent = "—";


        resultMessage.textContent =
            "No scan performed yet.";


        setScanStatus(
            "READY",
            "ready"
        );


        progressContainer.classList.add(
            "hidden"
        );


        progressFill.style.width = "0%";

        progressPercent.textContent = "0%";

    }
);


// ==========================================
// SET LOADING STATE
// ==========================================

function setLoading(isLoading) {

    checkPortBtn.disabled =
        isLoading;

    scanCommonBtn.disabled =
        isLoading;


    if (isLoading) {

        checkPortBtn.innerHTML =
            "⏳ Checking...";

        scanCommonBtn.innerHTML =
            "⏳ Scanning...";

    }

    else {

        checkPortBtn.innerHTML =
            "🔍 Check Port";

        scanCommonBtn.innerHTML =
            "📡 Scan Common Ports";
    }
}


// ==========================================
// SET SCAN STATUS
// ==========================================

function setScanStatus(
    text,
    className
) {

    scanStatus.textContent =
        text;

    scanStatus.className =
        `scan-badge ${className}`;
}


// ==========================================
// SHOW ERROR / MESSAGE
// ==========================================

function showMessage(message) {

    resultMessage.textContent =
        message;

    setScanStatus(
        "ERROR",
        "ready"
    );
}


// ==========================================
// ENTER KEY SUPPORT
// ==========================================

targetInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            portInput.focus();
        }

    }
);


portInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            checkPortBtn.click();
        }

    }
);