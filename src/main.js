const path = require('path')
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const fs = require('fs');
const svg2png = require('svg2png');

var drag_format = 'SVG';
var export_size = 0;

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
	    label: 'Export Settings',
	    submenu: [
		{label: 'Drag Format',
		 submenu: [
		     {label: 'SVG',
		      type: 'radio',
		      checked: true,
		      click() {drag_format = 'SVG';}},
		     {label: 'PNG',
		      type: 'radio',
		      checked: false,
		      click() {drag_format = 'PNG';}}
		 ]
		},
		{label: 'Export Size',
		 submenu: [
		     {'label': '100',
		      'type': 'radio',
		      checked: false,
		      click() {export_size = 100;}},
		     {'label': '250',
		      'type': 'radio',
		      checked: false,
		      click() {export_size = 250;}},
		     {'label': 'Full',
		      'type': 'radio',
		      checked: true,
		      click() {export_size = 0;}}
		 ]
		},
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

ipcMain.on('request-export-size', (event) => {
    console.log('Export size requested');
    //event.reply('reply-export-size', export_size);
    event.returnValue = export_size;
});

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
	if (!result.canceled) {
	    svg2png(arg).then(
		buffer => {fs.writeFileSync(result.filePath, buffer)})
	}
    }).catch(err => {
	console.log(err)
    })

});

ipcMain.on('request-save-text', (event, arg) => {

    dialog.showSaveDialog(null, {defaultPath: "equation.txt"}).then(result => {
	if (!result.canceled) {
	    fs.writeFileSync(result.filePath, arg)
	}
    }).catch(err => {
	console.log(err)
    })

});

ipcMain.on('request-load-text', (event, arg) => {

    dialog.showOpenDialog(null, {}).then(result => {
	if (!result.canceled) {
	    fs.readFile(result.filePaths[0], 'utf8', (err, data) => {
		if (err) throw err;
		event.reply('reply-loaded-text', data);
	    }).catch(err => {
		console.log(err);
	    });
	}
    });

});

ipcMain.on('cache-render', (event, data) => {
    const appPath = app.getAppPath();
    const baseRenderPath = "./temp_render";
    tempRenderPath = path.join(appPath, baseRenderPath);
    
    temp_png_loc = path.join(tempRenderPath, "temp_render.png");
    svg2png(data).then(
	buffer => {fs.writeFileSync(temp_png_loc, buffer);}
    );

    temp_svg_loc = path.join(tempRenderPath, "temp_render.svg");
    fs.writeFileSync(temp_svg_loc, data);
})

ipcMain.on('on-render-drag-start', (event, data) => {
    const appPath = app.getAppPath();
    const baseRenderPath = "./temp_render";
    tempRenderPath = path.join(appPath, baseRenderPath);
    
    temp_png_loc = path.join(tempRenderPath, "temp_render.png");
    temp_svg_loc = path.join(tempRenderPath, "temp_render.svg");
    
    if (drag_format === "PNG") {
	//temp_loc = path.join(tempRenderPath, "temp_render.png");
	/*
	svg2png(data).then(
	    buffer => {fs.writeFileSync(temp_loc, buffer);
		       event.sender.startDrag({
			   file: temp_loc,
			   icon: "./assets/icons/preview_icon.png"});
		      })
	*/
	event.sender.startDrag({
	    file: temp_png_loc,
	    icon: "./assets/icons/preview_icon.png"});
    };
	  
    if (drag_format == "SVG") {
	//temp_loc = path.join(tempRenderPath, "temp_render.svg");
	//fs.writeFileSync(temp_loc, data);
	event.sender.startDrag({
	    file: temp_svg_loc,
	    icon: "./assets/icons/preview_icon.png"});
    };
})
