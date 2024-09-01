
let exp = [ 
    {
        name: 'Lets Party',
        about: 'CEO & Founder of Lets Party. Cross-platform based application that revolutionize the social network field providing services to nightclubs.',
        tags: '#backend',
        img: '../assets/letsParty.png',
        lang:{
            html: '20%',
            css: '10%', 
            javascript: '90%', 
            typescript: '20%',  
            database: '97%', 
            nodejs: '80%',
        }
    },
    {
        name: 'Deloitte',
        about: 'Building up cloud infrastructure and mananger for third-party society. No more information for privacy agreements.',
        tags: '#backend',
        img: '../assets/dl.png',
        lang:{
            html: '10%',
            css: '10%', 
            javascript: '50%', 
            typescript: '80%',  
            database: '60%', 
            nodejs: '40%',
        }
    },
    {
        name: 'Eureka',
        about: 'CEO & Founder of Eureka. Groundbreaking social network for entrepreneurs, researchers,and artists who seek to share their innovative ideas. ',
        tags: '#backend',
        img: '../assets/EurekaLogo.png',
        lang:{
            html: '0%',
            css: '0%', 
            javascript: '90%', 
            typescript: '20%',  
            database: '97%', 
            nodejs: '80%',
        }
    },
    {
        name: 'Officinae Di Santo',
        about: 'Development and implementation of search algorithms (Graph, Binary Search Tree, and AVL Tree). Optimisation of the search algorithms to improve the project functionalities.', 
        tags: '#backend',
        img: '../assets/ofd.png',
        lang:{
            html: '10%',
            css: '5%', 
            javascript: '60%', 
            typescript: '90%',  
            database: '30%', 
            nodejs: '40%',
        }, 
    },

]


let exp_gallery = document.querySelector('.exp-gallery');  

const create_experience = (exp) => {
    exp_gallery.innerHTML += `
        <a href="#exp-info" class="exp-card" data-tags='${exp.tags}' data-info='${JSON.stringify(exp)}'>
            <img src="${exp.img}" alt="" class="exp-img">
            <span class="tags">${exp.tags}</span>
        </a>
    `
}


exp.map((experience, i) =>{
    create_experience(experience); 
})


