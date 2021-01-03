function on_fill_form(username, password) {
   var pwd = $("input[type='password']").filter(":visible");
   if (pwd.length == 0)
      return;

   var form = pwd.get(0).form;
   pwd.each(function(){
       if (this.form != form)
         form = null;
   });
   if (!form)
      return;

   pwd.val(password);

   var selector = "input[name='username'],input[name='login']";
   if (username.indexOf('@') != -1)
      selector += ",input[name='email']";

   var user = $(form).find(selector).filter(":visible");
   user.each(function() {
      if ($(this).val() == "")
         $(this).val(username);
   });
}

function get_user() {
   var pwd = $("input[type='password']").filter(":visible");
   if (pwd.length == 0)
      return '';

   var form = pwd.get(0).form;
   pwd.each(function(){
       if (this.form != form)
         form = null;
   });
   if (!form)
      return '';

   var selector = "input[name='username'],input[name='email'],input[name='login']";
   var user = $(form).find(selector).filter(":visible");
   if (user.length == 0)
      return '';

   return user.val();
}

chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
      console.log('Receive ' + request.command);
      if (request.command == "checkScript") {
         sendResponse({ status: "ok" });
      }
});

chrome.runtime.onConnect.addListener(function(port) {
   if (port.name == "popup") {
      console.log('Port connected!');
      port.onMessage.addListener(function(msg) {
         if (msg.commang == "getUser") {
            port.postMessage({ 
               command: "setUser",
               user: get_user()
            });
         } else if (msg.command == "fillForm") {
            on_fill_form(msg.user, msg.password);
         }
      });
   }
});

console.log('Script injected!');
