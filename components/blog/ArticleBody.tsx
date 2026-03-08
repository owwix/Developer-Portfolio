export default function ArticleBody({ html }: { html: string }) {
  return <article className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
}
