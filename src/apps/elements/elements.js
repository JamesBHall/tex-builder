function convert() {
    const { ipcRenderer } = require('electron');
    
    var input = document.getElementById("text-input").value.trim();
    var display = document.getElementById("render");
    var renderOptions = {em: 16, ex:8, containerWidth: 589, display: true, scale: 1, lineWidth: 1000};
    var element = MathJax.tex2svg(input, renderOptions);
    display.innerHTML = element.innerHTML;

    ipcRenderer.send('cache-render', export_svg_data());
}    
render_button = document.getElementById("render-button");
render_button.addEventListener('click', convert, false);

function export_svg() {
    var input = document.getElementById("text-input").value.trim();
    var renderOptions = {em: 16, ex: 8, scale: 1};
    var element = MathJax.tex2svg(input, renderOptions);
    var ele;
    for (child in element.children) {
	ele = element.children[child];
	if (ele.nodeName == 'svg') {
	    var svg = ele
	}
    }
    var height = Math.floor(svg.viewBox.baseVal.height);
    var width = Math.floor(svg.viewBox.baseVal.width);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    var svgBlob = new Blob([svg.outerHTML], {type: "image/svg+xml;charset=utf-8"});
    saveAs(svgBlob, "output.svg")
}
save_button = document.getElementById("export-svg-button");
save_button.addEventListener('click', export_svg, false);

function save_equation() {
    const { ipcRenderer } = require('electron');
    var equation_text = document.getElementById("text-input").value.trim();
    ipcRenderer.send('request-save-text', equation_text);
}
var save_equation_button = document.getElementById("save-button");
save_equation_button.addEventListener('click', save_equation, false);

function load_equation() {
    console.log("Load button pressed!");
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('request-load-text', "load");
    ipcRenderer.on('reply-loaded-text', (event, arg) => {
	var equation_area = document.getElementById("text-input");
	equation_area.value = arg;
    });	
}
var load_equation_button = document.getElementById("load-button");
load_equation_button.addEventListener('click', load_equation, false);

function export_png() {
    const { ipcRenderer } = require('electron');
    var input = document.getElementById("text-input").value.trim();
    var renderOptions = {em: 16, ex:8, scale: 1};
    var element = MathJax.tex2svg(input, renderOptions);
    var ele;
    for (child in element.children) {
	ele = element.children[child];
	if (ele.nodeName == 'svg') {
	    var svg = ele
	}
    }
    var height = Math.floor(svg.viewBox.baseVal.height / 10);
    var width = Math.floor(svg.viewBox.baseVal.width / 10);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    let Data = svg.outerHTML;
    ipcRenderer.send('request-save-png', Data);	
}
var save_png_button = document.getElementById("export-png-button");
save_png_button.addEventListener('click', export_png, false);

function toggle_preview() {
    var display = document.getElementById("render");
    var divider = document.getElementById("divider");
    var input = document.getElementById("text-input");
    
    if (display.style.display == "" || display.style.display == "block") {
	display.style.display = "none";
	divider.style.display = "none";
	input.style.flex = "0 0 calc(100% - 30px)";
    } else {
	display.style.display = "block";
	divider.style.display = "block";
	input.style.flex = "0 0 calc(50% - 31px)";
    }
    
}
toggle_preview_button = document.getElementById("toggle-preview-button");
toggle_preview_button.addEventListener('click', toggle_preview, false);

function export_svg_data() {
    const { ipcRenderer } = require('electron');
    //ipcRenderer.send('request-export-size');
    long_dim = 0;
    long_dim = ipcRenderer.sendSync('request-export-size');
    console.log("Long dim");
    console.log(long_dim);
		  
    
    var input = document.getElementById("text-input").value.trim();
    var renderOptions = {em: 16, ex:8, scale: 1};
    var element = MathJax.tex2svg(input, renderOptions);
    var ele;
    for (child in element.children) {
	ele = element.children[child];
	if (ele.nodeName == 'svg') {
	    var svg = ele
	}
    }
    var height = Math.floor(svg.viewBox.baseVal.height);
    var width = Math.floor(svg.viewBox.baseVal.width);

    max_dim = Math.max(height, width);
    if (long_dim == 0) {
	scale = 1.0;
    } else {
	scale = long_dim / max_dim;
    }

    console.log("Width:")
    console.log(width)
    console.log("Height:")
    console.log(height)
    console.log("Max dim:")
    console.log(max_dim)
    console.log("Scaler:")
    console.log(scale)

    svg.setAttribute('width', Math.floor(width*scale));
    svg.setAttribute('height', Math.floor(height*scale));
    return svg.outerHTML;
}

const { ipcRenderer } = require('electron');
const renderElement = document.getElementById('render');

renderElement.addEventListener('dragstart', (event) => {
    event.preventDefault();
    svg_data = export_svg_data();
    ipcRenderer.send('on-render-drag-start', svg_data);
});
