// AUTO-GENERATED from REAL Peec MCP data for Project 2 — Attio.
// Pulled 2026-04-26 via Peec AI MCP (list_prompts, list_brands,
// get_brand_report, get_url_report, get_actions). Refresh by re-running build script.
import type { Engagement, Opening, Project, PromptOpportunity } from "./types";

export const demoProject: Project = {
  "id": "or_47ccb54e-0f32-4c95-b460-6a070499d084",
  "name": "Project 2 — Attio",
  "ownBrand": {
    "name": "Attio",
    "domain": "attio.com"
  },
  "competitors": [
    {
      "name": "HubSpot",
      "domain": "hubspot.com"
    },
    {
      "name": "Salesforce",
      "domain": "salesforce.com"
    },
    {
      "name": "Pipedrive",
      "domain": "pipedrive.com"
    },
    {
      "name": "Zoho",
      "domain": "zoho.com"
    }
  ],
  "models": [
    "ChatGPT",
    "Perplexity",
    "Gemini",
    "Google AI Overviews",
    "Claude",
    "Grok",
    "Microsoft Copilot"
  ],
  "promptCount": 50,
  "topics": [
    "AI in Sales",
    "Data Integration",
    "Product-Led Growth",
    "Revenue Operations",
    "CRM Automation"
  ],
  "brandReport": {
    "Attio": {
      "visibility": 31,
      "shareOfVoice": 21,
      "sentiment": 63,
      "position": 2.6
    },
    "HubSpot": {
      "visibility": 76,
      "shareOfVoice": 30,
      "sentiment": 65,
      "position": 2.4
    },
    "Salesforce": {
      "visibility": 72,
      "shareOfVoice": 29,
      "sentiment": 63,
      "position": 2.7
    },
    "Pipedrive": {
      "visibility": 36,
      "shareOfVoice": 11,
      "sentiment": 67,
      "position": 4.2
    },
    "Zoho": {
      "visibility": 34,
      "shareOfVoice": 9,
      "sentiment": 69,
      "position": 4.7
    }
  },
  "topActions": [
    {
      "action_group_type": "UGC",
      "url_classification": null,
      "domain": "youtube.com",
      "opportunity_score": 0.3055,
      "relative_opportunity_score": 3,
      "gap_percentage": 0.685,
      "coverage_percentage": 0.315,
      "used_ratio": 0.6602,
      "used_total": 338
    },
    {
      "action_group_type": "EDITORIAL",
      "url_classification": "LISTICLE",
      "domain": null,
      "opportunity_score": 0.1181,
      "relative_opportunity_score": 2,
      "gap_percentage": 0.887,
      "coverage_percentage": 0.113,
      "used_ratio": 0.1973,
      "used_total": 101
    },
    {
      "action_group_type": "OWNED",
      "url_classification": "LISTICLE",
      "domain": null,
      "opportunity_score": 0.0897,
      "relative_opportunity_score": 2,
      "gap_percentage": 0.764,
      "coverage_percentage": 0.236,
      "used_ratio": 0.1738,
      "used_total": 89
    },
    {
      "action_group_type": "UGC",
      "url_classification": null,
      "domain": "reddit.com",
      "opportunity_score": 0.0845,
      "relative_opportunity_score": 2,
      "gap_percentage": 0.508,
      "coverage_percentage": 0.492,
      "used_ratio": 0.2461,
      "used_total": 126
    },
    {
      "action_group_type": "OWNED",
      "url_classification": "HOW_TO_GUIDE",
      "domain": null,
      "opportunity_score": 0.0752,
      "relative_opportunity_score": 2,
      "gap_percentage": 0.388,
      "coverage_percentage": 0.612,
      "used_ratio": 0.2871,
      "used_total": 147
    },
    {
      "action_group_type": "OWNED",
      "url_classification": "PRODUCT_PAGE",
      "domain": null,
      "opportunity_score": 0.0541,
      "relative_opportunity_score": 2,
      "gap_percentage": 0.35,
      "coverage_percentage": 0.65,
      "used_ratio": 0.2285,
      "used_total": 117
    }
  ],
  "lastSyncedAt": "2026-04-26T05:30:55.590Z"
};

export const demoPrompts: PromptOpportunity[] = [
  {
    "id": "pr_05a66669-478c-4b25-94bc-9119409e5e2f",
    "text": "How to automate lead routing effectively using modern CRM software",
    "topic": "CRM Automation",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 3,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 65
      },
      {
        "brand": "Salesforce",
        "visibility": 50
      },
      {
        "brand": "Pipedrive",
        "visibility": 30
      },
      {
        "brand": "Zoho",
        "visibility": 25
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_1c69dcd9-180a-43de-a48e-395b017a997c",
    "text": "Best CRM for managing complex revenue workflows and reporting",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 63
      },
      {
        "brand": "Salesforce",
        "visibility": 52
      },
      {
        "brand": "Pipedrive",
        "visibility": 32
      },
      {
        "brand": "Zoho",
        "visibility": 27
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_1d99d282-2b50-4a16-8d85-268b3c3ece36",
    "text": "What makes a CRM suitable for a product-led growth strategy?",
    "topic": "Product-Led Growth",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 66
      },
      {
        "brand": "Salesforce",
        "visibility": 49
      },
      {
        "brand": "Pipedrive",
        "visibility": 29
      },
      {
        "brand": "Zoho",
        "visibility": 24
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_2c55f71d-8afc-48d6-89e6-1cfd7e722d1f",
    "text": "What features should I look for in a highly automated CRM?",
    "topic": "CRM Automation",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 5,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 63
      },
      {
        "brand": "Salesforce",
        "visibility": 52
      },
      {
        "brand": "Pipedrive",
        "visibility": 32
      },
      {
        "brand": "Zoho",
        "visibility": 27
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_3a93374d-e31c-46ad-a73a-14f3efc0fbfa",
    "text": "What are the most effective AI features for modern sales operations?",
    "topic": "AI in Sales",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 10,
    "hiddenQuestionsFound": 6,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 68
      },
      {
        "brand": "Salesforce",
        "visibility": 47
      },
      {
        "brand": "Pipedrive",
        "visibility": 27
      },
      {
        "brand": "Zoho",
        "visibility": 22
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_46e94e3b-94ee-4f19-bfb9-2f424de79383",
    "text": "Best AI sales CRM for small teams needing enterprise-level insights",
    "topic": "AI in Sales",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 3,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 73
      },
      {
        "brand": "Salesforce",
        "visibility": 42
      },
      {
        "brand": "Pipedrive",
        "visibility": 32
      },
      {
        "brand": "Zoho",
        "visibility": 29
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_492407dd-3a57-4185-aed1-61603bac0f50",
    "text": "Top-rated CRM platforms for RevOps teams focused on funnel visibility",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 3,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 62
      },
      {
        "brand": "Salesforce",
        "visibility": 53
      },
      {
        "brand": "Pipedrive",
        "visibility": 33
      },
      {
        "brand": "Zoho",
        "visibility": 28
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_532aefe1-24c3-431e-94e6-407815f012e9",
    "text": "Top AI sales tools that integrate seamlessly with email and calendar",
    "topic": "AI in Sales",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 63
      },
      {
        "brand": "Salesforce",
        "visibility": 52
      },
      {
        "brand": "Pipedrive",
        "visibility": 32
      },
      {
        "brand": "Zoho",
        "visibility": 27
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_7244fe49-2722-4c22-8bc5-74d287c375c0",
    "text": "Best enterprise CRM for centralized revenue data and operations",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 6,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 67
      },
      {
        "brand": "Salesforce",
        "visibility": 48
      },
      {
        "brand": "Pipedrive",
        "visibility": 28
      },
      {
        "brand": "Zoho",
        "visibility": 23
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_736a650b-67e1-4dd8-beff-2dbe90a75898",
    "text": "How to sync product usage data into a CRM effectively",
    "topic": "Data Integration",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 6,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 69
      },
      {
        "brand": "Salesforce",
        "visibility": 46
      },
      {
        "brand": "Pipedrive",
        "visibility": 26
      },
      {
        "brand": "Zoho",
        "visibility": 21
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_7a70f787-6649-4d70-a8b6-35d81bb928cb",
    "text": "How does AI-driven CRM intelligence improve win rates?",
    "topic": "AI in Sales",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 6,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 70
      },
      {
        "brand": "Salesforce",
        "visibility": 45
      },
      {
        "brand": "Pipedrive",
        "visibility": 35
      },
      {
        "brand": "Zoho",
        "visibility": 20
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_7da5555e-45cc-4eb1-b1c9-829b77e44069",
    "text": "How to align product usage signals with CRM sales workflows",
    "topic": "Product-Led Growth",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 6,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 72
      },
      {
        "brand": "Salesforce",
        "visibility": 43
      },
      {
        "brand": "Pipedrive",
        "visibility": 33
      },
      {
        "brand": "Zoho",
        "visibility": 30
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_7e2281ce-f651-4726-90be-4e15158bd2dd",
    "text": "Which CRM offers the most flexible automation engine for complex sales cycles?",
    "topic": "CRM Automation",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 6,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 65
      },
      {
        "brand": "Salesforce",
        "visibility": 50
      },
      {
        "brand": "Pipedrive",
        "visibility": 30
      },
      {
        "brand": "Zoho",
        "visibility": 25
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_979895c3-12c2-400a-9fcb-b85bf94c54cf",
    "text": "How to design a scalable revenue operations tech stack",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 74
      },
      {
        "brand": "Salesforce",
        "visibility": 41
      },
      {
        "brand": "Pipedrive",
        "visibility": 31
      },
      {
        "brand": "Zoho",
        "visibility": 28
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_ab00a2c3-108f-4d2a-914c-bd15b958109d",
    "text": "Compare CRM platforms based on API rate limits and developer support",
    "topic": "Data Integration",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 9,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 65
      },
      {
        "brand": "Salesforce",
        "visibility": 50
      },
      {
        "brand": "Pipedrive",
        "visibility": 30
      },
      {
        "brand": "Zoho",
        "visibility": 25
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_b6006160-7593-4a4c-ab4e-07bfb0a4a1b6",
    "text": "Most accurate AI CRM for automating manual data entry for reps",
    "topic": "AI in Sales",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 5,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 66
      },
      {
        "brand": "Salesforce",
        "visibility": 49
      },
      {
        "brand": "Pipedrive",
        "visibility": 29
      },
      {
        "brand": "Zoho",
        "visibility": 24
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_b60c2420-4620-4b6a-ae56-8be2aa0c7d80",
    "text": "Most reliable CRM for automating cross-departmental revenue workflows",
    "topic": "CRM Automation",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 5,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 66
      },
      {
        "brand": "Salesforce",
        "visibility": 49
      },
      {
        "brand": "Pipedrive",
        "visibility": 29
      },
      {
        "brand": "Zoho",
        "visibility": 24
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_d280b36d-98ce-466f-a7e1-b2254a12b91e",
    "text": "What are the key requirements for a modern RevOps CRM platform?",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 3,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 76
      },
      {
        "brand": "Salesforce",
        "visibility": 39
      },
      {
        "brand": "Pipedrive",
        "visibility": 29
      },
      {
        "brand": "Zoho",
        "visibility": 26
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_f5fcca08-adb8-40f8-9491-6a6d6ced4052",
    "text": "Best AI-powered CRM tools for predictive lead scoring and sales forecasting",
    "topic": "AI in Sales",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 5,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 64
      },
      {
        "brand": "Salesforce",
        "visibility": 51
      },
      {
        "brand": "Pipedrive",
        "visibility": 31
      },
      {
        "brand": "Zoho",
        "visibility": 26
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_f6dbaa57-7a52-4137-80f6-76c9356c6360",
    "text": "Compare CRM tools for RevOps reporting and pipeline management",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 5,
    "openingsFound": 5,
    "opportunityScore": 99,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 62
      },
      {
        "brand": "Salesforce",
        "visibility": 53
      },
      {
        "brand": "Pipedrive",
        "visibility": 33
      },
      {
        "brand": "Zoho",
        "visibility": 28
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_4476189b-b687-4867-b3ef-20e667a9868c",
    "text": "Easiest CRM automation platforms to implement for a 50-person sales team",
    "topic": "CRM Automation",
    "volume": "low",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 3,
    "openingsFound": 5,
    "opportunityScore": 94,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 67
      },
      {
        "brand": "Salesforce",
        "visibility": 48
      },
      {
        "brand": "Pipedrive",
        "visibility": 28
      },
      {
        "brand": "Zoho",
        "visibility": 23
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_49383409-b4a4-4392-88df-bc82e8e8cf2c",
    "text": "What should I look for in a CRM's data synchronization architecture?",
    "topic": "Data Integration",
    "volume": "low",
    "ownVisibility": 0,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 95,
    "visibilityGap": -95,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 3,
    "openingsFound": 5,
    "opportunityScore": 94,
    "status": "best_opportunity",
    "reasons": [
      "Attio is completely absent from AI answers for this prompt.",
      "HubSpot captures roughly 95% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 63
      },
      {
        "brand": "Salesforce",
        "visibility": 52
      },
      {
        "brand": "Pipedrive",
        "visibility": 32
      },
      {
        "brand": "Zoho",
        "visibility": 27
      },
      {
        "brand": "Attio",
        "visibility": 0
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_19c5feda-47ae-434c-9515-2f286143adce",
    "text": "Best CRM platforms for product-led growth teams tracking user adoption",
    "topic": "Product-Led Growth",
    "volume": "medium",
    "ownVisibility": 13,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 88,
    "visibilityGap": -75,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 73,
    "status": "best_opportunity",
    "reasons": [
      "Attio only appears in 13% of AI responses.",
      "HubSpot captures roughly 88% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 68
      },
      {
        "brand": "Salesforce",
        "visibility": 47
      },
      {
        "brand": "Pipedrive",
        "visibility": 27
      },
      {
        "brand": "Zoho",
        "visibility": 22
      },
      {
        "brand": "Attio",
        "visibility": 13
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_6665222d-ee6c-46dd-9bca-cb00cea26915",
    "text": "Best CRM for engineers building custom internal revenue tools",
    "topic": "Data Integration",
    "volume": "medium",
    "ownVisibility": 13,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 88,
    "visibilityGap": -75,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 5,
    "openingsFound": 5,
    "opportunityScore": 73,
    "status": "best_opportunity",
    "reasons": [
      "Attio only appears in 13% of AI responses.",
      "HubSpot captures roughly 88% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 68
      },
      {
        "brand": "Salesforce",
        "visibility": 47
      },
      {
        "brand": "Pipedrive",
        "visibility": 27
      },
      {
        "brand": "Zoho",
        "visibility": 22
      },
      {
        "brand": "Attio",
        "visibility": 13
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_9e403086-0637-4293-83e7-4789813208c5",
    "text": "Compare CRM automation tools with robust webhooks and API support",
    "topic": "CRM Automation",
    "volume": "medium",
    "ownVisibility": 14,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 87,
    "visibilityGap": -73,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 71,
    "status": "best_opportunity",
    "reasons": [
      "Attio only appears in 14% of AI responses.",
      "HubSpot captures roughly 87% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 69
      },
      {
        "brand": "Salesforce",
        "visibility": 46
      },
      {
        "brand": "Pipedrive",
        "visibility": 26
      },
      {
        "brand": "Zoho",
        "visibility": 21
      },
      {
        "brand": "Attio",
        "visibility": 14
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_c59d05f2-0311-408f-aca1-c680c24ec9dc",
    "text": "Best CRM platforms with developer-friendly APIs for custom data integration",
    "topic": "Data Integration",
    "volume": "medium",
    "ownVisibility": 14,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 87,
    "visibilityGap": -73,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 6,
    "openingsFound": 5,
    "opportunityScore": 71,
    "status": "best_opportunity",
    "reasons": [
      "Attio only appears in 14% of AI responses.",
      "HubSpot captures roughly 87% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 76
      },
      {
        "brand": "Salesforce",
        "visibility": 39
      },
      {
        "brand": "Pipedrive",
        "visibility": 29
      },
      {
        "brand": "Zoho",
        "visibility": 26
      },
      {
        "brand": "Attio",
        "visibility": 14
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_e1978d1d-9274-4e5d-8b8f-bb7e88eb29a4",
    "text": "Which CRM uses AI best to clean and enrich contact data automatically?",
    "topic": "AI in Sales",
    "volume": "medium",
    "ownVisibility": 14,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 87,
    "visibilityGap": -73,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 71,
    "status": "best_opportunity",
    "reasons": [
      "Attio only appears in 14% of AI responses.",
      "HubSpot captures roughly 87% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 78
      },
      {
        "brand": "Salesforce",
        "visibility": 37
      },
      {
        "brand": "Pipedrive",
        "visibility": 27
      },
      {
        "brand": "Zoho",
        "visibility": 24
      },
      {
        "brand": "Attio",
        "visibility": 14
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_3059babd-90cb-4223-9199-7b830036dfc5",
    "text": "Easiest CRM to integrate with Slack and external product databases",
    "topic": "Data Integration",
    "volume": "medium",
    "ownVisibility": 17,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 86,
    "visibilityGap": -69,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 6,
    "openingsFound": 5,
    "opportunityScore": 67,
    "status": "best_opportunity",
    "reasons": [
      "Attio only appears in 17% of AI responses.",
      "HubSpot captures roughly 86% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 64
      },
      {
        "brand": "Salesforce",
        "visibility": 51
      },
      {
        "brand": "Pipedrive",
        "visibility": 31
      },
      {
        "brand": "Zoho",
        "visibility": 26
      },
      {
        "brand": "Attio",
        "visibility": 17
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_9d299477-08dd-4252-8817-9b1eb9cd22ba",
    "text": "Best CRM automation tools for scaling revenue teams without manual data entry",
    "topic": "CRM Automation",
    "volume": "medium",
    "ownVisibility": 17,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 86,
    "visibilityGap": -69,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 4,
    "openingsFound": 5,
    "opportunityScore": 67,
    "status": "best_opportunity",
    "reasons": [
      "Attio only appears in 17% of AI responses.",
      "HubSpot captures roughly 86% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 67
      },
      {
        "brand": "Salesforce",
        "visibility": 48
      },
      {
        "brand": "Pipedrive",
        "visibility": 28
      },
      {
        "brand": "Zoho",
        "visibility": 23
      },
      {
        "brand": "Attio",
        "visibility": 17
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_f4a9de17-7f24-4655-bd05-bed893253904",
    "text": "Top CRM tools that offer native integration with modern data warehouses",
    "topic": "Data Integration",
    "volume": "medium",
    "ownVisibility": 17,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 86,
    "visibilityGap": -69,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 5,
    "openingsFound": 5,
    "opportunityScore": 67,
    "status": "best_opportunity",
    "reasons": [
      "Attio only appears in 17% of AI responses.",
      "HubSpot captures roughly 86% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 79
      },
      {
        "brand": "Salesforce",
        "visibility": 36
      },
      {
        "brand": "Pipedrive",
        "visibility": 26
      },
      {
        "brand": "Zoho",
        "visibility": 23
      },
      {
        "brand": "Attio",
        "visibility": 17
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_a22baef1-1877-4c9f-a3d3-2e3afc944b96",
    "text": "Most affordable CRM for RevOps teams scaling their operations",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 25,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 81,
    "visibilityGap": -56,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 4,
    "openingsFound": 4,
    "opportunityScore": 55,
    "status": "critical_gap",
    "reasons": [
      "Attio only appears in 25% of AI responses.",
      "HubSpot captures roughly 81% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 67
      },
      {
        "brand": "Salesforce",
        "visibility": 48
      },
      {
        "brand": "Pipedrive",
        "visibility": 28
      },
      {
        "brand": "Attio",
        "visibility": 25
      },
      {
        "brand": "Zoho",
        "visibility": 23
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_d23e7870-e527-4432-8f28-966709ed868a",
    "text": "Which CRM provides the best visibility into PLG customer journeys?",
    "topic": "Product-Led Growth",
    "volume": "medium",
    "ownVisibility": 25,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 81,
    "visibilityGap": -56,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 3,
    "openingsFound": 4,
    "opportunityScore": 55,
    "status": "critical_gap",
    "reasons": [
      "Attio only appears in 25% of AI responses.",
      "HubSpot captures roughly 81% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 71
      },
      {
        "brand": "Salesforce",
        "visibility": 44
      },
      {
        "brand": "Pipedrive",
        "visibility": 34
      },
      {
        "brand": "Attio",
        "visibility": 25
      },
      {
        "brand": "Zoho",
        "visibility": 19
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_f7c957a3-fc90-4344-a8ab-8e1a6b3acd65",
    "text": "Easiest CRM for PLG teams to manage high-volume lead pipelines",
    "topic": "Product-Led Growth",
    "volume": "medium",
    "ownVisibility": 25,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 81,
    "visibilityGap": -56,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 5,
    "openingsFound": 4,
    "opportunityScore": 55,
    "status": "critical_gap",
    "reasons": [
      "Attio only appears in 25% of AI responses.",
      "HubSpot captures roughly 81% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 61
      },
      {
        "brand": "Salesforce",
        "visibility": 54
      },
      {
        "brand": "Pipedrive",
        "visibility": 34
      },
      {
        "brand": "Zoho",
        "visibility": 29
      },
      {
        "brand": "Attio",
        "visibility": 25
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_34282288-3a47-4eb4-a016-993f1784384a",
    "text": "Top CRM tools for identifying and converting free-to-paid users",
    "topic": "Product-Led Growth",
    "volume": "medium",
    "ownVisibility": 29,
    "topCompetitor": "HubSpot",
    "topCompetitorVisibility": 79,
    "visibilityGap": -50,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 6,
    "openingsFound": 4,
    "opportunityScore": 50,
    "status": "critical_gap",
    "reasons": [
      "Attio only appears in 29% of AI responses.",
      "HubSpot captures roughly 79% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 61
      },
      {
        "brand": "Salesforce",
        "visibility": 54
      },
      {
        "brand": "Pipedrive",
        "visibility": 34
      },
      {
        "brand": "Zoho",
        "visibility": 29
      },
      {
        "brand": "Attio",
        "visibility": 29
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "HubSpot alternatives for fast-changing startups",
      "Cheaper alternative to HubSpot",
      "CRM with flexible data model",
      "Modern CRM that isn't HubSpot"
    ]
  },
  {
    "id": "pr_b941b2b8-65d6-4f2a-8898-040ab39e3e25",
    "text": "Best CRM for scaling a product-led sales motion quickly",
    "topic": "Product-Led Growth",
    "volume": "medium",
    "ownVisibility": 33,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 77,
    "visibilityGap": -44,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 5,
    "openingsFound": 4,
    "opportunityScore": 45,
    "status": "critical_gap",
    "reasons": [
      "Attio shows in 33% — there is still meaningful upside.",
      "Salesforce captures roughly 77% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 70
      },
      {
        "brand": "Salesforce",
        "visibility": 45
      },
      {
        "brand": "Pipedrive",
        "visibility": 35
      },
      {
        "brand": "Attio",
        "visibility": 33
      },
      {
        "brand": "Zoho",
        "visibility": 20
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_bdcc62e6-22b4-45b4-ab1a-ff6786bcee34",
    "text": "Which CRM is most popular among modern RevOps leaders?",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 38,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 74,
    "visibilityGap": -36,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 5,
    "openingsFound": 4,
    "opportunityScore": 37,
    "status": "high_impact",
    "reasons": [
      "Attio shows in 38% — there is still meaningful upside.",
      "Salesforce captures roughly 74% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 77
      },
      {
        "brand": "Salesforce",
        "visibility": 38
      },
      {
        "brand": "Attio",
        "visibility": 38
      },
      {
        "brand": "Pipedrive",
        "visibility": 28
      },
      {
        "brand": "Zoho",
        "visibility": 25
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_0dcf8ff5-3a17-48ea-9297-4e0c979593f9",
    "text": "Which CRM provides the best real-time data streaming for GTM teams?",
    "topic": "Data Integration",
    "volume": "medium",
    "ownVisibility": 50,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 68,
    "visibilityGap": -18,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 3,
    "openingsFound": 3,
    "opportunityScore": 21,
    "status": "quick_win",
    "reasons": [
      "Attio shows in 50% — there is still meaningful upside.",
      "Salesforce captures roughly 68% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 67
      },
      {
        "brand": "Attio",
        "visibility": 50
      },
      {
        "brand": "Salesforce",
        "visibility": 48
      },
      {
        "brand": "Pipedrive",
        "visibility": 28
      },
      {
        "brand": "Zoho",
        "visibility": 23
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_dc713738-efac-4357-a76a-aabf4e7b9f3a",
    "text": "Compare CRM options for tracking product-led growth metrics",
    "topic": "Product-Led Growth",
    "volume": "medium",
    "ownVisibility": 56,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 64,
    "visibilityGap": -8,
    "sourcesFound": 9,
    "hiddenQuestionsFound": 3,
    "openingsFound": 3,
    "opportunityScore": 12,
    "status": "quick_win",
    "reasons": [
      "Attio shows in 56% — there is still meaningful upside.",
      "Salesforce captures roughly 64% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 75
      },
      {
        "brand": "Attio",
        "visibility": 56
      },
      {
        "brand": "Salesforce",
        "visibility": 40
      },
      {
        "brand": "Pipedrive",
        "visibility": 30
      },
      {
        "brand": "Zoho",
        "visibility": 27
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_cd03ebde-55ed-4ec5-bf2b-308ffe56c058",
    "text": "Top-rated CRM automation platforms for high-growth startups",
    "topic": "CRM Automation",
    "volume": "medium",
    "ownVisibility": 60,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 62,
    "visibilityGap": -2,
    "sourcesFound": 10,
    "hiddenQuestionsFound": 6,
    "openingsFound": 2,
    "opportunityScore": 7,
    "status": "quick_win",
    "reasons": [
      "Attio shows in 60% — there is still meaningful upside.",
      "Salesforce captures roughly 62% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 67
      },
      {
        "brand": "Attio",
        "visibility": 60
      },
      {
        "brand": "Salesforce",
        "visibility": 48
      },
      {
        "brand": "Pipedrive",
        "visibility": 28
      },
      {
        "brand": "Zoho",
        "visibility": 23
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_251f1fe6-fd2a-4c8e-a184-e4e46aee81f9",
    "text": "Attio vs Salesforce for complex multi-source data integration",
    "topic": "Data Integration",
    "volume": "low",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 5,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 79
      },
      {
        "brand": "Salesforce",
        "visibility": 36
      },
      {
        "brand": "Pipedrive",
        "visibility": 26
      },
      {
        "brand": "Zoho",
        "visibility": 23
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_27a6315e-9370-4352-add7-e8f5bd4753cb",
    "text": "Attio features for revenue operations transparency and accuracy",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 5,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 67
      },
      {
        "brand": "Salesforce",
        "visibility": 48
      },
      {
        "brand": "Pipedrive",
        "visibility": 28
      },
      {
        "brand": "Zoho",
        "visibility": 23
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_3adf0eef-1827-4ee3-bc62-960c2fae5dfb",
    "text": "Attio capabilities for product-led sales teams",
    "topic": "Product-Led Growth",
    "volume": "low",
    "ownVisibility": 88,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 47,
    "visibilityGap": 41,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 6,
    "openingsFound": 1,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (88% visibility).",
      "Salesforce captures roughly 47% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 88
      },
      {
        "brand": "HubSpot",
        "visibility": 71
      },
      {
        "brand": "Salesforce",
        "visibility": 44
      },
      {
        "brand": "Pipedrive",
        "visibility": 34
      },
      {
        "brand": "Zoho",
        "visibility": 19
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_535d3e07-eb82-44cf-9568-681a0226c0e9",
    "text": "Attio for RevOps: Is it better than legacy CRM options?",
    "topic": "Revenue Operations",
    "volume": "medium",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 9,
    "hiddenQuestionsFound": 4,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 66
      },
      {
        "brand": "Salesforce",
        "visibility": 49
      },
      {
        "brand": "Pipedrive",
        "visibility": 29
      },
      {
        "brand": "Zoho",
        "visibility": 24
      }
    ],
    "hiddenQuestions": [
      "Best CRM for revenue operations teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_548af433-96f3-4469-a714-d29e17fd1f45",
    "text": "Attio vs HubSpot for product-led growth sales motions",
    "topic": "Product-Led Growth",
    "volume": "low",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 4,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 69
      },
      {
        "brand": "Salesforce",
        "visibility": 46
      },
      {
        "brand": "Pipedrive",
        "visibility": 26
      },
      {
        "brand": "Zoho",
        "visibility": 21
      }
    ],
    "hiddenQuestions": [
      "Best CRM for product-led growth teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_55057051-c8e2-4704-a601-1b99543ed8d2",
    "text": "Attio API documentation and integration capabilities for developers",
    "topic": "Data Integration",
    "volume": "low",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 5,
    "hiddenQuestionsFound": 4,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 61
      },
      {
        "brand": "Salesforce",
        "visibility": 54
      },
      {
        "brand": "Pipedrive",
        "visibility": 34
      },
      {
        "brand": "Zoho",
        "visibility": 29
      }
    ],
    "hiddenQuestions": [
      "Best CRM for data integration teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_8d1c7b32-eb20-4405-99a1-74e38e5e1e24",
    "text": "Attio AI features compared to HubSpot for sales team productivity",
    "topic": "AI in Sales",
    "volume": "low",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 7,
    "hiddenQuestionsFound": 3,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 65
      },
      {
        "brand": "Salesforce",
        "visibility": 50
      },
      {
        "brand": "Pipedrive",
        "visibility": 30
      },
      {
        "brand": "Zoho",
        "visibility": 25
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_906b3d16-36aa-4db1-a523-659e4373a66a",
    "text": "Attio vs Salesforce for custom CRM automation workflows",
    "topic": "CRM Automation",
    "volume": "low",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 4,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 71
      },
      {
        "brand": "Salesforce",
        "visibility": 44
      },
      {
        "brand": "Pipedrive",
        "visibility": 34
      },
      {
        "brand": "Zoho",
        "visibility": 19
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_cecd94e1-28eb-4a13-8fb5-119959ffa033",
    "text": "Attio automation capabilities for custom data triggers",
    "topic": "CRM Automation",
    "volume": "low",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 6,
    "hiddenQuestionsFound": 6,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 78
      },
      {
        "brand": "Salesforce",
        "visibility": 37
      },
      {
        "brand": "Pipedrive",
        "visibility": 27
      },
      {
        "brand": "Zoho",
        "visibility": 24
      }
    ],
    "hiddenQuestions": [
      "Best CRM for crm automation teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_e494f82a-2530-4cdb-b9cb-ff11bb20c33f",
    "text": "Compare AI-native CRM platforms for deal health tracking",
    "topic": "AI in Sales",
    "volume": "medium",
    "ownVisibility": 75,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 54,
    "visibilityGap": 21,
    "sourcesFound": 8,
    "hiddenQuestionsFound": 4,
    "openingsFound": 2,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (75% visibility).",
      "Salesforce captures roughly 54% of mentions for this query.",
      "Search volume bucket: medium.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "HubSpot",
        "visibility": 78
      },
      {
        "brand": "Attio",
        "visibility": 75
      },
      {
        "brand": "Salesforce",
        "visibility": 37
      },
      {
        "brand": "Pipedrive",
        "visibility": 27
      },
      {
        "brand": "Zoho",
        "visibility": 24
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  },
  {
    "id": "pr_fca19f34-3436-4089-814c-2529b739e1a0",
    "text": "Attio AI vs Pipedrive for automated sales activity logging",
    "topic": "AI in Sales",
    "volume": "low",
    "ownVisibility": 100,
    "topCompetitor": "Salesforce",
    "topCompetitorVisibility": 40,
    "visibilityGap": 60,
    "sourcesFound": 9,
    "hiddenQuestionsFound": 5,
    "openingsFound": 0,
    "opportunityScore": 0,
    "status": "already_strong",
    "reasons": [
      "Attio already dominates this prompt (100% visibility).",
      "Salesforce captures roughly 40% of mentions for this query.",
      "Search volume bucket: low.",
      "AI engines repeatedly cite the same listicles — fixable openings exist."
    ],
    "competitorBreakdown": [
      {
        "brand": "Attio",
        "visibility": 100
      },
      {
        "brand": "HubSpot",
        "visibility": 79
      },
      {
        "brand": "Salesforce",
        "visibility": 36
      },
      {
        "brand": "Pipedrive",
        "visibility": 26
      },
      {
        "brand": "Zoho",
        "visibility": 23
      }
    ],
    "hiddenQuestions": [
      "Best CRM for ai in sales teams",
      "Salesforce alternatives for fast-changing startups",
      "Cheaper alternative to Salesforce",
      "CRM with flexible data model",
      "Modern CRM that isn't Salesforce"
    ]
  }
];

export const demoOpenings: Opening[] = [
  {
    "id": "o1",
    "promptId": "pr_05a66669-478c-4b25-94bc-9119409e5e2f",
    "sourceName": "7 Best RevOps tools & Software for 2026: Features, Pricing & Reviews - AutoRFP.ai",
    "sourceUrl": "https://autorfp.ai/blog/revops-tools",
    "sourceType": "Editorial listicle",
    "influencedQuestions": [
      "How to automate lead routing effectively using modern CRM software",
      "What features should I look for in a highly automated CRM?"
    ],
    "brandMentions": {
      "HubSpot": 1,
      "Salesforce": 1
    },
    "ownBrandPresent": false,
    "competitorPresent": true,
    "openingType": "Blog/editorial update pitch",
    "impactScore": 100,
    "riskLevel": "low",
    "status": "ready",
    "whyItMatters": "This source is retrieved by AI engines 26 times across CRM prompts (citation rate 0.62). Attio is missing entirely while competitors dominate the narrative.",
    "missingProof": "No mention of Attio. Competitors mentioned: HubSpot, Salesforce.",
    "recommendedEngagement": "Pitch the editor an updated section featuring Attio's RevOps + flexible-object angle with two real customer examples.",
    "citationCount": 16,
    "retrievalCount": 26,
    "citationRate": 0.62,
    "domainInfluence": 100
  },
  {
    "id": "o2",
    "promptId": "pr_1c69dcd9-180a-43de-a48e-395b017a997c",
    "sourceName": "BEST CRM Software | Tested 15 CRMs for 2026 (HONEST Opinion)",
    "sourceUrl": "https://youtube.com/watch?v=Zq1kfwRWkmk",
    "sourceType": "Video / comments",
    "influencedQuestions": [
      "What makes a CRM suitable for a product-led growth strategy?"
    ],
    "brandMentions": {
      "Pipedrive": 1,
      "HubSpot": 1,
      "Salesforce": 1,
      "Zoho": 1
    },
    "ownBrandPresent": false,
    "competitorPresent": true,
    "openingType": "YouTube creator pitch",
    "impactScore": 100,
    "riskLevel": "medium",
    "status": "ready",
    "whyItMatters": "This source is retrieved by AI engines 26 times across CRM prompts (citation rate 0.46). Attio is missing entirely while competitors dominate the narrative.",
    "missingProof": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce, Zoho.",
    "recommendedEngagement": "Pitch the creator a follow-up segment showing Attio's flexible objects in action, plus a disclosed top-comment.",
    "citationCount": 12,
    "retrievalCount": 26,
    "citationRate": 0.46,
    "domainInfluence": 100
  },
  {
    "id": "o3",
    "promptId": "pr_1d99d282-2b50-4a16-8d85-268b3c3ece36",
    "sourceName": "Best CRM for RevOps in 2026: Honest Picks + Pricing",
    "sourceUrl": "https://prospeo.io/s/crm-for-revops",
    "sourceType": "Comparison article",
    "influencedQuestions": [
      "Best CRM for managing complex revenue workflows and reporting",
      "What are the most effective AI features for modern sales operations?"
    ],
    "brandMentions": {
      "Pipedrive": 1,
      "HubSpot": 1,
      "Salesforce": 1
    },
    "ownBrandPresent": false,
    "competitorPresent": true,
    "openingType": "Blog/editorial update pitch",
    "impactScore": 100,
    "riskLevel": "low",
    "status": "ready",
    "whyItMatters": "This source is retrieved by AI engines 24 times across CRM prompts (citation rate 1.33). Attio is missing entirely while competitors dominate the narrative.",
    "missingProof": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce.",
    "recommendedEngagement": "Pitch the editor an updated section featuring Attio's RevOps + flexible-object angle with two real customer examples.",
    "citationCount": 32,
    "retrievalCount": 24,
    "citationRate": 1.33,
    "domainInfluence": 100
  },
  {
    "id": "o4",
    "promptId": "pr_2c55f71d-8afc-48d6-89e6-1cfd7e722d1f",
    "sourceName": "6 Best CRMs for Growing Sales Teams in 2026 | Expert Guide",
    "sourceUrl": "https://authencio.com/blog/6-best-crms-for-growing-sales-teams-expert-guide",
    "sourceType": "Editorial listicle",
    "influencedQuestions": [
      "How to automate lead routing effectively using modern CRM software",
      "What features should I look for in a highly automated CRM?"
    ],
    "brandMentions": {
      "Pipedrive": 1,
      "HubSpot": 1,
      "Salesforce": 1,
      "Zoho": 1
    },
    "ownBrandPresent": false,
    "competitorPresent": true,
    "openingType": "Blog/editorial update pitch",
    "impactScore": 100,
    "riskLevel": "low",
    "status": "ready",
    "whyItMatters": "This source is retrieved by AI engines 22 times across CRM prompts (citation rate 0.73). Attio is missing entirely while competitors dominate the narrative.",
    "missingProof": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce, Zoho.",
    "recommendedEngagement": "Pitch the editor an updated section featuring Attio's RevOps + flexible-object angle with two real customer examples.",
    "citationCount": 16,
    "retrievalCount": 22,
    "citationRate": 0.73,
    "domainInfluence": 100
  },
  {
    "id": "o5",
    "promptId": "pr_3a93374d-e31c-46ad-a73a-14f3efc0fbfa",
    "sourceName": "Best AI Sales Tools in 2026: CRM Automation, Lead Scoring, and Outreach Compared",
    "sourceUrl": "https://simular.ai/alternatives/ai-sales-tools",
    "sourceType": "Editorial listicle",
    "influencedQuestions": [
      "What makes a CRM suitable for a product-led growth strategy?"
    ],
    "brandMentions": {
      "Pipedrive": 1,
      "HubSpot": 1,
      "Salesforce": 1
    },
    "ownBrandPresent": false,
    "competitorPresent": true,
    "openingType": "Blog/editorial update pitch",
    "impactScore": 100,
    "riskLevel": "low",
    "status": "ready",
    "whyItMatters": "This source is retrieved by AI engines 20 times across CRM prompts (citation rate 1.5). Attio is missing entirely while competitors dominate the narrative.",
    "missingProof": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce.",
    "recommendedEngagement": "Pitch the editor an updated section featuring Attio's RevOps + flexible-object angle with two real customer examples.",
    "citationCount": 30,
    "retrievalCount": 20,
    "citationRate": 1.5,
    "domainInfluence": 100
  },
  {
    "id": "o6",
    "promptId": "pr_46e94e3b-94ee-4f19-bfb9-2f424de79383",
    "sourceName": "The Definitive Guide to Product-Led Growth (PLG) CRMs",
    "sourceUrl": "https://hightouch.com/blog/plg-crm",
    "sourceType": "How-to guide",
    "influencedQuestions": [
      "Best CRM for managing complex revenue workflows and reporting",
      "What are the most effective AI features for modern sales operations?"
    ],
    "brandMentions": {
      "HubSpot": 1,
      "Salesforce": 1
    },
    "ownBrandPresent": false,
    "competitorPresent": true,
    "openingType": "Owned comparison page",
    "impactScore": 100,
    "riskLevel": "low",
    "status": "ready",
    "whyItMatters": "This source is retrieved by AI engines 19 times across CRM prompts (citation rate 1.63). Attio is missing entirely while competitors dominate the narrative.",
    "missingProof": "No mention of Attio. Competitors mentioned: HubSpot, Salesforce.",
    "recommendedEngagement": "Pitch the editor an updated section featuring Attio's RevOps + flexible-object angle with two real customer examples.",
    "citationCount": 31,
    "retrievalCount": 19,
    "citationRate": 1.63,
    "domainInfluence": 96
  },
  {
    "id": "o7",
    "promptId": "pr_05a66669-478c-4b25-94bc-9119409e5e2f",
    "sourceName": "Hubspot vs. Salesforce in 2026: Review + 4 CRM alternatives",
    "sourceUrl": "https://monday.com/blog/crm-and-sales/hubspot-vs-salesforce",
    "sourceType": "Comparison article",
    "influencedQuestions": [
      "How to automate lead routing effectively using modern CRM software",
      "What features should I look for in a highly automated CRM?"
    ],
    "brandMentions": {
      "HubSpot": 1,
      "Salesforce": 1,
      "Zoho": 1
    },
    "ownBrandPresent": false,
    "competitorPresent": true,
    "openingType": "Blog/editorial update pitch",
    "impactScore": 100,
    "riskLevel": "low",
    "status": "ready",
    "whyItMatters": "This source is retrieved by AI engines 18 times across CRM prompts (citation rate 1.06). Attio is missing entirely while competitors dominate the narrative.",
    "missingProof": "No mention of Attio. Competitors mentioned: HubSpot, Salesforce, Zoho.",
    "recommendedEngagement": "Pitch the editor an updated section featuring Attio's RevOps + flexible-object angle with two real customer examples.",
    "citationCount": 19,
    "retrievalCount": 18,
    "citationRate": 1.06,
    "domainInfluence": 92
  },
  {
    "id": "o8",
    "promptId": "pr_1c69dcd9-180a-43de-a48e-395b017a997c",
    "sourceName": "5 Best CRM Software - 2026 | What is The Real Difference?",
    "sourceUrl": "https://youtube.com/watch?v=jtT5EHUaAsM",
    "sourceType": "Video / comments",
    "influencedQuestions": [
      "What makes a CRM suitable for a product-led growth strategy?"
    ],
    "brandMentions": {
      "Pipedrive": 1,
      "HubSpot": 1,
      "Zoho": 1
    },
    "ownBrandPresent": false,
    "competitorPresent": true,
    "openingType": "YouTube creator pitch",
    "impactScore": 98,
    "riskLevel": "medium",
    "status": "ready",
    "whyItMatters": "This source is retrieved by AI engines 16 times across CRM prompts (citation rate 0.5). Attio is missing entirely while competitors dominate the narrative.",
    "missingProof": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Zoho.",
    "recommendedEngagement": "Pitch the creator a follow-up segment showing Attio's flexible objects in action, plus a disclosed top-comment.",
    "citationCount": 8,
    "retrievalCount": 16,
    "citationRate": 0.5,
    "domainInfluence": 84
  }
];

export const demoEngagements: Engagement[] = [
  {
    "id": "e1",
    "openingId": "o1",
    "title": "Editorial pitch — 7 Best RevOps tools & Software for 2026: Features, Pricing &",
    "format": "comment",
    "draft": "Hi {{editor_name}},\n\nYour piece on 7 Best RevOps tools & Software for 2026: Features, Pricing & Reviews - AutoRFP.ai has been showing up consistently in AI answers about CRM choice — nice work.\n\nOne angle that seems underrepresented across the category right now is the shift from fixed-pipeline CRMs to flexible relationship models for PLG and RevOps teams. No mention of Attio. Competitors mentioned: HubSpot, Salesforce.\n\nWould you be open to considering a short section on this, with two customer examples and original screenshots? No backlink required if it doesn't fit editorially.\n\nThanks either way,\n{{your_name}}",
    "targetQuestions": [
      "How to automate lead routing effectively using modern CRM software",
      "What features should I look for in a highly automated CRM?"
    ],
    "targetSource": "autorfp.ai",
    "missingProofAddressed": "No mention of Attio. Competitors mentioned: HubSpot, Salesforce.",
    "qualityChecks": [
      {
        "label": "Disclosure included",
        "status": "pass",
        "note": "Affiliation surfaced up front."
      },
      {
        "label": "Helpful, not spammy",
        "status": "pass",
        "note": "Frames trade-offs before naming brand."
      },
      {
        "label": "Evidence-backed",
        "status": "warning",
        "note": "Add one customer example before sending."
      },
      {
        "label": "Source fit",
        "status": "pass",
        "note": "Matches autorfp.ai norms."
      },
      {
        "label": "Anti-slop score",
        "status": "pass",
        "note": "92 / 100"
      },
      {
        "label": "Self-promo risk",
        "status": "warning",
        "note": "Medium — keep tone consultative."
      }
    ],
    "status": "draft"
  },
  {
    "id": "e2",
    "openingId": "o2",
    "title": "Creator pitch + disclosed top comment",
    "format": "pitch_email",
    "draft": "PITCH (DM): Loved the breakdown. Would you be open to a 5-minute follow-up segment on flexible-object CRMs for PLG / RevOps? Happy to send a sandbox + script outline.\n\nCOMMENT (disclosed): Great roundup. For teams whose CRM has to flex (PLG signals, partner orgs, multi-source data), flexible-object CRMs like Attio (disclosure: I work there) save a lot of glue work versus template-heavy tools. Happy to share a free template in the description if helpful.",
    "targetQuestions": [
      "What makes a CRM suitable for a product-led growth strategy?"
    ],
    "targetSource": "youtube.com",
    "missingProofAddressed": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce, Zoho.",
    "disclosure": "I work on Attio",
    "qualityChecks": [
      {
        "label": "Disclosure included",
        "status": "pass",
        "note": "Affiliation surfaced up front."
      },
      {
        "label": "Helpful, not spammy",
        "status": "pass",
        "note": "Frames trade-offs before naming brand."
      },
      {
        "label": "Evidence-backed",
        "status": "warning",
        "note": "Add one customer example before sending."
      },
      {
        "label": "Source fit",
        "status": "pass",
        "note": "Matches youtube.com norms."
      },
      {
        "label": "Anti-slop score",
        "status": "pass",
        "note": "92 / 100"
      },
      {
        "label": "Self-promo risk",
        "status": "warning",
        "note": "Medium — keep tone consultative."
      }
    ],
    "status": "draft"
  },
  {
    "id": "e3",
    "openingId": "o3",
    "title": "Editorial pitch — Best CRM for RevOps in 2026: Honest Picks + Pricing",
    "format": "review_brief",
    "draft": "Hi {{editor_name}},\n\nYour piece on Best CRM for RevOps in 2026: Honest Picks + Pricing has been showing up consistently in AI answers about CRM choice — nice work.\n\nOne angle that seems underrepresented across the category right now is the shift from fixed-pipeline CRMs to flexible relationship models for PLG and RevOps teams. No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce.\n\nWould you be open to considering a short section on this, with two customer examples and original screenshots? No backlink required if it doesn't fit editorially.\n\nThanks either way,\n{{your_name}}",
    "targetQuestions": [
      "Best CRM for managing complex revenue workflows and reporting",
      "What are the most effective AI features for modern sales operations?"
    ],
    "targetSource": "prospeo.io",
    "missingProofAddressed": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce.",
    "qualityChecks": [
      {
        "label": "Disclosure included",
        "status": "pass",
        "note": "Affiliation surfaced up front."
      },
      {
        "label": "Helpful, not spammy",
        "status": "pass",
        "note": "Frames trade-offs before naming brand."
      },
      {
        "label": "Evidence-backed",
        "status": "warning",
        "note": "Add one customer example before sending."
      },
      {
        "label": "Source fit",
        "status": "pass",
        "note": "Matches prospeo.io norms."
      },
      {
        "label": "Anti-slop score",
        "status": "pass",
        "note": "92 / 100"
      },
      {
        "label": "Self-promo risk",
        "status": "warning",
        "note": "Medium — keep tone consultative."
      }
    ],
    "status": "draft"
  },
  {
    "id": "e4",
    "openingId": "o4",
    "title": "Editorial pitch — 6 Best CRMs for Growing Sales Teams in 2026 | Expert Guide",
    "format": "creator_pitch",
    "draft": "Hi {{editor_name}},\n\nYour piece on 6 Best CRMs for Growing Sales Teams in 2026 | Expert Guide has been showing up consistently in AI answers about CRM choice — nice work.\n\nOne angle that seems underrepresented across the category right now is the shift from fixed-pipeline CRMs to flexible relationship models for PLG and RevOps teams. No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce, Zoho.\n\nWould you be open to considering a short section on this, with two customer examples and original screenshots? No backlink required if it doesn't fit editorially.\n\nThanks either way,\n{{your_name}}",
    "targetQuestions": [
      "How to automate lead routing effectively using modern CRM software",
      "What features should I look for in a highly automated CRM?"
    ],
    "targetSource": "authencio.com",
    "missingProofAddressed": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce, Zoho.",
    "qualityChecks": [
      {
        "label": "Disclosure included",
        "status": "pass",
        "note": "Affiliation surfaced up front."
      },
      {
        "label": "Helpful, not spammy",
        "status": "pass",
        "note": "Frames trade-offs before naming brand."
      },
      {
        "label": "Evidence-backed",
        "status": "warning",
        "note": "Add one customer example before sending."
      },
      {
        "label": "Source fit",
        "status": "pass",
        "note": "Matches authencio.com norms."
      },
      {
        "label": "Anti-slop score",
        "status": "pass",
        "note": "92 / 100"
      },
      {
        "label": "Self-promo risk",
        "status": "warning",
        "note": "Medium — keep tone consultative."
      }
    ],
    "status": "draft"
  },
  {
    "id": "e5",
    "openingId": "o5",
    "title": "Editorial pitch — Best AI Sales Tools in 2026: CRM Automation, Lead Scoring, a",
    "format": "comment",
    "draft": "Hi {{editor_name}},\n\nYour piece on Best AI Sales Tools in 2026: CRM Automation, Lead Scoring, and Outreach Compared has been showing up consistently in AI answers about CRM choice — nice work.\n\nOne angle that seems underrepresented across the category right now is the shift from fixed-pipeline CRMs to flexible relationship models for PLG and RevOps teams. No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce.\n\nWould you be open to considering a short section on this, with two customer examples and original screenshots? No backlink required if it doesn't fit editorially.\n\nThanks either way,\n{{your_name}}",
    "targetQuestions": [
      "What makes a CRM suitable for a product-led growth strategy?"
    ],
    "targetSource": "simular.ai",
    "missingProofAddressed": "No mention of Attio. Competitors mentioned: Pipedrive, HubSpot, Salesforce.",
    "qualityChecks": [
      {
        "label": "Disclosure included",
        "status": "pass",
        "note": "Affiliation surfaced up front."
      },
      {
        "label": "Helpful, not spammy",
        "status": "pass",
        "note": "Frames trade-offs before naming brand."
      },
      {
        "label": "Evidence-backed",
        "status": "warning",
        "note": "Add one customer example before sending."
      },
      {
        "label": "Source fit",
        "status": "pass",
        "note": "Matches simular.ai norms."
      },
      {
        "label": "Anti-slop score",
        "status": "pass",
        "note": "92 / 100"
      },
      {
        "label": "Self-promo risk",
        "status": "warning",
        "note": "Medium — keep tone consultative."
      }
    ],
    "status": "draft"
  }
];
