# The value stick

What the value surface may say, and the sentence in the paper that lets it say so.

Same edition as [`studio-five-forces.md`](studio-five-forces.md): Mauboussin and Callahan,
*Measuring the Moat*, Counterpoint Global Insights, Consilient Observer, **15 October 2024**, read
from the copy committed at
[`docs/source-pdfs/measuring-the-moat-2024-10-15.pdf`](../source-pdfs/measuring-the-moat-2024-10-15.pdf).
This audit covers **pp. 40-55** and the checklist's firm-specific section, **p. 68**.

## Whose framework this is

The paper is explicit about the chain, and Studio repeats it rather than crediting the paper with
the idea:

- The model is Adam Brandenburger and Harborne Stuart's, "professors of strategy" (p. 40).
- The picture is a "value stick", "an image that another strategy professor, Felix
  Oberholzer-Gee, popularized" (p. 40).
- Exhibits 27 and 29 are sourced to Felix Oberholzer-Gee, *Better, Simpler Strategy: A Value-Based
  Guide to Exceptional Performance* (Boston, MA: Harvard Business Review Press, 2021), 14 —
  Exhibit 27 "Based on" it, Exhibit 29 "Counterpoint Global based on" it.

Studio has not read Oberholzer-Gee's book. Everything below is as *Measuring the Moat* reports it,
and the surface says so where it matters.

## The four concepts, defined as the paper defines them

Verbatim, p. 40:

| Concept | The paper's definition |
| --- | --- |
| Willingness to pay (WTP) | "the price a consumer is willing to pay for a good or service at which they are indifferent between the offering and the cash" |
| Price | "the price the company charges its consumers for its good or service" |
| Cost | "how much a company has to spend to acquire the inputs to provide an offering" |
| Willingness to sell (WTS) | "the price at which a supplier is indifferent between withholding their product or service and cash" |

And the three bands between them (p. 40):

- **Consumer surplus**, when "the price of a good or service is below the willingness to pay".
- **Firm value creation**: "the difference between its price and cost, including the opportunity
  cost of capital."
- **Supplier surplus**, when "suppliers (most notably employees) receive more for their good or
  service than their WTS".

Two of the four are not observable. The paper says so of one directly — "Willingness to pay can be
difficult to measure but is determined by economic, emotional, and situational drivers" (p. 40) —
and gives no method for either. **Studio therefore never asks a learner to put a number on WTP or
WTS for a real company**, which is also what the workspace proposal requires.

## The six levers

Exhibit 29, "How to Create Value on the Value Stick" (p. 43), lists three ways to raise WTP and
three to lower WTS. These are the paper's own words for them:

| Side | Lever | What the paper says it is |
| --- | --- | --- |
| Raise WTP | Network effects | "when the value of a good or service increases as more people use the good or service" (p. 43); direct, indirect, and platform forms (p. 44) |
| Raise WTP | Complements | "a good or service that is consumed with another good or service"; "The WTP for a complementary asset goes up when the cost of the other goes down" (pp. 44, 46) |
| Raise WTP | Products and services | those that "confer status, reduce search costs, consumers use by habit, or have high switching costs will induce a higher WTP than other offerings in the market" (p. 45) |
| Lower WTS | Lower supply cost | data sharing that makes a supplier more efficient; "production processes protected by trademarks, patents, licenses, operating rights, or geographic positioning"; unique access to an input (pp. 48-49) |
| Lower WTS | Productivity | "High relative operational effectiveness lowers the company's cost and WTS, as the company needs fewer inputs to generate the same output as its competitors" (p. 50) |
| Lower WTS | Employee relations | "Labor is the largest expense for most companies... increasing employee satisfaction is one of the most meaningful ways that a firm can increase supplier surplus" (p. 52) |

Two cautions the paper attaches, which the surface carries with the levers:

- On WTP: Oberholzer-Gee "argues that companies should worry less about the ability to raise prices
  per se and focus more on increasing WTP by making their customers happy" (p. 43). Raising price
  is not the lever; raising WTP is.
- On employee relations: "Paying employees more, by itself, is not an ideal strategy because it
  risks creating a wealth transfer to employees from other stakeholders, which eventually weakens
  the business" (p. 52).

## Where the stick meets the numbers Studio already has

The paper connects the two sides of the stick to the two parts of a return, and promises the link
Studio has already built: "the two main ways a company can create value is to either have higher
relative prices or lower relative costs... Executives and investors often associate higher relative
prices with a differentiation, or consumer, advantage and lower relative costs with a cost
leadership, or production, advantage" (p. 40), and "We will show how differentiation and cost
leadership strategies show up in the composition of ROIC with some basic financial statement
analysis" (p. 41).

The checklist closes the loop on p. 68: **"Does a disaggregated ROIC suggest a cost leadership or
differentiation advantage?"**

`readAdvantage` in `lib/studio-project/roic.ts` already answers exactly that question from the
seven figures and a peer set, and was built from the same paper. The value surface reads it rather
than asking again, and states the direction it points as a question to explain — not as proof that
a lever is there. A margin above the median is an observation; which of the three WTP levers
produced it is the learner's to argue from the filings.

## What a learner does, and why it takes this shape

1. **A worked example first.** Numbers on all four marks, moved by the levers, on a business
   Studio invents and labels as invented. The proposal asks for a labelled OPS example and the
   paper gives no numeric one of its own, so every figure in it is Studio's and says so.
2. **Then the real company, without numbers on the willingnesses.** The learner claims a lever,
   says how it works, attaches a passage they kept from the company's own filings, and records what
   would change their mind — the same bar the five forces surface sets, for the same reason.

## What is deliberately not built

- **No WTP or WTS figure for a real company**, and so no consumer- or supplier-surplus figure
  either. The paper gives no way to measure them; a box asking for one would invite a number that
  looks like evidence and is a guess.
- **No score, and no "has a moat" verdict.** The paper's own conclusion section is about
  sustainability and magnitude, not a grade, and a count of levers claimed is not a finding.
- **No claim that Studio has read Oberholzer-Gee or Brandenburger and Stuart.** Their work reaches
  this surface through *Measuring the Moat*, and the citation says so.
- **Nothing from the value chain pages (pp. 41-42) beyond the framing sentence.** Porter's nine
  categories of activities and the activity map are a separate surface with their own audit.

## Terms defined in place

*Willingness to pay*, *willingness to sell*, *consumer surplus*, *supplier surplus*, *network
effect*, *complement*, *switching cost*, *search cost*, *operational effectiveness*,
*differentiation*, *cost leadership*. The framework's own name — the value stick — is kept and
glossed where it first appears, as a cited framework's labels must be.
