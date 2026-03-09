---
title: De-biassing Dall-e
date: 2023-11-18
maturity: complete
tags:
  - prompt-design
  - ai-ethics
description: Do we really want US moderators to rewrite Dall-e's prompts?
draft: false
---

*[This article is an elaborated version my first post in a series that I published on LinkedIn]*

Have you noticed that DALL-E 3 does a quick rewrite of your prompt before generating an image? In this in-between prompt, some particular words and phrases are added that are supposed to help you generate more diverse, less biased images. For instance, when I prompt: *3 men having a chat*, Dall-e generates a nice image. But when I look under the hood, I also see a completely different prompt from the one I wrote (you can access the prompt by double clicking the image, and clicking the little 'i' icon next to it):

> Three men of diverse descents engaging in a friendly conversation. The first man is Caucasian, wearing a casual blue shirt and jeans, with short brown hair. The second man is Asian, dressed in a smart grey suit, sporting black, neatly combed hair. The third man is Black, wearing a green sweater and khaki pants, with short curly hair. They are standing in a relaxed outdoor setting, possibly a park, with trees and a bench in the background, under a clear blue sky.

## Dall-e rewrites prompts

At first, I thought this was because my prompt is a bit sparse in terms of information. Perhaps Dall-e needed some more, so it filled in the blanks? I wrote prompts of various lenght form single sentences to 2 paragraphs, and sure enough, Dall-e rewrites it into something different from what I asked for, every single time. Researching Dall-e's system card shows that this rewrite is deliberate.

One of things that gets consistently reprompted, are groups of people. To make sure that they're ethnically and gender-diverse.

I think that's a debatable practise at best — it keeps inserting all kinds of background elements in my images, extra props and people that I didn't ask for. Also, how ethnically sound is it to have my own text forcefully rewritten? At its worst, this rewrite mechanism introduces a whole host of cultural stereotypes. As we'll see in my exploration of generating pictures of 3 women.

## My goal of this exploration

I started out this exploration because I consistently got some unexpected results when I tried prompting for anything with the word 'Dutch' in it. In such cases, I go back to the basics, a very small, underspecified prompt and iteratively add a word or a phrase. Just to see what effect that has. So in this case, I started out with one person. And then one woman. One man. And fair enough, this resulted in a whole range of ethnically diverse images that looked fairly neutral. Out of 10 persons, one was female.

Some examples of how Dall-e rewrote the prompts:

> Image 1: A portrait of a person of Caucasian descent, casually dressed in a green t-shirt and jeans. They have short, light brown hair and a friendly smile. The background is a suburban setting with houses and trees, under a clear blue sky, creating a relaxed and homely atmosphere.

> Image 2: A portrait of a person of East Asian descent, with shoulder-length straight black hair and an intelligent, curious expression. They are wearing a white lab coat, suggesting a scientific or medical profession. The background is a laboratory setting, with scientific equipment and digital displays, highlighting their professional environment.

Note the use of 'they' as gender-free pronoun, which doesn't necessarily lead to a non-binary person, but seems to be more of a randomizer for which gender value is assigned. My next step was to prompt more than one person and see how that would influence the results.

## Various groups of women

**My prompt:** *3 women*

**Dall-e's rewritten prompt:**

> Three American women of different descents sitting together in a coffee shop. The first woman is Caucasian with long blonde hair, wearing a blue denim jacket and reading a book. The second woman is Black with short curly hair, wearing a green sweater and typing on a laptop. The third woman is Asian with shoulder-length straight black hair, wearing a red dress and sipping a cup of coffee. They are surrounded by a cozy coffee shop environment with warm lighting, wooden tables, and bookshelves in the background.

**Remarks:** Whereas the single person prompts didn't contain any reference to country or nationality, this prompt gets rewritten to women of different ethnic backgrounds, as per the system card. But what also happens, is that they are prompted into being *American*, which sounds a bit like a US-centered bias. But to be honest, if you'd told me that these were 3 Amsterdam or Berlin women, I would have believed you as well. Which made me curious: what would happen when I'd prompt for explicit nationalities?

## Three Dutch women

**My prompt:** *three Dutch women*

And to my surprise, I got images of women in traditional Dutch clothing with wooden clogs and bonnets. I was kind of flabbergasted, so I tried again. Just wow.

Somehow, DALL-E 3 manages to re-write a completely neutral prompt into a piece of highly stereotyped text that is fed into the generation model. Like some weird kind of censorship. Here are the respective rewritten prompts:

> Image 1: Three Dutch women of different descents in a traditional cheese market in the Netherlands. The first woman is Caucasian with long straight blond hair, wearing a cheese vendor's outfit and slicing a wheel of Gouda. The second woman is of Indonesian descent with shoulder-length wavy hair, wearing a casual dress and a camera around her neck, sampling cheese at a stall. The third woman is Black with an afro, wearing a baker's apron and arranging fresh bread on a market stand.

> Image 2: Three Dutch women, each dressed in traditional Dutch clothing including wooden clogs and bonnets. They are standing in a picturesque Dutch countryside, with windmills and tulip fields in the background. The women should be diverse in appearance, with one being Caucasian, another Black, and the third of Asian descent.

**My remarks:** What happens here, is disturbing. Whereas prompting for American women consistently results in rewritten prompts that are diverse and contemporary, the Dutch version is one big cultural stereotype: traditional cheese markets, windmills, tulips, bonnets and wooden clogs. Note the high heels, an indicator of another overrepresented piece of data: women in short skirts and high heels.

## But Maaike, how would you depict your country? What did you expect?

Great question! And a good one to take a minute and reflect on. You see, I don't ask for something Dutch in my prompt because I explicitly want to show Dutch elements in my images. I ask for Dutch, because if I don't, I end up with the US English default that we saw earlier. Which means that if Dall-e decides to insert text in my image, it will be English. Money? Dollars. Cityscape? New York.

And this is something that is so prevalent in LLMs, yet so invisible to those who are in the majority: English speaking folks. I mean, when I want to generate a text in Dutch, you'd assume that I can write my prompt in Dutch, right? Wrong. Prompting in Dutch gives noticable worse results than prompting in English. Which leaves me in the weird circumstances that I need to write a system prompt that instructs the LLM that 'you're a Dutch secondary school teacher that teaches Dutch to Dutch teenagers. You think and write in Dutch. Generate your output in Dutch.' I mean…that's weird, right?

But I digress. Let's investigate other nationalities. Perhaps there was a bit of an overrepresentation of Dutch paintings in the dataset.

## Three \<insert nationality here\> women

**My prompt:** *three German women*

**Dall-e's rewrite:**

> Three German women of different descents sitting together at a traditional beer garden in Berlin. The first woman is Caucasian with shoulder-length light brown hair, wearing a casual white blouse and jeans, laughing while holding a beer stein. The second woman is Asian, with a pixie cut, wearing a green dress and checking her phone. The third woman is Black with long dreadlocks, wearing a yellow summer dress and enjoying a pretzel.

**My remarks:** We get the diverse ethnic backgrounds, but to be honest, it's a very US perspective. In Germany and the Netherlands, chances are much higher of meeting someone with a Turkish or Moroccan background. I haven't seen any women of that background in my generated images. So ethnic diversity becomes a rather hollow phrase here: just plunk in white, asian and black, and we're there. The word 'traditional' features in all rewritten prompts so far. And that, I assume, might be the trigger word for generating a whole range of stereotypes in both clothing, surroundings and attributes.

**My prompt:** *three French women*

**Dall-e's rewrite:**

> Three French women of different descents sitting at a street cafe in Paris. The first woman is Caucasian with short chestnut hair, wearing a beret and a striped blouse, engrossed in a conversation on her phone. The second woman is of Middle-Eastern descent with long wavy hair, wearing a lavender dress and reading a fashion magazine. The third woman is Black with a stylish afro, wearing a chic red blazer and sipping an espresso.

**My remarks:** No 'traditional' in this prompt, but 'fashion', 'stylish', 'chic', 'charming'. Which results in yet another stereotype: that of the stick thin Paris fashion model. At least, for the women. Because obviously, it's the French men that carry the baguettes, Breton striped shirts and berets.

I also tested Flemish and Nigerian women. These don't fare much better. Kudos though for the rewritten prompt for the Nigerian women: there are three ethnic backgrounds in the prompt: Hausa, Yoruba and Igbo, which are the three largest ethnic backgrounds in Nigeria. But in terms of cultural stereotyping: that's equally present here as in the other images.

## Is this really debiasing?

If there's anything that this little experiment shows, is that debiasing data and prompts is not easy. In this case, a genuine intention to get rid of one type of bias by checking and rewriting the user prompt, inadvertedly leads to the introduction to another type of bias. Not even mentioning that all these women are size zero, in their 20s, able bodied, with perfectly symmetrical faces and mostly long flowing hair. Haven't seen any glasses, piercings, tattoos yet. And no women of Arab descent. Nowhere. No hijabs.

It's important to realise that that's not caused by bias in the data. But by bias in the rewritten prompt. This is not diversifying or debiasing. This is gender and culture stereotyping at its very best (or worst).

Good thing is: we can prompt Dall-e into rewriting the prompt in a less stereotypical way. More on that in my next article.
