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
        },
        popupLayer = document.querySelector('#popup-layer'),
        popup = document.querySelector('#popup'),
        notification = document.querySelector('#notification');

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
        }
    }
})();