(function () {
    let botScore = 0;
    let lastMouseMoveTime = Date.now();
    let lastMousePosition = { x: null, y: null };
    let lastScrollTime = Date.now();
    let clickCount = 0;
    let keypressCount = 0;
    let mouseMovements = [];
    const MAX_MOUSE_TRACK = 50;
    let botDetected = false;

    function showBotPopup() {
        if (!botDetected) {
            botDetected = true;
            
            // Create popup div
            let popup = document.createElement("div");
            popup.id = "bot-popup";
            popup.innerHTML = `
                <div id="bot-popup-content">
                    <h2>⚠️ Bot Detected!</h2>
                    <p>Your behavior indicates automated activity.</p>
                    <button onclick="document.getElementById('bot-popup').remove()">OK</button>
                </div>
            `;

            // Add styles
            let styles = document.createElement("style");
            styles.innerHTML = `
                #bot-popup {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10000;
                }
                #bot-popup-content {
                    background: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                }
                #bot-popup button {
                    padding: 10px 20px;
                    background: red;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                }
            `;

            document.head.appendChild(styles);
            document.body.appendChild(popup);
        }
    }

    function detectBot() {
        if (botScore > 15) {
            showBotPopup();
        }
    }

    // Detect linear mouse movements
    function checkLinearMouseMovement() {
        if (mouseMovements.length < 5) return;
        let totalDeviation = 0;
        let first = mouseMovements[0];
        let last = mouseMovements[mouseMovements.length - 1];

        let slope = (last.y - first.y) / (last.x - first.x);
        mouseMovements.forEach(point => {
            let expectedY = first.y + slope * (point.x - first.x);
            totalDeviation += Math.abs(expectedY - point.y);
        });

        let avgDeviation = totalDeviation / mouseMovements.length;
        if (avgDeviation < 2) {
            botScore += 7; // Almost straight-line movement is suspicious
            showBotPopup();
        }
    }

    // Mouse move detection
    document.addEventListener("mousemove", (event) => {
        let now = Date.now();
        let timeDiff = now - lastMouseMoveTime;

        if (timeDiff < 10) botScore += 2; // Extremely fast movement

        // Track mouse positions
        if (lastMousePosition.x !== null) {
            mouseMovements.push({ x: event.clientX, y: event.clientY });
            if (mouseMovements.length > MAX_MOUSE_TRACK) mouseMovements.shift();
        }

        lastMousePosition = { x: event.clientX, y: event.clientY };
        lastMouseMoveTime = now;

        checkLinearMouseMovement();
        detectBot();
    });

    // Detect rapid scrolling
    document.addEventListener("scroll", () => {
        let now = Date.now();
        if (now - lastScrollTime < 50) botScore += 3; // Too fast scrolling
        lastScrollTime = now;
        detectBot();
    });

    // Detect excessive clicks
    document.addEventListener("click", () => {
        clickCount++;
        if (clickCount > 10) botScore += 5; // Too many clicks in short time
        detectBot();
    });

    // Detect automated key presses
    document.addEventListener("keydown", () => {
        keypressCount++;
        if (keypressCount > 15) botScore += 4; // Excessive keypresses
        detectBot();
    });

    // Periodic bot score decay
    setInterval(() => {
        botScore = Math.max(0, botScore - 1); // Decrease score over time
    }, 1000);

})();
