const {ipcRenderer} = require('electron')

function iconChange(icon_element_id, icon_img_file) {
    color_mode_icon = document.querySelector(icon_element_id);
    color_mode_icon.src = icon_img_file;
}

ipcRenderer.on('set_dark', function(event) {
    document.documentElement.setAttribute('data-theme', 'dark');
});

ipcRenderer.on('set_light', function(even) {
    document.documentElement.setAttribute('data-theme', 'light');
});
