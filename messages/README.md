# Lab 6

## Correctly Implemented

To my knowledge, everything was correctly implemented.  

## Collaboration

I did not collaborate with anyone on this lab.  

## Time Taken

I spent about two hours on this lab.  

## Same-Origin Policy

It is *not* possible to request data from a different origin, or locally from one's machine, using `XMLHttpRequest`. This restriction is in accordance with the **same-origin policy**, which dictates that javascript initiated requests come from the same origin as the material requested. That is, only javascript originating in Tufts CS servers should be be allowed to access/modify other resources on Tufts CS servers.  

The same-origin policy is largely used to stop certain **cross-site scripting** attacks. Even if one page in your browser is executing malicious code, compliance with the same-origin policy means it can't access other resources open in your browser, or resources on your machine accessible under `file:///`.