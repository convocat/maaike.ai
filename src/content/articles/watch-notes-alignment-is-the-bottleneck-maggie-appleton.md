---
title: "Watch notes: Alignment is the bottleneck, by Maggie Appleton"
description: "Watching Maggie Appleton's GitHub Universe talk on agent collaboration. Running notes on alignment as the new bottleneck, the ACE environment, conversations under the hood, and a comparison with Engelbart's NIC."
date: 2026-05-17
maturity: draft
draft: false
ai: co-created
develops: conference-talk-guildford
tags: [maggie-appleton, ace-agent-collaboration-environment, alignment-bottleneck, coordination-debt, multi-agent-collaboration, agent-collaboration, agentic-ai, networked-improvement-community, proof-layer, douglas-engelbart, c-activity, collective-capability, digital-gardens, github-universe]
triples:
- ["Alignment bottleneck", "theorised-by", "Maggie Appleton"]
- ["Multi-agent collaboration", "leads-to", "Alignment bottleneck"]
- ["ACE (Agent Collaboration Environment)", "demonstrates", "Alignment bottleneck"]
- ["ACE (Agent Collaboration Environment)", "structured-as", "Networked Improvement Community"]
- ["Coordination debt", "caused-by", "Alignment bottleneck"]
- ["Proof layer", "requires", "ACE (Agent Collaboration Environment)"]
- ["ACE (Agent Collaboration Environment)", "characterised-as", "Living, intelligent environment"]
typora-root-url: ../../../public
typora-copy-images-to: ../../../public/images/articles
---

# Watch notes: Alignment is the bottleneck, by Maggie Appleton

Watching Maggie Appleton's talk ["One Developer, Two Dozen Agents, Zero Alignment"](https://maggieappleton.com/zero-alignment) ([video on YouTube](https://www.youtube.com/watch?v=ClWD8OEYgp8)). Core claim (from the title): when one developer can run two dozen agents, the bottleneck stops being implementation and starts being alignment: human-to-human and human-to-agent.

Running notes below.

More points of alignment but on the wrong side of implementation
Code is cheap, we don't think before we prompt
Local plan mode is unshared with other people
You're not sharing & checking with your team, yo ulose alignment
After implementation, you find out that this isn't what we needed or plan fo

Result: 
wasted work
coordination debt
duplicate work
Unclear PR

W enooed tools to align and collaborate into the development flow. Planning, building, are not separate anymore, they're part of the same cycle

Context is not in the code base, it's in people's head

Next team: ACE Agent collaboration environment

sessions list: chats that do the work. Humans and coding agents.

> Co-created with AI: ACE vs Engelbart
>
> **Shared DNA (strong):**
>
> - Both treat the *team* as the unit of design, not the individual. ACE's pitch is "shared alignment surfaces"; Engelbart's NLS was built around the shared Journal.
> - Both refuse the ease-of-use frame. Engelbart accepted learning cost for higher ceiling; ACE accepts process overhead for fewer downstream regrets.
> - Both make context first-class. Engelbart structured it (linked, signed, dated). ACE surfaces it (plans, intent, shared state). Same underlying claim: context lives in the team, not in the artifact.
> - Both are essentially building infrastructure for a NIC (Networked Improvement Community), even if ACE doesn't use the term.
>
> **What ACE adds that Engelbart didn't have to handle:**
>
> - Agents as *participants*, not just tools. Engelbart's collaborators were all human. ACE has to design the trust topology for non-human members.
> - Asymmetric speed. Humans deliberate; agents execute in seconds. ACE has to manage the mismatch you can ignore in pure-human collaboration.
> - Plans as machine-readable artifacts. Engelbart's plans were structured language for humans; ACE plans are also instructions to agents.
>
> **What ACE is missing that Engelbart had:**
>
> - The provenance fabric. NLS author-signed and dated everything. Most agent-collab tools today lose lineage when agents and humans edit shared state. (Connects to [[the-proof-layer-llms-are-missing|the proof layer LLMs are missing]].)
> - The explicit C-activity discipline. ACE is B-activity (improving how we ship code with agents); harder to tell if it builds in *improving how we improve* across teams over time.
>
> One-line read: ACE is Engelbart's NIC with agents added as members, but without the Journal underneath. The collaboration surface is there; the provenance and C-activity layers are not yet.

ACE: lots of talking happening during the work. Everybody works in the cloud. 
Screenshots, questions, reviews. Code changes on the fly....how to keep overview? Is someone allowed to do it? 
Everybody is in the same conversation as the feature gets built. 
(But who has time for this? Honestly?)

conversations under the hood, visual interface on top. LIke the digital garden (logical, because she coined the digital garden as I use it today)

challenges of agentic development: speed of working. Agents bring context and social information to you

even decision making

living, intelligent environment

quality is the new differentiator

environments where teams can thinkg rigorously about increasingly complex problems

---

<div class="linkedin">
Write your LinkedIn post here...
</div>
