export default function onCapture(){
    const capture = document.querySelector('.graph');
    html2canvas(capture)
    .then(canvas => {
        if (canvas.msToBlob) { //for IE 10, 11
            var blob = canvas.msToBlob();
            window.navigator.msSaveBlob(blob, "capture.png");
        } else {
            onSaveAs(canvas.toDataURL(), "capture.png");
        }
    });
}

function onSaveAs(uri, filename) {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}