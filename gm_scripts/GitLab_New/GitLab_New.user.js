// ==UserScript==
// @name        GitLab New
// @namespace   Qlogin
// @description Gitlab New UI
// @include     http://git/*
// @include     http://git.int.kronshtadt.ru/*
// @version     1
// @grant       none
// ==/UserScript==

var svg = document.querySelector('.header-logo a#logo svg');
if (svg) {
  var parent = svg.parentElement;
  parent.removeChild(svg)
}

var nav = document.querySelector('.global-dropdown-menu ul')
if (nav) {
   var xhr = new XMLHttpRequest();
   xhr.onload = function() {
      let separator = document.createElement('li');
      separator.className = 'divider';
      nav.insertBefore(separator, nav.children[1]);

      var projects = this.responseXML.querySelectorAll('.project-row')
      for (var i in projects) {
         let proj = projects[i];
         let link = proj.getElementsByTagName('a')[0];
         let new_proj = proj.cloneNode(false);
         if (document.location.href.startsWith(link.href)) {
            new_proj.classList.add('active');
         }

         let new_link = document.createElement('a');
         new_link.href = link.href;
         new_link.appendChild(proj.getElementsByClassName('namespace-name')[0]);
         new_link.appendChild(proj.getElementsByClassName('project-name')[0]);

         let avatar = proj.getElementsByClassName('project-avatar')[0];
         avatar.className = 'avatar project-avatar s24';

         new_proj.appendChild(avatar);
         new_proj.appendChild(new_link);
         nav.insertBefore(new_proj, separator);
      }
   }
   xhr.open("GET", "/dashboard/projects/starred");
   xhr.responseType = "document";
   xhr.send();
}

var commits_list = document.getElementById('commits-list');
if (commits_list) {
   var regex = /(.*) (\d+ commits?)/;
   var split_procedure = function(node) {
      let res = regex.exec(node.textContent);
      if (res && res.length == 3) {
         node.textContent = res[1];
         let count = document.createElement('span');
         count.textContent = res[2];
         node.appendChild(count);
      }
   };
   document.querySelectorAll('li.commit-header').forEach(split_procedure);

   var observer = new MutationObserver(function(mutations) {
       mutations.forEach(function(mutation) {
           for (var i = 0; i < mutation.addedNodes.length; i++) {
               let new_node = mutation.addedNodes[i];
               if (new_node.className == 'commit-header') {
                  split_procedure(new_node);
               }
           }
       });
   });
   observer.observe(commits_list, { childList: true });
}