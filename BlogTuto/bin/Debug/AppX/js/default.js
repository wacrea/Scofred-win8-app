// Pour obtenir une présentation du modèle Navigation, consultez la documentation suivante :
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    var articlesList = new WinJS.Binding.List();
    var publicArticles = { ItemList: articlesList };
    WinJS.Namespace.define("Articles", publicArticles);

    var appData = Windows.Storage.ApplicationData.current;
    var localFolder = appData.LocalFolder;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: cette application vient d'être lancée. Initialisez
                // votre application ici.
            } else {
                // TODO: cette application a été réactivée après avoir été suspendue.
                // Restaurez l'état de l'application ici.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                downloadArticles(); //On lance le téléchargement du flux RSS
                document.getElementById('cmd').addEventListener('click', downloadArticles);
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: cette application est sur le point d'être suspendue. Enregistrez tout état
        // devant être conservé lors des suspensions ici. Si vous devez 
        // effectuer une opération asynchrone avant la suspension de 
        // l'application, appelez args.setPromise().
        app.sessionState.history = nav.history;
    };

    //Fonction de téléchargement du flux RSS
    function downloadArticles() {

        WinJS.Application.local.readText("rss.db", "[]").done(function (listeTemp) {
            listeTemp = JSON.parse(listeTemp);
            for (var i = 0; i < listeTemp.length; i++) {
                articlesList.push(listeTemp[i]);
            }

            try {
                WinJS.xhr({ url: "http://scofred.com/feed" }).done(

                    function completed(rss) {

                        while (articlesList.length) {
                            articlesList.pop();
                        }

                        document.getElementById('chargement').style.display = 'none';
                        var items = rss.responseXML.querySelectorAll("item");
                        var tempItems = [];

                        for (var n = 0; n < items.length; n++) {
                            var article = {};
                            article.title = items[n].querySelector("title").textContent;
                            var thumbs = items[n].querySelectorAll("thumbnail");
                            var imgs = items[n].textContent.match(/http:\/\/\S+?\.(?:gif|png|jpe?g)/i);

                            if (thumbs.length > 1) {
                                article.thumbnail = thumbs[1].attributes.getNamedItem("url").textContent;
                            } else if (imgs) {
                                article.thumbnail = imgs[0];
                            } else {
                                article.thumbnail = "./images/logotiles.png";
                            }

                            //article.content = toStaticHTML(items[n].textContent);
                            article.content = toStaticHTML(items[n].querySelector("description").textContent);
                            tempItems.push(article);
                            articlesList.push(article);
                        }

                        WinJS.Application.local.writeText("rss.db", JSON.stringify(tempItems));
                    },
                    function error(request) {
                        document.getElementById('chargement').innerHTML = '';
                    },
                    function progress(request) {
                        document.getElementById('chargement').style.display = 'block';
                    }
                );
            } catch (e) {
            }
        });
    }

    //document.getElementById('cmd').addEventListener('click', downloadArticles);

    function onCommandsRequested(eventArgs) {
        var settingsCommand = new Windows.UI.ApplicationSettings.SettingsCommand("preference", "Politique de confidentialité", function () {
            var uri = new Windows.Foundation.Uri("http://ma.ms.giz.fr/?name=Mon+Blog");
            Windows.System.Launcher.launchUriAsync(uri);
        });
        eventArgs.request.applicationCommands.append(settingsCommand);
    }
    var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
    settingsPane.addEventListener("commandsrequested", onCommandsRequested);

    app.start();
})();
