// Zmienna odpowiadajaca za ruch silnika (1 - silnik wykonuje ruch, 0 - silnik nie pracuje)
var POWER_BUTTON = 0;

// Zmienna procesu pokazujaca w jakim etapie znajduje sie brama: 0 = brama otwarta, 1 = zamykanie bramy, 2 = brama zamknięta, 3 = otwieranie bramy, 4 = stop, 5 = AWARIA
var PROCESS = -1;
var PROCESS_BUFF = -1;

window.onload = function() {
    var start_button = document.querySelector('.power_button');
    var progressBar = document.querySelector('.loadingBar .progress');

    //Lista zmiennych które WYSYŁAMY na sterownik ze strony
    plcVariable=['"web_page".przycisk'];

    //Funkcja opowiedzialna za animacje paska postępu (czas został zmierzony ręcznie na podstawie działania bramy)
    async function startLoadingAnimation() {
        progressBar.style.transition = 'width 17s ease';
        progressBar.style.width = '100%';
        await new Promise(resolve => setTimeout(resolve, 19000));
        progressBar.style.transition = 'width 17s ease';
        progressBar.style.width = '0%';
    }
    


    //Funckja rozpoczynająca prace silnika -> wysyła odpowiednia zmienną do sterownika
    //Rozpoczyna animacje paska postępu
    async function start_working() {
        if (POWER_BUTTON===0) {
            start_button.classList.remove('active');
            change_value(plcVariable[0], POWER_BUTTON);
        } else {
            start_button.classList.add('active');
            change_value(plcVariable[0], POWER_BUTTON);
        }
        console.log("SILNIK JEST W TRYBIE: " + POWER_BUTTON);
        await startLoadingAnimation();
    }

    //Funkcja komunikacyjne - funkcja odpowiedzialna za wyslanie zmiennej ze strony do sterownika
    function change_value(variable, value) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", window.location.pathname + "?" + variable + "=" + value, true);
        xhr.send();
    }

    //Funkcja nasluchujące - nasłuchuje, czy kliknięto w przycisk
    start_button.addEventListener('click', function() {
        if (POWER_BUTTON == 0){
            POWER_BUTTON = 1;
        }
        else{
            POWER_BUTTON = 0;
        }
        start_working(POWER_BUTTON);
    });
};

//Wykrywanie awarii - wyswietli komunikat podczas awarii
function detect_failure(flag) {
    var AWARIA_box = document.getElementById('failure_info_box');

    if (flag == 5){
        AWARIA_box.style.display = 'flex';
    }
    else{
        AWARIA_box.style.display = 'none'; 
    }

}

//Funkcja odpowiedzialna za przesłanie zmiennej ze sterownika na strone
function reloadContent() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Extract the content from the response
                var parser = new DOMParser();
                var responseDoc = parser.parseFromString(xhr.responseText, 'text/html');
                var newContent = responseDoc.getElementById('parameter_from_tia').innerHTML;
                var PROCESS_UPDATE = parseInt(newContent);
                PROCESS = PROCESS_UPDATE;
                // Update the content of the div
                document.getElementById('parameter_from_tia').innerHTML = newContent;
            } else {
                console.error('Failed to fetch content.');
            }
        }
    };
    xhr.open('GET', 'http://143.30.128.37/awp/Brama_Garazowa/index.html', true);
    xhr.send();
    detect_failure(PROCESS)
    console.log("refresh")
}

//Wywołaj funcje reloadContent co x sekund
var intervalTime = 2000; // 2000 milliseconds = 2 seconds
setInterval(reloadContent, intervalTime);
