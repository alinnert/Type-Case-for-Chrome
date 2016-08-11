(() => {
    'use strict';

    const status = {
        clean: Symbol('clean'),
        dirty: Symbol('dirty')
    };

    let currentFile = null,
        currentStatus = status.clean;

    window.app = {
        status,

        isClean: () => currentStatus === status.clean,
        setClean: value => currentStatus = value,
        isFileOpened: () => currentFile !== null,

        newFile() {
            currentFile = null;
            currentStatus = status.clean;
        },

        chooseFile(callback) {
            chrome.fileSystem.chooseEntry({
                type: 'openWritableFile',
                acceptsMultiple: false
            }, entry => {
                if (!chrome.runtime.lastError) {
                    this.openFile(entry[0], callback);
                }
            });
        },

        openFile(fileEntry, callback, onError) {
            currentFile = fileEntry;

            fileEntry.file(file => this.readFile(file, callback, onError));
        },

        readFile(file, callback, onError) {
            const reader = new FileReader();

            reader.onerror = onError;
            reader.onloadend = event => {
                if (callback instanceof Function) {
                    callback({
                        content: event.target.result,
                        filename: currentFile.name
                    });
                }
            };

            reader.readAsText(file);
        },

        saveFile(textContent, callback, saveas) {
            if (currentFile === null || saveas) {
                chrome.fileSystem.chooseEntry({ type: 'saveFile' }, fileEntry => {
                    if (!chrome.runtime.lastError) {
                        this.onGetFileEntrySuccess(fileEntry, textContent, callback);
                    } else if (callback instanceof Function) {
                        callback({ filename: '' });
                    }
                });
            } else {
                chrome.fileSystem.isWritableEntry(currentFile, isWritable => {
                    if (isWritable) {
                        this.onGetFileEntrySuccess(currentFile, textContent, callback);
                    } else {
                        chrome.fileSystem.getWritableEntry(currentFile, fileEntry => this.onGetFileEntrySuccess(fileEntry, textContent, callback));
                    }
                });
            }
        },

        onGetFileEntrySuccess(fileEntry, textContent, callback) {
            currentFile = fileEntry;

            fileEntry.createWriter(writer => {
                const blob = new Blob([textContent], { type: 'text/plain' });
                let truncated = false;

                writer.onerror = error => console.error(error);
                writer.onwriteend = event => {
                    if (!truncated) {
                        truncated = true;
                        writer.truncate(blob.size);
                        return;
                    }

                    if (callback instanceof Function) {
                        callback({
                            filename: currentFile.name
                        });
                    }

                    this.setClean(status.clean);
                };

                writer.write(blob);
            });
        }
    };
})();
