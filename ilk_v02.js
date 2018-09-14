/*

Display all of the words from KIIP Korean classes in a grid
Tap the pairs to complete the challenge.
2018 Dean Nguyen

*/

/* GLOBALS */
const DB_NAME = "VocabDatabase";
const DB_STORE_NAME = "ObjectStore";
const DB_WORD_INDEX = "WordIndex";
const DB_VERSION = 3;
const NUMBER_OF_WORDS = 6;
var remainingPieces = NUMBER_OF_WORDS;
var wordList = [];
var position = [];
var answerMap = [];

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB && !window.msIndexedDB) {
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
    db.createObjectStore(DB_STORE_NAME, {keypath: "id", autoIncrement: true});
  }
  
  if (event.oldVersion < DB_VERSION){
    db.deleteObjectStore(DB_STORE_NAME);
  }
  var store = db.createObjectStore(DB_STORE_NAME, {keypath: "id", autoIncrement: true});
  store.createIndex(DB_WORD_INDEX, ["word.Korean", "word.English"]);
  writeWordsinDB(store);
};

request.onsuccess = function(){
  var db = this.result;
  var tx = db.transaction(DB_STORE_NAME, "readwrite");
  var store = tx.objectStore(DB_STORE_NAME);
  var index = store.index(DB_WORD_INDEX);   
  var count = store.count();
  
  count.onsuccess = function(){
    wordList = getWordList(store, NUMBER_OF_WORDS, count.result); //getWordList
    
    //randomize order in which divs receive text   
    for (var i = 0; i < NUMBER_OF_WORDS * 2; i++){
      position.push(i);
    }
    shuffleArray(position);
    
    setTimeout(function(){
        for (var i = 0; i < NUMBER_OF_WORDS; i++){
          let eng = wordList[i].word.English;
          let kor = wordList[i].word.Korean;
          let id = wordList[i].word.id;
          let corresPos = parseInt(position[i + position.length/2]);
          document.getElementById(position[i]).innerHTML = eng;
          document.getElementById(corresPos).innerHTML = kor;
          answerMap[[eng]] = id;
          answerMap[[kor]] = id;
        }
      }, 1000);      
      // console.log("first position: " + i + "gets: " + eng + "||||" + "second position: " + corresPos + "gets: " + kor);  
  }
  

  tx.oncomplete = function(){
    db.close();
  }
}


/* Create a screen that shows the word */
window.onload = function(){
  var display = document.getElementById("display");

  // track how many gridpieces the user clicks/unclicks
  var clicks = {
    count: 0,
    firstClickId: null,
    secondClickId: null,
    firstAnsId: null,
    secondAnsId: null,
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
            console.log("FIRST: " + clicks.firstClickId + " " + clicks.firstAnsId);
            break;
          case 2:                  
            clicks.secondClickId = gridPiece.id;
            clicks.secondAnsId = answerMap[gridPiece.innerHTML];
            console.log("SECOND: " + clicks.secondClickId + " " + clicks.secondAnsId);
            let pieces = [
              document.getElementById(clicks.firstClickId), 
              document.getElementById(clicks.secondClickId)
            ];
            if (clicks.secondClickId == clicks.firstClickId){
              gridPiece.style.borderStyle = "outset";
            } else {
              if (clicks.firstAnsId == clicks.secondAnsId){
                correctPiecesAnimation(pieces);
              } else {
                wrongPiecesAnimation(pieces);
              }
            }
            if (remainingPieces == 0){
              remainingPieces = NUMBER_OF_WORDS;
              startNewGame();
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

/* Create word bundles in db */
function writeWordsinDB(dbstore){
  dbstore.put({word: {id: "1", Korean: "가게", English: "store"}});
  dbstore.put({word: {id: "2", Korean: "가격", English: "price"}});
  dbstore.put({word: {id: "3", Korean: "가깝다", English: "close"}});
  dbstore.put({word: {id: "4", Korean: "가다", English: "go"}});
  dbstore.put({word: {id: "5", Korean: "가르치다", English: "teach"}});
  dbstore.put({word: {id: "6", Korean: "가방", English: "bag"}});
  dbstore.put({word: {id: "7", Korean: "가수", English: "singer"}});
  dbstore.put({word: {id: "8", Korean: "가스레인지", English: "gas range"}});
  dbstore.put({word: {id: "9", Korean: "가습기", English: "humidifier"}});
  dbstore.put({word: {id: "10", Korean: "가운데", English: "middle"}});
  dbstore.put({word: {id: "11", Korean: "가을", English: "autumn"}});
  dbstore.put({word: {id: "12", Korean: "가족", English: "family"}});
  dbstore.put({word: {id: "13", Korean: "가지", English: "eggplant"}});
  dbstore.put({word: {id: "14", Korean: "가지다", English: "have"}});
  dbstore.put({word: {id: "15", Korean: "간호사", English: "nurse"}});
  dbstore.put({word: {id: "16", Korean: "갈비", English: "rib"}});
  dbstore.put({word: {id: "17", Korean: "갈아타다", English: "transfer"}});
  dbstore.put({word: {id: "18", Korean: "감", English: "feeling"}});
  dbstore.put({word: {id: "19", Korean: "감기에 걸리다", English: "catch a cold"}});
  dbstore.put({word: {id: "20", Korean: "감사합니다", English: "thank you"}});
  dbstore.put({word: {id: "21", Korean: "감자", English: "potato"}});
  dbstore.put({word: {id: "22", Korean: "값", English: "value"}});
  dbstore.put({word: {id: "23", Korean: "강아지", English: "puppy"}});
  dbstore.put({word: {id: "24", Korean: "개", English: "dog"}});
  dbstore.put({word: {id: "25", Korean: "개(단위명사)", English: "thing (counter)"}});
  dbstore.put({word: {id: "26", Korean: "거기", English: "there"}});
  dbstore.put({word: {id: "27", Korean: "거실", English: "livingroom"}});
  dbstore.put({word: {id: "28", Korean: "거울", English: "mirror"}});
  dbstore.put({word: {id: "29", Korean: "건강에 좋다", English: "it's good for your health"}});
  dbstore.put({word: {id: "30", Korean: "건강하다", English: "healthy"}});
  dbstore.put({word: {id: "31", Korean: "건축가", English: "architect"}});
  dbstore.put({word: {id: "32", Korean: "걷다", English: "walk"}});
  dbstore.put({word: {id: "33", Korean: "걸다", English: "call (phone)"}});
  dbstore.put({word: {id: "34", Korean: "겨울", English: "winter"}});
  dbstore.put({word: {id: "35", Korean: "결혼", English: "marriage"}});
  dbstore.put({word: {id: "36", Korean: "결혼기념일", English: "wedding anniversary"}});
  dbstore.put({word: {id: "37", Korean: "결혼식", English: "wedding ceremony"}});
  dbstore.put({word: {id: "38", Korean: "경복궁", English: "Gyeongbokgung"}});
  dbstore.put({word: {id: "39", Korean: "경주", English: "Gyeongju"}});
  dbstore.put({word: {id: "40", Korean: "경찰관", English: "police officer"}});
  dbstore.put({word: {id: "41", Korean: "경찰서", English: "police station"}});
  dbstore.put({word: {id: "42", Korean: "경험", English: "experience"}});
  dbstore.put({word: {id: "43", Korean: "계단", English: "stairs"}});
  dbstore.put({word: {id: "44", Korean: "계란", English: "egg"}});
  dbstore.put({word: {id: "45", Korean: "계속", English: "continue"}});
  dbstore.put({word: {id: "46", Korean: "계시다", English: "be there"}});
  dbstore.put({word: {id: "47", Korean: "계절", English: "season"}});
  dbstore.put({word: {id: "48", Korean: "고객", English: "customer"}});
  dbstore.put({word: {id: "49", Korean: "고구마", English: "sweet potato"}});
  dbstore.put({word: {id: "50", Korean: "고기", English: "meat"}});
  dbstore.put({word: {id: "51", Korean: "고맙습니다", English: "thank you"}});
  dbstore.put({word: {id: "52", Korean: "고모", English: "aunt"}});
  dbstore.put({word: {id: "53", Korean: "고추", English: "pepper"}});
  dbstore.put({word: {id: "54", Korean: "고프다", English: "hungry"}});
  dbstore.put({word: {id: "55", Korean: "곳", English: "place"}});
  dbstore.put({word: {id: "56", Korean: "공공 기관", English: "public institutions"}});
  dbstore.put({word: {id: "57", Korean: "공기가 좋다", English: "the air is good"}});
  dbstore.put({word: {id: "58", Korean: "공무원", English: "official"}});
  dbstore.put({word: {id: "59", Korean: "공부", English: "study"}});
  dbstore.put({word: {id: "60", Korean: "공부하다", English: "to study"}});
  dbstore.put({word: {id: "61", Korean: "공연", English: "show"}});
  dbstore.put({word: {id: "62", Korean: "공원", English: "park (place)"}});
  dbstore.put({word: {id: "63", Korean: "공장", English: "factory"}});
  dbstore.put({word: {id: "64", Korean: "공책", English: "notebook"}});
  dbstore.put({word: {id: "65", Korean: "공항", English: "airport"}});
  dbstore.put({word: {id: "66", Korean: "과일", English: "fruit"}});
  dbstore.put({word: {id: "67", Korean: "과자", English: "snack"}});
  dbstore.put({word: {id: "68", Korean: "과장님", English: "supervisor"}});
  dbstore.put({word: {id: "69", Korean: "관광", English: "tourism"}});
  dbstore.put({word: {id: "70", Korean: "괜찮다", English: "okay"}});
  dbstore.put({word: {id: "71", Korean: "괜찮아요", English: "it's okay"}});
  dbstore.put({word: {id: "72", Korean: "교사", English: "teacher"}});
  dbstore.put({word: {id: "73", Korean: "교실", English: "classroom"}});
  dbstore.put({word: {id: "74", Korean: "교통편", English: "transportation"}});
  dbstore.put({word: {id: "75", Korean: "구경", English: "look around"}});
  dbstore.put({word: {id: "76", Korean: "구급상자", English: "first aid kit"}});
  dbstore.put({word: {id: "77", Korean: "구두", English: "shoes"}});
  dbstore.put({word: {id: "78", Korean: "구청", English: "district office"}});
  dbstore.put({word: {id: "79", Korean: "국물", English: "broth"}});
  dbstore.put({word: {id: "80", Korean: "국수", English: "noodle"}});
  dbstore.put({word: {id: "81", Korean: "국적", English: "nationality"}});
  dbstore.put({word: {id: "82", Korean: "군만두", English: "fried dumplings"}});
  dbstore.put({word: {id: "83", Korean: "군인", English: "soldier"}});
  dbstore.put({word: {id: "84", Korean: "권", English: "volume (series)"}});
  dbstore.put({word: {id: "85", Korean: "귀", English: "ear"}});
  dbstore.put({word: {id: "86", Korean: "귀걸이", English: "earring"}});
  dbstore.put({word: {id: "87", Korean: "귀엽다", English: "cute"}});
  dbstore.put({word: {id: "88", Korean: "귤", English: "tangerine"}});
  dbstore.put({word: {id: "89", Korean: "그네를 타다", English: "play on the swings"}});
  dbstore.put({word: {id: "90", Korean: "그래서", English: "therefore"}});
  dbstore.put({word: {id: "91", Korean: "그럼", English: "then"}});
  dbstore.put({word: {id: "92", Korean: "그릇", English: "bowl"}});
  dbstore.put({word: {id: "93", Korean: "그리고", English: "and"}});
  dbstore.put({word: {id: "94", Korean: "그리다", English: "draw"}});
  dbstore.put({word: {id: "95", Korean: "그림", English: "drawing"}});
  dbstore.put({word: {id: "96", Korean: "그저께", English: "day before yesterday"}});
  dbstore.put({word: {id: "97", Korean: "극장", English: "theater"}});
  dbstore.put({word: {id: "98", Korean: "근처", English: "near by"}});
  dbstore.put({word: {id: "99", Korean: "금요일", English: "Friday"}});
  dbstore.put({word: {id: "100", Korean: "기념일", English: "anniversary"}});
  dbstore.put({word: {id: "101", Korean: "기다리다", English: "wait"}});
  dbstore.put({word: {id: "102", Korean: "기대되다", English: "be expected"}});
  dbstore.put({word: {id: "103", Korean: "기분", English: "feeling"}});
  dbstore.put({word: {id: "104", Korean: "기쁘다", English: "happy"}});
  dbstore.put({word: {id: "105", Korean: "기술자", English: "technician"}});
  dbstore.put({word: {id: "106", Korean: "기운", English: "strength"}});
  dbstore.put({word: {id: "107", Korean: "기자", English: "reporter"}});
  dbstore.put({word: {id: "108", Korean: "기차", English: "train"}});
  dbstore.put({word: {id: "109", Korean: "기차역", English: "train station"}});
  dbstore.put({word: {id: "110", Korean: "기침", English: "cough"}});
  dbstore.put({word: {id: "111", Korean: "김", English: "kim"}});
  dbstore.put({word: {id: "112", Korean: "김밥", English: "kimbab"}});
  dbstore.put({word: {id: "113", Korean: "김치", English: "kimchi"}});
  dbstore.put({word: {id: "114", Korean: "김치찌개", English: "kimchi stew"}});
  dbstore.put({word: {id: "115", Korean: "깎다", English: "cut"}});
  dbstore.put({word: {id: "116", Korean: "깨끗하다", English: "clean"}});
  dbstore.put({word: {id: "117", Korean: "깻잎", English: "sesame leaf"}});
  dbstore.put({word: {id: "118", Korean: "꼭", English: "exactly"}});
  dbstore.put({word: {id: "119", Korean: "꽃", English: "flower"}});
  dbstore.put({word: {id: "120", Korean: "꽃집", English: "flower shop"}});
  dbstore.put({word: {id: "121", Korean: "꿀", English: "honey"}});
  dbstore.put({word: {id: "122", Korean: "끄다", English: "turn off"}});
  dbstore.put({word: {id: "123", Korean: "끓이다", English: "boil"}});
  dbstore.put({word: {id: "124", Korean: "나가다", English: "go out"}});
  dbstore.put({word: {id: "125", Korean: "나라", English: "country"}});
  dbstore.put({word: {id: "126", Korean: "나쁘다", English: "bad"}});
  dbstore.put({word: {id: "127", Korean: "나오다", English: "come out"}});
  dbstore.put({word: {id: "128", Korean: "나이", English: "age"}});
  dbstore.put({word: {id: "129", Korean: "나중", English: "later"}});
  dbstore.put({word: {id: "130", Korean: "날", English: "day"}});
  dbstore.put({word: {id: "131", Korean: "날씨", English: "weather"}});
  dbstore.put({word: {id: "132", Korean: "날씬하다", English: "slim"}});
  dbstore.put({word: {id: "133", Korean: "날짜", English: "date"}});
  dbstore.put({word: {id: "134", Korean: "남동생", English: "younger brother"}});
  dbstore.put({word: {id: "135", Korean: "남부 지방", English: "southern region"}});
  dbstore.put({word: {id: "136", Korean: "남이섬", English: "Nami Island"}});
  dbstore.put({word: {id: "137", Korean: "남자", English: "man"}});
  dbstore.put({word: {id: "138", Korean: "남편", English: "husband"}});
  dbstore.put({word: {id: "139", Korean: "낮", English: "day"}});
  dbstore.put({word: {id: "140", Korean: "낮다", English: "low"}});
  dbstore.put({word: {id: "141", Korean: "내과", English: "medicine"}});
  dbstore.put({word: {id: "142", Korean: "내년", English: "next year"}});
  dbstore.put({word: {id: "143", Korean: "내려가다", English: "go down"}});
  dbstore.put({word: {id: "144", Korean: "내일", English: "tomorrow"}});
  dbstore.put({word: {id: "145", Korean: "냉면", English: "cold noodles"}});
  dbstore.put({word: {id: "146", Korean: "냉장고", English: "refrigerator"}});
  dbstore.put({word: {id: "147", Korean: "너무", English: "too"}});
  dbstore.put({word: {id: "148", Korean: "넓다", English: "to be wide"}});
  dbstore.put({word: {id: "149", Korean: "넘어지다", English: "fall down"}});
  dbstore.put({word: {id: "150", Korean: "넣다", English: "to insert"}});
  dbstore.put({word: {id: "151", Korean: "넥타이", English: "necktie"}});
  dbstore.put({word: {id: "152", Korean: "노래", English: "song"}});
  dbstore.put({word: {id: "153", Korean: "노래방", English: "karaoke"}});
  dbstore.put({word: {id: "154", Korean: "놀다", English: "to play"}});
  dbstore.put({word: {id: "155", Korean: "놀이공원", English: "amusement park"}});
  dbstore.put({word: {id: "156", Korean: "농구", English: "basketball"}});
  dbstore.put({word: {id: "157", Korean: "농구공", English: "a basketball"}});
  dbstore.put({word: {id: "158", Korean: "농부", English: "farmer"}});
  dbstore.put({word: {id: "159", Korean: "높다", English: "high"}});
  dbstore.put({word: {id: "160", Korean: "누가", English: "who"}});
  dbstore.put({word: {id: "161", Korean: "누구", English: "who"}});
  dbstore.put({word: {id: "162", Korean: "누나", English: "sister"}});
  dbstore.put({word: {id: "163", Korean: "눈", English: "eye"}});
  dbstore.put({word: {id: "164", Korean: "눈병", English: "eye disease"}});
  dbstore.put({word: {id: "165", Korean: "느리다", English: "slow"}});
  dbstore.put({word: {id: "166", Korean: "늦다", English: "be late"}});
  dbstore.put({word: {id: "167", Korean: "다니다", English: "attend"}});
  dbstore.put({word: {id: "168", Korean: "다리", English: "bridge"}});
  dbstore.put({word: {id: "169", Korean: "다리", English: "leg"}});
  dbstore.put({word: {id: "170", Korean: "다섯", English: "five"}});
  dbstore.put({word: {id: "171", Korean: "다시", English: "again"}});
  dbstore.put({word: {id: "172", Korean: "다용도실", English: "utility room"}});
  dbstore.put({word: {id: "173", Korean: "다음 달", English: "next month"}});
  dbstore.put({word: {id: "174", Korean: "다음 주", English: "next week"}});
  dbstore.put({word: {id: "175", Korean: "다치다", English: "get hurt"}});
  dbstore.put({word: {id: "176", Korean: "단오", English: "Korean Spring Festival"}});
  dbstore.put({word: {id: "177", Korean: "단풍", English: "foliage"}});
  dbstore.put({word: {id: "178", Korean: "달력", English: "calendar"}});
  dbstore.put({word: {id: "179", Korean: "닭", English: "chicken"}});
  dbstore.put({word: {id: "180", Korean: "닭갈비", English: "chicken ribs"}});
  dbstore.put({word: {id: "181", Korean: "담배를 피우다", English: "smoke a cigarette"}});
  dbstore.put({word: {id: "182", Korean: "당근", English: "carrot"}});
  dbstore.put({word: {id: "183", Korean: "대", English: "versus"}});
  dbstore.put({word: {id: "184", Korean: "대추", English: "jujube"}});
  dbstore.put({word: {id: "185", Korean: "대추차", English: "jujube tea"}});
  dbstore.put({word: {id: "186", Korean: "대학생", English: "college student"}});
  dbstore.put({word: {id: "187", Korean: "댁", English: "house"}});
  dbstore.put({word: {id: "188", Korean: "더", English: "more"}});
  dbstore.put({word: {id: "189", Korean: "덥다", English: "hot"}});
  dbstore.put({word: {id: "190", Korean: "도서관", English: "library"}});
  dbstore.put({word: {id: "191", Korean: "도시", English: "city"}});
  dbstore.put({word: {id: "192", Korean: "도장", English: "stamp"}});
  dbstore.put({word: {id: "193", Korean: "도착하다", English: "arrive"}});
  dbstore.put({word: {id: "194", Korean: "돈", English: "money"}});
  dbstore.put({word: {id: "195", Korean: "돈가스", English: "pork cutlets"}});
  dbstore.put({word: {id: "196", Korean: "돈을 넣다", English: "put the money"}});
  dbstore.put({word: {id: "197", Korean: "돈을 보내다", English: "spend your money"}});
  dbstore.put({word: {id: "198", Korean: "돈을 찾다", English: "withdraw cash"}});
  dbstore.put({word: {id: "199", Korean: "돌", English: "stone"}});
  dbstore.put({word: {id: "200", Korean: "돌아오다", English: "come back"}});
  dbstore.put({word: {id: "201", Korean: "돌잔치", English: "birthday party"}});
  dbstore.put({word: {id: "202", Korean: "돌잡이", English: "Doljabi"}});
  dbstore.put({word: {id: "203", Korean: "돕다", English: "help"}});
  dbstore.put({word: {id: "204", Korean: "동료", English: "colleague"}});
  dbstore.put({word: {id: "205", Korean: "동안", English: "during"}});
  dbstore.put({word: {id: "206", Korean: "동전", English: "coin"}});
  dbstore.put({word: {id: "207", Korean: "동주민센터", English: "east community center"}});
  dbstore.put({word: {id: "208", Korean: "동화책", English: "fairy tale book"}});
  dbstore.put({word: {id: "209", Korean: "돼지", English: "pig"}});
  dbstore.put({word: {id: "210", Korean: "돼지고기", English: "pork"}});
  dbstore.put({word: {id: "211", Korean: "된장", English: "bean paste"}});
  dbstore.put({word: {id: "212", Korean: "된장찌개", English: "bean paste stew"}});
  dbstore.put({word: {id: "213", Korean: "두부", English: "tofu"}});
  dbstore.put({word: {id: "214", Korean: "두통", English: "headache"}});
  dbstore.put({word: {id: "215", Korean: "뒤", English: "rear"}});
  dbstore.put({word: {id: "216", Korean: "드라마", English: "drama"}});
  dbstore.put({word: {id: "217", Korean: "드리다", English: "give"}});
  dbstore.put({word: {id: "218", Korean: "드시다", English: "eat"}});
  dbstore.put({word: {id: "219", Korean: "들어가다", English: "go in"}});
  dbstore.put({word: {id: "220", Korean: "등산", English: "mountain climbing"}});
  dbstore.put({word: {id: "221", Korean: "등산화", English: "hiking boots"}});
  dbstore.put({word: {id: "222", Korean: "따뜻하다", English: "warm"}});
  dbstore.put({word: {id: "223", Korean: "딸", English: "daughter"}});
  dbstore.put({word: {id: "224", Korean: "딸기", English: "strawberry"}});
  dbstore.put({word: {id: "225", Korean: "떠들다", English: "be noisy"}});
  dbstore.put({word: {id: "226", Korean: "떡국", English: "rice cake soup"}});
  dbstore.put({word: {id: "227", Korean: "떡볶이", English: "rice cake stirfry"}});
  dbstore.put({word: {id: "228", Korean: "똑똑하다", English: "smart"}});
  dbstore.put({word: {id: "229", Korean: "뚱뚱하다", English: "fat"}});
  dbstore.put({word: {id: "230", Korean: "뜨겁다", English: "hot"}});
  dbstore.put({word: {id: "231", Korean: "뜻", English: "meaning"}});
  dbstore.put({word: {id: "232", Korean: "띠", English: "zodiac sign"}});
  dbstore.put({word: {id: "233", Korean: "라면", English: "ramen"}});
  dbstore.put({word: {id: "234", Korean: "린스", English: "conditioner"}});
  dbstore.put({word: {id: "235", Korean: "마당", English: "yard (place)"}});
  dbstore.put({word: {id: "236", Korean: "마리", English: "animal (counter)"}});
  dbstore.put({word: {id: "237", Korean: "마시다", English: "drink"}});
  dbstore.put({word: {id: "238", Korean: "마트", English: "mart"}});
  dbstore.put({word: {id: "239", Korean: "만나다", English: "meet"}});
  dbstore.put({word: {id: "240", Korean: "만나서 반갑습니다", English: "nice to meet you"}});
  dbstore.put({word: {id: "241", Korean: "만지다", English: "to touch"}});
  dbstore.put({word: {id: "242", Korean: "많다", English: "to have a lot [of]"}});
  dbstore.put({word: {id: "243", Korean: "많이", English: "a lot of"}});
  dbstore.put({word: {id: "244", Korean: "말", English: "horse"}});
  dbstore.put({word: {id: "245", Korean: "맛있게 드세요", English: "bon appetit"}});
  dbstore.put({word: {id: "246", Korean: "맛있다", English: "to be delicious"}});
  dbstore.put({word: {id: "247", Korean: "맞다", English: "right"}});
  dbstore.put({word: {id: "248", Korean: "매실", English: "plum"}});
  dbstore.put({word: {id: "249", Korean: "매일", English: "everyday"}});
  dbstore.put({word: {id: "250", Korean: "맥주", English: "beer"}});
  dbstore.put({word: {id: "251", Korean: "맵다", English: "spicy"}});
  dbstore.put({word: {id: "252", Korean: "머리", English: "head"}});
  dbstore.put({word: {id: "253", Korean: "머리핀", English: "hair pin"}});
  dbstore.put({word: {id: "254", Korean: "먹다", English: "eat"}});
  dbstore.put({word: {id: "255", Korean: "먼저", English: "first"}});
  dbstore.put({word: {id: "256", Korean: "멀다", English: "to be far"}});
  dbstore.put({word: {id: "257", Korean: "멋있다", English: "to be stylish"}});
  dbstore.put({word: {id: "258", Korean: "멍이 들다", English: "get bruises"}});
  dbstore.put({word: {id: "259", Korean: "명", English: "persons"}});
  dbstore.put({word: {id: "260", Korean: "명절", English: "holiday"}});
  dbstore.put({word: {id: "261", Korean: "모과차", English: "quince tea"}});
  dbstore.put({word: {id: "262", Korean: "모두", English: "all"}});
  dbstore.put({word: {id: "263", Korean: "모레", English: "tomorrow"}});
  dbstore.put({word: {id: "264", Korean: "모르다", English: "to not know"}});
  dbstore.put({word: {id: "265", Korean: "모이다", English: "gather"}});
  dbstore.put({word: {id: "266", Korean: "모자", English: "hat"}});
  dbstore.put({word: {id: "267", Korean: "목", English: "neck"}});
  dbstore.put({word: {id: "268", Korean: "목걸이", English: "necklace"}});
  dbstore.put({word: {id: "269", Korean: "목소리", English: "voice"}});
  dbstore.put({word: {id: "270", Korean: "목요일", English: "Thursday"}});
  dbstore.put({word: {id: "271", Korean: "몸살", English: "ache"}});
  dbstore.put({word: {id: "272", Korean: "몽골", English: "Mongolia"}});
  dbstore.put({word: {id: "273", Korean: "무", English: "radish"}});
  dbstore.put({word: {id: "274", Korean: "무궁화", English: "rose of sharon"}});
  dbstore.put({word: {id: "275", Korean: "무릎", English: "knee"}});
  dbstore.put({word: {id: "276", Korean: "무리하다", English: "overwork"}});
  dbstore.put({word: {id: "277", Korean: "무슨", English: "what kind"}});
  dbstore.put({word: {id: "278", Korean: "무엇", English: "what"}});
  dbstore.put({word: {id: "279", Korean: "문", English: "door"}});
  dbstore.put({word: {id: "280", Korean: "문화", English: "culture"}});
  dbstore.put({word: {id: "281", Korean: "물", English: "water"}});
  dbstore.put({word: {id: "282", Korean: "물약", English: "liquid medicine"}});
  dbstore.put({word: {id: "283", Korean: "물파스", English: "Liquid Pas"}});
  dbstore.put({word: {id: "284", Korean: "미안합니다", English: "sorry"}});
  dbstore.put({word: {id: "285", Korean: "미역국", English: "seaweed soup"}});
  dbstore.put({word: {id: "286", Korean: "미용사", English: "hairdresser"}});
  dbstore.put({word: {id: "287", Korean: "미용실", English: "salon"}});
  dbstore.put({word: {id: "288", Korean: "바나나", English: "banana"}});
  dbstore.put({word: {id: "289", Korean: "바쁘다", English: "busy"}});
  dbstore.put({word: {id: "290", Korean: "바지", English: "pants"}});
  dbstore.put({word: {id: "291", Korean: "박물관", English: "museum"}});
  dbstore.put({word: {id: "292", Korean: "밖", English: "out"}});
  dbstore.put({word: {id: "293", Korean: "반", English: "half"}});
  dbstore.put({word: {id: "294", Korean: "반창고", English: "bandaid"}});
  dbstore.put({word: {id: "295", Korean: "받다", English: "receive"}});
  dbstore.put({word: {id: "296", Korean: "발", English: "foot"}});
  dbstore.put({word: {id: "297", Korean: "밤(과일)", English: "chestnut"}});
  dbstore.put({word: {id: "298", Korean: "밤(시간)", English: "night"}});
  dbstore.put({word: {id: "299", Korean: "밥", English: "rice"}});
  dbstore.put({word: {id: "300", Korean: "방", English: "room"}});
  dbstore.put({word: {id: "301", Korean: "방법", English: "method"}});
  dbstore.put({word: {id: "302", Korean: "배(과일)", English: "pear"}});
  dbstore.put({word: {id: "303", Korean: "배(교통수단)", English: "boat"}});
  dbstore.put({word: {id: "304", Korean: "배낭", English: "backpack"}});
  dbstore.put({word: {id: "305", Korean: "배달", English: "delivery"}});
  dbstore.put({word: {id: "306", Korean: "배달하다", English: "to deliver"}});
  dbstore.put({word: {id: "307", Korean: "배우", English: "actor"}});
  dbstore.put({word: {id: "308", Korean: "배우다", English: "to learn"}});
  dbstore.put({word: {id: "309", Korean: "배추", English: "cabbage"}});
  dbstore.put({word: {id: "310", Korean: "배탈이 나다", English: "have a stomachache"}});
  dbstore.put({word: {id: "311", Korean: "백두산", English: "Baekdu Mountain"}});
  dbstore.put({word: {id: "312", Korean: "백일", English: "one hundred days"}});
  dbstore.put({word: {id: "313", Korean: "백화점", English: "department store"}});
  dbstore.put({word: {id: "314", Korean: "밴드", English: "band"}});
  dbstore.put({word: {id: "315", Korean: "밴드를 붙이다", English: "put on a bandaid"}});
  dbstore.put({word: {id: "316", Korean: "뱀", English: "snake"}});
  dbstore.put({word: {id: "317", Korean: "버리다", English: "throw away"}});
  dbstore.put({word: {id: "318", Korean: "버섯", English: "mushroom"}});
  dbstore.put({word: {id: "319", Korean: "버스터미널", English: "bus terminal"}});
  dbstore.put({word: {id: "320", Korean: "번역가", English: "translator"}});
  dbstore.put({word: {id: "321", Korean: "벌", English: "bee"}});
  dbstore.put({word: {id: "322", Korean: "베란다", English: "veranda"}});
  dbstore.put({word: {id: "323", Korean: "베트남", English: "Vietnam"}});
  dbstore.put({word: {id: "324", Korean: "벨트", English: "belt"}});
  dbstore.put({word: {id: "325", Korean: "변기", English: "toilet"}});
  dbstore.put({word: {id: "326", Korean: "변호사", English: "lawyer"}});
  dbstore.put({word: {id: "327", Korean: "병(단위명사)", English: "bottle"}});
  dbstore.put({word: {id: "328", Korean: "병원", English: "hospital"}});
  dbstore.put({word: {id: "329", Korean: "보건소", English: "public health"}});
  dbstore.put({word: {id: "330", Korean: "보내다", English: "send"}});
  dbstore.put({word: {id: "331", Korean: "보다", English: "see"}});
  dbstore.put({word: {id: "332", Korean: "보름달", English: "full moon"}});
  dbstore.put({word: {id: "333", Korean: "보쌈", English: "bossam"}});
  dbstore.put({word: {id: "334", Korean: "보통", English: "usually"}});
  dbstore.put({word: {id: "335", Korean: "보통이다", English: "to be normal"}});
  dbstore.put({word: {id: "336", Korean: "복숭아", English: "peach"}});
  dbstore.put({word: {id: "337", Korean: "볶음밥", English: "fried rice"}});
  dbstore.put({word: {id: "338", Korean: "볼펜", English: "pen"}});
  dbstore.put({word: {id: "339", Korean: "봄", English: "spring"}});
  dbstore.put({word: {id: "340", Korean: "부러지다", English: "to break"}});
  dbstore.put({word: {id: "341", Korean: "부르다", English: "call"}});
  dbstore.put({word: {id: "342", Korean: "부모님", English: "parents"}});
  dbstore.put({word: {id: "343", Korean: "부부", English: "couple"}});
  dbstore.put({word: {id: "344", Korean: "부산", English: "Busan"}});
  dbstore.put({word: {id: "345", Korean: "부엌", English: "kitchen"}});
  dbstore.put({word: {id: "346", Korean: "부지런하다", English: "be diligent"}});
  dbstore.put({word: {id: "347", Korean: "부채춤", English: "fan dance"}});
  dbstore.put({word: {id: "348", Korean: "부츠", English: "boots"}});
  dbstore.put({word: {id: "349", Korean: "분 (시간)", English: "minute"}});
  dbstore.put({word: {id: "350", Korean: "분 (높은 말)", English: "person"}});
  dbstore.put({word: {id: "351", Korean: "분식", English: "flour-based food"}});
  dbstore.put({word: {id: "352", Korean: "분식집", English: "Korean snack stand"}});
  dbstore.put({word: {id: "353", Korean: "불고기", English: "bulgogi"}});
  dbstore.put({word: {id: "354", Korean: "불다", English: "to blow"}});
  dbstore.put({word: {id: "355", Korean: "붙이다", English: "to attach"}});
  dbstore.put({word: {id: "356", Korean: "블라우스", English: "blouse"}});
  dbstore.put({word: {id: "357", Korean: "비", English: "rain"}});
  dbstore.put({word: {id: "358", Korean: "비밀번호", English: "password"}});
  dbstore.put({word: {id: "359", Korean: "비빔밥", English: "bibimbap"}});
  dbstore.put({word: {id: "360", Korean: "비싸다", English: "expensive"}});
  dbstore.put({word: {id: "361", Korean: "비자", English: "visa"}});
  dbstore.put({word: {id: "362", Korean: "비타민", English: "vitamin"}});
  dbstore.put({word: {id: "363", Korean: "비행기", English: "airplane"}});
  dbstore.put({word: {id: "364", Korean: "빠르다", English: "fast"}});
  dbstore.put({word: {id: "365", Korean: "빨래", English: "laundry"}});
  dbstore.put({word: {id: "366", Korean: "빨리", English: "quickly"}});
  dbstore.put({word: {id: "367", Korean: "빵", English: "bread"}});
  dbstore.put({word: {id: "368", Korean: "빵집", English: "bakery"}});
  dbstore.put({word: {id: "369", Korean: "사과", English: "apple"}});
  dbstore.put({word: {id: "370", Korean: "사다", English: "buy"}});
  dbstore.put({word: {id: "371", Korean: "사람", English: "person"}});
  dbstore.put({word: {id: "372", Korean: "사랑하다", English: "love"}});
  dbstore.put({word: {id: "373", Korean: "사무실", English: "office"}});
  dbstore.put({word: {id: "374", Korean: "사업가", English: "entrepreneur"}});
  dbstore.put({word: {id: "375", Korean: "사이", English: "between"}});
  dbstore.put({word: {id: "376", Korean: "사장님", English: "boss"}});
  dbstore.put({word: {id: "377", Korean: "사전", English: "dictionary"}});
  dbstore.put({word: {id: "378", Korean: "사진", English: "photo"}});
  dbstore.put({word: {id: "379", Korean: "사진을 찍다", English: "take pictures"}});
  dbstore.put({word: {id: "380", Korean: "산부인과", English: "obstetrics & gynecology"}});
  dbstore.put({word: {id: "381", Korean: "살다", English: "live"}});
  dbstore.put({word: {id: "382", Korean: "삼겹살", English: "pork belly"}});
  dbstore.put({word: {id: "383", Korean: "삼계탕", English: "chicken and ginseng soup"}});
  dbstore.put({word: {id: "384", Korean: "삼촌", English: "uncle"}});
  dbstore.put({word: {id: "385", Korean: "상설할인매장", English: "permanent discount stores"}});
  dbstore.put({word: {id: "386", Korean: "상자", English: "box"}});
  dbstore.put({word: {id: "387", Korean: "상처", English: "wound"}});
  dbstore.put({word: {id: "388", Korean: "상추", English: "lettuce"}});
  dbstore.put({word: {id: "389", Korean: "샌들", English: "sandal"}});
  dbstore.put({word: {id: "390", Korean: "생강차", English: "ginger tea"}});
  dbstore.put({word: {id: "391", Korean: "생선", English: "fish"}});
  dbstore.put({word: {id: "392", Korean: "생신", English: "birthday"}});
  dbstore.put({word: {id: "393", Korean: "생일", English: "birthday"}});
  dbstore.put({word: {id: "394", Korean: "생활", English: "life"}});
  dbstore.put({word: {id: "395", Korean: "생활용품", English: "household goods"}});
  dbstore.put({word: {id: "396", Korean: "샤브샤브", English: "shabu"}});
  dbstore.put({word: {id: "397", Korean: "샴푸", English: "shampoo"}});
  dbstore.put({word: {id: "398", Korean: "서명", English: "signature"}});
  dbstore.put({word: {id: "399", Korean: "서울", English: "Seoul"}});
  dbstore.put({word: {id: "400", Korean: "서점", English: "bookstore"}});
  dbstore.put({word: {id: "401", Korean: "석류", English: "pomegranate"}});
  dbstore.put({word: {id: "402", Korean: "선글라스", English: "sunglasses"}});
  dbstore.put({word: {id: "403", Korean: "선물", English: "gift"}});
  dbstore.put({word: {id: "404", Korean: "선생님", English: "teacher"}});
  dbstore.put({word: {id: "405", Korean: "설날", English: "new year"}});
  dbstore.put({word: {id: "406", Korean: "설사", English: "diarrhea"}});
  dbstore.put({word: {id: "407", Korean: "설악산", English: "Mt. Seorak"}});
  dbstore.put({word: {id: "408", Korean: "성격", English: "character"}});
  dbstore.put({word: {id: "409", Korean: "성격이 좋다", English: "good nature"}});
  dbstore.put({word: {id: "410", Korean: "성명", English: "name"}});
  dbstore.put({word: {id: "411", Korean: "성묘를 하다", English: "ancestor reverence"}});
  dbstore.put({word: {id: "412", Korean: "성함", English: "name"}});
  dbstore.put({word: {id: "413", Korean: "세다", English: "count"}});
  dbstore.put({word: {id: "414", Korean: "세면대", English: "wash basin"}});
  dbstore.put({word: {id: "415", Korean: "세배를 하다", English: "bow down (for New Years)"}});
  dbstore.put({word: {id: "416", Korean: "세종대왕", English: "King Sejong"}});
  dbstore.put({word: {id: "417", Korean: "세탁기", English: "laundry machine"}});
  dbstore.put({word: {id: "418", Korean: "세탁소", English: "laundromat"}});
  dbstore.put({word: {id: "419", Korean: "센터", English: "center"}});
  dbstore.put({word: {id: "420", Korean: "셔츠", English: "shirt"}});
  dbstore.put({word: {id: "421", Korean: "소", English: "ox"}});
  dbstore.put({word: {id: "422", Korean: "소개", English: "introduce"}});
  dbstore.put({word: {id: "423", Korean: "소개하다", English: "to introduce"}});
  dbstore.put({word: {id: "424", Korean: "소독약", English: "antiseptic"}});
  dbstore.put({word: {id: "425", Korean: "소방관", English: "firefighter"}});
  dbstore.put({word: {id: "426", Korean: "소방서", English: "fire station"}});
  dbstore.put({word: {id: "427", Korean: "소원을 빌다", English: "make a wish"}});
  dbstore.put({word: {id: "428", Korean: "소파", English: "sofa"}});
  dbstore.put({word: {id: "429", Korean: "소포", English: "parcel"}});
  dbstore.put({word: {id: "430", Korean: "소화제", English: "digestive medicine"}});
  dbstore.put({word: {id: "431", Korean: "손", English: "hand"}});
  dbstore.put({word: {id: "432", Korean: "손가락", English: "finger"}});
  dbstore.put({word: {id: "433", Korean: "손님", English: "customer"}});
  dbstore.put({word: {id: "434", Korean: "송이", English: "bunch (of)"}});
  dbstore.put({word: {id: "435", Korean: "송편", English: "songpyeon (rice cake)"}});
  dbstore.put({word: {id: "436", Korean: "송편을 빚다", English: "make songpyeon"}});
  dbstore.put({word: {id: "437", Korean: "쇼핑", English: "shopping"}});
  dbstore.put({word: {id: "438", Korean: "쇼핑하다", English: "to shop"}});
  dbstore.put({word: {id: "439", Korean: "수건", English: "towel"}});
  dbstore.put({word: {id: "440", Korean: "수도", English: "capital"}});
  dbstore.put({word: {id: "441", Korean: "수령", English: "receipt"}});
  dbstore.put({word: {id: "442", Korean: "수박", English: "watermelon"}});
  dbstore.put({word: {id: "443", Korean: "수업", English: "class"}});
  dbstore.put({word: {id: "444", Korean: "수영", English: "swimming"}});
  dbstore.put({word: {id: "445", Korean: "수영장", English: "swimming pool"}});
  dbstore.put({word: {id: "446", Korean: "수요일", English: "Wednesday"}});
  dbstore.put({word: {id: "447", Korean: "수표", English: "check"}});
  dbstore.put({word: {id: "448", Korean: "숙소", English: "rooms"}});
  dbstore.put({word: {id: "449", Korean: "숙제", English: "homework"}});
  dbstore.put({word: {id: "450", Korean: "숙제하다", English: "do homework"}});
  dbstore.put({word: {id: "451", Korean: "순두부찌개", English: "tofu stew"}});
  dbstore.put({word: {id: "452", Korean: "숫자", English: "number"}});
  dbstore.put({word: {id: "453", Korean: "쉬다", English: "rest"}});
  dbstore.put({word: {id: "454", Korean: "슈퍼마켓", English: "supermarket"}});
  dbstore.put({word: {id: "455", Korean: "스웨터", English: "sweater"}});
  dbstore.put({word: {id: "456", Korean: "스카프", English: "scarf"}});
  dbstore.put({word: {id: "457", Korean: "슬리퍼", English: "slipper"}});
  dbstore.put({word: {id: "458", Korean: "시간", English: "time"}});
  dbstore.put({word: {id: "459", Korean: "시계", English: "clock"}});
  dbstore.put({word: {id: "460", Korean: "시골", English: "country"}});
  dbstore.put({word: {id: "461", Korean: "시금치", English: "spinach"}});
  dbstore.put({word: {id: "462", Korean: "시끄럽다", English: "be noisy"}});
  dbstore.put({word: {id: "463", Korean: "시원하다", English: "be cool"}});
  dbstore.put({word: {id: "464", Korean: "시작하다", English: "to start"}});
  dbstore.put({word: {id: "465", Korean: "시장", English: "market"}});
  dbstore.put({word: {id: "466", Korean: "시청", English: "city hall"}});
  dbstore.put({word: {id: "467", Korean: "시키다", English: "force somebody to do"}});
  dbstore.put({word: {id: "468", Korean: "식당", English: "restaurant"}});
  dbstore.put({word: {id: "469", Korean: "식물원", English: "botanical garden"}});
  dbstore.put({word: {id: "470", Korean: "식용유", English: "cooking oil"}});
  dbstore.put({word: {id: "471", Korean: "식탁", English: "table"}});
  dbstore.put({word: {id: "472", Korean: "식후", English: "after a meal"}});
  dbstore.put({word: {id: "473", Korean: "신문", English: "newspaper"}});
  dbstore.put({word: {id: "474", Korean: "신발", English: "shoes"}});
  dbstore.put({word: {id: "475", Korean: "신분증", English: "identification"}});
  dbstore.put({word: {id: "476", Korean: "신청서", English: "application"}});
  dbstore.put({word: {id: "477", Korean: "실례합니다", English: "excuse me"}});
  dbstore.put({word: {id: "478", Korean: "싫어하다", English: "dislike"}});
  dbstore.put({word: {id: "479", Korean: "싸다", English: "cheap"}});
  dbstore.put({word: {id: "480", Korean: "쌀국수", English: "rice noodles"}});
  dbstore.put({word: {id: "481", Korean: "씨름을 하다", English: "wrestle"}});
  dbstore.put({word: {id: "482", Korean: "씻다", English: "wash"}});
  dbstore.put({word: {id: "483", Korean: "아기를 낳다", English: "give birth"}});
  dbstore.put({word: {id: "484", Korean: "아내", English: "wife"}});
  dbstore.put({word: {id: "485", Korean: "아니에요", English: "no"}});
  dbstore.put({word: {id: "486", Korean: "아들", English: "son"}});
  dbstore.put({word: {id: "487", Korean: "아래", English: "bottom"}});
  dbstore.put({word: {id: "488", Korean: "아리랑", English: "arirang"}});
  dbstore.put({word: {id: "489", Korean: "아마", English: "maybe"}});
  dbstore.put({word: {id: "490", Korean: "아이", English: "children"}});
  dbstore.put({word: {id: "491", Korean: "아이스크림", English: "ice cream"}});
  dbstore.put({word: {id: "492", Korean: "아저씨", English: "mister"}});
  dbstore.put({word: {id: "493", Korean: "아주", English: "very"}});
  dbstore.put({word: {id: "494", Korean: "아주머니", English: "old lady"}});
  dbstore.put({word: {id: "495", Korean: "아직", English: "yet"}});
  dbstore.put({word: {id: "496", Korean: "아침", English: "morning"}});
  dbstore.put({word: {id: "497", Korean: "아파트", English: "apartment"}});
  dbstore.put({word: {id: "498", Korean: "아프다", English: "pain"}});
  dbstore.put({word: {id: "499", Korean: "안", English: "within"}});
  dbstore.put({word: {id: "500", Korean: "안경을 끼다", English: "wear glasses"}});
  dbstore.put({word: {id: "501", Korean: "안과", English: "ophthalmology"}});
  dbstore.put({word: {id: "502", Korean: "안녕?", English: "hey"}});
  dbstore.put({word: {id: "503", Korean: "안녕하세요", English: "hello"}});
  dbstore.put({word: {id: "504", Korean: "안녕히 가세요", English: "please go well"}});
  dbstore.put({word: {id: "505", Korean: "안녕히 계세요", English: "please stay well"}});
  dbstore.put({word: {id: "506", Korean: "안녕히 주무세요", English: "good night"}});
  dbstore.put({word: {id: "507", Korean: "안녕히 주무셨어요?", English: "good morning"}});
  dbstore.put({word: {id: "508", Korean: "안약을 넣다", English: "apply eye drops"}});
  dbstore.put({word: {id: "509", Korean: "앉다", English: "sit"}});
  dbstore.put({word: {id: "510", Korean: "알다", English: "know"}});
  dbstore.put({word: {id: "511", Korean: "알약", English: "pill"}});
  dbstore.put({word: {id: "512", Korean: "앞", English: "front"}});
  dbstore.put({word: {id: "513", Korean: "애국가", English: "national anthem"}});
  dbstore.put({word: {id: "514", Korean: "액세서리", English: "accessory"}});
  dbstore.put({word: {id: "515", Korean: "야구", English: "baseball"}});
  dbstore.put({word: {id: "516", Korean: "야구공", English: "a baseball"}});
  dbstore.put({word: {id: "517", Korean: "야식", English: "late night meal"}});
  dbstore.put({word: {id: "518", Korean: "약", English: "medicine"}});
  dbstore.put({word: {id: "519", Korean: "약국", English: "pharmacy"}});
  dbstore.put({word: {id: "520", Korean: "약속", English: "appointment"}});
  dbstore.put({word: {id: "521", Korean: "양", English: "sheep"}});
  dbstore.put({word: {id: "522", Korean: "양념 치킨", English: "marinated chicken"}});
  dbstore.put({word: {id: "523", Korean: "양말", English: "socks"}});
  dbstore.put({word: {id: "524", Korean: "양배추", English: "cabbage"}});
  dbstore.put({word: {id: "525", Korean: "양복", English: "suit"}});
  dbstore.put({word: {id: "526", Korean: "양식", English: "Western food"}});
  dbstore.put({word: {id: "527", Korean: "양파", English: "onion"}});
  dbstore.put({word: {id: "528", Korean: "어깨", English: "shoulder"}});
  dbstore.put({word: {id: "529", Korean: "어디", English: "where"}});
  dbstore.put({word: {id: "530", Korean: "어디에 살아요?", English: "where do you live?"}});
  dbstore.put({word: {id: "531", Korean: "어디에서 왔어요?", English: "where are you from?"}});
  dbstore.put({word: {id: "532", Korean: "어제", English: "yesterday"}});
  dbstore.put({word: {id: "533", Korean: "언니", English: "sister"}});
  dbstore.put({word: {id: "534", Korean: "언제", English: "when"}});
  dbstore.put({word: {id: "535", Korean: "얼굴", English: "face"}});
  dbstore.put({word: {id: "536", Korean: "얼마나 걸려요?", English: "how long does it take?"}});
  dbstore.put({word: {id: "537", Korean: "없다", English: "be nonexistent"}});
  dbstore.put({word: {id: "538", Korean: "에스컬레이터", English: "escalator"}});
  dbstore.put({word: {id: "539", Korean: "에어컨", English: "air conditioner"}});
  dbstore.put({word: {id: "540", Korean: "엘리베이터", English: "elevator"}});
  dbstore.put({word: {id: "541", Korean: "여권", English: "passport"}});
  dbstore.put({word: {id: "542", Korean: "여기", English: "here"}});
  dbstore.put({word: {id: "543", Korean: "여동생", English: "younger sister"}});
  dbstore.put({word: {id: "544", Korean: "여름", English: "summer"}});
  dbstore.put({word: {id: "545", Korean: "여보", English: "darling"}});
  dbstore.put({word: {id: "546", Korean: "여자", English: "woman"}});
  dbstore.put({word: {id: "547", Korean: "여행사", English: "travel agency"}});
  dbstore.put({word: {id: "548", Korean: "역", English: "station"}});
  dbstore.put({word: {id: "549", Korean: "연고", English: "ointment"}});
  dbstore.put({word: {id: "550", Korean: "연락하다", English: "contact"}});
  dbstore.put({word: {id: "551", Korean: "연세", English: "age"}});
  dbstore.put({word: {id: "552", Korean: "연장하다", English: "extend"}});
  dbstore.put({word: {id: "553", Korean: "연필", English: "pencil"}});
  dbstore.put({word: {id: "554", Korean: "연휴", English: "holidays"}});
  dbstore.put({word: {id: "555", Korean: "열", English: "ten"}});
  dbstore.put({word: {id: "556", Korean: "열다", English: "open"}});
  dbstore.put({word: {id: "557", Korean: "열쇠", English: "key"}});
  dbstore.put({word: {id: "558", Korean: "열심히", English: "hard"}});
  dbstore.put({word: {id: "559", Korean: "열이 나다", English: "have a fever"}});
  dbstore.put({word: {id: "560", Korean: "영어", English: "English"}});
  dbstore.put({word: {id: "561", Korean: "영화", English: "movie"}});
  dbstore.put({word: {id: "562", Korean: "영화관", English: "cinema"}});
  dbstore.put({word: {id: "563", Korean: "영화를 보다", English: "watch a movie"}});
  dbstore.put({word: {id: "564", Korean: "옆", English: "side"}});
  dbstore.put({word: {id: "565", Korean: "예쁘다", English: "be pretty"}});
  dbstore.put({word: {id: "566", Korean: "예약하다", English: "make a reservation"}});
  dbstore.put({word: {id: "567", Korean: "오늘", English: "today"}});
  dbstore.put({word: {id: "568", Korean: "오다", English: "come"}});
  dbstore.put({word: {id: "569", Korean: "오렌지", English: "orange"}});
  dbstore.put({word: {id: "570", Korean: "오른쪽", English: "right"}});
  dbstore.put({word: {id: "571", Korean: "오빠", English: "brother"}});
  dbstore.put({word: {id: "572", Korean: "오이", English: "cucumber"}});
  dbstore.put({word: {id: "573", Korean: "오전", English: "morning"}});
  dbstore.put({word: {id: "574", Korean: "오후", English: "afternoon"}});
  dbstore.put({word: {id: "575", Korean: "올라가다", English: "go up"}});
  dbstore.put({word: {id: "576", Korean: "올해", English: "this year"}});
  dbstore.put({word: {id: "577", Korean: "옷", English: "dress"}});
  dbstore.put({word: {id: "578", Korean: "옷장", English: "closet"}});
  dbstore.put({word: {id: "579", Korean: "외국인등록증", English: "alien registration card"}});
  dbstore.put({word: {id: "580", Korean: "외모", English: "appearance"}});
  dbstore.put({word: {id: "581", Korean: "외삼촌", English: "maternal uncle"}});
  dbstore.put({word: {id: "582", Korean: "외할머니", English: "maternal grandmother"}});
  dbstore.put({word: {id: "583", Korean: "외할아버지", English: "maternal grandfather"}});
  dbstore.put({word: {id: "584", Korean: "왼쪽", English: "left"}});
  dbstore.put({word: {id: "585", Korean: "요가", English: "yoga"}});
  dbstore.put({word: {id: "586", Korean: "요리", English: "cooking"}});
  dbstore.put({word: {id: "587", Korean: "요리사", English: "a cook"}});
  dbstore.put({word: {id: "588", Korean: "요리하다", English: "to cook"}});
  dbstore.put({word: {id: "589", Korean: "요일", English: "day of the week"}});
  dbstore.put({word: {id: "590", Korean: "요즘", English: "nowadays"}});
  dbstore.put({word: {id: "591", Korean: "욕실", English: "bathroom"}});
  dbstore.put({word: {id: "592", Korean: "욕조", English: "tub"}});
  dbstore.put({word: {id: "593", Korean: "용", English: "dragon"}});
  dbstore.put({word: {id: "594", Korean: "우리", English: "us"}});
  dbstore.put({word: {id: "595", Korean: "우산", English: "umbrella"}});
  dbstore.put({word: {id: "596", Korean: "우유", English: "milk"}});
  dbstore.put({word: {id: "597", Korean: "우체국", English: "post office"}});
  dbstore.put({word: {id: "598", Korean: "우체통", English: "mailbox"}});
  dbstore.put({word: {id: "599", Korean: "우표", English: "stamp"}});
  dbstore.put({word: {id: "600", Korean: "운동", English: "exercise"}});
  dbstore.put({word: {id: "601", Korean: "운동선수", English: "athlete"}});
  dbstore.put({word: {id: "602", Korean: "운동장", English: "playground"}});
  dbstore.put({word: {id: "603", Korean: "운동하다", English: "to exercise"}});
  dbstore.put({word: {id: "604", Korean: "운동화", English: "running shoes"}});
  dbstore.put({word: {id: "605", Korean: "운전기사", English: "chauffeur"}});
  dbstore.put({word: {id: "606", Korean: "운전면허증", English: "driver's license"}});
  dbstore.put({word: {id: "607", Korean: "울다", English: "to cry"}});
  dbstore.put({word: {id: "608", Korean: "웃다", English: "to laugh"}});
  dbstore.put({word: {id: "609", Korean: "원숭이", English: "monkey"}});
  dbstore.put({word: {id: "610", Korean: "원피스", English: "dress"}});
  dbstore.put({word: {id: "611", Korean: "월요일", English: "Monday"}});
  dbstore.put({word: {id: "612", Korean: "위", English: "top"}});
  dbstore.put({word: {id: "613", Korean: "윷놀이", English: "Korean board game"}});
  dbstore.put({word: {id: "614", Korean: "은행", English: "bank"}});
  dbstore.put({word: {id: "615", Korean: "음력", English: "lunar calendar"}});
  dbstore.put({word: {id: "616", Korean: "음식", English: "food"}});
  dbstore.put({word: {id: "617", Korean: "의료보험증", English: "health insurance"}});
  dbstore.put({word: {id: "618", Korean: "의사", English: "doctor"}});
  dbstore.put({word: {id: "619", Korean: "의자", English: "chair"}});
  dbstore.put({word: {id: "620", Korean: "이", English: "this"}});
  dbstore.put({word: {id: "621", Korean: "이렇게", English: "like this"}});
  dbstore.put({word: {id: "622", Korean: "이를 닦다", English: "brush teeth"}});
  dbstore.put({word: {id: "623", Korean: "이름", English: "name"}});
  dbstore.put({word: {id: "624", Korean: "이름이 뭐예요?", English: "what's your name?"}});
  dbstore.put({word: {id: "625", Korean: "이마", English: "forehead"}});
  dbstore.put({word: {id: "626", Korean: "이메일", English: "e-mail"}});
  dbstore.put({word: {id: "627", Korean: "이모", English: "aunt"}});
  dbstore.put({word: {id: "628", Korean: "이모티콘", English: "emoticon"}});
  dbstore.put({word: {id: "629", Korean: "이번 달", English: "this month"}});
  dbstore.put({word: {id: "630", Korean: "이번 주", English: "this week"}});
  dbstore.put({word: {id: "631", Korean: "이야기", English: "story"}});
  dbstore.put({word: {id: "632", Korean: "이쪽", English: "this way"}});
  dbstore.put({word: {id: "633", Korean: "인분", English: "serving (per person)"}});
  dbstore.put({word: {id: "634", Korean: "인사", English: "greetings"}});
  dbstore.put({word: {id: "635", Korean: "인사동", English: "Insa-dong"}});
  dbstore.put({word: {id: "636", Korean: "인삼", English: "ginseng"}});
  dbstore.put({word: {id: "637", Korean: "인터넷 쇼핑", English: "online shopping"}});
  dbstore.put({word: {id: "638", Korean: "일과", English: "daily routine"}});
  dbstore.put({word: {id: "639", Korean: "일본", English: "Japan"}});
  dbstore.put({word: {id: "640", Korean: "일식", English: "Japanese food"}});
  dbstore.put({word: {id: "641", Korean: "일어나다", English: "to rise"}});
  dbstore.put({word: {id: "642", Korean: "일요일", English: "Sunday"}});
  dbstore.put({word: {id: "643", Korean: "일찍", English: "early"}});
  dbstore.put({word: {id: "644", Korean: "일하다", English: "work"}});
  dbstore.put({word: {id: "645", Korean: "읽다", English: "read"}});
  dbstore.put({word: {id: "646", Korean: "입", English: "mouth"}});
  dbstore.put({word: {id: "647", Korean: "입학하다", English: "enter a school"}});
  dbstore.put({word: {id: "648", Korean: "있다", English: "have"}});
  dbstore.put({word: {id: "649", Korean: "자다", English: "sleep"}});
  dbstore.put({word: {id: "650", Korean: "자동차", English: "car"}});
  dbstore.put({word: {id: "651", Korean: "자장면", English: "noodles"}});
  dbstore.put({word: {id: "652", Korean: "자전거", English: "bicycle"}});
  dbstore.put({word: {id: "653", Korean: "자주", English: "often"}});
  dbstore.put({word: {id: "654", Korean: "작년", English: "last year"}});
  dbstore.put({word: {id: "655", Korean: "작다", English: "small"}});
  dbstore.put({word: {id: "656", Korean: "잔", English: "glass"}});
  dbstore.put({word: {id: "657", Korean: "잔치", English: "party"}});
  dbstore.put({word: {id: "658", Korean: "잘 먹겠습니다", English: "i will enjoy this food"}});
  dbstore.put({word: {id: "659", Korean: "잘생기다", English: "be handsome"}});
  dbstore.put({word: {id: "660", Korean: "잡채", English: "japchae"}});
  dbstore.put({word: {id: "661", Korean: "잣", English: "pine nuts"}});
  dbstore.put({word: {id: "662", Korean: "장", English: "sheet (counter)"}});
  dbstore.put({word: {id: "663", Korean: "장보기", English: "shopping"}});
  dbstore.put({word: {id: "664", Korean: "장소", English: "place"}});
  dbstore.put({word: {id: "665", Korean: "재료", English: "material"}});
  dbstore.put({word: {id: "666", Korean: "재미있다", English: "be interesting"}});
  dbstore.put({word: {id: "667", Korean: "저", English: "that"}});
  dbstore.put({word: {id: "668", Korean: "저(제)", English: "I, me, mine"}});
  dbstore.put({word: {id: "669", Korean: "저기", English: "there"}});
  dbstore.put({word: {id: "670", Korean: "저녁", English: "dinner"}});
  dbstore.put({word: {id: "671", Korean: "저쪽", English: "there"}});
  dbstore.put({word: {id: "672", Korean: "적다", English: "little"}});
  dbstore.put({word: {id: "673", Korean: "전자사전", English: "electronic dictionary"}});
  dbstore.put({word: {id: "674", Korean: "전자상가", English: "electronics store"}});
  dbstore.put({word: {id: "675", Korean: "전화", English: "telephone"}});
  dbstore.put({word: {id: "676", Korean: "전화를 걸다", English: "to call by phone"}});
  dbstore.put({word: {id: "677", Korean: "전화를 끊다", English: "hang up the phone"}});
  dbstore.put({word: {id: "678", Korean: "전화를 바꾸다", English: "put sb else on phone"}});
  dbstore.put({word: {id: "679", Korean: "전화를 받다", English: "receive a call"}});
  dbstore.put({word: {id: "680", Korean: "전화번호", English: "phone number"}});
  dbstore.put({word: {id: "681", Korean: "전화번호가 몇 번이에요?", English: "what's your phone number?"}});
  dbstore.put({word: {id: "682", Korean: "전화하다", English: "make a phone call"}});
  dbstore.put({word: {id: "683", Korean: "점심", English: "lunch"}});
  dbstore.put({word: {id: "684", Korean: "점퍼", English: "jacket"}});
  dbstore.put({word: {id: "685", Korean: "정류장", English: "station, stop"}});
  dbstore.put({word: {id: "686", Korean: "정말", English: "really"}});
  dbstore.put({word: {id: "687", Korean: "정원", English: "garden"}});
  dbstore.put({word: {id: "688", Korean: "정장", English: "formal dress"}});
  dbstore.put({word: {id: "689", Korean: "정형외과", English: "orthopedics"}});
  dbstore.put({word: {id: "690", Korean: "제목", English: "title"}});
  dbstore.put({word: {id: "691", Korean: "제주도", English: "Jeju Island"}});
  dbstore.put({word: {id: "692", Korean: "조금", English: "a little"}});
  dbstore.put({word: {id: "693", Korean: "조끼", English: "vest"}});
  dbstore.put({word: {id: "694", Korean: "조심하다", English: "be careful"}});
  dbstore.put({word: {id: "695", Korean: "조용하다", English: "be silent"}});
  dbstore.put({word: {id: "696", Korean: "족발", English: "pig's feet"}});
  dbstore.put({word: {id: "697", Korean: "좋다", English: "be good"}});
  dbstore.put({word: {id: "698", Korean: "좋아하다", English: "to like"}});
  dbstore.put({word: {id: "699", Korean: "죄송합니다", English: "sorry"}});
  dbstore.put({word: {id: "700", Korean: "주다", English: "give"}});
  dbstore.put({word: {id: "701", Korean: "주말", English: "weekend"}});
  dbstore.put({word: {id: "702", Korean: "주머니", English: "pocket"}});
  dbstore.put({word: {id: "703", Korean: "주무시다", English: "to sleep"}});
  dbstore.put({word: {id: "704", Korean: "주문", English: "order"}});
  dbstore.put({word: {id: "705", Korean: "주문하다", English: "place an order"}});
  dbstore.put({word: {id: "706", Korean: "주민등록등본", English: "copy of ID card"}});
  dbstore.put({word: {id: "707", Korean: "주민등록증", English: "ID card"}});
  dbstore.put({word: {id: "708", Korean: "주민센터", English: "community center"}});
  dbstore.put({word: {id: "709", Korean: "주방", English: "kitchen"}});
  dbstore.put({word: {id: "710", Korean: "주부", English: "housewife"}});
  dbstore.put({word: {id: "711", Korean: "주사를 맞다", English: "get a shot (med)"}});
  dbstore.put({word: {id: "712", Korean: "주스", English: "juice"}});
  dbstore.put({word: {id: "713", Korean: "주차장", English: "parking lot"}});
  dbstore.put({word: {id: "714", Korean: "주차하다", English: "to park a car"}});
  dbstore.put({word: {id: "715", Korean: "준비하다", English: "prepare"}});
  dbstore.put({word: {id: "716", Korean: "중국", English: "China"}});
  dbstore.put({word: {id: "717", Korean: "중국어", English: "Chinese"}});
  dbstore.put({word: {id: "718", Korean: "중국집", English: "Chinese restaurant"}});
  dbstore.put({word: {id: "719", Korean: "중부 지방", English: "Central Region"}});
  dbstore.put({word: {id: "720", Korean: "중식", English: "Chinese food"}});
  dbstore.put({word: {id: "721", Korean: "쥐", English: "rat"}});
  dbstore.put({word: {id: "722", Korean: "즐겁다", English: "be enjoyable"}});
  dbstore.put({word: {id: "723", Korean: "지갑", English: "wallet"}});
  dbstore.put({word: {id: "724", Korean: "지금", English: "now"}});
  dbstore.put({word: {id: "725", Korean: "지난달", English: "last month"}});
  dbstore.put({word: {id: "726", Korean: "지난주", English: "last week"}});
  dbstore.put({word: {id: "727", Korean: "지우개", English: "eraser"}});
  dbstore.put({word: {id: "728", Korean: "지폐", English: "paper money"}});
  dbstore.put({word: {id: "729", Korean: "지하", English: "underground"}});
  dbstore.put({word: {id: "730", Korean: "지하철역", English: "subway station"}});
  dbstore.put({word: {id: "731", Korean: "직업", English: "job"}});
  dbstore.put({word: {id: "732", Korean: "직원", English: "employee"}});
  dbstore.put({word: {id: "733", Korean: "진지", English: "serious"}});
  dbstore.put({word: {id: "734", Korean: "진통제", English: "painkiller"}});
  dbstore.put({word: {id: "735", Korean: "집", English: "house"}});
  dbstore.put({word: {id: "736", Korean: "집들이", English: "housewarming"}});
  dbstore.put({word: {id: "737", Korean: "집안일", English: "housework"}});
  dbstore.put({word: {id: "738", Korean: "차", English: "car"}});
  dbstore.put({word: {id: "739", Korean: "차가 막히다", English: "have a traffic jam"}});
  dbstore.put({word: {id: "740", Korean: "차례를 지내다", English: "hold ancestral rites"}});
  dbstore.put({word: {id: "741", Korean: "차이", English: "difference"}});
  dbstore.put({word: {id: "742", Korean: "착하다", English: "be kind"}});
  dbstore.put({word: {id: "743", Korean: "참외", English: "Korean melon"}});
  dbstore.put({word: {id: "744", Korean: "창고", English: "warehouse"}});
  dbstore.put({word: {id: "745", Korean: "창문", English: "window"}});
  dbstore.put({word: {id: "746", Korean: "찾다", English: "find"}});
  dbstore.put({word: {id: "747", Korean: "채소", English: "vegetable"}});
  dbstore.put({word: {id: "748", Korean: "책", English: "book"}});
  dbstore.put({word: {id: "749", Korean: "책상", English: "desk"}});
  dbstore.put({word: {id: "750", Korean: "처방전", English: "prescription"}});
  dbstore.put({word: {id: "751", Korean: "청바지", English: "blue jeans"}});
  dbstore.put({word: {id: "752", Korean: "청소", English: "cleaning"}});
  dbstore.put({word: {id: "753", Korean: "청소하다", English: "sweep"}});
  dbstore.put({word: {id: "754", Korean: "체격이 좋다", English: "good physique"}});
  dbstore.put({word: {id: "755", Korean: "초대를 받다", English: "receive an invitation"}});
  dbstore.put({word: {id: "756", Korean: "초대하다", English: "invite"}});
  dbstore.put({word: {id: "757", Korean: "초등학교", English: "elementary school"}});
  dbstore.put({word: {id: "758", Korean: "초밥", English: "sushi"}});
  dbstore.put({word: {id: "759", Korean: "추다", English: "dance"}});
  dbstore.put({word: {id: "760", Korean: "추석", English: "thanksgiving"}});
  dbstore.put({word: {id: "761", Korean: "축구", English: "football"}});
  dbstore.put({word: {id: "762", Korean: "축하", English: "celebration"}});
  dbstore.put({word: {id: "763", Korean: "축하하다", English: "celebrate"}});
  dbstore.put({word: {id: "764", Korean: "출구", English: "exit"}});
  dbstore.put({word: {id: "765", Korean: "출근하다", English: "go to work"}});
  dbstore.put({word: {id: "766", Korean: "출입국관리사무소", English: "immigration office"}});
  dbstore.put({word: {id: "767", Korean: "춤", English: "dance"}});
  dbstore.put({word: {id: "768", Korean: "춥다", English: "cold"}});
  dbstore.put({word: {id: "769", Korean: "취미", English: "hobby"}});
  dbstore.put({word: {id: "770", Korean: "층", English: "layer"}});
  dbstore.put({word: {id: "771", Korean: "치과", English: "dentist"}});
  dbstore.put({word: {id: "772", Korean: "치마", English: "skirt"}});
  dbstore.put({word: {id: "773", Korean: "치킨", English: "chicken"}});
  dbstore.put({word: {id: "774", Korean: "친구", English: "friend"}});
  dbstore.put({word: {id: "775", Korean: "친절하다", English: "kind"}});
  dbstore.put({word: {id: "776", Korean: "친척", English: "relative"}});
  dbstore.put({word: {id: "777", Korean: "칠순", English: "seventieth"}});
  dbstore.put({word: {id: "778", Korean: "칠판", English: "blackboard"}});
  dbstore.put({word: {id: "779", Korean: "침대", English: "bed"}});
  dbstore.put({word: {id: "780", Korean: "카드", English: "card"}});
  dbstore.put({word: {id: "781", Korean: "카디건", English: "cardigan"}});
  dbstore.put({word: {id: "782", Korean: "칼국수", English: "kalguksu"}});
  dbstore.put({word: {id: "783", Korean: "캄보디아", English: "cambodia"}});
  dbstore.put({word: {id: "784", Korean: "캐나다", English: "canada"}});
  dbstore.put({word: {id: "785", Korean: "커피", English: "coffee"}});
  dbstore.put({word: {id: "786", Korean: "커피숍", English: "coffee shop"}});
  dbstore.put({word: {id: "787", Korean: "컴퓨터", English: "computer"}});
  dbstore.put({word: {id: "788", Korean: "컵", English: "cup"}});
  dbstore.put({word: {id: "789", Korean: "케이크", English: "cake"}});
  dbstore.put({word: {id: "790", Korean: "켤레", English: "pair"}});
  dbstore.put({word: {id: "791", Korean: "코", English: "nose"}});
  dbstore.put({word: {id: "792", Korean: "코트", English: "coat"}});
  dbstore.put({word: {id: "793", Korean: "콜라", English: "cola"}});
  dbstore.put({word: {id: "794", Korean: "콧물", English: "snot"}});
  dbstore.put({word: {id: "795", Korean: "퀵서비스", English: "quick-service"}});
  dbstore.put({word: {id: "796", Korean: "크다", English: "big"}});
  dbstore.put({word: {id: "797", Korean: "큰아버지", English: "father's older brother"}});
  dbstore.put({word: {id: "798", Korean: "타다", English: "ride"}});
  dbstore.put({word: {id: "799", Korean: "탁자", English: "table"}});
  dbstore.put({word: {id: "800", Korean: "탕수육", English: "sweet and sour pork"}});
  dbstore.put({word: {id: "801", Korean: "태권도", English: "taekwondo"}});
  dbstore.put({word: {id: "802", Korean: "태권도장", English: "taekwondo chapter"}});
  dbstore.put({word: {id: "803", Korean: "태극기", English: "Korean flag"}});
  dbstore.put({word: {id: "804", Korean: "태어나다", English: "be born"}});
  dbstore.put({word: {id: "805", Korean: "택시", English: "taxi"}});
  dbstore.put({word: {id: "806", Korean: "텔레비전", English: "television"}});
  dbstore.put({word: {id: "807", Korean: "토끼", English: "rabbit"}});
  dbstore.put({word: {id: "808", Korean: "토마토", English: "tomato"}});
  dbstore.put({word: {id: "809", Korean: "토요일", English: "Saturday"}});
  dbstore.put({word: {id: "810", Korean: "통", English: "barrel"}});
  dbstore.put({word: {id: "811", Korean: "통역사", English: "translator"}});
  dbstore.put({word: {id: "812", Korean: "통장", English: "bank book"}});
  dbstore.put({word: {id: "813", Korean: "통통하다", English: "chubby"}});
  dbstore.put({word: {id: "814", Korean: "통화 중이다", English: "phone line is busy"}});
  dbstore.put({word: {id: "815", Korean: "퇴근하다", English: "leave the office"}});
  dbstore.put({word: {id: "816", Korean: "특히", English: "especially"}});
  dbstore.put({word: {id: "817", Korean: "틀다", English: "turn on"}});
  dbstore.put({word: {id: "818", Korean: "티셔츠", English: "t-shirt"}});
  dbstore.put({word: {id: "819", Korean: "파", English: "scallion"}});
  dbstore.put({word: {id: "820", Korean: "파란색", English: "blue"}});
  dbstore.put({word: {id: "821", Korean: "파스", English: "Pas"}});
  dbstore.put({word: {id: "822", Korean: "파티", English: "party"}});
  dbstore.put({word: {id: "823", Korean: "팔찌", English: "bracelet"}});
  dbstore.put({word: {id: "824", Korean: "팝콘", English: "popcorn"}});
  dbstore.put({word: {id: "825", Korean: "팥빙수", English: "red bean shaved ice"}});
  dbstore.put({word: {id: "826", Korean: "패션디자이너", English: "fashion designer"}});
  dbstore.put({word: {id: "827", Korean: "편리하다", English: "be convenient"}});
  dbstore.put({word: {id: "828", Korean: "편의점", English: "convenience store"}});
  dbstore.put({word: {id: "829", Korean: "편지", English: "letter"}});
  dbstore.put({word: {id: "830", Korean: "포기", English: "Chinese cabbage"}});
  dbstore.put({word: {id: "831", Korean: "포도", English: "grape"}});
  dbstore.put({word: {id: "832", Korean: "표", English: "ticket"}});
  dbstore.put({word: {id: "833", Korean: "표시하다", English: "indicate"}});
  dbstore.put({word: {id: "834", Korean: "푹", English: "well, deep, good"}});
  dbstore.put({word: {id: "835", Korean: "피가 나다", English: "blood oozes"}});
  dbstore.put({word: {id: "836", Korean: "피곤하다", English: "be tired"}});
  dbstore.put({word: {id: "837", Korean: "피다", English: "to bloom"}});
  dbstore.put({word: {id: "838", Korean: "피망", English: "bell pepper"}});
  dbstore.put({word: {id: "839", Korean: "피아노", English: "piano"}});
  dbstore.put({word: {id: "840", Korean: "피자", English: "pizza"}});
  dbstore.put({word: {id: "841", Korean: "필리핀", English: "Philippines"}});
  dbstore.put({word: {id: "842", Korean: "필통", English: "pencil case"}});
  dbstore.put({word: {id: "843", Korean: "하루", English: "one day"}});
  dbstore.put({word: {id: "844", Korean: "하루 종일", English: "all day"}});
  dbstore.put({word: {id: "845", Korean: "하지만", English: "but"}});
  dbstore.put({word: {id: "846", Korean: "학교", English: "school"}});
  dbstore.put({word: {id: "847", Korean: "학생", English: "student"}});
  dbstore.put({word: {id: "848", Korean: "학원", English: "academy"}});
  dbstore.put({word: {id: "849", Korean: "한과", English: "Korean cookie"}});
  dbstore.put({word: {id: "850", Korean: "한국", English: "Korea"}});
  dbstore.put({word: {id: "851", Korean: "한국어", English: "Korean Language"}});
  dbstore.put({word: {id: "852", Korean: "한국어를 배우다", English: "learn Korean"}});
  dbstore.put({word: {id: "853", Korean: "한국인", English: "Korean person"}});
  dbstore.put({word: {id: "854", Korean: "한글", English: "Hangul"}});
  dbstore.put({word: {id: "855", Korean: "한글날", English: "Hangul Day"}});
  dbstore.put({word: {id: "856", Korean: "한꺼번에", English: "at the same time"}});
  dbstore.put({word: {id: "857", Korean: "한라산", English: "Mt. Halla"}});
  dbstore.put({word: {id: "858", Korean: "한복", English: "traditional Korean clothing"}});
  dbstore.put({word: {id: "859", Korean: "한식", English: "Korean food"}});
  dbstore.put({word: {id: "860", Korean: "한옥", English: "Korean houses"}});
  dbstore.put({word: {id: "861", Korean: "한우", English: "Korean beef"}});
  dbstore.put({word: {id: "862", Korean: "할머니", English: "grandmother"}});
  dbstore.put({word: {id: "863", Korean: "할아버지", English: "grandfather"}});
  dbstore.put({word: {id: "864", Korean: "항공", English: "airline"}});
  dbstore.put({word: {id: "865", Korean: "항상", English: "always"}});
  dbstore.put({word: {id: "866", Korean: "햄버거", English: "hamburger"}});
  dbstore.put({word: {id: "867", Korean: "행정 구역", English: "area"}});
  dbstore.put({word: {id: "868", Korean: "헬스클럽", English: "health club"}});
  dbstore.put({word: {id: "869", Korean: "현관", English: "entrance"}});
  dbstore.put({word: {id: "870", Korean: "현금", English: "cash"}});
  dbstore.put({word: {id: "871", Korean: "형", English: "brother"}});
  dbstore.put({word: {id: "872", Korean: "호두", English: "walnut"}});
  dbstore.put({word: {id: "873", Korean: "호랑이", English: "tiger"}});
  dbstore.put({word: {id: "874", Korean: "호박", English: "pumpkin"}});
  dbstore.put({word: {id: "875", Korean: "호텔", English: "hotel"}});
  dbstore.put({word: {id: "876", Korean: "혼자", English: "alone"}});
  dbstore.put({word: {id: "877", Korean: "홈쇼핑", English: "home shopping"}});
  dbstore.put({word: {id: "878", Korean: "홍삼", English: "red ginseng"}});
  dbstore.put({word: {id: "879", Korean: "화가", English: "artist"}});
  dbstore.put({word: {id: "880", Korean: "화요일", English: "Tuesday"}});
  dbstore.put({word: {id: "881", Korean: "화장대", English: "vanity"}});
  dbstore.put({word: {id: "882", Korean: "화장실", English: "restroom"}});
  dbstore.put({word: {id: "883", Korean: "화장품", English: "cosmetics"}});
  dbstore.put({word: {id: "884", Korean: "화폐", English: "currency"}});
  dbstore.put({word: {id: "885", Korean: "환갑", English: "sixtieth birthday"}});
  dbstore.put({word: {id: "886", Korean: "회", English: "raw meat"}});
  dbstore.put({word: {id: "887", Korean: "회사", English: "company"}});
  dbstore.put({word: {id: "888", Korean: "회사원", English: "employee"}});
  dbstore.put({word: {id: "889", Korean: "회식하다", English: "company dinner"}});
  dbstore.put({word: {id: "890", Korean: "회의하다", English: "discuss"}});
  dbstore.put({word: {id: "891", Korean: "휴가", English: "vacation"}});
  dbstore.put({word: {id: "892", Korean: "휴게실", English: "rest area"}});
  dbstore.put({word: {id: "893", Korean: "휴대폰", English: "cellphone"}});
  dbstore.put({word: {id: "894", Korean: "힘들다", English: "be difficult"}});
  dbstore.put({word: {id: "895", Korean: "ATM기기", English: "ATM"}});
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
  console.log(remainingPieces);
}

/* Draw all pieces. Call when the grid is empty. */
function startNewGame(){
  // clear globals
  wordList = [];
  position = [];
  answerMap = [];
  
  let views = document.getElementsByClassName("gridpiece");
  // open db again
  request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onsuccess = function(){
    let db = this.result;
    let tx = db.transaction(DB_STORE_NAME, "readwrite");
    let store = tx.objectStore(DB_STORE_NAME);
    let index = store.index(DB_WORD_INDEX);   
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
          let eng = wordList[i].word.English;
          let kor = wordList[i].word.Korean;
          let id = wordList[i].word.id;
          let corresPos = parseInt(position[i + position.length/2]);
          document.getElementById(position[i]).innerHTML = eng;
          document.getElementById(corresPos).innerHTML = kor;
          answerMap[[eng]] = id;
          answerMap[[kor]] = id;
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
  return Object.keys(object).find(function(key) {
    return object[key] === value
  });
}