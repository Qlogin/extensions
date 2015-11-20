function on_fill_form(email, password) {
   var pwd = $("input[type='password']").filter(":visible");
   if (pwd.length == 1) {
      pwd.val(password);
      var user = $("input[name='username']").filter(":visible");
      user.val(email);
   }
}

self.port.on("fill-form", on_fill_form);
