(() => {
    'use strict';

    window.settings = {
        getSettingsDialogContent() {

            return new Promise(promise.bind(this));

            // PROMISE

            function promise(resolve, reject) {
                const
                    dialogContent = document.createElement('div'),
                    request = new XMLHttpRequest(),
                    textarea = document.querySelector('#textarea');

                request.addEventListener('load', onLoad.bind(this));
                request.open('GET', 'settingsDialogContent.html', true);
                request.send();

                function onLoad(event) {
                    dialogContent.setAttribute('id', 'settings-dialog');
                    dialogContent.innerHTML = event.target.responseText;

                    const previewElement = dialogContent.querySelector('.font-preview');

                    // THEMES

                    const themeChoosers = dialogContent.querySelectorAll('.theme');

                    for (let i = 0; i < themeChoosers.length; i++) {
                        let currentElement = themeChoosers[i];
                        currentElement.addEventListener('click', onThemeClick.bind(this), false);

                        if (currentElement.dataset.theme === document.body.dataset.theme) {
                            currentElement.classList.add('current');
                        }
                    }

                    // FONT SIZE

                    const fontSizeIncrease = dialogContent.querySelector('.font-size-increase'),
                        fontSizeDecrease = dialogContent.querySelector('.font-size-decrease');

                    let newFontSize;

                    previewElement.style.fontFamily = getComputedStyle(textarea).fontFamily;
                    previewElement.style.fontSize = getComputedStyle(textarea).fontSize;
                    previewElement.style.background = getComputedStyle(textarea).backgroundColor;
                    previewElement.style.color = getComputedStyle(textarea).color;

                    fontSizeIncrease.addEventListener('click', event => {
                        newFontSize = this.apply_fontsize(this.relativeFontsize.increase);
                        setPreviewFontSize(newFontSize);
                    }, false);

                    fontSizeDecrease.addEventListener('click', event => {
                        newFontSize = this.apply_fontsize(this.relativeFontsize.decrease);
                        setPreviewFontSize(newFontSize);
                    }, false);

                    function setPreviewFontSize(value) {
                        previewElement.style.fontSize = newFontSize + 'px';
                    }

                    // TEXT WIDTH

                    const textWidth = dialogContent.querySelector('#text-width');

                    textWidth.checked = textarea.classList.contains('full-width');

                    textWidth.addEventListener('change', event => {
                        if (textWidth.checked) {
                            this.apply_textwidth('full');
                        } else {
                            this.apply_textwidth('limited');
                        }
                    }, false);

                    // END

                    dialogContent.querySelector('.close').addEventListener('click', ui.closePopup, false);
                    resolve(dialogContent);

                    function onThemeClick(event) {
                        const clickedElement = event.currentTarget,
                            themeElements = clickedElement.parentElement.querySelectorAll('.theme');

                        for (let i = 0; i < themeElements.length; i++) {
                            themeElements[i].classList.remove('current');
                        }

                        clickedElement.classList.add('current');
                        this.apply_theme(clickedElement.dataset.theme);

                        previewElement.style.background = getComputedStyle(textarea).backgroundColor;
                        previewElement.style.color = getComputedStyle(textarea).color;
                    }
                }
            }
        },

        init() {
            this.readSetting(['theme', 'fontsize', 'textwidth']).then(gotSettings.bind(this));

            function gotSettings(items) {
                for (let item in items) {
                    const applyFunction = this['apply_' + item];

                    if (applyFunction && items.hasOwnProperty(item)) {
                        applyFunction.call(this, items[item]);
                    }
                }
            }
        },

        relativeFontsize: {
            increase: Symbol('increase'),
            decrease: Symbol('decrease')
        },

        apply_fontsize(value) {
            const currentFontSize = Number.parseInt(getComputedStyle(document.querySelector('#textarea')).fontSize),
                minFontSize = 8,
                maxFontSize = 30;

            let newFontSize = currentFontSize;

            if (value === this.relativeFontsize.decrease && currentFontSize > minFontSize) {
                newFontSize = currentFontSize <= 14 ? currentFontSize - 1 : currentFontSize - 2;
            } else if (value === this.relativeFontsize.increase && currentFontSize < maxFontSize) {
                newFontSize = currentFontSize < 14 ? currentFontSize + 1 : currentFontSize + 2;
            } else if (Number.isInteger(value)) {
                if (value < minFontSize) {
                    newFontSize = minFontSize;
                } else if (value > maxFontSize) {
                    newFontSize = maxFontSize;
                } else {
                    newFontSize = value;
                }
            }

            document.querySelector('#textarea').style.fontSize = newFontSize + 'px';

            this.writeSetting('fontsize', newFontSize);

            return newFontSize;
        },

        textwidthValues: {
            limited: 'limited',
            full: 'full'
        },

        apply_textwidth(value) {
            if (value === this.textwidthValues.full) {
                document.querySelector('#textarea').classList.add('full-width');
            } else if (value === this.textwidthValues.limited) {
                document.querySelector('#textarea').classList.remove('full-width');
            }
            this.writeSetting('textwidth', value);
        },

        apply_theme(themeName) {
            document.body.dataset.theme = themeName;
            this.writeSetting('theme', themeName);
        },

        writeSetting(key, value) {
            return new Promise(promise);

            function promise(resolve, reject) {
                chrome.storage.sync.set({
                    [key]: value
                }, () => resolve());
            }
        },

        readSetting(key) {
            return new Promise(promise);

            function promise(resolve, reject) {
                chrome.storage.sync.get(key, items => resolve(items));
            }
        }
    };

    settings.init();
})();