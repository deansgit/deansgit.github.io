/*

Display all of the words from KIIP Korean classes in a grid
Tap the pairs to complete the challenge.
2018 Dean Nguyen

*/

/* GLOBALS */
const DB_NAME = "VocabDatabase";
const DB_VERSION = 4;
const NUMBER_OF_WORDS = 6;
var remainingPieces = NUMBER_OF_WORDS;
var wordList = [];
var position = [];
var answerMap = [];
var initialGame = true;

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB. Vocabulary will not be available.");
}

// initialize DB and request user permission to open it
var db;
var request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = function(event){
  console.error("IndexedDB:", event.target.errorCode);
}

// Create the database
request.onupgradeneeded = function(event){
  db = event.target.result;
  
  if (event.oldVersion < 1){
    // Version 1 has KIIP1 Vocab
    var KIIP1store = db.createObjectStore("KIIP1", {keypath: "id", autoIncrement: true});
    var KIIP1Index = KIIP1store.createIndex("KIIP1Index", ["word.question", "word.answer"]);
    writeWordsinDB(KIIP1store, KIIP1);
  }
  
  if (event.oldVersion < 2){
    // Version 2 introduces capital and lowercase alphabet letters
    var alphabetStore = db.createObjectStore("Alphabet", {keypath: "id", autoIncrement: true});
    var alphabetIndex = alphabetStore.createIndex("AlphabetIndex", ["word.question", "word.answer"]);
    writeWordsinDB(alphabetStore, alphabet);
  }  

  if (event.oldVersion < 3){
    // Version 3 introduces 3rd Grade Vocabulary
    var thirdGradeStore = db.createObjectStore("ThirdGrade", {keypath: "id", autoIncrement: true});
    var thirdGradeIndex = thirdGradeStore.createIndex("ThirdGradeIndex", ["word.question", "word.answer"]);
    writeWordsinDB(thirdGradeStore, thirdGrade);
  }
};

/* Create a screen that shows the word */
window.onload = function(){
  showMainMenu(display);
}

/* Produce word array*/
function getWordList(dbstore, numOfWords, max){
  let list = [];
  for (var i = 0; i < numOfWords; i++){
    let index =  Math.floor(Math.random() * (max - 1 + 1)) + 1;
    let request = dbstore.get(index);
    request.onsuccess = function(){
      list.push(request.result);
    }
  }  
  return list;
}

/* Animate gridpieces: red for wrong, green for correct.*/
function wrongPiecesAnimation(pieces){
  var keyframes = [
    { backgroundColor: "#FF0033"},
    { backgroundColor: "#FFCCCC"}
  ];
  pieces.forEach(function(piece){
    piece.style.borderStyle = "outset";
    piece.animate(keyframes, 500);
  });
}

function correctPiecesAnimation(pieces){
  var keyframes = [
    { backgroundColor: "#CCFFCC"},
    { backgroundColor: "#00FF33"},
  ];
  pieces.forEach(function(piece){
    piece.animate(keyframes, 500);
    setTimeout(function(){
      piece.style.visibility = "hidden";
    }, 600);
  });
  // track end of game
  remainingPieces--;
}

/* Animate Victory Screen */
function splashScreen(){
  let splash = document.getElementById("splash");
  let pic = document.createElement("img");
  pic.src = "https://placekitten.com/g/300/200";
  splash.appendChild(pic);
  splash.style.visibility = "visible";
  splash.style.zIndex = "1";
  splash.addEventListener("click", function(){    
    splash.style.visibility = "hidden";
  });
}

/* Draw all pieces.*/
function startNewGame(dbStoreName,dbWordIndex){
    request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = function(){
      let db = this.result;
      let tx = db.transaction(dbStoreName, "readwrite");
      let store = tx.objectStore(dbStoreName);
      let index = store.index(dbWordIndex);   
      let count = store.count();

      count.onsuccess = function(){
        wordList = getWordList(store, NUMBER_OF_WORDS, count.result); //getWordList
        
        //randomize order in which divs receive text   
        for (var i = 0; i < NUMBER_OF_WORDS * 2; i++){
          position.push(i);
        }
        shuffleArray(position);
        
        setTimeout(function(){
          for (var i = 0; i < NUMBER_OF_WORDS; i++){
            let ans = wordList[i].word.answer;
            let que = wordList[i].word.question;
            let id = wordList[i].word.id;
            let corresPos = parseInt(position[i + position.length/2]);
            document.getElementById(position[i]).innerHTML = ans;
            document.getElementById(corresPos).innerHTML = que;
            answerMap[[ans]] = id;
            answerMap[[que]] = id;
          }
        }, 1000);
      }

    tx.oncomplete = function(){
      db.close();
    }
  }

  // track how many gridpieces the user clicks/unclicks
  var clicks = {
    count: 0,
    firstClickId: null,
    secondClickId: null,
    firstAnsId: null,
    secondAnsId: null,
    firstCharCode: null,
    secondCharCode: null,
  };
  
  //populate grid
  var grid = function(){           
    //create 2 grid elements on DOM for each word
    for (var i = 0; i < NUMBER_OF_WORDS * 2; i++){
      let gridPiece = document.createElement("div");
      gridPiece.id = i;
      gridPiece.className = "gridpiece"
      gridPiece.fontFamily = "Gaegu";
      gridPiece.innerHTML = "?";
      
      // animation of clicks
      gridPiece.addEventListener("click", function(){
        clicks.count++;
        gridPiece.style.borderStyle = "inset";
        
        switch (clicks.count){
          case 1: 
            clicks.firstClickId = gridPiece.id;
            clicks.firstAnsId = answerMap[gridPiece.innerHTML];
            clicks.firstCharCode = gridPiece.innerHTML.charCodeAt(0);
            console.log("FIRST: AnsId: " + clicks.firstAnsId + ", CharCode: " + clicks.secondCharCode);
            break;
          case 2:                  
            clicks.secondClickId = gridPiece.id;
            clicks.secondAnsId = answerMap[gridPiece.innerHTML];
            clicks.secondCharCode = gridPiece.innerHTML.charCodeAt(0);
            console.log("SECOND: AnsId: " + clicks.secondAnsId + ", CharCode: " + clicks.secondCharCode);
            let pieces = [
              document.getElementById(clicks.firstClickId), 
              document.getElementById(clicks.secondClickId)
            ];
            if (clicks.secondClickId == clicks.firstClickId){
              gridPiece.style.borderStyle = "outset";
            } else {
              if ((clicks.firstAnsId == clicks.secondAnsId) && (clicks.firstCharCode !== clicks.secondCharCode)){
                correctPiecesAnimation(pieces);
              } else {
                wrongPiecesAnimation(pieces);
              }
            }
            if (remainingPieces == 0){
              remainingPieces = NUMBER_OF_WORDS;
              splashScreen();
              setTimeout(restartGame(dbStoreName, dbWordIndex), 1000);
            }
            clicks.count = 0; //reset clicks
            break;
          default:
            clicks.count = 0; //reset clicks
        }
        
      });
      display.appendChild(gridPiece);
    };
  }();
}

function restartGame(dbStoreName, dbWordIndex){
  // clear globals
  if (!initialGame){
    wordList = [];
    position = [];
    answerMap = [];
  }

  let views = document.getElementsByClassName("gridpiece");
  // open db again
  request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onsuccess = function(){
    let db = this.result;
    let tx = db.transaction(dbStoreName, "readwrite");
    let store = tx.objectStore(dbStoreName);
    let index = store.index(dbWordIndex);   
    let count = store.count();

    count.onsuccess = function(){
      wordList = getWordList(store, NUMBER_OF_WORDS, count.result); //getWordList
      
      //randomize order in which divs receive text   
      for (var i = 0; i < NUMBER_OF_WORDS * 2; i++){
        position.push(i);
      }
      shuffleArray(position);
      
      setTimeout(function(){
        for (var i = 0; i < NUMBER_OF_WORDS; i++){
          let ans = wordList[i].word.answer;
          let que = wordList[i].word.question;
          let id = wordList[i].word.id;
          let corresPos = parseInt(position[i + position.length/2]);
          document.getElementById(position[i]).innerHTML = ans;
          document.getElementById(corresPos).innerHTML = que;
          answerMap[[ans]] = id;
          answerMap[[que]] = id;
        }
      }, 1000);      
      // console.log("first position: " + i + "gets: " + eng + "||||" + "second position: " + corresPos + "gets: " + kor);  
    }

    tx.oncomplete = function(){
      db.close();
    }
  }
  
  setTimeout(function(){
    Array.from(views).forEach(function(view){
    view.style.visibility = "visible";
    view.style.borderStyle = "outset";
    })
  }, 1000);
}

/* Helper function for randomizing output on grid */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
    }
}

/* Helper function for finding answer pairs */
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}