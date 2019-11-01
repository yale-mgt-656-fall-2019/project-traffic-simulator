# Project traffic simulator

This is the project that drives traffic to students' class
projects. Here are my goals:

1. Send traffic to students' websites where
2. the traffic has a known distribution between sources and
3. users have a known preference for the "support/donate" A/B test.
4. Provide a way to increase click-through rates based on quality
   of the design.

The last goal is new as of this writing. I'm hoping to use
Mechanical Turk.

## Basic flow

1. Get a the latest URLs for each group via an API call to
   a class website. This will require a JWT token.
2. Persist those?
3. Crawl each in serial
4. Record the crawling activity (is this worth it? why would I do this?)

Questions:

- Do I need multiple workers?
- If there is persistence, surely there ought to only be one database?
- Should I use the class website database and use some kind of "scratch"
  JSON store? This would require migrations and some thought. Otherwise,
  I could use a local store to the app. I won't be putting grades into
  the class website.

## How to run

Something like the following:

```
env $(cat .env.660 | xargs) node ./run.js
```
