sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'fiorielements/bookstockcontrol/test/integration/FirstJourney',
		'fiorielements/bookstockcontrol/test/integration/pages/BooksList',
		'fiorielements/bookstockcontrol/test/integration/pages/BooksObjectPage'
    ],
    function(JourneyRunner, opaJourney, BooksList, BooksObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('fiorielements/bookstockcontrol') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBooksList: BooksList,
					onTheBooksObjectPage: BooksObjectPage
                }
            },
            opaJourney.run
        );
    }
);