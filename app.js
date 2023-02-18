
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
}

//insert book to start

const book1 = new Book('Cracking the Coding Interview', 'Gayle Lakmann McDowell', '687', false);
const book2 = new Book('The Giver', 'Lois Lowry', '240', true);
addBooktoLibrary(book1);
addBooktoLibrary(book2);
setUpStorage();
myLibrary = JSON.parse(localStorage.getItem('library') || []);
displayBooks();

// localStorage.clear();

function setUpStorage() {
    if (!localStorage.getItem('library')) {
        localStorage.setItem('library', JSON.stringify(myLibrary))
    }
}

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
    // myLibrary =
    let oldInfo = JSON.parse(localStorage.getItem('library') || [])
    localStorage.setItem('library', JSON.stringify([...oldInfo, createBook]));
    displayBooks();
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
                localStorage.setItem('library', JSON.stringify(myLibrary));
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
                    book.read = true;
                }
                else {
                    book.read = false;
                }
                localStorage.setItem('library', JSON.stringify(myLibrary));

            })
        })
    })
}
