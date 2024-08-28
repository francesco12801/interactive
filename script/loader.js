document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        let loader = document.getElementById('loader');
        loader.classList.add('hidden'); 
    }, 5000); 

    let logo = document.getElementById('logo');
    logo.addEventListener('click', function() {
        window.location.reload();
    });
});

