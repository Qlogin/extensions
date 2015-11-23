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

   var selector = "input[name='username']";
   if (username.contains('@'))
      selector += ",input[name='email']";

   var user = $(form).find(selector).filter(":visible");
   user.each(function() {
      $(this).val(username);
   });
}

self.port.on("fill-form", on_fill_form);
