document.addEventListener("DOMContentLoaded", function (e) {
   if (typeof chrome !== "undefined") {
      chrome.storage.local.get({ saveMoto: false }, 
         function(items) {
            document.getElementById("saveMoto").checked = items.saveMoto;
         });

      let save_cb = document.getElementById("saveMoto");
      save_cb.addEventListener("change", function (e) {
         chrome.storage.local.set({ saveMoto: e.target.checked }, () => {});
      });       
   }
});
