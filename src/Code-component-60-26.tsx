<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Offline - Cubist Inspired Portraits</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .offline-container {
            max-width: 400px;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .offline-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }

        h1 {
            margin: 0 0 10px;
            font-size: 24px;
            font-weight: 600;
        }

        p {
            margin: 0 0 20px;
            opacity: 0.9;
            line-height: 1.5;
        }

        .retry-button {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .retry-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
        }

        .features {
            margin-top: 30px;
            text-align: left;
        }

        .feature {
            display: flex;
            align-items: center;
            margin: 10px 0;
            opacity: 0.8;
        }

        .feature-icon {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            opacity: 0.7;
        }

        @media (max-width: 480px) {
            .offline-container {
                margin: 20px;
                padding: 30px 15px;
            }
            
            h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1>You're Offline</h1>
        <p>Cubist Inspired Portraits works best with an internet connection, but you can still use some features offline.</p>
        
        <button class="retry-button" onclick="window.location.reload()">
            Try Again
        </button>

        <div class="features">
            <div class="feature">
                <span class="feature-icon">✏️</span>
                <span>Continue drawing on existing projects</span>
            </div>
            <div class="feature">
                <span class="feature-icon">🎨</span>
                <span>Use cached facial elements</span>
            </div>
            <div class="feature">
                <span class="feature-icon">💾</span>
                <span>Save work locally</span>
            </div>
        </div>
    </div>

    <script>
        // Check if back online
        window.addEventListener('online', function() {
            window.location.reload();
        });

        // Service worker update check
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function(registration) {
                registration.update();
            });
        }
    </script>
</body>
</html>