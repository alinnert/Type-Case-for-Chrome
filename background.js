/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */

chrome.app.runtime.onLaunched.addListener(onLaunchedListener);

function onLaunchedListener(launchData) {
    const options = {
        id: 'mainWindow',
        outerBounds: {
            width: 900,
            height: 750
        },
        frame: {
            color: '#4b4b4b',
            inactiveColor: '#6b6b6b'
        }
    };

    chrome.app.window.create('index.html', options, createWindowCallback);

    function createWindowCallback(createdWindow) {
        createdWindow.contentWindow.launchData = launchData;

        if (createdWindow.contentWindow.checkLaunchData instanceof createdWindow.contentWindow.Function) {
            createdWindow.contentWindow.checkLaunchData();
        }
    }
}