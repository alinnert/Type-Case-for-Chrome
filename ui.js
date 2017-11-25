(() => {
    'use strict';

    const defaultDialogOptions = {
        message: '',
        actions: [
            {
                label: 'OK',
                callback() {
                }
            }
        ]
    };
    const popupLayer = document.querySelector('#popup-layer');
    const popup = document.querySelector('#popup');
    const notification = document.querySelector('#notification');

    let notifyTimeout = null;

    window.ui = {
        openDialog(options) {
            let buttonHtml = '';
            const simplePopupContent = document.createElement('div');

            Object.setPrototypeOf(options, defaultDialogOptions);

            simplePopupContent.innerHTML =
                `<p class="message">${options.message}</p>
                <div class="buttons"></div>`;

            options.actions.forEach(item => {
                const button = document.createElement('button');
                button.textContent = item.label;
                button.addEventListener('click', event => {
                    this.closePopup();
                    if (item.callback instanceof Function) {
                        item.callback();
                    }
                }, false);
                simplePopupContent.querySelector('.buttons').appendChild(button);
            });

            simplePopupContent.querySelector('button').focus();

            this.openSimplePopup(simplePopupContent);
        },

        closePopup() {
            popupLayer.classList.add('hidden');

            setTimeout(() => {
                popup.innerHTML = '';
            }, 200);
        },

        isPopupOpen() {
            return !popupLayer.classList.contains('hidden');
        },

        openSimplePopup(contentElement, options) {
            if (typeof options !== 'object') {
                options = {};
            }

            Object.setPrototypeOf(options, {
                closeOnLayerClick: false
            });

            if (options.closeOnLayerClick) {
                popupLayer.addEventListener('click', this.closePopup, false);
            } else {
                popupLayer.removeEventListener('click', this.closePopup, false);
            }

            popup.addEventListener('click', event => event.stopPropagation(), false);
            popup.appendChild(contentElement);
            popupLayer.classList.remove('hidden');
        },

        notify(text) {
            notification.textContent = text;
            notification.classList.remove('hidden');
            clearTimeout(notifyTimeout);
            notifyTimeout = setTimeout(this.removeNotification, 2000);
        },

        removeNotification() {
            notification.classList.add('hidden');
            setTimeout(() => notification.textContent = '', 200);
        },

        supportTab(event) {
            if (event.keyCode === 9) {
                event.preventDefault();

                const start = event.currentTarget.selectionStart;
                const end = event.currentTarget.selectionEnd;

                event.currentTarget.value = event.currentTarget.value.substring(0, start) + '\t' + event.currentTarget.value.substring(end);
                event.currentTarget.selectionStart = event.currentTarget.selectionEnd = start + 1;
            }
        }
    }
})();