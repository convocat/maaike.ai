---
title: Font comparison tool
date: 2026-05-07
maturity: developing
tags: [design, typography, tools]
description: A side-by-side preview for picking a body font. Two columns, two dropdowns, identical sample text in different sans-serifs.
category: design
section: Tools
ai: co-created
---

A small standalone tool for comparing body fonts side-by-side. Live at [/font-compare.html](/font-compare.html).

## What it does

Two columns, two dropdowns. Each column renders the same sample (a short article fragment, a numerals row, a few metadata pills) in the chosen font. Headings stay Lora to match the rest of the site, so only the body typography differs between columns.

Fifteen sans-serif candidates plus eight handwriting / cursive options are loaded. Sans: Roboto, Source Sans 3, IBM Plex Sans, Lato, Atkinson Hyperlegible, Inter, Karla, Manrope, Fira Sans, Mulish, Cabin, Work Sans, DM Sans, Nunito, Rubik. Handwriting: Cedarville Cursive, La Belle Aurore, Reenie Beanie, Shadows Into Light, Mrs Saint Delafield, Caveat, Indie Flower, Architects Daughter. All Google Fonts.

## Why a comparison view

Single-font previews are easy to misjudge. Two fonts side by side, on the same words, expose differences that are otherwise too subtle to register: how an `g` is shaped, where the `e` aperture closes, how comfortable italics feel, whether numerals have lining or oldstyle figures.

Numerals get their own row deliberately, since most candidate fonts shift personality between letters and digits.

## Companion tool

For looking at one font at a time on the actual site (rendered through the production layout in an iframe), use [/font-preview.html](/font-preview.html).

## Caveat

Both pages live in `public/` as static HTML, they aren't part of Astro's build. They load Google Fonts directly. Useful for design exploration; not a production system.
