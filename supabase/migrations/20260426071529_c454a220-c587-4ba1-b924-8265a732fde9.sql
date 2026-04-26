
-- Remove placeholder/seed QFOs without model attribution
DELETE FROM public.prompt_qfos WHERE model_id IS NULL;

-- Insert real fanouts captured from ChatGPT per prompt
INSERT INTO public.prompt_qfos (prompt_id, query_text, model_id, chat_id, occurrence_count) VALUES
-- pr_0dcf8ff5 (real-time data streaming for GTM)
('pr_0dcf8ff5-3a17-48ea-9297-4e0c979593f9','CRM with best real-time data streaming for GTM teams','chatgpt-scraper','ch_1ee7a125-19ba-43f4-ba12-4c3a2d01a400',1),
('pr_0dcf8ff5-3a17-48ea-9297-4e0c979593f9','Which customer relationship management platforms support real time data streaming for go-to-market teams','chatgpt-scraper','ch_1ee7a125-19ba-43f4-ba12-4c3a2d01a400',1),
('pr_0dcf8ff5-3a17-48ea-9297-4e0c979593f9','Salesforce real-time data streaming CRM streaming data pipeline','chatgpt-scraper','ch_1ee7a125-19ba-43f4-ba12-4c3a2d01a400',1),
('pr_0dcf8ff5-3a17-48ea-9297-4e0c979593f9','CRM platforms with real time data capabilities: Salesforce vs HubSpot vs Zoho vs Attio','chatgpt-scraper','ch_1ee7a125-19ba-43f4-ba12-4c3a2d01a400',1),
('pr_0dcf8ff5-3a17-48ea-9297-4e0c979593f9','Best CRM real-time data integration and streaming features for GTM teams','chatgpt-scraper','ch_d1c972c3-6570-5bf8-9938-49a9e736d80a',1),
('pr_0dcf8ff5-3a17-48ea-9297-4e0c979593f9','Salesforce vs HubSpot realtime data streaming CRM analytics','chatgpt-scraper','ch_d1c972c3-6570-5bf8-9938-49a9e736d80a',1),
-- pr_19c5feda (PLG CRM)
('pr_19c5feda-47ae-434c-9515-2f286143adce','Best CRM platforms for product-led growth teams tracking user adoption','chatgpt-scraper','ch_85d26d65-a713-53a4-b73a-a6dcb5105216',1),
('pr_19c5feda-47ae-434c-9515-2f286143adce','CRM tools tailored for product-led growth user adoption tracking','chatgpt-scraper','ch_85d26d65-a713-53a4-b73a-a6dcb5105216',1),
-- pr_3059babd (Slack-native CRM)
('pr_3059babd-90cb-4223-9199-7b830036dfc5','CRM that easily integrates with Slack and external product databases','chatgpt-scraper','ch_d746604e-f67e-5599-8301-ad4b1f59f5db',1),
('pr_3059babd-90cb-4223-9199-7b830036dfc5','Best CRM integrations with Slack and external databases','chatgpt-scraper','ch_d746604e-f67e-5599-8301-ad4b1f59f5db',1),
-- pr_34282288 (free-to-paid)
('pr_34282288-3a47-4eb4-a016-993f1784384a','Best CRM for SaaS free-to-paid conversion tools and customer lifecycle','chatgpt-scraper','ch_ad7a3508-3dae-445b-a77e-b012f25d6945',1),
-- pr_4476189b (easy CRM automation, 50-person team)
('pr_4476189b-b687-4867-b3ef-20e667a9868c','Easiest CRM automation platforms to implement for a 50-person sales team','chatgpt-scraper','ch_0ba6e4cb-4e22-471e-b7af-0bac7d21bd7d',1),
('pr_4476189b-b687-4867-b3ef-20e667a9868c','Best simple CRM automation for mid-size sales teams','chatgpt-scraper','ch_0ba6e4cb-4e22-471e-b7af-0bac7d21bd7d',1),
('pr_4476189b-b687-4867-b3ef-20e667a9868c','Easiest CRM automation platforms for sales teams of 50 users (HubSpot, Salesforce, Zoho, Pipedrive)','chatgpt-scraper','ch_9b0704d7-edc3-4703-bcfd-daf590e7d21f',1),
('pr_4476189b-b687-4867-b3ef-20e667a9868c','Easy CRM automation platforms sales team comparison: HubSpot vs Salesforce vs Zoho','chatgpt-scraper','ch_ad15de71-7a1f-5216-a354-5a69a35e07db',1);
