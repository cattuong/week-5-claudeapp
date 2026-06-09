I have a spec ready at specs/contract-assistant/.

My credentials are set:
- .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Azure credentials are ready for the Edge Function secrets

Please implement the full spec wave by wave. After Wave 2 is complete
and the Edge Function is deployed, start a /loop 30s to tail
supabase functions logs chat and report any errors while I test manually.

Stop the loop once Wave 4 is verified working end to end.

---
That single prompt covers:
- Triggering /implement-feature
- Telling me when to start the loop
- Telling me when to stop it

Just paste it after you've filled in your .env and set the Supabase secrets.