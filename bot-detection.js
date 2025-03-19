(function () {
    let botScore = 0;
    let lastMouseMoveTime = Date.now();
    let lastMousePosition = { x: null, y: null };
    let lastScrollTime = Date.now();
    let lastClickTime = Date.now();
    let lastKeyPressTime = Date.now();
    let clickCount = 0;
    let keypressCount = 0;
    let mouseMovements = [];
    const MAX_MOUSE_TRACK = 100;
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
                    <p>Your behavior suggests automated activity.</p>
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
        if (botScore >= 20) {
            showBotPopup();
        }
    }

    // Detect linear and robotic mouse movements
    function checkMousePatterns() {
        if (mouseMovements.length < 10) return;

        let totalDeviation = 0;
        let first = mouseMovements[0];
        let last = mouseMovements[mouseMovements.length - 1];

        let slope = (last.y - first.y) / (last.x - first.x);
        let speedSum = 0;
        let suddenJumps = 0;

        mouseMovements.forEach((point, index) => {
            if (index > 0) {
                let dx = Math.abs(point.x - mouseMovements[index - 1].x);
                let dy = Math.abs(point.y - mouseMovements[index - 1].y);
                let speed = Math.sqrt(dx * dx + dy * dy);
                speedSum += speed;

                if (speed > 50) suddenJumps++; // Unusual jump detection
            }

            let expectedY = first.y + slope * (point.x - first.x);
            totalDeviation += Math.abs(expectedY - point.y);
        });

        let avgDeviation = totalDeviation / mouseMovements.length;
        let avgSpeed = speedSum / mouseMovements.length;

        if (avgDeviation < 1.5 && avgSpeed > 10 && suddenJumps < 2) {
            botScore += 8; // Linear robotic movement
        }

        mouseMovements = [];
    }

    // Mouse move detection
    document.addEventListener("mousemove", (event) => {
        let now = Date.now();
        let timeDiff = now - lastMouseMoveTime;

        if (timeDiff < 10) botScore += 1; // Very fast reaction time

        if (lastMousePosition.x !== null) {
            let dx = Math.abs(event.clientX - lastMousePosition.x);
            let dy = Math.abs(event.clientY - lastMousePosition.y);
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 100) botScore += 3; // Sudden large movement
            if (dx < 2 && dy < 2) botScore += 2; // Very tiny movements
        }

        mouseMovements.push({ x: event.clientX, y: event.clientY });
        if (mouseMovements.length > MAX_MOUSE_TRACK) mouseMovements.shift();

        lastMousePosition = { x: event.clientX, y: event.clientY };
        lastMouseMoveTime = now;

        checkMousePatterns();
        detectBot();
    });

    // Detect rapid scrolling
    document.addEventListener("scroll", () => {
        let now = Date.now();
        let timeDiff = now - lastScrollTime;

        if (timeDiff < 100) botScore += 4; // Very rapid scrolling
        lastScrollTime = now;
        detectBot();
    });

    // Detect excessive clicking
    document.addEventListener("click", () => {
        let now = Date.now();
        let timeDiff = now - lastClickTime;
        clickCount++;

        if (timeDiff < 200) botScore += 3; // Clicking too fast
        if (clickCount > 15) botScore += 5; // Too many clicks

        lastClickTime = now;
        detectBot();
    });

    // Detect excessive key presses
    document.addEventListener("keydown", () => {
        let now = Date.now();
        let timeDiff = now - lastKeyPressTime;
        keypressCount++;

        if (timeDiff < 100) botScore += 2; // Fast keypresses
        if (keypressCount > 20) botScore += 4; // Excessive keypresses

        lastKeyPressTime = now;
        detectBot();
    });

    // Adaptive bot score decay
    setInterval(() => {
        if (botScore > 10) botScore -= 2;
        else botScore = Math.max(0, botScore - 1);
    }, 1500);

})();
