(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // Cette fonction est appelée chaque fois qu'un utilisateur accède à cette page. Elle
        // remplit les éléments de la page avec les données d'application.
        ready: function (element, options) {
            // TODO: initialisez la page ici.
            listeArticles.addEventListener('iteminvoked', function (e) {
                WinJS.Navigation.navigate('/pages/article/article.html', { index: e.detail.itemIndex });
            });
        }
    });
})();
