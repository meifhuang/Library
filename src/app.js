import './style.css';
import firebaseConfig from '../firebase.config';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, onSnapshot, setDoc, updateDoc, doc, serverTimestamp, getDocs, orderBy, deleteDoc, limit } from 'firebase/firestore';

// import firebase from 'firebase/app';
// import 'firebase/firestore';

/** arrray to hold books **/
let myLibrary = [];
let userId;

class Book {
    constructor(title, author, pages, read) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.read = read;
    }
    toJSON() {
        return {
            title: this.title,
            author: this.author,
            pages: this.pages,
            read: this.read
        }
    }
}

function addBooktoLibrary(book) {
    myLibrary.push(book);
}

//insert book to start


// addBooktoLibrary(book2);
// setUpStorage();


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
    // addBooktoLibrary(createBook);
    saveBook(createBook); 
    // myLibrary =
    
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
                deletebook(book);
            })
        })

        let toggleRead = document.querySelectorAll(".onOff");
        toggleRead.forEach( async (read) => {
            read.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                e.target.classList.toggle("on");
                if (e.target.classList.contains("on")) {
                    book.read = true;
                }
                else {
                    book.read = false;
                }
                updateBook(book); 
            })

        })
    })
}


//firebase

const app = initializeApp(firebaseConfig);

initFirebaseAuth(); 
const db = getFirestore(app);


//sign in 

async function signIn() {
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
}

function signOutUser() {
    signOut(getAuth());
    userId = null; 
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
        local.setAttribute('hidden', true); 
        loadBooks();
    }
    else {
        userNameDiv.setAttribute('hidden', 'true');
        userPic.setAttribute('hidden', 'true');
        signOutButton.setAttribute('hidden', 'true');
        signInButton.removeAttribute('hidden');
        local.removeAttribute('hidden');
    }
}

function addSizeToGoogleProfilePic(url) {
    if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
        return url + '?sz=150';
    }
    return url;
}

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadBooks();
    }
    else {
        loadBooks(); 
    }
})

async function saveBook(book) {
    let user = getAuth().currentUser; 
    if (user) {
        const user = getAuth().currentUser;
        const docRef = await addDoc(collection(db, `users/${user.uid}/books`),{...book.toJSON(), createdAt: serverTimestamp()}); 
    }
    else if (!user) {
        let oldInfo = JSON.parse(localStorage.getItem('library') || [])
        localStorage.setItem('library', JSON.stringify([...oldInfo, book])); 
    }
    loadBooks(); 
}

async function deletebook(book) {
    let user = getAuth().currentUser; 
    if (user) { 
        const user = getAuth().currentUser;
        const lib = collection(db, `users/${user.uid}/books`);
        const queried = query(lib, where("title", "==", book.title), where("author", "==", book.author), where("pages", "==", book.pages))
        const snap = await getDocs(queried); 
        snap.forEach(doc => {
            deleteDoc(doc.ref)
        })
       
    }
    else {
       
        let index;
        let oldInfo = JSON.parse(localStorage.getItem('library') || [])

        for (let i = 0; i < oldInfo.length; i++) {
            if (oldInfo[i].title === book.title && oldInfo[i].author === book.author) {
                index = i 
            }
        }
        oldInfo.splice(index, 1);
        localStorage.setItem('library', JSON.stringify(oldInfo));
    }
    loadBooks(); 
}

async function updateBook(book) {
    let user = getAuth().currentUser; 
    if (user) { 
        const user = getAuth().currentUser;
        const lib = collection(db, `users/${user.uid}/books`);
        const queried = query(lib, where("title", "==", book.title), where("author", "==", book.author), where("pages", "==", book.pages))
        const querySnapshot = await getDocs(queried);
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { 
        read: book.read
        });
        }
    else {
        let oldInfo = JSON.parse(localStorage.getItem('library') || [])
        for (let i = 0; i < oldInfo.length; i++) {
            if (oldInfo[i].title === book.title && oldInfo[i].author === book.author) {
                oldInfo[i].read = book.read;
            }
        }
        localStorage.setItem('library', JSON.stringify(oldInfo));
    }
    loadBooks();
}


async function loadBooks() {
    let user = getAuth().currentUser; 
    if (user) {
        const querySnap = await getDocs(collection(db, `users/${user.uid}/books`), orderBy("createdAt",'desc'));
        let tempLib = [];
        let prevLib = myLibrary; 
        querySnap.forEach((doc) => {
            tempLib.push(doc.data());
        })
        myLibrary = tempLib
        displayBooks(); 
        myLibrary = prevLib; 
    }
    else {
        let prevLib = myLibrary;
        setUpStorage();
        let tempLibrary = JSON.parse(localStorage.getItem('library') || []);
        myLibrary = tempLibrary;
        displayBooks(); 
        myLibrary = prevLib; 
    }
}


let userPic = document.getElementById('user-pic');
let userNameDiv = document.getElementById('user-name');
let signInButton = document.getElementById('sign-in');
let signOutButton = document.getElementById('sign-out');
let local = document.getElementById('local');

signOutButton.addEventListener('click', signOutUser);
signInButton.addEventListener('click', signIn);

loadBooks();
