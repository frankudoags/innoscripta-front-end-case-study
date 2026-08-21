import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Article, ProviderId } from '@/lib/types'
import { formatDate, relativeTime } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

const sourceStyles: Record<ProviderId, string> = {
  guardian: 'bg-brand-100 text-brand-700',
  nyt: 'bg-cyan-100 text-cyan-800',
  newsapi: 'bg-rose-100 text-rose-800',
}
const sourceNames: Record<ProviderId, string> = { 
  guardian: 'The Guardian',
  nyt: 'The New York Times',
  newsapi: 'NewsAPI.org'
};
export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt=""
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
          <span className="text-xs font-medium uppercase tracking-wide">No image</span>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`rounded px-1.5 py-0.5 font-medium ${sourceStyles[article.source] ?? 'bg-muted'}`}
          >
            {sourceNames[article.source] ?? article.source}
          </span>
          {article.category ? (
            <span className="text-muted-foreground">{article.category}</span>
          ) : null}
        </div>
        <CardTitle className="line-clamp-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {article.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {article.description ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{article.description}</p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">{article.author || 'Unknown author'}</span>
        <span className="flex shrink-0 items-center gap-1">
          <time dateTime={article.publishedAt} title={formatDate(article.publishedAt)}>
            {relativeTime(article.publishedAt)}
          </time>
          <ExternalLink className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
        </span>
      </CardFooter>
    </Card>
  )
}
