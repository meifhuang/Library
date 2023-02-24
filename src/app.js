import './style.css';
import firebaseConfig from '../firebase.config';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, setDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// import firebase from 'firebase/app';
// import 'firebase/firestore';

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
saveBook(book1);
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
        let indexer = myLibrary.map(b => b.title).indexOf(`${book.title}`);
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


//firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//sign in 
async function signIn() {
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
}

function signOutUser() {
    signOut(getAuth());
}

function initFirebaseAuth() {
    onAuthStateChanged(getAuth(), authStateObserver);
}

function getProfilePicUrl() {
    return getAuth().currentUser.photoURL || '/images/profile_placeholder.png'
}

function getUserName() {
    return getAuth().currentUser.displayName;
}

function authStateObserver(user) {
    if (user) {
        let profilePicUrl = getProfilePicUrl();
        let userName = getUserName();
        userPic.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
        userNameDiv.textContent = userName;
        userPic.removeAttribute('hidden');
        userNameDiv.removeAttribute('hidden');
        signOutButton.removeAttribute('hidden');
        signInButton.setAttribute('hidden', true);
    }
    else {
        userNameDiv.setAttribute('hidden', 'true');
        userPic.setAttribute('hidden', 'true');
        signOutButton.setAttribute('hidden', 'true');
        signInButton.removeAttribute('hidden');
    }
}

function addSizeToGoogleProfilePic(url) {
    if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
        return url + '?sz=150';
    }
    return url;
}

async function saveBook(book) {
    try {
        await addDoc(collection(getFirestore(), 'books'), {
            title: book.title,
            author: book.author,
            pages: book.pages,
            read: book.read
        })
    }
    catch (err) {
        console.error(err)
    }
}

let userPic = document.getElementById('user-pic');
let userNameDiv = document.getElementById('user-name');
let signInButton = document.getElementById('sign-in');
let signOutButton = document.getElementById('sign-out');


signOutButton.addEventListener('click', signOutUser);
signInButton.addEventListener('click', signIn);

initFirebaseAuth(); 
