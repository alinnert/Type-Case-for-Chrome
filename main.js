'use strict';

const textarea = document.querySelector('#textarea'),
    textInfo = document.querySelector('#text-info'),
    filename = document.querySelector('#filename'),
    menuNew = document.querySelector('#menu-new'),
    menuOpen = document.querySelector('#menu-open'),
    menuSave = document.querySelector('#menu-save'),
    menuSaveas = document.querySelector('#menu-saveas'),
    menuSettings = document.querySelector('#menu-settings'),
    body = document.querySelector('body'),
    emptyFilename = '< new unsaved file >';

menuNew.addEventListener('click', onNewFile, false);
menuOpen.addEventListener('click', onOpenFile, false);
menuSave.addEventListener('click', onSaveFile, false);
menuSaveas.addEventListener('click', onSaveasFile, false);
menuSettings.addEventListener('click', onSettings, false);
textarea.addEventListener('input', onTextareaInput, false);
body.addEventListener('drop', onBodyDrop, false);

Mousetrap.bind('ctrl+n', event => {
    event.preventDefault();
    onNewFile();
});
Mousetrap.bind('ctrl+t', event => {
    event.preventDefault();
});
Mousetrap.bind('ctrl+o', event => {
    event.preventDefault();
    onOpenFile();
});
Mousetrap.bind('ctrl+s', event => {
    event.preventDefault();
    onSaveFile();
});
Mousetrap.bind('ctrl+shift+s', event => {
    event.preventDefault();
    onSaveasFile();
});
Mousetrap.bind('ctrl+,', event => {
    event.preventDefault();
    onSettings();
});
Mousetrap.bind('esc', event => {
    event.preventDefault();
    ui.closePopup();
});
Mousetrap.bind(['ctrl++', 'ctrl+='], event => {
    settings.apply_fontsize(settings.relativeFontsize.increase);
});
Mousetrap.bind('ctrl+-', event => {
    settings.apply_fontsize(settings.relativeFontsize.decrease);
});

app.newFile();
loadOpenedFile();
checkLaunchData();

// FUNCTIONS

function notifyError(text) {
    ui.notify(text);
}

function checkLaunchData() {
    if (window.launchData && window.launchData.items) {
        app.openFile(window.launchData.items[0].entry, loadOpenedFile, notifyError);
    }
}

function onNewFile(event) {
    if (app.isClean()) {
        if (app.isFileOpened() || textarea.value !== '') {
            app.newFile();
            ui.notify('created new file');
            loadOpenedFile();
        }
    } else {
        ui.openDialog({
            message: 'Save file before creating a new one?',
            actions: [
                {
                    label: 'Yes',
                    callback() {
                        onSaveFile(null, () => {
                            app.newFile();
                            ui.notify('created new file');
                            loadOpenedFile();
                        });
                    }
                },
                {
                    label: 'No',
                    callback() {
                        app.newFile();
                        ui.notify('created new file');
                        loadOpenedFile();
                    }
                },
                {
                    label: 'Cancel'
                }
            ]
        });
    }
}

function onOpenFile(event) {
    if (app.isClean()) {
        app.chooseFile(loadOpenedFile);
    } else {
        ui.openDialog({
            message: 'Save file before opening a new one?',
            actions: [
                {
                    label: 'Yes',
                    callback() {
                        onSaveFile(null, () => {
                            app.chooseFile(loadOpenedFile);
                        });
                    }
                },
                {
                    label: 'No',
                    callback() {
                        app.chooseFile(loadOpenedFile);
                    }
                },
                {
                    label: 'Cancel'
                }
            ]
        });
    }
}

function loadOpenedFile(data) {
    if (data !== undefined) {
        textarea.value = data.content;
        filename.textContent = data.filename;
        ui.notify(`opened file ${data.filename}`);
    } else {
        textarea.value = '';
        filename.textContent = emptyFilename;
    }
    updateTextInfo();
    app.setClean(app.status.clean);
}

function onSaveFile(event, callback) {
    app.saveFile(textarea.value, onSaveFileSuccess);

    function onSaveFileSuccess(data) {
        if (data.filename) {
            filename.textContent = data.filename;
            ui.notify(`saved file ${data.filename}`);
        }

        if (callback instanceof Function) {
            callback();
        }
    }
}

function onSaveasFile(event) {
    app.saveFile(textarea.value, onSaveFileSuccess, true);

    function onSaveFileSuccess(data) {
        if (data.filename) {
            filename.textContent = data.filename;
            ui.notify(`saved copy ${data.filename}`);
        }
    }
}

function onSettings(event) {
    if (!ui.isPopupOpen()) {
        settings
            .getSettingsDialogContent()
            .then(
                settingsContent =>
                    ui.openSimplePopup(settingsContent, { closeOnLayerClick: true })
            );
    }
}

function onTextareaInput(event) {
    app.setClean(app.status.dirty);
    updateTextInfo();
}

function onBodyDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const droppedFileEntry = event.dataTransfer.items[0].webkitGetAsEntry();

    if (app.isClean()) {
        app.openFile(droppedFileEntry, loadOpenedFile, notifyError);
    } else {
        ui.openDialog({
            message: 'Save file before opening a new one?',
            actions: [
                {
                    label: 'Yes',
                    callback() {
                        onSaveFile(null, () => {
                            app.openFile(droppedFileEntry, loadOpenedFile, notifyError);
                        });
                    }
                },
                {
                    label: 'No',
                    callback() {
                        app.openFile(droppedFileEntry, loadOpenedFile, notifyError);
                    }
                },
                {
                    label: 'Cancel'
                }
            ]
        });
    }
}

function updateTextInfo() {
    let words = (textarea.value.replace(/['";:,.?¿\-!¡]+/g, '').match(/\S+/g) || []).length;

    textInfo.textContent = `${textarea.value.length.toLocaleString()} characters / ${words.toLocaleString()} words`;
}