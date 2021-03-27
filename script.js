(function() {

    var width = 320; // We will scale the photo width to this
    var height = 0; // This will be computed based on the input stream

    var streaming = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;
    var sendBtn = null;
    var sendIcon = null;

    var clickCheck = false;
    var resetCheck = false;
    
    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        sendBtn = document.getElementById('sendBtn');
        sendIcon = document.getElementById('sendIcon');

        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function(err) {
                console.log("An error occurred: " + err);
            });

        video.addEventListener('canplay', function(ev) {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function(ev) {
            if (clickCheck === false && resetCheck === false) {
                clickCheck = true;
                sendIcon.className = "fas fa-flask";
                canvas.style.zIndex = 1;
                console.log('first if');
                takepicture();

            }else{

                if (resetCheck === false) {
                    resetCheck = true;
                    clickCheck = false;
                    sendIcon.className = "fas fa-redo";
                    showResult();                   
                }else{
                    resetCheck = false;
                    canvas.style.zIndex = -1;
                    sendIcon.className = "fas fa-camera";
                }
            }
            ev.preventDefault();
        }, false);

        clearphoto();
    }

    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    function takepicture() {
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
            uploadFile(data);
        } else {
            clearphoto();
        }
    }

    function uploadFile(dataSend) {
        console.log('upload file');
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://127.0.0.1:7000/predict', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            value: dataSend
        }));
    }

    function showResult() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {     
            document.getElementById("result").innerHTML = 'Prediction = ' + xhttp.responseText;
        };
        xhttp.open("GET", 'http://127.0.0.1:7000/result', true);
        xhttp.send();
    }

    window.addEventListener('load', startup, false);
})();