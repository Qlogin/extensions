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

function on_get_user() {
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

   var selector = "input[name='username'],input[name='email'],input[name='login']";
   var user = $(form).find(selector).filter(":visible");
   if (user.length == 0)
      return;

   self.port.emit("set-user", user.val());
}

self.port.on("fill-form", on_fill_form);
self.port.on("get-user", on_get_user);
