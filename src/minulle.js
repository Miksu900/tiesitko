(function () {
  var chips = document.querySelectorAll("#sit .chip"), items = document.querySelectorAll("#mlista .cardli"), n = document.getElementById("mmaara");
  var sel = TK.get("tk-sit", []);
  function apply() {
    var c = 0;
    [].forEach.call(items, function (li) {
      var t = li.getAttribute("data-tags").split(" "), show = sel.length && sel.some(function (s) { return t.indexOf(s) >= 0; });
      li.hidden = !show; if (show) c++;
    });
    [].forEach.call(chips, function (b) { b.setAttribute("aria-pressed", sel.indexOf(b.dataset.s) >= 0 ? "true" : "false"); });
    n.textContent = sel.length ? c + " aihetta sopii tilanteeseesi" : "Valitse yksi tai useampi tilanne, niin näet siihen sopivat aiheet.";
  }
  [].forEach.call(chips, function (b) {
    b.onclick = function () { var i = sel.indexOf(b.dataset.s); if (i < 0) sel.push(b.dataset.s); else sel.splice(i, 1); TK.put("tk-sit", sel); apply(); };
  });
  apply();
})();
