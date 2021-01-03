var motoString = "";
var saveMoto;

chrome.storage.local.get({ saveMoto: false }, 
   function(items) {
      saveMoto = items.saveMoto;
      motoString = localStorage.getItem("moto") || "";
   });

chrome.storage.local.onChanged.addListener(
   function(changes) {
      if (changes["saveMoto"]) {
         saveMoto = changes["saveMoto"].newValue;
         if (saveMoto) {
            localStorage.setItem("moto", motoString);
         } else {
            localStorage.clear();
         }
      }
   }
);

chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
      if (request.command == "getMoto") {
         sendResponse({ moto: motoString });
      } else if (request.command == "updateMoto") {
         motoString = request.moto;
         if (saveMoto) {
            localStorage.setItem("moto", motoString);
         }
      }
});
