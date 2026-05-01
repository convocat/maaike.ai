---
title: Onthaast je voice action met SSML
date: 2020-02-09
updated: 2026-03-15
maturity: complete
tags:
- conversation-design
- voice
- ssml
- prosody
- text-to-speech
- dialogflow
- human-machine-interface
themes:
- The default synthetic voice in Dutch-language voice actions is a UX problem that designers can partially solve without waiting for better platform infrastructure.
- SSML markup — especially paragraph and sentence tags — is the minimum viable intervention for making TTS output sound human and breathable.
- 'Pace and prosody are design materials: slowing down a voice action is as much a design decision as choosing words.'
- Conversation designers working within constrained voice platforms (four default voices) must rely on markup craft, not platform variety, to improve audio quality.
- Experimenting with alternative voices and SSML together represents a compounding improvement strategy, not a single silver bullet.
triples:
- [SSML, defined-as, Speech Synthesis Markup Language]
- [SSML, instance-of, Voice markup]
- [Voice action, requires, Prosody]
- [SSML, counters, Monotone synthesis]
- [Voice design, requires, SSML]
- [SSML, defined-as, markup language applied to dialogue text to control how TTS renders speech]
- [Default TTS voice, characterised-as, monotone and unnatural for Dutch-language voice actions]
- [SSML paragraph and sentence tags, leads-to, more natural sentence melody and breath pauses]
- [Voice action, lacks, natural prosody without SSML markup]
- [SSML, requires, Dialogflow or compatible voice platform]
- [Breath pause, instance-of, Prosody]
- [SSML, reinforces, Conversation design]
- [Speech rate control, instance-of, SSML]
description: Klinkt jouw Google Assistant ook zo buiten adem? SSML helpt!
pruning: This was written in the era of Dialogflow and Google Assistant. SSML is still relevant for voice interfaces, but the landscape has shifted dramatically since then. Today, I'd add a section on how LLM-based voice interfaces handle prosody differently.
draft: false
ai: 100% Maai
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

## Related

- [[quickstart-ssml-les-4-ssml-invoeren-in-dialogflow|Quickstart SSML: les 4 'SSML invoeren in Dialogflow']]
