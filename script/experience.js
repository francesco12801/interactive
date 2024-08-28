let expCards = [...document.querySelectorAll('.exp-card')]; 


// Filtering 
const filter = [...document.querySelectorAll('.filter-btn')]
filter.map((btn, i) =>{
    btn.addEventListener('click', () => {
        filter.map(item => item.classList.remove('active')); 
        btn.classList.add('active'); 
    })
});



// exp details 
let expName = document.querySelector('.exp-detail .name'); 
let expImage = document.querySelector('.exp-detail .image'); 
let expDetails = document.querySelector('.exp-detail .details'); 

let progressTrack = [...document.querySelectorAll('.progress-tracking')];


expCards.forEach((experience) =>{
    experience.addEventListener('click', () =>{
        expCards.map(card => card.classList.remove('active'));
        experience.classList.add('active');
        let data = JSON.parse(experience.getAttribute('data-info')); 
        console.log(data); 
        expImage.src = data.img; 
        expName.innerHTML = data.name; 
        expDetails.innerHTML = data.about;
        progressTrack.map((item) =>{
            let progress = item.querySelector('.progress'); 
            progress.style.width = data.lang[item.getAttribute('data-name')];   

        })
    })
})
