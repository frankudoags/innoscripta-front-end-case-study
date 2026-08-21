import { z } from 'zod'

export const guardianArticleSchema = z.object({
  id: z.string(),
  webTitle: z.string(),
  sectionName: z.string(),
  webPublicationDate: z.string(),
  webUrl: z.string(),
  fields: z
    .object({
      thumbnail: z.string().optional(),
      byline: z.string().optional(),
    })
    .optional(),
})

export const guardianSearchResponseSchema = z.object({
  response: z.object({
    status: z.string(),
    total: z.number().optional(),
    pages: z.number().optional(),
    results: z.array(guardianArticleSchema),
  }),
})

export const guardianSectionSchema = z.object({
  id: z.string(),
  webTitle: z.string(),
})

export const guardianSectionsResponseSchema = z.object({
  response: z.object({
    status: z.string(),
    total: z.number().optional(),
    results: z.array(guardianSectionSchema),
  }),
})

export const guardianTagSchema = z.object({
  id: z.string(),
  webTitle: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export const guardianTagsResponseSchema = z.object({
  response: z.object({
    status: z.string(),
    results: z.array(guardianTagSchema),
  }),
})

export const nytArticleSchema = z.object({
  _id: z.string(),
  headline: z.object({ main: z.string() }),
  abstract: z.string().optional().default(''),
  byline: z.object({ original: z.string().optional() }).optional(),
  section_name: z.string().optional().default(''),
  source: z.string().optional().default(''),
  pub_date: z.string(),
  web_url: z.string(),
  multimedia: z
    .object({
      default: z.object({ url: z.string() }).optional(),
      thumbnail: z.object({ url: z.string() }).optional(),
    })
    .optional(),
})

export const nytSearchResponseSchema = z.object({
  response: z.object({
    docs: z.array(nytArticleSchema).nullable(),
    metadata: z.object({ hits: z.number() }).optional(),
  }),
})

export const nytFacetTermSchema = z.object({
  term: z.string(),
  count: z.number(),
})

export const nytFacetGroupSchema = z.object({
  terms: z.array(nytFacetTermSchema),
})

export const nytFacetsResponseSchema = z.object({
  response: z.object({
    facets: z
      .object({
        section_name: nytFacetGroupSchema.optional(),
        news_desk: nytFacetGroupSchema.optional(),
        source: nytFacetGroupSchema.optional(),
      })
      .optional(),
  }),
})

const newsapiArticleSchema = z.object({
  source: z.object({ id: z.string().nullable(), name: z.string() }),
  author: z.string().nullable().optional().default(''),
  title: z.string(),
  description: z.string().nullable().optional().default(''),
  url: z.string(),
  urlToImage: z.string().nullable().optional(),
  publishedAt: z.string(),
  content: z.string().nullable().optional(),
})

export const newsapiEverythingResponseSchema = z.object({
  status: z.string(),
  totalResults: z.number().optional().default(0),
  articles: z.array(newsapiArticleSchema).nullable().optional().default([]),
})

export const newsapiTopHeadlinesResponseSchema = newsapiEverythingResponseSchema

export const newsapiSourcesResponseSchema = z.object({
  status: z.string(),
  sources: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .nullable()
    .optional()
    .default([]),
})
