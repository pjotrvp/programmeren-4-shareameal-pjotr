# Programmeren 4 Share-a-meal-server

Met deze server kunnen de gebruikers Inloggen en zich aanmelden voor maaltijden, na het inloggen kan de gebruiker zelf maaltijd toevoegen en zich aanmelden om deel te nemen aan andere maaltijden.

Voor het gebruik van de server zijn de volgende endpoints aanwezig.

## api/auth/login

deze endpoint word gebruikt om als gebruiker in te loggen op de server, je krijgt hier een token terug waarmee je alle functionaliteiten kunt gebruiken in de server.

## api/users

deze endpoint maakt het mogelijk gebruikers te bekijken en toe te voegen

## api/users/profile

Bekijk het profiel van de gebruiker waarmee je zelf bent ingelogd.

## api/users/:id

op de plek van het id kun je kiezen welke user je wilt wijzigen, bekijken of verwijderen.

## api/meal

met deze endpoint kan er een meal worden toegevoegd of alle meals kunnen worden bekeken

## api/meal/:mealId

met deze endpoint kan een specifieke meal worden geselecteerd, aangepast of verwijderd.
