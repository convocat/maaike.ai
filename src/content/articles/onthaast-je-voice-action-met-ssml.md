---
title: Onthaast je voice action met SSML
date: 2020-02-09
maturity: complete
tags:
  - conversation-design
description: Klinkt jouw Google Assistant ook zo buiten adem? SSML helpt!
pruning: "This was written in the era of Dialogflow and Google Assistant. SSML is still relevant for voice interfaces, but the landscape has shifted dramatically since then. Today, I'd add a section on how LLM-based voice interfaces handle prosody differently."
draft: false
---

*(Dit artikel publiceerde ik in juni 2019 op LinkedIn)*

KLM Bluebot, Billie van Bol.com, Appie van Albert Heijn, Buienradar, de Voice action van Schiphol, Mijn vader ik ben er ook nog van Ben…het merendeel van de Nederlandstalige Google voice actions maakt gebruik van de-zelf-de-mo-no-to-ne-vrou-wen-stem-die-niet-zo-makkelijk-te-volgen-is.

Oké, met maar vier standaard stemmen tot je beschikking in Dialogflow heb je als conversational designer niet bijster veel keus in hoe je voice klinkt. Maar één ding kun je wel: je voice action onthaasten.

Luister maar eens naar deze twee voorbeelden.

Voorbeeld 1 klinkt als een hele lange zin waar maar geen eind aan lijkt te komen. Voorbeeld 2 daarentegen klinkt al een stuk rustiger en natuurlijker.

## Adempauze

Het geheim achter voorbeeld 2: Speech Synthesis Markup Language, ofwel SSML. Met SSML kun je je dialoogtekst voorzien van markup die wordt toegepast op het moment dat jouw geschreven tekst wordt omgezet naar spraak. Daarmee heb je net wat meer controle over hoe je dialoog gaat klinken.

De structuur van SSML is relatief eenvoudig: je start je SSML met `<speak>` en je markeert je tekst met alinea's (tag `<p>`) die vervolgens weer één of meerdere zinnen (tag `<s>`) kunnen bevatten. Deze markeringen zorgen voor een meer natuurlijke zinsmelodie en voor de nodige adempauzes na iedere zin en alinea.

## Experimenteren

Naast deze markup kun je ook nog experimenteren met kleine pauzes, het versnellen of vertragen van je spreektempo, en de toonhoogte van je voice. De beschikbare markup voor Google assistant vind je [hier](https://developers.google.com/assistant/conversational/ssml). En voor Alexa staat 'ie [hier](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html).

Mocht je nog een stapje verder willen gaan, probeer dan vooral de andere Nederlandstalige stemmen uit die Google aanbiedt.

In dit voorbeeld heb ik Female 2 gebruikt, ook weer voorzien van SSML.

Niet slecht, toch? :-)
