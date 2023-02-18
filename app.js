
/** arrray to hold books **/
let myLibrary = [];

class Book {
    constructor(title, author, pages, read) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.read = read;
    }
}

function addBooktoLibrary(book) {
    myLibrary.push(book);
    displayBooks();
}

//insert book to start

const book1 = new Book('Cracking the Coding Interview', 'Gayle Lakmann McDowell', '687', false);
const book2 = new Book('The Giver', 'Lois Lowry', '240', true);
addBooktoLibrary(book1);
addBooktoLibrary(book2);


//retrieve form values + create book + add book to library
let bookform = document.querySelector('form');
bookform.addEventListener('submit', (e) => {
    e.preventDefault()
    let title = e.currentTarget.title.value;
    let author = e.currentTarget.author.value;
    let pages = e.currentTarget.pages.value;
    let read = e.currentTarget.read.checked;
    let createBook = new Book(title, author, pages, read);
    addBooktoLibrary(createBook);
    // localStorage.setItem('library', JSON.stringify(myLibrary));

    let titleInput = document.querySelector("#title");
    let authorInput = document.querySelector("#author");
    let pagesInput = document.querySelector("#pages");
    let readInput = document.querySelector("#read");

    //reset input 
    titleInput.value = '';
    authorInput.value = '';
    pagesInput.value = '';
    readInput.value = '';
})


function displayBooks() {

    let wrapper = document.querySelector(".bookshelf");

    while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild);
    }

    myLibrary.forEach(function (book) {
        //create elements for card 
        let wrapper = document.querySelector('.bookshelf');
        let newCard = document.createElement("div");
        let titleCard = document.createElement("h5");
        let authorCard = document.createElement("h5");
        let pagesCard = document.createElement("h5");
        let readCard = document.createElement("span");
        let removeCard = document.createElement("span");

        //add text content to card
        titleCard.textContent = `${book.title}`;
        authorCard.textContent = `${book.author}`;
        pagesCard.textContent = `${book.pages}`;
        removeCard.textContent = "delete";


        if (titleCard.textContent.length > 30) {
            titleCard.classList.add('smaller');
        };

        if (authorCard.textContent.length > 30) {
            authorCard.classList.add('smaller');
        };

        //add classes
        newCard.classList.add("book");
        readCard.classList.add('material-symbols-outlined');
        removeCard.classList.add('remove');
        readCard.classList.add('onOff');
        removeCard.classList.add('material-symbols-outlined');
        let indexer = myLibrary.map(b => b.title).indexOf(`${book.title} `);
        removeCard.setAttribute('index', indexer);

        if (book.read === true) {
            readCard.classList.add('on');
            readCard.textContent = 'check';
        }
        else {
            readCard.textContent = 'check';
        }

        //append each section to card
        wrapper.appendChild(newCard);
        newCard.appendChild(titleCard);
        newCard.appendChild(authorCard);
        newCard.appendChild(pagesCard);
        newCard.appendChild(readCard);
        newCard.appendChild(removeCard);

        let removeButtons = document.querySelectorAll(".remove");
        removeButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                myLibrary.splice(`${e.target.getAttribute("index")} `, 1);
                displayBooks();

            })
        })

        let toggleRead = document.querySelectorAll(".onOff");
        toggleRead.forEach((read) => {
            read.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                e.target.classList.toggle("on");
                if (e.target.classList.contains("on")) {
                    e.target.textContent = "check";
                }
                // else {
                //     // e.target.textContent = "close";
                // }
            })
        })
    })
}

//localstorage 
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}
function store() {
    if (storageAvailable('localStorage')) {
        if (!localStorage.getItem('library')) {
            console.log(myLibrary);
            console.log(JSON.stringify(myLibrary));
            localStorage.setItem('library', JSON.stringify(myLibrary));

        }
        else {
            localStorage.clear();
            let lib = localStorage.getItem('library');
            let books = JSON.parse(lib);
            myLibrary = []
            books.forEach((book) => myLibrary.push(book));
            localStorage.setItem('library', JSON.stringify(myLibrary));
        }
    }
}
