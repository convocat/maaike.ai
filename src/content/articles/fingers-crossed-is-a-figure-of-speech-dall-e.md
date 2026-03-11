---
title: "Fingers crossed is a figure of speech, DALL-E!"
date: 2023-11-04
maturity: complete
tags:
  - prompt-design
  - ai-ethics
description: DALL-E 3 is still digitally challenged.
draft: false
ai: "100% Maai"
---

With the introduction of DALL-E 3 in the ChatGPT, hopes were high. This most capable image generation engine to date would be able to create reliable, accurate and crisp images that are not only more visually striking but also crisper in detail. It was supposed to reliably render intricate details, including text, hands, and faces.

The New York Times also reported that DALL-E 3 can produce more convincing images than previous versions of the technology, showing a particular knack for images containing letters, numbers, and human hands.

I'm preparing a workshop where I want to show how far image generation has advanced since the early days, so naturally, hands were high on my DALL-E 3 example list. Oh boy.

## Prompt: ultrarealistic photograph of a pair of folded hands

What's good to realise, is that DALL-E 3 takes the original prompt and augments it. It basically rewrites my prompt, adding adjectives, extra instructions and more. This results in a very pretty picture, but also introduces the risk of completely missing the point, and, quite often, propagating bias (more on that in [[de-biassing-dall-e]]).

**DALL-E 3's augmented prompt:** *An ultra-realistic photograph of a pair of folded hands, showcasing the intricate details of the skin, nails, and wrinkles. The lighting should highlight the contours and textures of the hands, giving it a lifelike appearance.*

As you can see, this was absolutely not what I asked for. And the anatomy is…interesting, to say the least. Time for another shot.

## Prompt: a photo of a pair of folded hands

This time, the number of fingers is correct! The distribution is a bit outside the bell-curve for normal human hands. And the style doesn't resemble a photo at all.

**DALL-E's augmented prompt:** *A photo-like depiction of a pair of folded hands, capturing the natural positioning and nuances of the hands. The image should have a realistic appearance reminiscent of a photograph, with accurate lighting and shadows.*

Speaking of photography, I am a photographer myself, so why not instruct it with some manual settings. Ha. Ha.

## Prompt: Try again, this time make it photorealistic, iso 200, f 5.6, kodak chroma

**DALL-E 3's augmented prompt:** *A photorealistic image of a pair of folded hands, captured with settings similar to ISO 200, f/5.6. The image should evoke the look and feel of a photograph taken with Kodak Chroma film, showcasing the unique color tones and grains associated with that film type.*

Amazing! This is it! Oh…wait…what's that…I mean…have a look at that middle finger in the left hand image. How?

But nevertheless, this was by far the best image of this run, so I thought I'd ask to ditch the text info in the images. At this point, it's good to note that DALL-E doesn't have a context for images. All these tasks are 1-shot prompt-completion tasks. So there's no reliable way to reuse an image as a basis for a next prompt (I tried seed numbers, but not with a lot of success). So I kind of expected the next image to be slightly different. But not this different…

## Prompt: again, but leave out the exif information

**DALL-E 3's augmented prompt:** *A photorealistic image of a pair of folded hands, reminiscent of a photograph taken with Kodak Chroma film. The image should highlight the unique color tones, grains, and textures associated with that film type without referencing any specific camera settings.*

At this point, I seriously started doubting whether there was some kind of regression in the model itself. I mean, how could it get this far besides the point? It's quite frustrating that I can't really tweak the detailed parameters, like in Midjourney. So the outcome of each round is basically a big guess.

## Anatomically correct…Seriously?

I got a bit frustrated at this point, so I prompted: *a photorealistic and anatomically correct image of a pair of folded hands, reminiscent of a photograph taken with Kodak Chroma film.*

No words at this point.

## Appeal to emotions

From here onwards, I tried a slightly different approach, one that came quite naturally. *Forget everything, can you just give a normal image of 2 hands? It's really important to get it right this time. PLEASE???*

And sure enough, I finally got something that looked slightly normal. Until I counted the fingers…sigh.

The appeal to emotions is a well-known rethorical device to persuade people to your point of view. Recent research has shown that LLMs, too, can be influenced this way, something that I find fascinating and worrying at the same time. Because let's face it: there's a thin line between urging someone to do something better for your sake, and manipulation, or even worse, abuse. Shouting at an LLM to improve your results? Don't know if that's the interaction model we want to reinforce on humanity. Source: [Large Language Models Understand and Can be Enhanced by Emotional Stimuli](https://arxiv.org/pdf/2307.11760.pdf)

## More emotions

OK, I'm not really proud of myself for my next prompt, but honestly, I was getting a bit fed-up at this point. So here's what I prompted: *Can you make another normal image of 2 hands, this time getting THE NUMBER OF FINGERS RIGHT???? For crying out loud, we all know that hands have four fingers and one thumb, what's bothering you.*

To which DALL-E 3 responded with a creepy pair of hands.

Game on, Dalle. Game on. *"Seriously, what's wrong with you. Just a photograph of two human hands. That look like a human took the picture."*

Finally! Two hands! 8 fingers! Two thumbs!

## That one, tiny, final touch

Just one thing I wanted to change at this point. I wanted a color image. Easy, right? (I know, I should have used the seed number, the unique ID that's generated for each image, but I forgot to ask for it). *That's much better, now make them color instead of black and white.*

With the finish line in sight, I headed for the kitchen to make a cup of tea. And when I came back…

*Twee linkerhanden.*

I give up.
