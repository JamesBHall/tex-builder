const path = require('path')
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const fs = require('fs');
const svg2png = require('svg2png');

function createWindow() {
    const win = new BrowserWindow({
	window: 800,
	height: 600,
	minWidth: 400,
	webPreferences: {
	    nodeIntegration: true
	}
    })
    win.loadFile('index.html')
    //win.webContents.openDevTools()

    var menu = Menu.buildFromTemplate([
	{
	    label: 'Menu',
	    submenu: [
		{role: 'quit'}
	    ]
	},
	{
	    label: 'Edit',
	    submenu: [
		{role: 'copy'},
		{role: 'paste'}
	    ]
	},	
	{
	    label: 'View',
	    submenu: [
		{label: 'Dark Mode',
		 click() {win.webContents.send('set_dark');}
		},
		{label: 'Light Mode',
		 click() {win.webContents.send('set_light');}
		}

	    ]
	},
	{
	    label: 'Dev Tools',
	    submenu: [
		{role: 'toggleDevTools'}
	    ]
	}
    ])
    Menu.setApplicationMenu(menu)
}
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
	app.quit()
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
	createWindow()
    }
});
	
ipcMain.on('request-save-png', (event, arg) => {

    dialog.showSaveDialog(null, {defaultPath: "output.png"}).then(result => {
	svg2png(arg).then(
	    buffer => {fs.writeFileSync(result.filePath, buffer)})
    }).catch(err => {
	console.log(err)
    })

});

ipcMain.on('request-save-text', (event, arg) => {

    dialog.showSaveDialog(null, {defaultPath: "equation.txt"}).then(result => {
	fs.writeFileSync(result.filePath, arg)
    }).catch(err => {
	console.log(err)
    })

    console.log(arg)

});

ipcMain.on('request-load-text', (event, arg) => {

    dialog.showOpenDialog(null, {}).then(result => {
	console.log(result);
	fs.readFile(result.filePaths[0], 'utf8', (err, data) => {
	    if (err) throw err;
	    event.reply('reply-loaded-text', data);
	}).catch(err => {
	    console.log(err);
	});
    });

});

ipcMain.on('on-render-drag-start', (event, data) => {
    const appPath = app.getAppPath();
    const baseRenderPath = "./temp_render";
    tempRenderPath = path.join(appPath, baseRenderPath);
    temp_loc = path.join(tempRenderPath, "temp_render.svg")
    fs.writeFileSync(temp_loc, data)
    event.sender.startDrag({
	file: temp_loc,
	icon: "./assets/icons/placeholder.png"
    })
})
