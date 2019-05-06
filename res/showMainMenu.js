var DB_STORE_NAME = "";
var DB_STORE_INDEX = "";

function showMainMenu(display){
  //create main menu buttons
  for (let i = 0; i < DICTIONARIES.length; i++){
    let menuButton = document.createElement("div");
    menuButton.id = i;
    menuButton.className = "menubutton"
    menuButton.fontFamily = "Gaegu";
    menuButton.innerHTML = DICTIONARIES[i];
    
    // animation of clicks
    menuButton.addEventListener("click", function(){
      menuButton.style.borderStyle = "inset";

      DB_STORE_NAME = menuButton.innerHTML.replace(/\s/g, '');
      DB_STORE_INDEX = DB_STORE_NAME + "Index";

      removeMenu();
      initialGame = false;
      startNewGame(DB_STORE_NAME, DB_STORE_INDEX);
    });
    display.appendChild(menuButton);
  }

}

/* Animate main menu pieces*/
function removeMenu(){
  let menuButtons = document.getElementsByClassName("menubutton");
  var keyframes = [
    { backgroundColor: "#CCFFCC"},
    { backgroundColor: "#00FF33"},
  ];
  for (let menuButton of menuButtons){
    menuButton.animate(keyframes, 500);
    setTimeout(function(){
      menuButton.parentNode.removeChild(menuButton);
    }, 200);
  };
}

function selectedStoreName(storeName){
  console.log(storeName);
  return storeName;
}