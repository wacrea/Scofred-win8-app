(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/article/article.html", {
        // Cette fonction est appelée chaque fois qu'un utilisateur accède à cette page. Elle
        // remplit les éléments de la page avec les données d'application.
        ready: function (element, options) {
            // TODO: initialisez la page ici.
            var flipView = document.getElementById('fullFlip').winControl;
            WinJS.UI.setOptions(flipView, {
                currentPage: WinJS.Navigation.state.index
            });

        }
    });

    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
    dataTransferManager.addEventListener("datarequested", function (e) {
        var request = e.request;
        var current = document.getElementById('fullFlip').winControl.currentPage;
        request.data.properties.title = Articles.ItemList.getAt(current).title;
        request.data.setHtmlFormat(Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(Articles.ItemList.getAt(current).content));
        request.data.properties.description = "Partage de l'article";
    });
})();
